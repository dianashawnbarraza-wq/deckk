import type { Card } from "@/types/cards";

const MS_DAY = 86_400_000;
const FRESH_ITEM_DAYS = 14;
const EVENT_URGENT_DAYS = 7;
const EVENT_SOON_DAYS = 30;
const PAST_VISIBLE_DAYS = 30;

function urgencyBoost(card: Card, now: Date): number {
  if (card.type !== "event" && card.type !== "announcement") return 0;
  const start = card.date_start ? new Date(card.date_start).getTime() : null;
  const end = card.date_end ? new Date(card.date_end).getTime() : start;
  if (end == null) return 0;
  if (end < now.getTime()) return -100;
  if (start == null) return 10;
  const daysUntil = (start - now.getTime()) / MS_DAY;
  if (daysUntil <= EVENT_URGENT_DAYS) return 100;
  if (daysUntil <= EVENT_SOON_DAYS) return 50;
  return 10;
}

function recencyScore(card: Card, now: Date): number {
  const created = new Date(card.created_at).getTime();
  const ageDays = (now.getTime() - created) / MS_DAY;
  return Math.max(0, 30 - ageDays);
}

function isPast(card: Card, now: Date): boolean {
  const end = card.date_end ?? card.date_start;
  if (!end) return false;
  return new Date(end).getTime() < now.getTime();
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
  evergreen: Card[];
  past: Card[];
}

/** Pure ranking per PRD §6.2 — unit-testable, not in SQL. */
export function rankCards(cards: Card[], now: Date = new Date()): RankedCards {
  const live = cards.filter((c) => c.status === "live" && !isHiddenPast(c, now));
  const pinned = live.find((c) => c.pinned) ?? null;
  const withoutPinned = pinned ? live.filter((c) => c.id !== pinned.id) : live;

  const timeRanked = withoutPinned
    .filter((c) => c.type === "event" || c.type === "announcement")
    .sort((a, b) => {
      const scoreA = urgencyBoost(a, now) + recencyScore(a, now);
      const scoreB = urgencyBoost(b, now) + recencyScore(b, now);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const freshItems = withoutPinned
    .filter((c) => isFreshItem(c, now))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const freshIds = new Set(freshItems.map((c) => c.id));
  const timeIds = new Set(timeRanked.map((c) => c.id));

  const evergreen = withoutPinned
    .filter(
      (c) =>
        !timeIds.has(c.id) &&
        !freshIds.has(c.id) &&
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
    evergreen,
    past,
  };
}

export function cardsForTab(
  ranked: RankedCards,
  tab: "home" | "events" | "shop"
): Card[] {
  if (tab === "events") {
    const pinnedEvent =
      ranked.pinned &&
      (ranked.pinned.type === "event" || ranked.pinned.type === "announcement")
        ? [ranked.pinned]
        : [];
    return [...pinnedEvent, ...ranked.happeningSoon, ...ranked.past];
  }
  if (tab === "shop") {
    return [...ranked.freshItems, ...ranked.evergreen.filter((c) => c.type === "item")];
  }
  const seen = new Set<string>();
  const out: Card[] = [];
  for (const c of [
    ranked.pinned,
    ...ranked.happeningSoon,
    ...ranked.freshItems,
    ...ranked.evergreen,
  ]) {
    if (!c || seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}
