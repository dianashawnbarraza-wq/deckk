import type { ReactNode } from "react";
import Link from "next/link";
import { DeckLogo } from "@/components/brand/deck-logo";
import { PublicThemeToggle } from "@/components/layout/public-theme-shell";
import { cn } from "@/lib/utils";

export function PublicSiteHeader({
  right,
  className,
  showThemeToggle = true,
  /** Softer bar that sits over hero/flyer imagery */
  overMedia = false,
  /** Replace Deckk logo (e.g. co-presented event branding) */
  brandLabel,
}: {
  right?: ReactNode;
  className?: string;
  showThemeToggle?: boolean;
  overMedia?: boolean;
  brandLabel?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur-xl",
        overMedia
          ? "border-white/10 bg-black/25"
          : "border-deck-card-brd bg-glass-strong",
        className
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 lg:h-16 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center"
          title={brandLabel ? brandLabel : "deckk.me"}
          aria-label={brandLabel ? `${brandLabel} — deckk.me home` : "deckk.me home"}
        >
          {brandLabel ? (
            <span
              className={cn(
                "min-w-0 truncate text-[12px] font-semibold leading-snug tracking-tight sm:text-[13px] lg:text-[14px]",
                overMedia ? "text-white" : "text-foreground"
              )}
            >
              {brandLabel}
            </span>
          ) : (
            <DeckLogo size={overMedia ? 34 : 32} soft={overMedia} priority />
          )}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {showThemeToggle ? <PublicThemeToggle /> : null}
          {right}
        </div>
      </div>
    </header>
  );
}
