import type { Card } from "@/types/cards";
import { cn } from "@/lib/utils";

type SocialKind =
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "facebook"
  | "threads"
  | "bluesky"
  | "linkedin"
  | "generic";

function hostOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function detectSocialKind(card: Pick<Card, "title" | "cta_url" | "tags">): SocialKind {
  const host = hostOf(card.cta_url);
  const blob = `${card.title} ${card.tags.join(" ")}`.toLowerCase();
  if (host.includes("instagram") || blob.includes("instagram")) return "instagram";
  if (host.includes("tiktok") || blob.includes("tiktok")) return "tiktok";
  if (host === "x.com" || host.includes("twitter") || /\b(twitter|\bx\b)\b/.test(blob)) return "x";
  if (host.includes("youtube") || host.includes("youtu.be") || blob.includes("youtube")) {
    return "youtube";
  }
  if (host.includes("facebook") || blob.includes("facebook")) return "facebook";
  if (host.includes("threads") || blob.includes("threads")) return "threads";
  if (host.includes("bsky") || blob.includes("bluesky")) return "bluesky";
  if (host.includes("linkedin") || blob.includes("linkedin")) return "linkedin";
  return "generic";
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.92a3.12 3.12 0 1 1 0-6.24 3.12 3.12 0 0 1 0 6.24ZM17.52 6.96a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0ZM21.6 7.14a6.48 6.48 0 0 0-1.77-4.59A6.48 6.48 0 0 0 15.24 1.8c-1.78-.08-7.12-.08-8.9 0A6.5 6.5 0 0 0 1.77 6.56 6.5 6.5 0 0 0 0 11.16c-.08 1.78-.08 7.12 0 8.9a6.5 6.5 0 0 0 1.77 4.6 6.53 6.53 0 0 0 4.59 1.76c1.78.08 7.12.08 8.9 0a6.5 6.5 0 0 0 4.59-1.76 6.5 6.5 0 0 0 1.76-4.59c.08-1.78.08-7.11 0-8.89Zm-2.13 10.8a3.7 3.7 0 0 1-2.08 2.08c-1.44.57-4.86.44-6.45.44s-5.02.12-6.45-.44a3.7 3.7 0 0 1-2.08-2.08c-.57-1.44-.44-4.86-.44-6.45s-.12-5.02.44-6.45A3.7 3.7 0 0 1 4.49 2.98c1.44-.57 4.86-.44 6.45-.44s5.02-.12 6.45.44a3.7 3.7 0 0 1 2.08 2.08c.57 1.44.44 4.86.44 6.45s.13 5.02-.44 6.45Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.34 6.34 6.34 0 0 0 9.5 21.67a6.34 6.34 0 0 0 6.34-6.34V8.77a8.16 8.16 0 0 0 4.76 1.52V6.84a4.85 4.85 0 0 1-1.01-.15Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.84c0-2.37 1.4-3.68 3.56-3.68 1.03 0 2.11.18 2.11.18v2.33h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.9h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93Z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.186 24h-.007C6.56 23.991 2.008 19.437 2 13.76.991 6.46 6.561 1.009 12.186 1h.015c5.625.009 10.177 4.563 10.185 10.24A10.18 10.18 0 0 1 12.2 24h-.015Zm.015-21.4c-4.798.01-8.683 3.896-8.692 8.696-.008 4.8 3.877 8.69 8.677 8.701h.015c4.8-.01 8.685-3.896 8.693-8.696.009-4.8-3.877-8.69-8.678-8.701h-.015Z" />
      <path d="M16.6 11.2c-.4-2.4-2.3-3.5-4.6-3.5-2.8 0-4.8 1.8-4.8 4.6 0 2.7 2.1 4.5 5 4.5 1.6 0 3-.5 3.9-1.4.2-.2.1-.5-.1-.6l-.9-.6c-.2-.1-.4-.1-.6.1-.6.5-1.4.8-2.3.8-1.7 0-2.9-1-2.9-2.6 0-.1 0-.3.1-.4.4 1.1 1.5 1.8 3 1.8h.1c2.2 0 3.7-1.4 3.7-3.5 0-1.2-.6-2.2-1.7-2.6.4.5.6 1.2.5 2-.1 1.6-1.4 2.8-2.9 2.8-.5 0-1-.1-1.4-.4-.1-.1-.1-.3 0-.4l.7-.8c.1-.1.3-.1.5 0 .2.1.4.2.7.2.8 0 1.4-.7 1.5-1.5.1-1.1-.5-2-1.7-2-.9 0-1.6.5-2 1.2-.1.1-.2.1-.3 0l-.9-.4c-.1-.1-.2-.3-.1-.4.6-1.1 1.9-1.8 3.3-1.8 1.8-.1 3.2 1.1 3.4 2.7.1.7 0 1.4-.2 2Z" />
    </svg>
  );
}

function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 10.8c-1.1-2.1-4.1-6.1-6.9-8.1C2.7.9.5 1.4.5 4.3c0 1.5.8 12.4 5.7 17 1.7 1.6 3.5.9 4.4-.3.7-.9 1.5-.9 2.2 0 .9 1.2 2.7 1.9 4.4.3 4.9-4.6 5.7-15.5 5.7-17 0-2.9-2.2-3.4-4.6-1.6-2.8 2-5.8 6-6.9 8.1Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0Z" />
    </svg>
  );
}

function GenericSocialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

const ICONS: Record<SocialKind, (p: { className?: string }) => React.ReactNode> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  x: XIcon,
  youtube: YouTubeIcon,
  facebook: FacebookIcon,
  threads: ThreadsIcon,
  bluesky: BlueskyIcon,
  linkedin: LinkedInIcon,
  generic: GenericSocialIcon,
};

export function SocialBrandIcon({
  card,
  className,
}: {
  card: Pick<Card, "title" | "cta_url" | "tags">;
  className?: string;
}) {
  const kind = detectSocialKind(card);
  const Icon = ICONS[kind];
  return <Icon className={cn("size-5", className)} />;
}

/** Compact 18+ badge icon for bottom nav. */
export function EighteenPlusIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-[5px] border-[1.5px] border-current text-[9px] font-black leading-none tracking-tight",
        className
      )}
      aria-hidden
    >
      18+
    </span>
  );
}
