"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Heart, MapPin, ShoppingBag, X } from "lucide-react";
import type { Card } from "@/types/cards";
import { cn } from "@/lib/utils";
import { secondaryButton, desktopPress } from "@/lib/secondary-surface";
import { SocialBrandIcon, PaymentBrandIcon, detectPaymentKind } from "@/components/icons/social-icons";
import { useCopyToast, writeClipboard } from "@/components/shell/deck-copy-toast";
import {
  isVenmoUrl,
  openVenmo,
  outboundHref,
} from "@/lib/outbound-links";
import { eventPublicPath } from "@/lib/event-slug";

/** Image fill with shimmer until load — used when OG/product photos lag. */
export function CoverLoadingImage({
  src,
  alt = "",
  className,
  imgClassName,
  label = "Image is loading…",
  showLabel = true,
  onError,
}: {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  label?: string;
  showLabel?: boolean;
  onError?: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setStatus("loading");
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setStatus("loaded");
    }
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-page", className)}>
      {status === "loading" && (
        <div
          className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-1.5 px-2"
          aria-busy="true"
          aria-live="polite"
        >
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "linear-gradient(90deg, var(--deck-card-brd) 25%, color-mix(in srgb, var(--faint) 55%, transparent) 37%, var(--deck-card-brd) 63%)",
              backgroundSize: "400px 100%",
              animation: "deckk-shimmer 1.2s infinite linear",
            }}
          />
          {showLabel ? (
            <span className="relative z-[1] max-w-[9rem] text-center text-[10px] font-semibold leading-snug text-dim">
              {label}
            </span>
          ) : (
            <span
              className="relative z-[1] size-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
              aria-hidden
            />
          )}
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={() => {
          setStatus("error");
          onError?.();
        }}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          status === "loaded" ? "opacity-100" : "opacity-0",
          imgClassName
        )}
      />
      {status === "error" && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-page px-2 text-center text-[10px] font-medium text-faint">
          Photo unavailable
        </div>
      )}
    </div>
  );
}

export function ImageLightbox({
  src,
  alt = "",
  onClose,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black deckk-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 flex shrink-0 justify-end px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}

export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-deck-card-brd bg-deck-card p-3 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}


export function EventDateChip({ card }: { card: Card }) {
  const date = card.date_start ? new Date(card.date_start) : null;
  const month = date ? format(date, "MMM").toUpperCase() : "NEW";
  const day = date ? format(date, "d") : "★";
  const weekday = date ? format(date, "EEE").toUpperCase() : "";

  return (
    <div className="w-[52px] shrink-0 overflow-hidden rounded-[10px] text-center shadow-md">
      <div className="bg-primary px-0 py-0.5 text-[9px] font-bold tracking-widest text-primary-foreground">
        {month}
      </div>
      <div className="bg-[#1b1813] px-0 py-1.5 text-white">
        <div className="font-display text-[22px] leading-none text-white">{day}</div>
        {weekday && (
          <div className="mt-0.5 text-[8px] font-semibold tracking-[0.12em] text-white/60">
            {weekday}
          </div>
        )}
      </div>
    </div>
  );
}

/** Preferred chip order for event category tags. */
const EVENT_CHIP_ORDER = [
  "leather",
  "workshop",
  "party",
  "mosh",
  "craft",
  "reading",
  "social",
  "show",
  "class",
  "vending",
] as const;

function eventTypeChips(card: Card): string[] {
  const tags = card.tags.map((t) => t.toLowerCase());
  const fromTags = EVENT_CHIP_ORDER.filter((k) => tags.includes(k)).map((k) =>
    k.toUpperCase()
  );
  if (fromTags.length > 0) return fromTags;

  const title = card.title.toLowerCase();
  const inferred: string[] = [];
  if (/leather/.test(title) || tags.includes("leather")) inferred.push("LEATHER");
  if (/workshop|collar|class/.test(title)) inferred.push("WORKSHOP");
  if (/mosh|party/.test(title)) inferred.push("PARTY");
  if (/reading|poetry|open mic/.test(title)) inferred.push("READING");
  if (inferred.length > 0) return inferred;
  if (card.type === "announcement") return ["NEWS"];
  return ["EVENT"];
}

