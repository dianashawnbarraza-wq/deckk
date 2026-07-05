import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCreatorEmail } from "@/lib/deck";
import {
  sendInventoryRefundEmails,
  sendOrderConfirmationEmails,
} from "@/lib/resend";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();
  const stripe = getStripe();

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) return;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const metadata = { ...session.metadata, ...paymentIntent.metadata };

  const profileId = metadata.profile_id;
  if (!profileId) return;

  const amountCents = paymentIntent.amount_received || paymentIntent.amount;
  const applicationFeeCents = paymentIntent.application_fee_amount ?? 0;
  const buyerEmail =
    session.customer_details?.email ?? session.customer_email ?? "unknown@deckk.me";

  const productId = metadata.product_id ?? null;
  const paymentLinkId = metadata.payment_link_id ?? null;
  const quantity = Number.parseInt(metadata.quantity ?? "1", 10) || 1;

  const lineItems = session.line_items
    ? (await stripe.checkout.sessions.listLineItems(session.id)).data.map(
        (item) => ({
          description: item.description,
          amount: item.amount_total,
          quantity: item.quantity,
        })
      )
    : [{ description: metadata.kind ?? "purchase", amount: amountCents, quantity: 1 }];

  // Idempotent insert — duplicate webhook deliveries are a no-op
  const { data: inserted, error: insertError } = await supabase
    .from("orders")
    .insert({
      profile_id: profileId,
      product_id: productId,
      payment_link_id: paymentLinkId,
      buyer_email: buyerEmail,
      stripe_payment_intent: paymentIntentId,
      amount_cents: amountCents,
      currency: paymentIntent.currency,
      application_fee_cents: applicationFeeCents,
      status: "paid",
      line_items: lineItems,
    })
    .select("id")
    .maybeSingle();

  if (insertError) {
    if (insertError.code === "23505") {
      // unique violation on stripe_payment_intent — already processed
      return;
    }
    throw insertError;
  }

  if (!inserted) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_id, handle, display_name")
    .eq("id", profileId)
    .single();

  if (!profile) return;

  let itemTitle = lineItems[0]?.description ?? "Purchase";

  if (productId) {
    const { data: product } = await supabase
      .from("products")
      .select("title")
      .eq("id", productId)
      .single();
    if (product) itemTitle = product.title;

    const { data: inventoryOk, error: rpcError } = await supabase.rpc(
      "decrement_product_inventory",
      { p_product_id: productId, p_quantity: quantity }
    );

    if (rpcError) throw rpcError;

    if (!inventoryOk) {
      await stripe.refunds.create({ payment_intent: paymentIntentId });
      await supabase
        .from("orders")
        .update({ status: "refunded" })
        .eq("id", inserted.id);

      const creatorEmail = await getCreatorEmail(profile.user_id);
      if (creatorEmail) {
        await sendInventoryRefundEmails({
          buyerEmail,
          creatorEmail,
          creatorName: profile.display_name,
          itemTitle,
          amountCents,
        });
      }
      return;
    }
  }

  if (paymentLinkId) {
    const { data: link } = await supabase
      .from("payment_links")
      .select("title")
      .eq("id", paymentLinkId)
      .single();
    if (link) itemTitle = link.title;
  }

  const creatorEmail = await getCreatorEmail(profile.user_id);
  if (creatorEmail) {
    await sendOrderConfirmationEmails({
      buyerEmail,
      creatorEmail,
      creatorName: profile.display_name,
      handle: profile.handle,
      itemTitle,
      amountCents,
      orderId: inserted.id,
    });
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const supabase = createAdminClient();
  await supabase
    .from("orders")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent", paymentIntentId);
}

async function handleAccountUpdated(account: Stripe.Account) {
  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ charges_enabled: account.charges_enabled ?? false })
    .eq("stripe_account_id", account.id);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.stripeWebhookSecret()
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    case "account.updated":
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
