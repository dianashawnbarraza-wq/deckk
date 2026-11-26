import type { Card } from "@/types/cards";

export type LinkBucket = "social" | "support" | "adult" | "listen" | "writing" | "shop" | "other";

export type StudioSectionId =
  | "shop"
  | "events"
  | "social"
  | "support"
  | "adult"
  | "listen"
  | "more";

export const STUDIO_SECTIONS: {
  id: StudioSectionId;
  title: string;
  hint: string;
}[] = [
  {
    id: "shop",
    title: "Shop",
    hint: "Etsy, Big Cartel, or other shop links · star up to 4 to feature on home",
  },
  {
    id: "events",
    title: "Future events",
    hint: "Flyer, Momence, Eventbrite, Dice, or any ticket link",
  },
  {
    id: "social",
    title: "Social",
    hint: "Instagram, TikTok, and other social platforms",
  },
  {
    id: "support",
    title: "Support",
    hint: "Venmo, Cash App, PayPal, GoFundMe, or other tip links",
  },
  {
    id: "adult",
    title: "18+",
    hint: "OnlyFans, Fansly, and similar platforms",
  },
  {
    id: "listen",
    title: "Listen",
    hint: "Spotify, YouTube Music, and other music platforms",
  },
  {
    id: "more",
    title: "Home / other",
    hint: "Misc links shown on home — or move them into a section above",
  },
];

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

/** Instant-pay hosts that can be Support (tip) or Pay (send money). */
const PAY_HOSTS = [
  "venmo.com",
  "account.venmo.com",
  "cash.app",
  "paypal.com",
  "paypal.me",
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
  "music.youtube.com",
  "music.apple.com",
  "bandcamp.com",
  "soundcloud.com",
  "tidal.com",
  "deezer.com",
];

const SHOP_HOSTS = [
  "etsy.com",
  "bigcartel.com",
  "shopify.com",
  "myshopify.com",
  "square.site",
  "squareup.com",
  "storenvy.com",
  "depop.com",
  "poshmark.com",
  "gumroad.com",
  "payhip.com",
  "shop.app",
  "amazon.com",
  "ebay.com",
];

