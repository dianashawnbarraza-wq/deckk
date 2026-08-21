import Link from "next/link";
import { format } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { CommunityBadge } from "@/components/deck/community-badge";
import { EventsWaitlistForm } from "@/components/deck/events-waitlist-form";
import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { PublicThemeShell } from "@/components/layout/public-theme-shell";
import { FEATURED_EVENT_HANDLES } from "@/lib/featured-event-hosts";
import { eventPublicPath } from "@/lib/event-slug";

export const dynamic = "force-dynamic";

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

export default async function EventsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city: cityParam } = await searchParams;
  const city = cityParam?.trim() || null;
  const supabase = createAdminClient();

  const { data: featuredDecks } = await supabase
    .from("decks")
    .select("id, handle, display_name")
    .in("handle", [...FEATURED_EVENT_HANDLES])
    .eq("is_published", true);

  const deckIds = (featuredDecks ?? []).map((d) => d.id);
  const deckById = new Map(
    (featuredDecks ?? []).map((d) => [d.id, d] as const)
  );
  // Upcoming: undated (TBA) or date_start >= now. Home uses gte-only;
  // directory also keeps null dates so TBA cards still list.
  const nowIso = new Date().toISOString();
  const upcomingDateFilter = `date_start.is.null,date_start.gte.${nowIso}`;

  type Row = {
    id: string;
    title: string;
    date_start: string | null;
    city: string | null;
    ticket_price_cents: number | null;
    ticketing_enabled: boolean;
    price: number | null;
    slug: string | null;
    deck_id: string;
    host: { handle: string; display_name: string };
  };

  let events: Row[] = [];

  if (deckIds.length > 0) {
    let query = supabase
      .from("cards")
      .select(
        "id, title, date_start, city, ticket_price_cents, ticketing_enabled, price, deck_id, slug"
      )
      .eq("type", "event")
      .eq("status", "live")
      .in("deck_id", deckIds)
      .or(upcomingDateFilter)
      .order("date_start", { ascending: true, nullsFirst: false });

    if (city) {
      query = query.ilike("city", city);
    }

    let { data: rows, error } = await query;

    if (error) {
      let legacy = supabase
        .from("cards")
        .select("id, title, date_start, price, deck_id")
        .eq("type", "event")
        .eq("status", "live")
        .in("deck_id", deckIds)
        .or(upcomingDateFilter)
        .order("date_start", { ascending: true, nullsFirst: false });
      const legacyRes = await legacy;
      rows = (legacyRes.data ?? []).map((r) => ({
        ...r,
        city: null,
        ticket_price_cents: null,
        ticketing_enabled: false,
        slug: null,
      })) as typeof rows;
      error = legacyRes.error;
    }

    if (!error && rows) {
      events = rows.flatMap((row) => {
        const deck = deckById.get(row.deck_id);
        if (!deck) return [];
        return [
          {
            id: row.id,
            title: row.title,
            date_start: row.date_start,
            price: row.price,
            deck_id: row.deck_id,
            city: (row as { city?: string | null }).city ?? null,
            ticket_price_cents:
              (row as { ticket_price_cents?: number | null })
                .ticket_price_cents ?? null,
            ticketing_enabled: Boolean(
              (row as { ticketing_enabled?: boolean }).ticketing_enabled
            ),
            slug: (row as { slug?: string | null }).slug ?? null,
            host: {
              handle: deck.handle,
              display_name: deck.display_name,
            },
          } satisfies Row,
        ];
      });
    }
  }

  const cities = Array.from(
    new Set(events.map((e) => e.city).filter(Boolean) as string[])
  ).sort();

  return (
    <PublicThemeShell initialAppearance="dark">
      <PublicSiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
        <CommunityBadge />

        <header className="mt-6 max-w-2xl">
          <h1 className="font-display text-[36px] leading-none lg:text-[48px]">
            Events
          </h1>
          <p className="mt-2 text-[14px] text-dim lg:text-[16px]">
            From Kyle Holiday, Chains of Love, and Snake &amp; Moon — starting in
            Los Angeles.
          </p>
        </header>

        <form className="mt-5 max-w-sm" method="get">
          <label className="text-[11px] font-semibold tracking-wide text-dim uppercase">
            City
          </label>
          <select
            name="city"
            defaultValue={city ?? ""}
            className="mt-1.5 w-full rounded-xl border border-deck-card-brd bg-deck-card px-3 py-2.5 text-[14px] text-foreground"
          >
            <option value="">All cities</option>
            {(cities.length ? cities : ["Los Angeles"]).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="mt-2 text-[13px] font-semibold text-primary underline-offset-2 hover:underline"
          >
            Apply
          </button>
        </form>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 ? (
            <li className="col-span-full rounded-[18px] border border-dashed border-deck-card-brd px-4 py-10 text-center text-[14px] text-dim">
              No upcoming events from these hosts yet.
            </li>
          ) : (
            events.map((event) => (
              <li key={event.id}>
                <Link
                  href={eventPublicPath({
                    id: event.id,
                    slug: event.slug,
                    title: event.title,
                  })}
                  className="group flex h-full flex-col rounded-[18px] border border-deck-card-brd bg-deck-card/70 p-4 transition-opacity hover:opacity-90"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 font-display text-[22px] leading-tight text-foreground">
                      {event.title}
                    </h2>
                    <span className="shrink-0 rounded-full border border-deck-card-brd px-2.5 py-1 text-[11px] font-bold text-foreground">
                      {event.ticketing_enabled
                        ? formatPrice(event.ticket_price_cents, null)
                        : formatPrice(event.ticket_price_cents, event.price)}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-dim">
                    {event.date_start
                      ? format(new Date(event.date_start), "EEE · MMM d · h:mm a")
                      : "Date TBA"}
                    {event.city ? ` · ${event.city}` : ""}
                  </p>
                  <p className="mt-auto pt-3 text-[12px] font-semibold text-foreground">
                    {event.host.display_name || event.host.handle}
                  </p>
                </Link>
              </li>
            ))
          )}
        </ul>

        <div className="mt-14 max-w-lg">
          <EventsWaitlistForm />
        </div>
      </main>
    </PublicThemeShell>
  );
}
