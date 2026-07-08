import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimitCheckout } from "@/lib/rate-limit";
import { calculateApplicationFeeCents } from "@/lib/platform-fee";
import { checkoutExpiresAt, getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { publicDeckPath } from "@/lib/paths";

const TIP_MIN_CENTS = 100;
const TIP_MAX_CENTS = 50_000;

const checkoutSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("tip"),
    handle: z.string().min(3).max(30),
    paymentLinkId: z.string().uuid(),
    customAmountCents: z.number().int().min(TIP_MIN_CENTS).max(TIP_MAX_CENTS),
  }),
  z.object({
    type: z.literal("fixed"),
    handle: z.string().min(3).max(30),
    paymentLinkId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("product"),
    handle: z.string().min(3).max(30),
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(10).default(1),
  }),
]);

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = await rateLimitCheckout(ip);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again shortly." },
      { status: 429 }
    );
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, stripe_account_id, charges_enabled, is_published")
    .eq("handle", input.handle.toLowerCase())
    .eq("is_published", true)
    .single();

  if (!profile?.stripe_account_id || !profile.charges_enabled) {
    return NextResponse.json(
      { error: "Payments are not available for this creator yet." },
      { status: 403 }
    );
  }

  const stripe = getStripe();
  const appUrl = env.appUrl;
  const expiresAt = checkoutExpiresAt();

  const baseParams = {
    mode: "payment" as const,
    expires_at: expiresAt,
    payment_intent_data: {
      transfer_data: { destination: profile.stripe_account_id },
      metadata: {
        profile_id: profile.id,
        handle: profile.handle,
      },
    },
    success_url: `${appUrl}${publicDeckPath(profile.handle, { checkout: "success" })}`,
    cancel_url: `${appUrl}${publicDeckPath(profile.handle, { checkout: "cancelled" })}`,
  };

  if (input.type === "tip") {
    const { data: link } = await supabase
      .from("payment_links")
      .select("*")
      .eq("id", input.paymentLinkId)
      .eq("profile_id", profile.id)
      .eq("kind", "tip")
      .eq("is_active", true)
      .single();

    if (!link) {
      return NextResponse.json({ error: "Tip jar not found" }, { status: 404 });
    }

    const amountCents = input.customAmountCents;
    const applicationFee = calculateApplicationFeeCents(amountCents);

    const session = await stripe.checkout.sessions.create({
      ...baseParams,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: link.title || `Support ${profile.display_name}` },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        ...baseParams.payment_intent_data,
        application_fee_amount: applicationFee,
        metadata: {
          ...baseParams.payment_intent_data.metadata,
          payment_link_id: link.id,
          kind: "tip",
          amount_cents: String(amountCents),
        },
      },
      metadata: {
        profile_id: profile.id,
        payment_link_id: link.id,
        kind: "tip",
      },
    });

    return NextResponse.json({ url: session.url });
  }

  if (input.type === "fixed") {
    const { data: link } = await supabase
      .from("payment_links")
      .select("*")
      .eq("id", input.paymentLinkId)
      .eq("profile_id", profile.id)
      .eq("kind", "fixed")
      .eq("is_active", true)
      .single();

    if (!link?.amount_cents) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    const amountCents = link.amount_cents;
    const applicationFee = calculateApplicationFeeCents(amountCents);

    const session = await stripe.checkout.sessions.create({
      ...baseParams,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: link.title },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        ...baseParams.payment_intent_data,
        application_fee_amount: applicationFee,
        metadata: {
          ...baseParams.payment_intent_data.metadata,
          payment_link_id: link.id,
          kind: "fixed",
          amount_cents: String(amountCents),
        },
      },
      metadata: {
        profile_id: profile.id,
        payment_link_id: link.id,
        kind: "fixed",
      },
    });

    return NextResponse.json({ url: session.url });
  }

  // product checkout
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", input.productId)
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (
    product.inventory_qty !== null &&
    product.inventory_qty < input.quantity
  ) {
    return NextResponse.json({ error: "Insufficient inventory" }, { status: 409 });
  }

  const amountCents = product.price_cents * input.quantity;
  const applicationFee = calculateApplicationFeeCents(amountCents);

  const session = await stripe.checkout.sessions.create({
    ...baseParams,
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.title,
            description: product.description || undefined,
            images: product.images.length > 0 ? product.images.slice(0, 8) : undefined,
          },
          unit_amount: product.price_cents,
        },
        quantity: input.quantity,
      },
    ],
    payment_intent_data: {
      ...baseParams.payment_intent_data,
      application_fee_amount: applicationFee,
      metadata: {
        ...baseParams.payment_intent_data.metadata,
        product_id: product.id,
        kind: "product",
        quantity: String(input.quantity),
        amount_cents: String(amountCents),
      },
    },
    metadata: {
      profile_id: profile.id,
      product_id: product.id,
      kind: "product",
      quantity: String(input.quantity),
    },
  });

  return NextResponse.json({ url: session.url });
}
