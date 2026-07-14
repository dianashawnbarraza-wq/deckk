"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Heart, ShoppingBag } from "lucide-react";
import type { Card } from "@/types/cards";
import { cn } from "@/lib/utils";
import { SocialBrandIcon, PaymentBrandIcon } from "@/components/icons/social-icons";

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
        "rounded-[18px] border border-deck-card-brd bg-deck-card p-3 backdrop-blur-xl",
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
    <div className="w-[52px] shrink-0 overflow-hidden rounded-xl text-center shadow-md">
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

function eventTypeLabel(card: Card): string {
  const tags = card.tags.map((t) => t.toLowerCase());
  const known = [
    "party",
    "workshop",
    "reading",
    "mosh",
    "craft",
    "social",
    "show",
    "class",
    "vending",
  ];
  for (const k of known) {
    if (tags.includes(k)) return k.toUpperCase();
  }
  const title = card.title.toLowerCase();
  if (/mosh|party/.test(title)) return "PARTY";
  if (/workshop|collar|class/.test(title)) return "WORKSHOP";
  if (/reading|poetry|open mic/.test(title)) return "READING";
  if (card.type === "announcement") return "NEWS";
  return "EVENT";
}

function priceChip(card: Card): string {
  if (card.price != null && Number(card.price) > 0) {
    return `$${Number(card.price).toFixed(0)}`;
  }
  const label = (card.cta_label ?? "").toLowerCase();
  if (/ticket/.test(label)) return "Ticketed";
  return "Free";
}

function ctaLabel(card: Card): string | null {
  if (!card.cta_url) return null;
  const label = (card.cta_label ?? "").trim();
  if (/rsvp/i.test(label)) return "RSVP";
  if (/ticket/i.test(label)) return "Tickets";
  if (label) {
    // Prefer short action words
    if (/details|info|more|view/i.test(label)) return "Details";
    if (label.length <= 14) return label;
  }
  return "Details";
}

export function EventCardRow({ card }: { card: Card }) {
  const flyer = card.media[0]?.url;
  const start = card.date_start ? new Date(card.date_start) : null;
  const end = card.date_end ? new Date(card.date_end) : null;

  let timePart = "";
  if (start && end) {
    const sM = format(start, "a");
    const eM = format(end, "a");
    if (sM === eM) {
      timePart = `${format(start, "h")}–${format(end, "h")} ${eM}`;
    } else {
      timePart = `${format(start, "h a")}–${format(end, "h a")}`;
    }
  } else if (start) {
    timePart = format(start, "h:mm a").replace(":00", "");
  }

  const dayPart = start ? format(start, "EEE").toUpperCase() : null;
  const meta = [dayPart, timePart, card.location_name].filter(Boolean).join(" · ");
  const action = ctaLabel(card);
  const typeLabel = eventTypeLabel(card);
  const price = priceChip(card);

  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-[18px] border border-deck-card-brd bg-deck-card p-2.5 backdrop-blur-xl">
      {flyer ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={flyer}
          alt=""
          className="h-[92px] w-[68px] shrink-0 rounded-[12px] object-cover"
        />
      ) : (
        <EventDateChip card={card} />
      )}

      <div className="min-w-0 flex-1 py-0.5">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-deck-card-brd bg-page/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-dim uppercase">
            {typeLabel}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              price === "Free"
                ? "border border-primary/40 text-primary"
                : "bg-[#1b1813] text-white"
            )}
          >
            {price}
          </span>
        </div>
        <div className="font-display text-[18px] leading-tight text-foreground">
          {card.title}
        </div>
        {meta && <div className="mt-0.5 text-[12px] text-dim">{meta}</div>}
      </div>

      {action && card.cta_url && (
        <a
          href={card.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-[#1b1813] px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {action}
        </a>
      )}
    </div>
  );
}

export function ItemCardGrid({ card }: { card: Card }) {
  const image = card.media[0]?.url;
  const price = card.price != null ? `$${Number(card.price).toFixed(0)}` : null;
  const starred = card.featured || card.tags.includes("featured");

  const body = (
    <>
      <div className="relative h-[136px] bg-page">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-faint text-xs">No photo</div>
        )}
        {starred && (
          <span className="absolute left-2 top-2 rounded-full bg-[#1b1813]/90 px-2 py-0.5 text-[10px] font-bold text-white">
            ★ Featured
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="font-display text-[17px] leading-tight text-foreground">{card.title}</div>
        {card.description && (
          <div className="mt-0.5 text-[11px] text-dim line-clamp-2">{card.description}</div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          {price && <div className="text-sm font-semibold text-foreground">{price}</div>}
          {card.cta_label && (
            <span className="ml-auto rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">
              {card.cta_label}
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (card.cta_url) {
    return (
      <a
        href={card.cta_url}
        target="_blank"
        rel="noopener noreferrer"
        className="overflow-hidden rounded-[18px] border border-deck-card-brd bg-deck-card backdrop-blur-xl transition-opacity hover:opacity-90"
      >
        {body}
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-deck-card-brd bg-deck-card backdrop-blur-xl">
      {body}
    </div>
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
  return (
    <a
      href={card.cta_url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-[18px] border border-deck-card-brd bg-deck-card p-3 backdrop-blur-xl transition-opacity hover:opacity-90"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-primary text-primary-foreground">
        {showPayment ? (
          <PaymentBrandIcon card={card} className="size-[18px]" />
        ) : (
          <span className="font-display text-lg">
            {(card.title || "L").charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{card.title}</div>
        {card.description && <div className="text-xs text-dim">{card.description}</div>}
      </div>
      <span className="text-faint">→</span>
    </a>
  );
}

export function SocialIconLink({ card }: { card: Card }) {
  const kind = card.title || "Social";
  return (
    <a
      href={card.cta_url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      title={kind}
      aria-label={kind}
      className="flex size-10 items-center justify-center rounded-full border border-deck-card-brd bg-deck-card text-foreground transition-opacity hover:opacity-80"
    >
      <SocialBrandIcon card={card} className="size-[18px]" />
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
    <h2 className="mb-2.5 flex items-center gap-2 font-display text-[22px] text-foreground">
      {Icon && <Icon className="size-[18px] text-primary" strokeWidth={2.2} />}
      {children}
    </h2>
  );
}

export function SectionHeader({
  title,
  href,
  onAction,
  linkLabel = "View all",
  icon,
}: {
  title: string;
  href?: string;
  onAction?: () => void;
  linkLabel?: string;
  icon?: "calendar" | "shop" | "heart";
}) {
  const Icon =
    icon === "calendar" ? Calendar : icon === "shop" ? ShoppingBag : icon === "heart" ? Heart : null;
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3">
      <h2 className="flex items-center gap-2 font-display text-[22px] text-foreground">
        {Icon && <Icon className="size-[18px] text-primary" strokeWidth={2.2} />}
        {title}
      </h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mb-0.5 text-[12px] font-semibold text-primary underline-offset-2 hover:underline"
        >
          {linkLabel}
        </button>
      )}
      {!onAction && href && (
        <Link
          href={href}
          className="mb-0.5 text-[12px] font-semibold text-primary underline-offset-2 hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
