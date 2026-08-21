import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicDeckPath } from "@/lib/paths";
import {
  BuyTicketsButton,
  type TicketTierOption,
} from "@/components/deck/buy-tickets-button";
import { ExternalTicketsButton } from "@/components/deck/external-tickets-button";
import { ShareDeckSheet } from "@/components/deck/share-deck-sheet";
import { ButchBrunchBackdrop } from "@/components/events/butch-brunch-backdrop";
import { EventCountdown } from "@/components/events/event-countdown";
import { EventFlyerGallery } from "@/components/events/event-flyer-gallery";
import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { PublicThemeShell } from "@/components/layout/public-theme-shell";
import { EventDescription } from "@/components/events/event-description";
import { AddToCalendarSheet } from "@/components/events/add-to-calendar-sheet";
import { deckAppearance } from "@/lib/appearance";
import { env } from "@/lib/env";
import { enrichEventHosts, type EventHost } from "@/lib/event-hosts";
import { eventPublicPath, looksLikeUuid, slugifyTitle } from "@/lib/event-slug";
import { resolvePublicEvent } from "@/lib/public-event";
import { ticketContactFromTags } from "@/lib/ticket-contact";
import { parseTestTicketCents } from "@/lib/ticket-tiers";
import { cn } from "@/lib/utils";
import type { DeckTheme } from "@/types/cards";
import { MapPin, Pencil } from "lucide-react";

function formatEventDate(iso: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(iso);
}

function formatEventTime(iso: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(iso);
}
export const dynamic = "force-dynamic";

