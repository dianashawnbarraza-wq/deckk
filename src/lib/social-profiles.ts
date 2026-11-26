import type { Card } from "@/types/cards";

export type SocialPlatformId =
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "threads";

export type SocialPlatformDef = {
  id: SocialPlatformId;
  label: string;
  placeholder: string;
  prefix: string;
  /** Match existing cards / build profile URLs. */
  hosts: string[];
  buildUrl: (handle: string) => string;
  parseHandle: (url: string) => string | null;
};

function stripAt(raw: string): string {
  return raw.trim().replace(/^@+/, "").replace(/^\/+/, "").split(/[/?#\s]/)[0] ?? "";
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export const SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "yourhandle",
    prefix: "@",
    hosts: ["instagram.com"],
    buildUrl: (h) => `https://instagram.com/${h}`,
    parseHandle: (url) => {
      try {
        const path = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
        const first = path.split("/")[0] ?? "";
        if (!first || first === "p" || first === "reel" || first === "stories") return null;
        return stripAt(first);
      } catch {
        return null;
      }
    },
  },
  {
    id: "tiktok",
    label: "TikTok",
    placeholder: "yourhandle",
    prefix: "@",
    hosts: ["tiktok.com"],
    buildUrl: (h) => `https://www.tiktok.com/@${h}`,
    parseHandle: (url) => {
      try {
        const path = new URL(url).pathname;
        const m = path.match(/@([^/?#]+)/);
        return m?.[1] ? stripAt(m[1]) : null;
      } catch {
        return null;
      }
    },
  },
  {
    id: "x",
    label: "X",
    placeholder: "yourhandle",
    prefix: "@",
    hosts: ["x.com", "twitter.com"],
    buildUrl: (h) => `https://x.com/${h}`,
    parseHandle: (url) => {
      try {
        const path = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
        const first = path.split("/")[0] ?? "";
        if (!first || first === "i" || first === "intent") return null;
        return stripAt(first);
      } catch {
        return null;
      }
    },
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "channel",
    prefix: "@",
    hosts: ["youtube.com", "youtu.be"],
    buildUrl: (h) => `https://youtube.com/@${h}`,
    parseHandle: (url) => {
      try {
        const u = new URL(url);
        const path = u.pathname;
        const at = path.match(/@([^/?#]+)/);
        if (at?.[1]) return stripAt(at[1]);
        const ch = path.match(/\/channel\/([^/?#]+)/);
        return ch?.[1] ? stripAt(ch[1]) : null;
      } catch {
        return null;
      }
    },
  },
  {
    id: "threads",
    label: "Threads",
    placeholder: "yourhandle",
    prefix: "@",
    hosts: ["threads.net"],
    buildUrl: (h) => `https://www.threads.net/@${h}`,
    parseHandle: (url) => {
      try {
        const path = new URL(url).pathname;
        const m = path.match(/@([^/?#]+)/);
        return m?.[1] ? stripAt(m[1]) : null;
      } catch {
        return null;
      }
    },
  },
];

export function platformForHost(host: string): SocialPlatformDef | null {
  const h = host.replace(/^www\./, "").toLowerCase();
  return (
    SOCIAL_PLATFORMS.find((p) => p.hosts.some((x) => h === x || h.endsWith(`.${x}`))) ??
    null
  );
}

export function detectSocialPlatform(
  card: Pick<Card, "title" | "cta_url" | "tags">
): SocialPlatformDef | null {
  if (card.cta_url) {
    const byHost = platformForHost(hostname(card.cta_url));
    if (byHost) return byHost;
  }
  const blob = `${card.title} ${(card.tags ?? []).join(" ")}`.toLowerCase();
  return (
    SOCIAL_PLATFORMS.find((p) => blob.includes(p.id) || blob.includes(p.label.toLowerCase())) ??
    null
  );
}

/** Extract handles for each platform from existing link cards. */
export function socialHandlesFromCards(cards: Card[]): Record<SocialPlatformId, string> {
  const out = Object.fromEntries(
    SOCIAL_PLATFORMS.map((p) => [p.id, ""])
  ) as Record<SocialPlatformId, string>;

  for (const card of cards) {
    if (card.type !== "link" || card.status === "archived" || !card.cta_url) continue;
    const platform = detectSocialPlatform(card);
    if (!platform) continue;
    if (out[platform.id]) continue;
    const handle = platform.parseHandle(card.cta_url) ?? stripAt(card.title);
    if (handle) out[platform.id] = handle;
  }
  return out;
}

export function normalizeSocialHandle(raw: string): string {
  return stripAt(raw).slice(0, 64);
}

/** Parse a full profile URL into a known platform + handle, if possible. */
export function socialFromUrl(
  rawUrl: string
): { platform: SocialPlatformDef; handle: string } | null {
  try {
    const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const url = new URL(withProtocol);
    const platform = platformForHost(url.hostname);
    if (!platform) return null;
    const handle = platform.parseHandle(url.toString());
    if (!handle) return null;
    return { platform, handle: normalizeSocialHandle(handle) };
  } catch {
    return null;
  }
}

/**
 * Upsert social link cards for the signed-in deck.
 * Empty handle → archive matching card if present.
 */
export async function syncSocialHandles(
  cards: Card[],
  handles: Partial<Record<SocialPlatformId, string>>
): Promise<{ ok: boolean; error?: string }> {
  for (const platform of SOCIAL_PLATFORMS) {
    const next = normalizeSocialHandle(handles[platform.id] ?? "");
    const existing = cards.find((c) => {
      if (c.type !== "link" || c.status === "archived") return false;
      return detectSocialPlatform(c)?.id === platform.id;
    });

    if (!next) {
      if (existing) {
        const res = await fetch(`/api/cards/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "archived" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { ok: false, error: data.error ?? `Could not remove ${platform.label}` };
        }
      }
      continue;
    }

    const url = platform.buildUrl(next);
    if (existing) {
      const res = await fetch(`/api/cards/${existing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: platform.label,
          ctaUrl: url,
          ctaLabel: "Follow",
          status: "live",
          tags: ["social", platform.id],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: false, error: data.error ?? `Could not update ${platform.label}` };
      }
    } else {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "link",
          title: platform.label,
          ctaUrl: url,
          ctaLabel: "Follow",
          status: "live",
          tags: ["social", platform.id],
          source: "manual",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: false, error: data.error ?? `Could not add ${platform.label}` };
      }
    }
  }
  return { ok: true };
}
