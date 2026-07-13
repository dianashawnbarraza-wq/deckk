import Link from "next/link";
import { format } from "date-fns";
import type { Card } from "@/types/cards";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  href,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const cls = cn(
    "rounded-[18px] border border-deck-card-brd bg-deck-card p-3 backdrop-blur-xl",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cn(cls, "block transition-opacity hover:opacity-90")}>
        {children}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(cls, "w-full text-left")}>
        {children}
      </button>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function EventDateChip({ card }: { card: Card }) {
  const date = card.date_start ? new Date(card.date_start) : null;
  const month = date ? format(date, "MMM").toUpperCase() : "NEW";
  const day = date ? format(date, "d") : "★";

  return (
    <div className="w-[52px] shrink-0 overflow-hidden rounded-xl text-center shadow-md">
      <div className="bg-primary px-0 py-0.5 text-[9px] font-bold tracking-widest text-primary-foreground">
        {month}
      </div>
      <div className="bg-[#1b1813] px-0 py-1 text-white">
        <div className="font-display text-[22px] leading-none text-white">{day}</div>
      </div>
    </div>
  );
}

export function EventCardRow({ card }: { card: Card }) {
  const meta = [card.location_name, card.cta_label].filter(Boolean).join(" · ");
  const price =
    card.price != null ? `$${Number(card.price).toFixed(0)}` : card.cta_label ?? "Free";

  return (
    <GlassCard
      href={card.cta_url ?? undefined}
      className="flex items-center gap-3"
    >
      <EventDateChip card={card} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded-full border border-deck-card-brd px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-dim uppercase">
            {card.type}
          </span>
          <span className="rounded-full bg-[#1b1813] px-2 py-0.5 text-[10px] font-bold text-white">
            {price}
          </span>
        </div>
        <div className="font-display text-lg leading-tight text-foreground">{card.title}</div>
        {meta && <div className="mt-0.5 text-xs text-dim">{meta}</div>}
      </div>
    </GlassCard>
  );
}

export function ItemCardGrid({ card }: { card: Card }) {
  const image = card.media[0]?.url;
  const price = card.price != null ? `$${Number(card.price).toFixed(0)}` : null;

  const body = (
    <>
      <div className="relative h-[136px] bg-page">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-faint text-xs">No photo</div>
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

export function LinkCardRow({ card }: { card: Card }) {
  return (
    <GlassCard href={card.cta_url ?? undefined} className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-primary font-display text-lg text-primary-foreground">
        {(card.title || "L").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{card.title}</div>
        {card.description && <div className="text-xs text-dim">{card.description}</div>}
      </div>
      <span className="text-faint">→</span>
    </GlassCard>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 font-display text-[22px] text-foreground">{children}</h2>
  );
}