function flyerUrlsFromMedia(media: unknown): string[] {
  if (!Array.isArray(media)) return [];
  return media
    .map((m) =>
      m && typeof m === "object" && typeof (m as { url?: string }).url === "string"
        ? (m as { url: string }).url
        : null
    )
    .filter((u): u is string => Boolean(u));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slugOrId } = await params;
  const supabase = createAdminClient();
  const event = await resolvePublicEvent(supabase, slugOrId);
  if (!event) return { title: "Event · deckk.me" };

  const flyers = flyerUrlsFromMedia(event.media);
  const sharePath = eventPublicPath({
    id: event.id,
    slug: event.slug,
    title: event.title,
  });
  const shareUrl = `${env.appUrl.replace(/\/$/, "")}${sharePath}`;
  const title = event.title;
  const description =
    event.description?.trim().slice(0, 160) ||
    `${event.title} on Deckk`;
  /** First uploaded flyer drives favicon + social share previews. */
  const image = flyers[0] ?? null;
  const imageType = image
    ? /\.png(?:\?|$)/i.test(image)
      ? "image/png"
      : /\.webp(?:\?|$)/i.test(image)
        ? "image/webp"
        : "image/jpeg"
    : undefined;
  const iconPath = eventPublicPath({
    id: event.id,
    slug: event.slug,
    title: event.title,
  });

  return {
    metadataBase: new URL(env.appUrl.replace(/\/$/, "") || "https://deckk.me"),
    title: `${title} · deckk.me`,
    description,
    alternates: { canonical: shareUrl },
    icons: {
      // Prefer route-segment icon (flyer) over root favicon.ico / icon.svg
      icon: [
        { url: `${iconPath}/icon`, type: "image/png", sizes: "64x64" },
        ...(image ? [{ url: image, type: imageType }] : []),
      ],
      apple: [
        { url: `${iconPath}/apple-icon`, type: "image/png", sizes: "180x180" },
        ...(image ? [{ url: image, type: imageType }] : []),
      ],
      shortcut: image
        ? [{ url: image, type: imageType }]
        : [{ url: `${iconPath}/icon`, type: "image/png" }],
    },
    openGraph: {
      title,
      description,
      url: shareUrl,
      type: "website",
      images: image
        ? [
            {
              url: image,
              alt: title,
              type: imageType,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

function DeckkPlatformNote({ withStripe }: { withStripe?: boolean }) {
  return (
    <div className="w-full rounded-[14px] border border-deck-card-brd/80 bg-deck-card/60 px-4 py-3.5 text-[13px] leading-snug text-dim backdrop-blur-md lg:text-[14px]">
      <p className="font-medium text-foreground/90">
        Deckk is a proud LGBTQ+ founded platform fueled by community, not big
        tech.
        {withStripe ? " Pay securely with Stripe." : null}
      </p>
    </div>
  );
}

function HostsInline({ hosts }: { hosts: EventHost[] }) {
  if (hosts.length === 0) return null;
  return (
    <p className="mt-3 text-[18px] leading-snug text-dim lg:text-[20px]">
      <span className="text-faint">by </span>
      {hosts.map((host, i) => {
        const label = host.note ? `${host.name} (${host.note})` : host.name;
        const linkClass =
          "font-semibold text-foreground underline underline-offset-2";
        const link = host.handle ? (
          <Link href={publicDeckPath(host.handle)} className={linkClass}>
            {label}
          </Link>
        ) : host.instagram ? (
          <a
            href={host.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {label}
          </a>
        ) : (
          <span className={linkClass}>{label}</span>
        );
        return (
          <span key={`${host.name}-${host.instagram ?? ""}-${host.note ?? ""}`}>
            {i > 0 ? ", " : null}
            {link}
          </span>
        );
      })}
    </p>
  );
}

function fullAddressLines(event: {
  location_name: string | null;
  location_address: string | null;
  city: string | null;
}): string[] {
  const name = event.location_name?.trim() || "";
  const address = event.location_address?.trim() || "";
  const city = event.city?.trim() || "";
  const lines: string[] = [];

  if (name) lines.push(name);

  if (address) {
    const addressIsJustName =
      name.length > 0 && address.toLowerCase() === name.toLowerCase();
    if (!addressIsJustName) lines.push(address);
  }

  if (city) {
    const haystack = `${name} ${address}`.toLowerCase();
    if (!haystack.includes(city.toLowerCase())) lines.push(city);
  }

  return lines;
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugOrId } = await params;
  const supabase = createAdminClient();
  const event = await resolvePublicEvent(supabase, slugOrId);
  if (!event) notFound();

  if (looksLikeUuid(slugOrId)) {
    redirect(
      eventPublicPath({
        id: event.id,
        slug: event.slug,
        title: event.title,
      })
    );
  }

  const { data: deck } = await supabase
    .from("decks")
    .select("handle, display_name, is_published, theme, user_id, timezone")
    .eq("id", event.deck_id)
    .maybeSingle();

  if (!deck?.is_published || !deck.handle) notFound();

  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  const isOwner = Boolean(user && deck.user_id && user.id === deck.user_id);

  const appearance = deckAppearance((deck.theme as DeckTheme) ?? null);
  const timeZone = deck.timezone?.trim() || "America/Los_Angeles";

  const flyerUrls = flyerUrlsFromMedia(event.media);

  const start = event.date_start ? new Date(event.date_start) : null;
  const end = event.date_end ? new Date(event.date_end) : null;
  const sold = event.tickets_sold ?? 0;
  const cap = event.ticket_capacity;
  const unitPriceCents =
    event.ticket_price_cents != null && event.ticket_price_cents > 0
      ? event.ticket_price_cents
      : event.price != null && Number(event.price) > 0
        ? Math.round(Number(event.price) * 100)
        : null;
  const hasPrice = unitPriceCents != null && unitPriceCents > 0;
  const canBuyOnDeckk = hasPrice && Boolean(event.ticketing_enabled);
  const externalTicketUrl = event.cta_url?.trim() || null;
  const useExternalTickets = hasPrice && !canBuyOnDeckk && Boolean(externalTicketUrl);
  const soldOut =
    canBuyOnDeckk &&
    Boolean(event.ticketing_enabled) &&
    cap != null &&
    sold >= cap;
  const remaining = cap != null ? Math.max(0, cap - sold) : null;
  const maxQuantity =
    remaining != null ? Math.min(8, Math.max(1, remaining)) : 8;

  const testPriceCents = parseTestTicketCents(event.tags);
  let testSoldOut = false;
  if (testPriceCents != null) {
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("card_id", event.id)
      .eq("unit_price_cents", testPriceCents)
      .eq("status", "paid");
    testSoldOut = (count ?? 0) >= 1;
  }

  const ticketTiers: TicketTierOption[] | undefined =
    canBuyOnDeckk && unitPriceCents != null && testPriceCents != null
      ? [
          {
            id: "ga",
            label: "General admission",
            unitPriceCents,
            maxQuantity,
            soldOut,
          },
          {
            id: "test",
            label: "Test ticket",
            unitPriceCents: testPriceCents,
            maxQuantity: 1,
            soldOut: testSoldOut,
          },
        ]
      : undefined;

  const isButchBrunch =
    (event.slug ?? "").toLowerCase() === "butch-brunch" ||
    slugifyTitle(event.title) === "butch-brunch" ||
    /butch\s*brunch/i.test(event.title);
  const sharePath = eventPublicPath({
    id: event.id,
    slug: event.slug ?? (isButchBrunch ? "butch-brunch" : null),
    title: event.title,
  });
  const shareUrl = `${env.appUrl.replace(/\/$/, "")}${sharePath}`;
  const hosts = enrichEventHosts(event.hosts ?? []);
  const organizerEmail =
    ticketContactFromTags(event.tags) ||
    (isButchBrunch ? "mxcruiselaleather2026@gmail.com" : null);
  const contactMailto = organizerEmail
    ? `mailto:${organizerEmail}?subject=${encodeURIComponent(`Question about ${event.title}`)}`
    : null;
  const addressLines = (() => {
    if (isButchBrunch) {
      return [
        "Unnamed place",
        "1733 New Hampshire Ave.",
        "Los Angeles, CA 90027",
      ];
    }
    return fullAddressLines(event);
  })();
  const calendarEvent =
    event.date_start != null
      ? {
          title: event.title,
          description: event.description,
          location: addressLines.join(", ") || null,
          url: shareUrl,
          startIso: event.date_start,
          endIso: event.date_end,
        }
      : null;
  const icsHref = event.date_start ? `/api/cards/${event.id}/ics` : null;
  const mapsQuery = encodeURIComponent(
    isButchBrunch
      ? "1733 New Hampshire Ave, Los Angeles, CA 90027"
      : addressLines.join(", ")
  );
  const mapsEmbedSrc = mapsQuery
    ? `https://maps.google.com/maps?q=${mapsQuery}&z=15&output=embed`
    : null;
  const mapsLink = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
    : null;

  return (
    <PublicThemeShell
      initialAppearance={isButchBrunch ? "dark" : appearance}
    >
      <div className={cn(isButchBrunch && "butch-brunch-page min-h-dvh")}>
        {isButchBrunch ? <ButchBrunchBackdrop /> : null}
        <PublicSiteHeader
          showThemeToggle={!isButchBrunch}
          overMedia={isButchBrunch || flyerUrls.length > 0}
          brandLabel={
            isButchBrunch
              ? "Butch Monthly LA x Mx. Cruise LA Leather 2026"
              : undefined
          }
          right={
            <div className="flex items-center gap-2">
              {isOwner ? (
                <Link
                  href={`/studio?event=${event.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-deck-card-brd bg-deck-card px-3 text-[13px] font-semibold text-foreground"
                >
                  <Pencil className="size-3.5" strokeWidth={2.25} />
                  Edit event
                </Link>
              ) : null}
              {contactMailto ? (
                <a
                  href={contactMailto}
                  className="text-[13px] font-semibold text-dim underline-offset-2 hover:text-foreground hover:underline"
                >
                  Contact event organizer
                </a>
              ) : (
                <Link
                  href={publicDeckPath(deck.handle)}
                  className="text-[13px] font-semibold text-dim underline-offset-2 hover:text-foreground hover:underline"
                >
                  {deck.display_name || deck.handle}
                </Link>
              )}
            </div>
          }
        />

        {/* Compact Eventbrite-style flyer banner / gallery */}
        {flyerUrls.length > 0 ? (
          <EventFlyerGallery
            images={flyerUrls}
            title={event.title}
            side={
              isButchBrunch ? (
                <div className="max-w-xl">
                  <h1 className="font-display text-[44px] leading-[1.02] tracking-tight text-white lg:text-[56px]">
                    Butch Brunch
                  </h1>
                  <p className="mt-3 text-[17px] leading-snug font-semibold text-white/85 lg:text-[19px]">
                    Fundraiser for Union del Barrio and Unnamed Place
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/65 lg:text-[16px]">
                    hosted by{" "}
                    <span className="text-white/80">
                      Butch Monthly LA, Mx. Cruise LA Leather 2026 Kyle and JP
                      (Akbar, Craft Night)
                    </span>
                  </p>
                </div>
              ) : undefined
            }
            footer={
              event.date_start ? (
                <EventCountdown
                  startIso={event.date_start}
                  subdued={isButchBrunch}
                />
              ) : null
            }
          />
        ) : event.date_start ? (
          <div className="border-b border-deck-card-brd px-4 py-4">
            <div className="mx-auto flex max-w-6xl justify-center">
              <EventCountdown
                startIso={event.date_start}
                subdued={isButchBrunch}
              />
            </div>
          </div>
        ) : null}

        <main
          className={cn(
            "mx-auto w-full max-w-6xl px-4 pt-6 lg:px-8 lg:pt-8",
            canBuyOnDeckk || useExternalTickets ? "pb-36 lg:pb-40" : "pb-16"
          )}
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] lg:items-start lg:gap-12">
            {/* Left: title, hosts, overview, Deckk box */}
            <div className="min-w-0">
              {/* Butch: title/hosts live beside the desktop gallery lockup */}
              <div className={cn(isButchBrunch && "lg:hidden")}>
                <h1 className="font-display text-[36px] leading-[1.05] tracking-tight text-foreground lg:text-[48px]">
                  {isButchBrunch ? "Butch Brunch" : event.title}
                </h1>
                {isButchBrunch ? (
                  <>
                    <p className="mt-3 text-[16px] leading-snug font-semibold text-foreground/90">
                      Fundraiser for Union del Barrio and Unnamed Place
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-dim">
                      hosted by Butch Monthly LA, Mx. Cruise LA Leather 2026
                      Kyle and JP (Akbar, Craft Night)
                    </p>
                  </>
                ) : (
                  <HostsInline hosts={hosts} />
                )}
              </div>
              {event.description ? (
                <div className="mt-8">
                  <p className="text-[13px] font-bold tracking-[0.14em] text-faint uppercase">
                    Overview
                  </p>
                  <div className="mt-3">
                    <EventDescription
                      text={event.description}
                      tone={isButchBrunch ? "bright" : "default"}
                      clamp={false}
                    />
                  </div>
                </div>
              ) : null}

              {canBuyOnDeckk && unitPriceCents != null ? (
                <div className="mt-6 max-w-sm">
                  <BuyTicketsButton
                    handle={deck.handle}
                    cardId={event.id}
                    unitPriceCents={unitPriceCents}
                    maxQuantity={maxQuantity}
                    soldOut={soldOut}
                    tiers={ticketTiers}
                    showCheckoutHint={false}
                  />
                </div>
              ) : null}

              {useExternalTickets && externalTicketUrl ? (
                <a
                  href={externalTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex h-12 w-full max-w-sm items-center justify-center rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground sm:w-auto"
                >
                  {event.cta_label?.trim() || "Get tickets"}
                </a>
              ) : null}

              {/* Desktop: keep Deckk note under overview */}
              <div className="mt-8 hidden lg:block">
                <DeckkPlatformNote
                  withStripe={canBuyOnDeckk || useExternalTickets}
                />
              </div>
            </div>

            {/* Right: date, time, calendar, share, location */}
            <aside className="min-w-0 lg:sticky lg:top-24">
              <div className="rounded-[18px] border border-deck-card-brd bg-deck-card/70 p-5 backdrop-blur-xl lg:p-6">
                {start ? (
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.14em] text-faint uppercase">
                      Date & time
                    </p>
                    <p className="mt-2 font-display text-[26px] leading-tight text-foreground lg:text-[30px]">
                      {formatEventDate(start, timeZone)}
                    </p>
                    <p className="mt-1.5 text-[18px] font-semibold text-foreground lg:text-[20px]">
                      {formatEventTime(start, timeZone)}
                      {end ? ` – ${formatEventTime(end, timeZone)}` : ""}
                    </p>
                  </div>
                ) : null}

                {addressLines.length > 0 ? (
                  <div className={cn(start && "mt-6")}>
                    <p className="text-[11px] font-bold tracking-[0.14em] text-faint uppercase">
                      Location
                    </p>
                    <div className="mt-2 flex gap-3">
                      <MapPin
                        className="mt-0.5 size-5 shrink-0 text-primary"
                        strokeWidth={2.2}
                      />
                      <div className="min-w-0 space-y-0.5">
                        {addressLines.map((line, i) => (
                          <p
                            key={`${i}-${line}`}
                            className={cn(
                              "leading-relaxed text-foreground",
                              i === 0
                                ? "text-[16px] font-semibold lg:text-[17px]"
                                : "text-[14px] text-dim lg:text-[15px]"
                            )}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>

                    {mapsEmbedSrc ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-deck-card-brd">
                        <iframe
                          title={`Map of ${addressLines[0] ?? "venue"}`}
                          src={mapsEmbedSrc}
                          className="h-40 w-full border-0 grayscale-[20%] contrast-[1.05]"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                        {mapsLink ? (
                          <a
                            href={mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border-t border-deck-card-brd bg-page/70 px-3 py-2 text-center text-[12px] font-semibold text-primary underline-offset-2 hover:underline"
                          >
                            Open in Maps
                          </a>
                        ) : null}
                      </div>
                    ) : null}

                    {isButchBrunch ? (
                      <p className="mt-3 text-[13px] leading-snug text-dim">
                        <span className="font-semibold text-foreground">
                          Parking:
                        </span>{" "}
                        Park in the lot or street parking available.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-2.5">
                  {calendarEvent ? (
                    <AddToCalendarSheet
                      event={calendarEvent}
                      icsHref={icsHref}
                    />
                  ) : null}
                  <ShareDeckSheet
                    shareUrl={shareUrl}
                    title={event.title}
                    imageUrl={flyerUrls[0] ?? null}
                    trigger="button"
                    label="Share event"
                    className="h-11 w-full rounded-full border border-deck-card-brd bg-page px-4 text-[14px] font-semibold text-foreground"
                  />
                </div>
              </div>

              {!hasPrice ? (
                <div className="mt-4">
                  <p className="font-display text-[36px] leading-none tracking-tight">
                    Free
                  </p>
                  <Link
                    href={`${publicDeckPath(deck.handle)}?tab=events`}
                    className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground"
                  >
                    View on Deckk
                  </Link>
                </div>
              ) : null}
            </aside>
          </div>

          {/* Mobile: Deckk note at the very bottom of page content */}
          <div className="mt-8 lg:hidden">
            <DeckkPlatformNote
              withStripe={canBuyOnDeckk || useExternalTickets}
            />
          </div>

          {canBuyOnDeckk && unitPriceCents != null ? (
            <BuyTicketsButton
              handle={deck.handle}
              cardId={event.id}
              unitPriceCents={unitPriceCents}
              maxQuantity={maxQuantity}
              soldOut={soldOut}
              stickyPurchase
              tiers={ticketTiers}
              stickyTheme={isButchBrunch ? "electric" : "default"}
              stickyProceeds={
                isButchBrunch
                  ? "Proceeds to Union del Barrio and Unnamed Place"
                  : undefined
              }
            />
          ) : null}

          {useExternalTickets && unitPriceCents != null && externalTicketUrl ? (
            <ExternalTicketsButton
              href={externalTicketUrl}
              unitPriceCents={unitPriceCents}
              label={event.cta_label?.trim() || "Get tickets"}
            />
          ) : null}
        </main>
      </div>
    </PublicThemeShell>
  );
}
