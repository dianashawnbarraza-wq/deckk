import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

const BASE_FIELDS =
  "id, user_id, handle, display_name, bio, avatar_url, theme, is_published, community_opt_in, charges_enabled, stripe_account_id";

type ProfileRow = Pick<
  Profile,
  | "id"
  | "user_id"
  | "handle"
  | "display_name"
  | "bio"
  | "avatar_url"
  | "header_url"
  | "theme"
  | "is_published"
  | "community_opt_in"
  | "charges_enabled"
  | "stripe_account_id"
>;

/** Load profile; tolerates missing header_url column before migration runs. */
export async function getProfileByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  const withHeader = await supabase
    .from("profiles")
    .select(`${BASE_FIELDS}, header_url`)
    .eq("user_id", userId)
    .maybeSingle();

  if (!withHeader.error && withHeader.data) {
    return {
      ...withHeader.data,
      header_url: withHeader.data.header_url ?? null,
    } as ProfileRow;
  }

  if (withHeader.error?.message?.includes("header_url")) {
    const fallback = await supabase
      .from("profiles")
      .select(BASE_FIELDS)
      .eq("user_id", userId)
      .maybeSingle();
    if (fallback.error || !fallback.data) return null;
    return { ...fallback.data, header_url: null } as ProfileRow;
  }

  return withHeader.data as ProfileRow | null;
}

export async function profileExistsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error?.message?.includes("header_url")) {
    const retry = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
    return Boolean(retry.data);
  }
  return Boolean(data);
}
