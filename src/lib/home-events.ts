import { createAdminClient } from "@/lib/supabase/admin";
import { eventPublicPath } from "@/lib/event-slug";

export type HomeUpcomingEvent = {
  id: string;
  title: string;
  href: string;
  dateStart: string | null;
  city: string | null;
  hostName: string | null;
  priceLabel: string;
  imageUrl: string | null;
};

/** Marketing home only — never include kyleholiday. */
const HOME_EVENT_HANDLES = ["chainsoflove", "snakeandmoon"] as const;

function isBlockedHomeHost(
  handle: string | null | undefined,
  displayName: string | null | undefined
) {
  const h = (handle ?? "").toLowerCase();
  const n = (displayName ?? "").toLowerCase();
  return h === "kyleholiday" || n.includes("kyle holiday");
}

function formatPrice(cents: number | null | undefined, price: number | null) {
  if (cents != null && cents > 0) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }
  if (price != null && Number(price) > 0) {
    return `$${Number(price).toFixed(0)}`;
  }
  return "Free";
}

function firstMediaUrl(media: unknown): string | null {
  if (!Array.isArray(media)) return null;
  for (const m of media) {
    if (
      m &&
      typeof m === "object" &&
      typeof (m as { url?: string }).url === "string"
    ) {
      const url = (m as { url: string }).url.trim();
      if (url) return url;
    }
  }
  return null;
}

/** Up to `limit` live, published upcoming events for the marketing home. */
export async function getUpcomingHomeEvents(
  limit = 3
): Promise<HomeUpcomingEvent[]> {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: featuredDecks } = await supabase
    .from("decks")
    .select("id, handle, display_name")
    .in("handle", [...HOME_EVENT_HANDLES])
    .eq("is_published", true);

  const allowedDecks = (featuredDecks ?? []).filter(
    (d) => !isBlockedHomeHost(d.handle, d.display_name)
  );
  const deckIds = allowedDecks.map((d) => d.id);
  const deckById = new Map(allowedDecks.map((d) => [d.id, d] as const));

  if (deckIds.length === 0) return [];

  const full = await supabase
    .from("cards")
    .select(
      "id, title, date_start, city, ticket_price_cents, ticketing_enabled, price, slug, media, deck_id"
    )
    .eq("type", "event")
    .eq("status", "live")
    .in("deck_id", deckIds)
    .gte("date_start", nowIso)
    .order("date_start", { ascending: true, nullsFirst: false })
    .limit(limit);

  let rows = full.data;
  let error = full.error;

  if (error) {
    const legacy = await supabase
      .from("cards")
      .select("id, title, date_start, price, media, deck_id")
      .eq("type", "event")
      .eq("status", "live")
      .in("deck_id", deckIds)
      .gte("date_start", nowIso)
      .order("date_start", { ascending: true, nullsFirst: false })
      .limit(limit);
    rows = (legacy.data ?? []).map((r) => ({
      ...r,
      city: null,
      ticket_price_cents: null,
      ticketing_enabled: false,
      slug: null,
    })) as typeof rows;
    error = legacy.error;
  }

  if (error || !rows) return [];

  return rows
    .map((row) => {
      const deck = deckById.get(row.deck_id as string);
      if (!deck) return null;
      if (isBlockedHomeHost(deck.handle, deck.display_name)) return null;

      const ticketCents =
        "ticket_price_cents" in row
          ? (row.ticket_price_cents as number | null)
          : null;
      const ticketingOn =
        "ticketing_enabled" in row ? Boolean(row.ticketing_enabled) : false;
      const price = row.price as number | null;

      return {
        id: row.id as string,
        title: row.title as string,
        href: eventPublicPath({
          id: row.id as string,
          slug: (row as { slug?: string | null }).slug,
          title: row.title as string,
        }),
        dateStart: (row.date_start as string | null) ?? null,
        city: ((row as { city?: string | null }).city as string | null) ?? null,
        hostName: deck.display_name || deck.handle || null,
        priceLabel: ticketingOn
          ? formatPrice(ticketCents, null)
          : formatPrice(ticketCents, price),
        imageUrl: firstMediaUrl(row.media),
      } satisfies HomeUpcomingEvent;
    })
    .filter((e): e is HomeUpcomingEvent => e != null);
}
