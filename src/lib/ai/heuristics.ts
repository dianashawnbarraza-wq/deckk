import type { ComposeResult } from "@/lib/ai/types";

const URL_RE = /https?:\/\/[^\s<>"')]+/i;
const PRICE_RE = /\$\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:usd|dollars?)/i;

function inferLinkCategory(url: string): ComposeResult["link"] extends infer L
  ? L extends { category?: infer C }
    ? C
    : never
  : never {
  const host = new URL(url).hostname.toLowerCase();
  if (host.includes("tiktok") || host.includes("instagram") || host.includes("twitter") || host.includes("x.com")) {
    return "social" as never;
  }
  if (host.includes("spotify") || host.includes("soundcloud") || host.includes("apple.com/music")) {
    return "listen" as never;
  }
  if (host.includes("youtube") || host.includes("youtu.be")) {
    return "listen" as never;
  }
  if (host.includes("substack") || host.includes("medium")) {
    return "read" as never;
  }
  return "custom" as never;
}

function linkTitleFromUrl(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host.includes("tiktok")) return "TikTok";
  if (host.includes("instagram")) return "Instagram";
  if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube";
  if (host.includes("spotify")) return "Spotify";
  return host.split(".")[0] ?? "Link";
}

export function heuristicCompose(
  prompt: string,
  timezone: string,
  imageUrl?: string | null
): ComposeResult {
  const lower = prompt.toLowerCase();
  const url = prompt.match(URL_RE)?.[0] ?? null;
  const priceMatch = prompt.match(PRICE_RE);
  const priceCents = priceMatch
    ? Math.round(Number.parseFloat(priceMatch[1] ?? priceMatch[2]) * 100)
    : undefined;

  const wantsEvent =
    Boolean(imageUrl) ||
    /\b(flyer|event|calendar|show|market|pop[- ]?up|workshop|concert|rsvp)\b/.test(lower);
  const wantsSell = /\b(sell|shop|product|listing|for sale)\b/.test(lower) || Boolean(priceCents);
  const wantsTip = /\b(tip|support|donate|tip jar)\b/.test(lower);

  if (url && !wantsEvent && !wantsSell) {
    return {
      intent: "link",
      summary: "Social or custom link",
      link: {
        title: linkTitleFromUrl(url),
        url,
        category: inferLinkCategory(url),
      },
    };
  }

  if (wantsSell || (priceCents && !wantsEvent)) {
    const title =
      prompt.replace(URL_RE, "").replace(PRICE_RE, "").trim().slice(0, 80) ||
      "New listing";
    return {
      intent: "product",
      summary: "Product for your shop",
      imageDescription: imageUrl ? "Photo attached — edit the description below." : undefined,
      product: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        description: imageUrl
          ? "Describe your item — we attached your photo as the listing image."
          : prompt,
        priceCents: priceCents ?? 1500,
        inventoryQty: null,
      },
    };
  }

  if (wantsTip) {
    return {
      intent: "payment_link",
      summary: "Tip jar or fixed support link",
      paymentLink: {
        kind: priceCents ? "fixed" : "tip",
        title: "Support my work",
        amountCents: priceCents ?? null,
      },
    };
  }

  if (wantsEvent || imageUrl) {
    const titleGuess =
      prompt
        .replace(URL_RE, "")
        .replace(/\b(post|add|share|this|flyer|to my calendar|calendar)\b/gi, "")
        .trim()
        .slice(0, 100) || "New event";

    return {
      intent: "event",
      summary: "Event from your flyer",
      imageDescription: imageUrl
        ? "Flyer attached — review the details below and adjust anything that looks off."
        : undefined,
      event: {
        title: titleGuess.charAt(0).toUpperCase() + titleGuess.slice(1),
        description: prompt || "Event details from your flyer.",
        timezone,
        isAllDay: false,
        communityOptIn: /\b(community|public)\b/.test(lower),
        location: null,
        isOnline: /\b(online|zoom|virtual|livestream)\b/.test(lower),
        url: url,
        city: null,
      },
    };
  }

  if (url) {
    return {
      intent: "link",
      summary: "Link for your deck",
      link: {
        title: linkTitleFromUrl(url),
        url,
        category: inferLinkCategory(url),
      },
    };
  }

  return {
    intent: "link",
    summary: "Custom link",
    link: {
      title: prompt.slice(0, 60) || "New link",
      url: "https://",
      category: "custom",
    },
  };
}
