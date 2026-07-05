import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, charges_enabled")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    stripe_account_id: profile?.stripe_account_id ?? null,
    charges_enabled: profile?.charges_enabled ?? false,
    needs_onboarding: Boolean(
      profile?.stripe_account_id && !profile.charges_enabled
    ),
  });
}
