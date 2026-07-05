import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicDeck } from "@/types/database";

export async function getPublicDeck(handle: string): Promise<PublicDeck | null> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle.toLowerCase())
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) return null;

  const [blocksRes, productsRes, linksRes, eventsRes] = await Promise.all([
    supabase
      .from("blocks")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("position"),
    supabase
      .from("products")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_links")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("starts_at", { ascending: true }),
  ]);

  return {
    profile,
    blocks: blocksRes.data ?? [],
    products: productsRes.data ?? [],
    paymentLinks: linksRes.data ?? [],
    events: eventsRes.data ?? [],
  };
}

export async function getProfileByUserId(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function getCreatorEmail(userId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}