function priceChip(card: Card): string {
  if (card.ticketing_enabled && card.ticket_price_cents != null) {
    return `$${(card.ticket_price_cents / 100).toFixed(0)}`;
  }
  if (card.price != null && Number(card.price) > 0) {
    return `$${Number(card.price).toFixed(0)}`;
  }
  const label = (card.cta_label ?? "").toLowerCase();
  if (/ticket/.test(label)) return "Ticketed";
  return "Free";
}

function ctaLabel(card: Card): string | null {
  if (card.ticketing_enabled && card.ticket_price_cents != null) {
    const sold = card.tickets_sold ?? 0;
    const cap = card.ticket_capacity;
    if (cap != null && sold >= cap) return "Sold out";
    return "Get tickets";
  }
  if (!card.cta_url) return null;
  if (/etsy\.com/i.test(card.cta_url)) return "Shop on Etsy";
  const label = (card.cta_label ?? "").trim();
  if (/rsvp/i.test(label)) return "RSVP";
  if (/ticket/i.test(label)) return "Tickets";
  if (label) {
    if (/details|info|more|view/i.test(label)) return "Details";
    if (label.length <= 14) return label;
  }
  return "Details";
}

function shopCtaLabel(card: Card): string | null {
  if (!card.cta_url && !card.cta_label) return null;
  if (card.cta_url && /etsy\.com/i.test(card.cta_url)) return "Shop on Etsy";
  return (card.cta_label ?? "").trim() || "Shop";
}

function formatTimeRange(start: Date, end: Date | null): string {
  if (end) {
    const sM = format(start, "a");
    const eM = format(end, "a");
    if (sM === eM) {
      return `${format(start, "h")}–${format(end, "h")} ${eM}`;
    }
    return `${format(start, "h a")}–${format(end, "h a")}`;
  }
  return format(start, "h:mm a").replace(":00", "");
}

function LocationRow({
  name,
  address,
}: {
  name: string | null;
  address: string | null;
}) {
  const { showCopied } = useCopyToast();
  const copyText = [name, address].filter(Boolean).join("\n");
  if (!name && !address) return null;

  async function onAddressTap() {
    if (!copyText) return;
    const ok = await writeClipboard(copyText);
    if (ok) showCopied("Address copied");
  }

  const line =
    name && address ? `${name} · ${address}` : name || address || "";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void onAddressTap();
      }}
      title="Copy address"
      aria-label="Copy address"
      className="mt-2 flex w-full min-w-0 items-center gap-1.5 text-left transition-opacity active:opacity-70"
    >
      <MapPin className="size-3.5 shrink-0 text-primary" strokeWidth={2.4} />
      <span className="min-w-0 flex-1 truncate text-[12px] leading-snug text-foreground">
        {name && address ? (
          <>
            <span className="font-medium">{name}</span>
            <span className="text-dim"> · {address}</span>
          </>
        ) : (
          <span className="font-medium">{line}</span>
        )}
      </span>
    </button>
  );
}

