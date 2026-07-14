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

type PaymentKind = "venmo" | "cashapp" | "paypal" | "gofundme" | "kofi" | "generic";

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

export function detectPaymentKind(card: Pick<Card, "title" | "cta_url" | "tags">): PaymentKind {
  const host = hostOf(card.cta_url);
  const blob = `${card.title} ${card.tags.join(" ")} ${card.cta_url ?? ""}`.toLowerCase();
  if (host.includes("venmo") || blob.includes("venmo")) return "venmo";
  if (host.includes("cash.app") || blob.includes("cash app") || blob.includes("cashapp")) {
    return "cashapp";
  }
  if (host.includes("paypal") || blob.includes("paypal")) return "paypal";
  if (host.includes("gofundme") || blob.includes("gofundme")) return "gofundme";
  if (host.includes("ko-fi") || host.includes("kofi") || blob.includes("ko-fi")) return "kofi";
  return "generic";
}

/** Official-style Instagram glyph (camera + lens + flash). */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
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
      <path d="M12.186 24h-.007a10.184 10.184 0 0 1-7.187-2.976 10.23 10.23 0 0 1-2.98-7.246c-.01-5.61 4.54-10.16 10.15-10.17h.014c5.61.01 10.16 4.56 10.17 10.17a10.184 10.184 0 0 1-10.16 10.222Zm6.905-15.307a7.256 7.256 0 0 0-3.72-1.078h-.04c-1.306 0-2.46.322-3.413.933-.96.616-1.619 1.484-1.97 2.575-.211.658-.257 1.36-.14 2.09.176 1.086.688 2.042 1.53 2.85.82.79 1.86 1.317 3.1 1.572.3.06.605.09.914.09 1.35 0 2.55-.41 3.57-1.216.08-.063.127-.16.127-.26 0-.11-.05-.21-.14-.27l-.92-.63a.33.33 0 0 0-.4.02 4.14 4.14 0 0 1-2.24.74c-.9 0-1.64-.27-2.19-.8-.5-.48-.78-1.12-.83-1.89h5.67c.18 0 .33-.15.33-.33v-.09c0-1.84-.53-3.3-1.57-4.34Zm-6.09 3.52c.13-.86.47-1.53 1.02-2.02.56-.5 1.28-.75 2.16-.75.9 0 1.62.28 2.15.83.49.51.78 1.2.86 2.06l-.01-.02H13Z" />
    </svg>
  );
}

function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944.481 1.489.481 4.285c0 1.374.86 12.01 5.564 16.545 1.806 1.76 3.55.9 4.302-.413.74-.96 1.526-.96 2.265 0 .753 1.312 2.496 2.172 4.302.413 4.704-4.535 5.564-15.17 5.564-16.545 0-2.796-2.085-3.341-4.721-1.48C16.046 4.747 13.087 8.686 12 10.8Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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

/** Venmo V monogram traced from brand mark (currentColor, no blue plate). */
function VenmoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M21.18 1.5L21.96 2.55L22.45 4.34L22.45 6.99L21.82 9.64L20.6 12.53L18.93 15.55L16.79 18.75L13.9 22.5H5.02L1.5 2.64L9.17 1.96L10.88 15.13L11.12 16.09L12 14.81L13.27 12.43L14.2 10.33L14.83 8.32L15.08 6.67L15.03 4.98L14.69 3.51L14.34 2.83L21.13 1.55Z" />
    </svg>
  );
}

function CashAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M23.59 3.46a5.14 5.14 0 0 0-4.12-2.06c-3.1-.1-6.1 1.81-7.53 5.06a4.88 4.88 0 0 0-3.62 1.26 4.88 4.88 0 0 0-1.62 3.44c0 .46.05.91.15 1.34C2.07 16.17.7 19.05.4 20.54a.75.75 0 0 0 .9.95c1.52-.33 4.34-1.78 6.01-6.57.44.1.9.15 1.36.15a4.88 4.88 0 0 0 3.44-1.62 4.88 4.88 0 0 0 1.26-3.62c3.25-1.43 5.16-4.43 5.06-7.53a5.14 5.14 0 0 0-2.06-4.12l.22.28Zm-9.1 9.56c-.86 0-1.56-.7-1.56-1.56s.7-1.56 1.56-1.56 1.56.7 1.56 1.56-.7 1.56-1.56 1.56Z" />
    </svg>
  );
}

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.666 1.049 4.676-.04.315-.09.636-.15.962-1.23 6.162-5.39 8.3-11.244 8.3H7.35c-.564 0-1.043.415-1.13.974l-.98 5.79a.64.64 0 0 1-.632.54l-.532-.015zm8.723-13.18c-.17.94-.39 1.83-.68 2.63 2.72-.097 4.66-1.55 5.21-4.55.37-2.02.01-3.42-1.02-4.32C18.42 1.03 16.75.64 14.52.64h-5.8a.64.64 0 0 0-.633.54L5.786 13.92a.64.64 0 0 0 .633.74h3.84c4.07 0 7.01-1.42 7.95-6.04.13-.61.23-1.19.31-1.74-.26.05-.52.09-.79.12z" />
    </svg>
  );
}

function GoFundMeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.7 13.3c-.4.4-.9.7-1.5.8-.6.2-1.2.2-1.8.1-.7-.1-1.3-.5-1.7-1-.4-.5-.6-1.1-.6-1.8V11h2.2v1.8c0 .3.1.6.3.8.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.5.3-.8V11h2.2v2.4c0 .7-.2 1.3-.6 1.9zM9.5 8.2c0-.6.5-1.1 1.1-1.1h2.8c.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1h-2.8c-.6 0-1.1-.5-1.1-1.1z" />
    </svg>
  );
}

function KofiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M11.4 21.5c-3.4 0-5.9-1.3-7.4-3.9C2.5 15 2 12.2 2.6 9.2c.5-2.7 2.2-5 4.6-6.4.5-.3 1-.1 1.2.4.5 1.4 1 2.8 1.6 4.1.2.5 0 1.1-.5 1.3-1 .4-1.7 1.2-2 2.3-.3 1.2 0 2.4.8 3.3.8.9 2 1.3 3.2 1.1 1.7-.3 2.9-1.8 2.9-3.6V8.9c0-.6.4-1 1-1h2.5c2.9 0 5.2 2.4 5.1 5.3-.1 2.7-2.4 4.9-5.1 5-.4 0-.8.3-.8.8v1.6c0 .5-.4.9-.9.9H11.4z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<SocialKind, (p: { className?: string }) => React.ReactNode> = {
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

const PAYMENT_ICONS: Record<PaymentKind, (p: { className?: string }) => React.ReactNode> = {
  venmo: VenmoIcon,
  cashapp: CashAppIcon,
  paypal: PayPalIcon,
  gofundme: GoFundMeIcon,
  kofi: KofiIcon,
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
  const Icon = SOCIAL_ICONS[kind];
  return <Icon className={cn("size-5", className)} />;
}

export function PaymentBrandIcon({
  card,
  className,
}: {
  card: Pick<Card, "title" | "cta_url" | "tags">;
  className?: string;
}) {
  const kind = detectPaymentKind(card);
  const Icon = PAYMENT_ICONS[kind];
  return <Icon className={cn("size-5", className)} />;
}

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
