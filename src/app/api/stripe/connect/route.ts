import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const returnTo =
    typeof body.returnTo === "string" ? body.returnTo : "/dashboard/payments";

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, stripe_account_id, charges_enabled")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const stripe = getStripe();
  let accountId = profile.stripe_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: user.email ?? undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        profile_id: profile.id,
        user_id: user.id,
      },
    });
    accountId = account.id;

    await supabase
      .from("profiles")
      .update({ stripe_account_id: accountId })
      .eq("id", profile.id);
  }

  const appUrl = env.appUrl;
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/stripe/connect/refresh?return_to=${encodeURIComponent(returnTo)}`,
    return_url: `${appUrl}/api/stripe/connect/return?return_to=${encodeURIComponent(returnTo)}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
