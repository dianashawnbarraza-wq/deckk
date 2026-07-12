import type { SupabaseClient } from "@supabase/supabase-js";
import type { Card, Deck } from "@/types/cards";

const DECK_FIELDS =
  "id, user_id, handle, display_name, bio, avatar_url, theme, timezone, is_published, created_at, updated_at";

const CARD_FIELDS =
  "id, deck_id, type, title, description, media, date_start, date_end, location_name, location_address, cta_label, cta_url, price, currency, tags, pinned, status, position, source, extraction_confidence, collection_id, created_at, updated_at";

export async function getDeckByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<Deck | null> {
  const { data, error } = await supabase
    .from("decks")
    .select(DECK_FIELDS)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Deck;
}

export async function getDeckByHandle(
  supabase: SupabaseClient,
  handle: string
): Promise<Deck | null> {
  const { data, error } = await supabase
    .from("decks")
    .select(DECK_FIELDS)
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return data as Deck;
}

export async function getLiveCardsForDeck(
  supabase: SupabaseClient,
  deckId: string,
  includeDrafts = false
): Promise<Card[]> {
  let query = supabase.from("cards").select(CARD_FIELDS).eq("deck_id", deckId);
  if (!includeDrafts) {
    query = query.eq("status", "live");
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Card[];
}

export async function deckExistsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("decks")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}