export function EventCardRow({
  card,
  /** When true, sit inside a parent GlassCard with hairline dividers (no nested glass). */
  embedded = false,
  /** Deck handle — required for native ticket checkout. */
  handle,
}: {
  card: Card;
  embedded?: boolean;
  handle?: string;
}) {
  const [flyerOpen, setFlyerOpen] = useState(false);
  const flyer = card.media[0]?.url;
  const start = card.date_start ? new Date(card.date_start) : null;
  const end = card.date_end ? new Date(card.date_end) : null;
  const displayDate = start
    ? `${format(start, "EEE").toUpperCase()} ${format(start, "MMMM d")}`
    : null;
  const timePart = start ? formatTimeRange(start, end) : "";
  const action = ctaLabel(card);
  const typeChips = eventTypeChips(card);
  const price = priceChip(card);
  const nativeTickets =
    Boolean(card.ticketing_enabled && card.ticket_price_cents != null && handle);
  const soldOut =
    nativeTickets &&
    card.ticket_capacity != null &&
    (card.tickets_sold ?? 0) >= card.ticket_capacity;
  const remaining =
    card.ticket_capacity != null
      ? Math.max(0, card.ticket_capacity - (card.tickets_sold ?? 0))
      : null;
  const eventPageHref = eventPublicPath(card);

  const cta =
    nativeTickets ? (
      <Link
        href={eventPageHref}
        className={cn(
          "mt-0.5 inline-flex h-9 shrink-0 items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 lg:h-11 lg:rounded-2xl lg:px-4 lg:text-[14px]",
          desktopPress
        )}
      >
        {soldOut ? "Sold out" : "Get tickets"}
      </Link>
    ) : action && card.cta_url ? (
      card.cta_url.includes("/events/") ? (
        <Link
          href={card.cta_url.startsWith("http") ? new URL(card.cta_url).pathname : card.cta_url}
          className={cn(
          "mt-0.5 inline-flex h-9 shrink-0 items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 lg:h-11 lg:rounded-2xl lg:px-4 lg:text-[14px]",
          desktopPress
        )}
        >
          {action}
        </Link>
      ) : (
        <a
          href={outboundHref(card.cta_url)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-0.5 inline-flex h-9 shrink-0 items-center rounded-full bg-[#1b1813] px-3 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#0c0f14] lg:h-11 lg:rounded-2xl lg:px-4 lg:text-[14px]",
            desktopPress
          )}
        >
          {action}
        </a>
      )
    ) : (
      <Link
        href={eventPageHref}
        className="mt-0.5 inline-flex h-9 shrink-0 items-center rounded-full bg-[#1b1813] px-3 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#0c0f14] lg:h-11 lg:rounded-2xl lg:px-4 lg:text-[14px]"
      >
        Details
      </Link>
    );

  const body = (
    <div
      className={cn(
        "flex items-center gap-3",
        embedded && "border-b border-deck-card-brd/35 py-3 last:border-b-0 last:pb-0 first:pt-0",
        !embedded && "p-0"
      )}
    >
      {flyer ? (
        <button
          type="button"
          onClick={() => setFlyerOpen(true)}
          className="shrink-0 self-center overflow-hidden rounded-[12px] ring-1 ring-black/5 transition-transform duration-300 ease-out active:scale-[0.98] lg:rounded-[18px]"
          aria-label="View larger flyer"
        >
          <CoverLoadingImage
            src={flyer}
            className="h-[118px] w-[82px] lg:h-[168px] lg:w-[118px]"
            showLabel={false}
          />
        </button>
      ) : (
        <EventDateChip card={card} />
      )}

      <div className="min-w-0 flex-1 py-0.5 lg:py-1">
        <div className="flex items-start gap-2 lg:gap-4">
          <div className="min-w-0 flex-1">
            {flyer && displayDate && (
              <div className="mb-0.5 text-[12px] font-semibold tracking-wide text-primary lg:mb-1 lg:text-[14px]">
                {displayDate}
                {timePart ? (
                  <span className="font-medium text-dim"> · {timePart}</span>
                ) : null}
              </div>
            )}
            {!flyer && timePart && (
              <div className="mb-0.5 text-[12px] font-semibold text-primary lg:text-[14px]">
                {timePart}
              </div>
            )}
            <div className="font-display text-[18px] font-medium leading-tight tracking-normal text-foreground lg:text-[28px]">
              {card.title}
            </div>
          </div>

          {cta}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 lg:mt-2.5 lg:gap-2">
          {typeChips.map((label) => (
            <span
              key={label}
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-dim uppercase lg:px-2.5 lg:py-1 lg:text-[11px]"
            >
              {label}
            </span>
          ))}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary lg:px-2.5 lg:py-1 lg:text-[12px]">
            {price}
          </span>
          {nativeTickets && remaining != null && !soldOut && (
            <span className="text-[10px] font-semibold text-dim lg:text-[12px]">
              {remaining} left
            </span>
          )}
        </div>

        <LocationRow
          name={card.location_name}
          address={card.location_address}
        />
      </div>
    </div>
  );

  return (
    <>
      {embedded ? (
        body
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-deck-card-brd/60 bg-deck-card/80 p-2.5 shadow-[0_8px_28px_-20px_var(--deck-shadow)] backdrop-blur-xl lg:rounded-[28px] lg:p-4 lg:shadow-[0_16px_40px_-28px_var(--deck-shadow)]">
          {body}
        </div>
      )}

      {flyerOpen && flyer && (
        <ImageLightbox
          src={flyer}
          alt={card.title}
          onClose={() => setFlyerOpen(false)}
        />
      )}
    </>
  );
}