/** Ticket / RSVP / class-booking platforms → suggest as Events. */
const TICKET_HOSTS = [
  "momence.com",
  "eventbrite.com",
  "eventbrite.co.uk",
  "dice.fm",
  "link.dice.fm",
  "partiful.com",
  "lu.ma",
  "luma.com",
  "humanitix.com",
  "ticketmaster.com",
  "ticketweb.com",
  "tixr.com",
  "posh.vip",
  "ra.co",
  "residentadvisor.net",
  "feverup.com",
  "fever.com",
  "shotgun.live",
  "seetickets.com",
  "axs.com",
  "universe.com",
  "ticketleap.com",
  "ticketspice.com",
  "tickettailor.com",
  "brownpapertickets.com",
  "showclix.com",
  "allevents.in",
  "meetup.com",
  "withfriends.com",
  "pixieset.com",
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

/** True when a URL looks like an ecommerce / shop listing host. */
export function isEcommerceUrl(url: string | null | undefined): boolean {
  const host = hostOf(url);
  if (!host) return false;
  return matchesHost(host, SHOP_HOSTS);
}

/** True when a URL looks like a tickets / RSVP / class booking page. */
export function isTicketUrl(url: string | null | undefined): boolean {
  const host = hostOf(url);
  if (!host) return false;
  return matchesHost(host, TICKET_HOSTS);
}

export function isShopLink(card: Pick<Card, "type" | "tags" | "cta_url" | "title" | "description">): boolean {
  if (card.type === "item") return true;
  if (card.type !== "link") return false;
  const tags = card.tags.map((t) => t.toLowerCase());
  if (tags.includes("shop") || tags.includes("ecommerce")) return true;
  const host = hostOf(card.cta_url);
  const blob = `${card.title} ${card.description ?? ""} ${card.cta_url ?? ""}`.toLowerCase();
  return (
    matchesHost(host, SHOP_HOSTS) ||
    /\b(etsy|big\s*cartel|shopify|my shop|online shop)\b/.test(blob)
  );
}

/** Venmo / Cash App / PayPal — creator chooses Support vs Pay. */
export function isPayChoiceLink(
  card: Pick<Card, "type" | "cta_url" | "title" | "description">
): boolean {
  if (card.type !== "link") return false;
  const host = hostOf(card.cta_url);
  const blob = `${card.title} ${card.description ?? ""} ${card.cta_url ?? ""}`.toLowerCase();
  return matchesHost(host, PAY_HOSTS) || /\b(venmo|cash\s*app|paypal)\b/.test(blob);
}

export function payPlacement(card: Pick<Card, "tags">): "support" | "pay" {
  const tags = card.tags.map((t) => t.toLowerCase());
  if (tags.includes("pay")) return "pay";
  return "support";
}

export function tagsForPayPlacement(
  currentTags: string[],
  placement: "support" | "pay"
): string[] {
  const base = currentTags.filter((t) => {
    const lower = t.toLowerCase();
    return lower !== "pay" && lower !== "support" && lower !== "tip" && lower !== "social";
  });
  if (placement === "pay") return [...base, "pay"];
  return [...base, "support"];
}

export function classifyLink(card: Pick<Card, "tags" | "cta_url" | "title" | "description">): LinkBucket {
  const tags = card.tags.map((t) => t.toLowerCase());
  if (tags.includes("pay")) return "support";
  if (tags.includes("social")) return "social";
  if (tags.includes("support") || tags.includes("tip") || tags.includes("wishlist")) return "support";
  if (tags.includes("adult") || tags.includes("18+") || tags.includes("nsfw")) return "adult";
  if (tags.includes("listen") || tags.includes("music")) return "listen";
  if (tags.includes("writing") || tags.includes("newsletter")) return "writing";
  if (tags.includes("shop") || tags.includes("ecommerce")) return "shop";

  const host = hostOf(card.cta_url);
  const blob = `${card.title} ${card.description ?? ""} ${card.cta_url ?? ""}`.toLowerCase();

  if (matchesHost(host, ADULT_HOSTS) || /\b(onlyfans|fansly|just\s*for\s*fans)\b/.test(blob)) {
    return "adult";
  }
  if (
    (matchesHost(host, LISTEN_HOSTS) ||
      /\b(spotify|youtube music|apple music|bandcamp|soundcloud)\b/.test(blob)) &&
    !(
      (host.includes("youtube") || host.includes("youtu.be")) &&
      !host.includes("music.youtube")
    )
  ) {
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
  if (
    matchesHost(host, SHOP_HOSTS) ||
    /\b(etsy|big\s*cartel|shopify|my shop|online shop)\b/.test(blob)
  ) {
    return "shop";
  }
  if (matchesHost(host, SOCIAL_HOSTS)) return "social";

  return "other";
}

export function studioSectionForCard(card: Card): StudioSectionId {
  if (card.type === "event" || card.type === "announcement") return "events";
  if (card.type === "item" || isShopLink(card)) return "shop";
  if (card.type === "link") {
    // Social profile links are managed in Profile, not Links.
    // Pay links (Venmo/Cash App) land under Support.
    if (isPayChoiceLink(card) && payPlacement(card) === "pay") return "support";
    const bucket = classifyLink(card);
    if (bucket === "social") return "social";
    if (bucket === "support") return "support";
    if (bucket === "adult") return "adult";
    if (bucket === "listen") return "listen";
    if (bucket === "shop") return "shop";
  }
  return "more";
}

const SECTION_TAG_KEYS = [
  "social",
  "support",
  "tip",
  "wishlist",
  "pay",
  "adult",
  "18+",
  "nsfw",
  "listen",
  "music",
  "writing",
  "newsletter",
  "shop",
  "ecommerce",
  "home",
] as const;

/** Tags used to place a misc/link card into a Studio section. */
export function tagsForStudioSection(
  currentTags: string[],
  section: StudioSectionId
): string[] {
  const base = currentTags.filter(
    (t) => !SECTION_TAG_KEYS.includes(t.toLowerCase() as (typeof SECTION_TAG_KEYS)[number])
  );
  switch (section) {
    case "social":
      return [...base, "social"];
    case "support":
      return [...base, "support"];
    case "adult":
      return [...base, "adult"];
    case "listen":
      return [...base, "listen", "music"];
    case "shop":
      return [...base, "shop"];
    case "events":
      return base;
    case "more":
    default:
      return [...base, "home"];
  }
}

export function isFeaturedItem(card: Card): boolean {
  const starred = card.featured === true || card.tags.includes("featured");
  if (!starred) return false;
  return card.type === "item" || isShopLink(card);
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
    hasShop: live.some((c) => c.type === "item" || isShopLink(c)),
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
