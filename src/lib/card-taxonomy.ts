import type { Card } from "@/types/cards";

export type LinkBucket = "social" | "support" | "adult" | "listen" | "writing" | "other";

const SOCIAL_HOSTS = [
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "threads.net",
  "bsky.app",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
];

const SUPPORT_HOSTS = [
  "venmo.com",
  "account.venmo.com",
  "cash.app",
  "paypal.com",
  "paypal.me",
  "gofundme.com",
  "ko-fi.com",
  "buymeacoffee.com",
  "throne.com",
  "wishlist.com",
  "amazon.com",
];

const ADULT_HOSTS = [
  "onlyfans.com",
  "fansly.com",
  "justforfans.com",
  "jff.live",
  "manyvids.com",
];

const LISTEN_HOSTS = [
  "open.spotify.com",
  "spotify.com",
  "music.apple.com",
  "bandcamp.com",
  "soundcloud.com",
  "tidal.com",
  "deezer.com",
];

const WRITING_HOSTS = [
  "substack.com",
  "beehiiv.com",
  "ghost.io",
  "medium.com",
  "buttondown.email",
  "convertkit.com",
  "mailchi.mp",
  "newsletter",
];

function hostOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function matchesHost(host: string, list: string[]): boolean {
  return list.some((h) => host === h || host.endsWith(`.${h}`) || host.includes(h));
}

export function classifyLink(card: Pick<Card, "tags" | "cta_url" | "title" | "description">): LinkBucket {
  const tags = card.tags.map((t) => t.toLowerCase());
  if (tags.includes("social")) return "social";
  if (tags.includes("support") || tags.includes("tip") || tags.includes("wishlist")) return "support";
  if (tags.includes("adult") || tags.includes("18+") || tags.includes("nsfw")) return "adult";
  if (tags.includes("listen") || tags.includes("music")) return "listen";
  if (tags.includes("writing") || tags.includes("newsletter")) return "writing";

  const host = hostOf(card.cta_url);
  const blob = `${card.title} ${card.description ?? ""} ${card.cta_url ?? ""}`.toLowerCase();

  if (matchesHost(host, ADULT_HOSTS) || /\b(onlyfans|fansly|just\s*for\s*fans)\b/.test(blob)) {
    return "adult";
  }
  if (matchesHost(host, LISTEN_HOSTS) || /\b(spotify|apple music|bandcamp|soundcloud)\b/.test(blob)) {
    return "listen";
  }
  if (
    matchesHost(host, WRITING_HOSTS) ||
    /\b(substack|newsletter|mailing list|email list)\b/.test(blob)
  ) {
    return "writing";
  }
  if (
    matchesHost(host, SUPPORT_HOSTS) ||
    /\b(venmo|cash\s*app|gofundme|tip jar|wishlist|ko-fi|buy me a coffee)\b/.test(blob)
  ) {
    return "support";
  }
  if (matchesHost(host, SOCIAL_HOSTS)) return "social";

  return "other";
}

export function isFeaturedItem(card: Card): boolean {
  return card.type === "item" && (card.featured === true || card.tags.includes("featured"));
}

export function cardsInBucket(cards: Card[], bucket: LinkBucket): Card[] {
  return cards.filter((c) => c.type === "link" && c.status === "live" && classifyLink(c) === bucket);
}

export type NavCapability = {
  hasEvents: boolean;
  hasShop: boolean;
  hasAdult: boolean;
  hasListen: boolean;
  hasWriting: boolean;
};

export function detectNavCapabilities(cards: Card[]): NavCapability {
  const live = cards.filter((c) => c.status === "live");
  return {
    hasEvents: live.some((c) => c.type === "event" || c.type === "announcement"),
    hasShop: live.some((c) => c.type === "item"),
    hasAdult: cardsInBucket(live, "adult").length > 0,
    hasListen: cardsInBucket(live, "listen").length > 0,
    hasWriting: cardsInBucket(live, "writing").length > 0,
  };
}

/** Event fields that are important but often missing after flyer extract. */
export function missingEventFields(draft: {
  type: string;
  dateStart: string | null;
  locationName: string | null;
  locationAddress: string | null;
  ctaUrl: string | null;
}): { key: string; label: string; hint: string }[] {
  if (draft.type !== "event" && draft.type !== "announcement") return [];
  const missing: { key: string; label: string; hint: string }[] = [];
  if (!draft.dateStart) {
    missing.push({ key: "dateStart", label: "When", hint: "Date & time" });
  }
  if (!draft.locationName) {
    missing.push({ key: "locationName", label: "Venue", hint: "Where is it?" });
  }
  if (!draft.locationAddress) {
    missing.push({
      key: "locationAddress",
      label: "Address",
      hint: "Street address helps people find you",
    });
  }
  if (!draft.ctaUrl) {
    missing.push({ key: "ctaUrl", label: "RSVP / ticket link", hint: "Optional but useful" });
  }
  return missing;
}