export function ItemCardGrid({
  card,
  /** When false, no outer glass frame (for use inside a section card). */
  framed = true,
}: {
  card: Card;
  framed?: boolean;
}) {
  const [imageOpen, setImageOpen] = useState(false);
  const image = card.media[0]?.url;
  const price = card.price != null ? `$${Number(card.price).toFixed(0)}` : null;
  const starred = card.featured || card.tags.includes("featured");
  const action = shopCtaLabel(card);
  const href = card.cta_url ? outboundHref(card.cta_url) : null;

  const body = (
    <>
      <div
        className={cn(
          "relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-page",
          framed ? "" : "rounded-[14px] lg:rounded-[20px]"
        )}
      >
        {image ? (
          <button
            type="button"
            onClick={() => setImageOpen(true)}
            className="absolute inset-0 transition-transform duration-300 ease-out active:scale-[0.985]"
            aria-label={`View ${card.title}`}
          >
            <CoverLoadingImage
              src={image}
              alt=""
              className="h-full w-full"
              label="Image is loading…"
            />
          </button>
        ) : (
          <div className="flex h-full items-center justify-center border border-dashed border-deck-card-brd text-faint text-xs">
            No photo
          </div>
        )}
        {starred && (
          <span className="pointer-events-none absolute left-2 top-2 z-[2] rounded-full bg-[#1b1813]/85 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm lg:left-3 lg:top-3 lg:px-2.5 lg:py-1 lg:text-[11px]">
            Featured
          </span>
        )}
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          framed ? "p-3 lg:p-5" : "pt-2.5 lg:pt-4"
        )}
      >
        <div className="line-clamp-2 font-display text-[17px] font-medium leading-tight tracking-normal text-foreground lg:text-[24px]">
          {card.title}
        </div>
        {card.description ? (
          <div className="mt-0.5 text-[11px] text-dim line-clamp-2 lg:mt-1.5 lg:text-[14px] lg:leading-relaxed">
            {card.description}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 lg:pt-4">
          {price && (
            <div className="text-sm font-semibold text-foreground lg:text-[17px]">{price}</div>
          )}
          {action && href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "ml-auto inline-flex h-9 items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 lg:h-11 lg:rounded-2xl lg:px-4 lg:text-[14px]",
                desktopPress
              )}
            >
              {action}
            </a>
          )}
          {action && !href && (
            <span className="ml-auto inline-flex h-9 items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-foreground lg:h-11 lg:rounded-2xl lg:px-4 lg:text-[14px]">
              {action}
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {framed ? (
        <div className="flex h-full flex-col overflow-hidden rounded-[16px] border border-deck-card-brd/60 bg-deck-card/80 shadow-[0_8px_28px_-20px_var(--deck-shadow)] backdrop-blur-xl lg:rounded-[28px] lg:shadow-[0_16px_40px_-28px_var(--deck-shadow)]">
          {body}
        </div>
      ) : (
        <div className="flex h-full flex-col">{body}</div>
      )}

      {imageOpen && image && (
        <ImageLightbox
          src={image}
          alt={card.title}
          onClose={() => setImageOpen(false)}
        />
      )}
    </>
  );
}

