import type { Card, PublicTab } from "@/types/cards";
import { cardsInBucket, isFeaturedItem } from "@/lib/card-taxonomy";

const MS_DAY = 86_400_000;
const FRESH_ITEM_DAYS = 14;
const PAST_VISIBLE_DAYS = 30;

function isPast(card: Card, now: Date): boolean {
  const end = card.date_end ?? card.date_start;
  if (!end) return false;
  // Calendar-day past: still "upcoming" through the end date's local day.
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(end).getTime() < startOfToday.getTime();
}

function isFreshItem(card: Card, now: Date): boolean {
  if (card.type !== "item") return false;
  const ageDays = (now.getTime() - new Date(card.created_at).getTime()) / MS_DAY;
  return ageDays <= FRESH_ITEM_DAYS;
}

function isHiddenPast(card: Card, now: Date): boolean {
  if (!isPast(card, now)) return false;
  const end = card.date_end ?? card.date_start;
  if (!end) return false;
  const daysSinceEnd = (now.getTime() - new Date(end).getTime()) / MS_DAY;
  return daysSinceEnd > PAST_VISIBLE_DAYS;
}

export interface RankedCards {
  pinned: Card | null;
  happeningSoon: Card[];
  freshItems: Card[];
  featuredItems: Card[];
  socialLinks: Card[];
  supportLinks: Card[];
  adultLinks: Card[];
  listenLinks: Card[];
  writingLinks: Card[];
  shopLinks: Card[];
  evergreen: Card[];
  past: Card[];
}

/** Pure ranking per PRD §6.2 — unit-testable, not in SQL. */
export function rankCards(cards: Card[], now: Date = new Date()): RankedCards {
  const live = cards.filter((c) => c.status === "live" && !isHiddenPast(c, now));
  const pinned = live.find((c) => c.pinned) ?? null;
  // Keep pinned cards in event/item buckets so they still appear on Home + tabs.
  // `pinned` is only used for spotlight / calendar landing.

  const timeRanked = live
    .filter((c) => c.type === "event" || c.type === "announcement")
    .sort((a, b) => {
      const aUndated = !a.date_start && !a.date_end;
      const bUndated = !b.date_start && !b.date_end;
      if (aUndated !== bUndated) return aUndated ? 1 : -1;
      const aT = new Date(a.date_start ?? a.date_end ?? 0).getTime();
      const bT = new Date(b.date_start ?? b.date_end ?? 0).getTime();
      if (aT !== bT) return aT - bT;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const freshItems = live
    .filter((c) => isFreshItem(c, now))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const featuredItems = live
    .filter((c) => isFeaturedItem(c))
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
    .slice(0, 4);

  const socialLinks = cardsInBucket(live, "social");
  const supportLinks = cardsInBucket(live, "support");
  const adultLinks = cardsInBucket(live, "adult");
  const listenLinks = cardsInBucket(live, "listen");
  const writingLinks = cardsInBucket(live, "writing");
  const shopLinks = cardsInBucket(live, "shop");

  const reservedLinkIds = new Set([
    ...socialLinks,
    ...supportLinks,
    ...adultLinks,
    ...listenLinks,
    ...writingLinks,
    ...shopLinks,
  ].map((c) => c.id));
  const featuredIds = new Set(featuredItems.map((c) => c.id));
  const freshIds = new Set(freshItems.map((c) => c.id));
  const timeIds = new Set(timeRanked.map((c) => c.id));

  const evergreen = live
    .filter(
      (c) =>
        !timeIds.has(c.id) &&
        !freshIds.has(c.id) &&
        !featuredIds.has(c.id) &&
        !reservedLinkIds.has(c.id) &&
        (c.type === "link" || c.type === "collection" || c.type === "item")
    )
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

  const past = cards
    .filter((c) => c.status === "live" && isPast(c, now) && !isHiddenPast(c, now))
    .sort((a, b) => {
      const aEnd = new Date(a.date_end ?? a.date_start ?? 0).getTime();
      const bEnd = new Date(b.date_end ?? b.date_start ?? 0).getTime();
      return bEnd - aEnd;
    });

  return {
    pinned,
    happeningSoon: timeRanked.filter((c) => !isPast(c, now)),
    freshItems,
    featuredItems,
    socialLinks,
    supportLinks,
    adultLinks,
    listenLinks,
    writingLinks,
    shopLinks,
    evergreen,
    past,
  };
}

export function cardsForTab(ranked: RankedCards, tab: PublicTab): Card[] {
  if (tab === "events") {
    const pinnedEvent =
      ranked.pinned &&
      (ranked.pinned.type === "event" || ranked.pinned.type === "announcement")
        ? [ranked.pinned]
        : [];
    return [...pinnedEvent, ...ranked.happeningSoon, ...ranked.past];
  }
  if (tab === "shop") {
    const featuredIds = new Set(ranked.featuredItems.map((f) => f.id));
    const items = [
      ...ranked.freshItems.filter((c) => !featuredIds.has(c.id)),
      ...ranked.evergreen.filter((c) => c.type === "item" && !featuredIds.has(c.id)),
    ];
    const shopExtras = ranked.shopLinks.filter((c) => !featuredIds.has(c.id));
    const seen = new Set<string>();
    const out: Card[] = [];
    for (const c of [...ranked.featuredItems, ...items, ...shopExtras]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
    return out;
  }
  if (tab === "adult") return ranked.adultLinks;
  if (tab === "listen") return ranked.listenLinks;
  if (tab === "writing") return ranked.writingLinks;

  const seen = new Set<string>();
  const out: Card[] = [];
  for (const c of [
    ranked.pinned,
    ...ranked.happeningSoon,
    ...ranked.featuredItems,
    ...ranked.freshItems,
    ...ranked.supportLinks,
    ...ranked.evergreen,
  ]) {
    if (!c || seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}

/** Cards to preview on Home Featured shop (featured first, then fill). */
export function homeShopPreview(ranked: RankedCards, limit = 4): Card[] {
  const seen = new Set<string>();
  const out: Card[] = [];
  for (const c of [
    ...ranked.featuredItems,
    ...ranked.freshItems,
    ...ranked.shopLinks,
    ...ranked.evergreen.filter((card) => card.type === "item"),
  ]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Upcoming events/announcements in chronological order
 * (still happening or not yet started).
 */
export function getNextUpcomingEvents(
  cards: Card[],
  limit = 2,
  now: Date = new Date()
): Card[] {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  return cards
    .filter((c) => {
      if (c.status !== "live") return false;
      if (c.type !== "event" && c.type !== "announcement") return false;
      const end = c.date_end ?? c.date_start;
      if (!end) return false;
      return new Date(end).getTime() >= startOfToday.getTime();
    })
    .sort((a, b) => {
      const aT = new Date(a.date_start ?? a.date_end ?? 0).getTime();
      const bT = new Date(b.date_start ?? b.date_end ?? 0).getTime();
      return aT - bT;
    })
    .slice(0, Math.max(0, limit));
}

/** First upcoming event — Events calendar landing date. */
export function getNextUpcomingEvent(
  cards: Card[],
  now: Date = new Date()
): Card | null {
  return getNextUpcomingEvents(cards, 1, now)[0] ?? null;
}
