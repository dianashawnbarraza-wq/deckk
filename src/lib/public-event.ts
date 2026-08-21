import type { SupabaseClient } from "@supabase/supabase-js";
import { looksLikeUuid, slugifyTitle } from "@/lib/event-slug";
import { resolveHosts, type EventHost } from "@/lib/event-hosts";

const EVENT_SELECT_FULL =
  "id, title, description, media, date_start, date_end, location_name, location_address, city, ticket_price_cents, ticket_capacity, tickets_sold, ticketing_enabled, price, status, type, deck_id, slug, cta_url, cta_label, hosts, tags";

const EVENT_SELECT_LEGACY =
  "id, title, description, media, date_start, date_end, location_name, location_address, price, status, type, deck_id, cta_url, cta_label, tags";

export type PublicEventRow = {
  id: string;
  title: string;
  description: string | null;
  media: unknown;
  date_start: string | null;
  date_end: string | null;
  location_name: string | null;
  location_address: string | null;
  city: string | null;
  ticket_price_cents: number | null;
  ticket_capacity: number | null;
  tickets_sold: number;
  ticketing_enabled: boolean;
  price: number | null;
  status: string;
  type: string;
  deck_id: string;
  slug: string | null;
  cta_url: string | null;
  cta_label: string | null;
  hosts: EventHost[];
  tags: string[];
};

function capacityFromTags(tags: unknown): number | null {
  if (!Array.isArray(tags)) return null;
  const hit = (tags as string[]).find((t) => t.startsWith("capacity:"));
  if (!hit) return null;
  const n = Number.parseInt(hit.slice("capacity:".length), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function withDefaults(
  row: Record<string, unknown>,
  slugHint?: string | null
): PublicEventRow {
  const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
  const ticketPriceFromCol =
    typeof row.ticket_price_cents === "number" ? row.ticket_price_cents : null;
  const priceDollars = typeof row.price === "number" ? row.price : null;
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: (row.description as string | null) ?? null,
    media: row.media,
    date_start: (row.date_start as string | null) ?? null,
    date_end: (row.date_end as string | null) ?? null,
    location_name: (row.location_name as string | null) ?? null,
    location_address: (row.location_address as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    ticket_price_cents:
      ticketPriceFromCol != null && ticketPriceFromCol > 0
        ? ticketPriceFromCol
        : priceDollars != null && priceDollars > 0
          ? Math.round(priceDollars * 100)
          : null,
    ticket_capacity:
      typeof row.ticket_capacity === "number"
        ? row.ticket_capacity
        : capacityFromTags(tags),
    tickets_sold: typeof row.tickets_sold === "number" ? row.tickets_sold : 0,
    ticketing_enabled:
      Boolean(row.ticketing_enabled) || tags.includes("ticketing:on"),
    price: priceDollars,
    status: String(row.status ?? "live"),
    type: String(row.type ?? "event"),
    deck_id: String(row.deck_id),
    slug: (row.slug as string | null | undefined) ?? slugHint ?? null,
    cta_url: (row.cta_url as string | null) ?? null,
    cta_label: (row.cta_label as string | null) ?? null,
    hosts: resolveHosts(row),
    tags,
  };
}

async function selectEvent(
  supabase: SupabaseClient,
  filter: { column: "id" | "slug"; value: string }
): Promise<PublicEventRow | null> {
  const full = await supabase
    .from("cards")
    .select(EVENT_SELECT_FULL)
    .eq(filter.column, filter.value)
    .eq("type", "event")
    .eq("status", "live")
    .maybeSingle();

  if (!full.error && full.data) {
    return withDefaults(full.data as Record<string, unknown>);
  }

  // Retry without hosts / ticketing / city columns when migrations are partial
  if (full.error && /(hosts|ticket_|directory_opt_in|\bcity\b|\bslug\b)/i.test(full.error.message)) {
    const mid = await supabase
      .from("cards")
      .select(
        "id, title, description, media, date_start, date_end, location_name, location_address, ticket_price_cents, ticket_capacity, tickets_sold, ticketing_enabled, price, status, type, deck_id, slug, cta_url, cta_label, tags"
      )
      .eq(filter.column, filter.value)
      .eq("type", "event")
      .eq("status", "live")
      .maybeSingle();
    if (!mid.error && mid.data) {
      return withDefaults(mid.data as Record<string, unknown>);
    }

    // city (and sometimes ticket cols) still missing — drop those too
    if (mid.error && /(city|ticket_|directory_opt_in|\bslug\b)/i.test(mid.error.message)) {
      const slim = await supabase
        .from("cards")
        .select(
          "id, title, description, media, date_start, date_end, location_name, location_address, price, status, type, deck_id, cta_url, cta_label, tags"
        )
        .eq(filter.column, filter.value)
        .eq("type", "event")
        .eq("status", "live")
        .maybeSingle();
      if (!slim.error && slim.data) {
        return withDefaults(slim.data as Record<string, unknown>);
      }
    }
  }

  if (filter.column === "slug") {
    // Column may not exist yet — fall through to title match
    return null;
  }

  const legacy = await supabase
    .from("cards")
    .select(EVENT_SELECT_LEGACY)
    .eq("id", filter.value)
    .eq("type", "event")
    .eq("status", "live")
    .maybeSingle();

  if (legacy.error || !legacy.data) return null;
  return withDefaults(legacy.data as Record<string, unknown>);
}

/** Resolve /events/[slugOrId] by slug, uuid, or title-derived slug match. */
export async function resolvePublicEvent(
  supabase: SupabaseClient,
  slugOrId: string
): Promise<PublicEventRow | null> {
  const key = slugOrId.trim().toLowerCase();
  if (!key) return null;

  if (looksLikeUuid(key)) {
    return selectEvent(supabase, { column: "id", value: key });
  }

  const bySlug = await selectEvent(supabase, { column: "slug", value: key });
  if (bySlug) return bySlug;

  // Pre-migration / unset slug: match live events by slugified title
  const { data: rows } = await supabase
    .from("cards")
    .select(EVENT_SELECT_LEGACY)
    .eq("type", "event")
    .eq("status", "live")
    .limit(200);

  const match = (rows ?? []).find(
    (row) => slugifyTitle(String(row.title ?? "")) === key
  );
  if (!match) return null;
  return withDefaults(match as Record<string, unknown>, key);
}

/** Allocate a unique slug for an event title. */
export async function ensureUniqueEventSlug(
  supabase: SupabaseClient,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugifyTitle(title);
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const { data } = await supabase
      .from("cards")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || (excludeId && data.id === excludeId)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