export function LinkCardRow({
  card,
  variant = "default",
}: {
  card: Card;
  variant?: "default" | "support";
}) {
  const showPayment = variant === "support";
  const href = outboundHref(card.cta_url);
  const venmo = isVenmoUrl(card.cta_url);

  return (
    <a
      href={href}
      target={venmo ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!venmo || !card.cta_url) return;
        e.preventDefault();
        openVenmo(card.cta_url, { preferPay: variant === "support" });
      }}
      className="flex items-center gap-3 rounded-[14px] border border-deck-card-brd bg-deck-card p-3 backdrop-blur-xl transition-opacity hover:opacity-90"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-white">
        {showPayment ? (
          <PaymentBrandIcon card={card} className="size-[18px]" />
        ) : (
          <span className="font-display text-lg">
            {(card.title || "L").charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{card.title}</div>
        {card.description && <div className="text-xs text-dim">{card.description}</div>}
      </div>
      <span className="text-faint">→</span>
    </a>
  );
}

export function SocialIconLink({
  card,
  compact = false,
}: {
  card: Card;
  /** Smaller hit target for condensed headers. */
  compact?: boolean;
}) {
  const kind = card.title || "Link";
  const payment = detectPaymentKind(card);
  const isPayment = payment !== "generic";
  const href = outboundHref(card.cta_url);
  const venmo = isVenmoUrl(card.cta_url);
  if (!href) return null;
  return (
    <a
      href={href}
      target={venmo ? undefined : "_blank"}
      rel="noopener noreferrer"
      title={kind}
      aria-label={kind}
      onClick={(e) => {
        if (!venmo || !card.cta_url) return;
        e.preventDefault();
        openVenmo(card.cta_url, { preferPay: isPayment });
      }}
      className={cn(
        secondaryButton,
        compact ? "size-8" : "size-10"
      )}
    >
      {isPayment ? (
        <PaymentBrandIcon card={card} className={compact ? "size-3.5" : "size-[18px]"} />
      ) : (
        <SocialBrandIcon card={card} className={compact ? "size-3.5" : "size-[18px]"} />
      )}
    </a>
  );
}

export function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: "calendar" | "shop" | "heart" | "none";
}) {
  const Icon =
    icon === "calendar" ? Calendar : icon === "shop" ? ShoppingBag : icon === "heart" ? Heart : null;
  return (
    <h2 className="mb-4 flex items-center gap-2 font-display text-[28px] leading-[1.15] text-foreground lg:mb-6 lg:gap-3 lg:text-[34px]">
      {Icon && <Icon className="size-5 text-primary lg:size-7" strokeWidth={2.2} />}
      {children}
    </h2>
  );
}

/** Matches Share / CTA pill height so “View all” lines up with event action buttons. */
const SECTION_ACTION_CLASS = cn(
  secondaryButton,
  "h-9 shrink-0 px-3 text-[12px] backdrop-blur-md lg:h-11 lg:rounded-2xl lg:px-4 lg:text-[14px]"
);

export function SectionHeader({
  title,
  href,
  onAction,
  linkLabel = "View all",
  icon,
  count,
  className,
  action,
}: {
  title: string;
  href?: string;
  onAction?: () => void;
  linkLabel?: string;
  icon?: "calendar" | "shop" | "heart";
  /** Quiet total shown next to the title (e.g. upcoming events, shop items). */
  count?: number;
  className?: string;
  /** Optional custom action (e.g. category filter) instead of View all. */
  action?: ReactNode;
}) {
  const Icon =
    icon === "calendar" ? Calendar : icon === "shop" ? ShoppingBag : icon === "heart" ? Heart : null;
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-3 lg:mb-6", className)}>
      <h2 className="flex min-w-0 items-center gap-2 pb-0.5 font-display text-[28px] leading-[1.15] text-foreground lg:gap-3 lg:text-[34px]">
        {Icon && <Icon className="size-5 shrink-0 text-primary lg:size-7" strokeWidth={2.2} />}
        <span className="min-w-0 truncate">{title}</span>
        {typeof count === "number" && count > 0 ? (
          <span className="shrink-0 text-[15px] font-sans font-semibold tabular-nums text-dim lg:text-[18px]">
            {count}
          </span>
        ) : null}
      </h2>
      {action ? (
        action
      ) : onAction ? (
        <button type="button" onClick={onAction} className={SECTION_ACTION_CLASS}>
          {linkLabel}
        </button>
      ) : href ? (
        <Link href={href} className={SECTION_ACTION_CLASS}>
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
