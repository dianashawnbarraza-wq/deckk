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
      <div
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-3 px-4 lg:px-8",
          brandLabel ? "max-w-7xl pt-10 pb-8 lg:pt-10 lg:pb-8" : "max-w-6xl h-14 lg:h-16"
        )}
      >
        <Link
          href="/"
          className="inline-flex min-w-0 flex-1 items-center pr-3"
          title={brandLabel ? brandLabel : "deckk.me"}
          aria-label={
            brandLabel ? `${brandLabel} — deckk.me home` : "deckk.me home"
          }
        >
          {brandLabel ? (
            <span
              className={cn(
                "min-w-0 text-[11px] font-semibold leading-snug tracking-tight text-white sm:text-[12px] lg:text-[13px]"
              )}
            >
              {brandLabel}
            </span>
          ) : (
            <DeckLogo size={overMedia ? 34 : 32} soft={overMedia} priority />
          )}
        </Link>
        <div
          className={cn(
            "flex shrink-0 items-center gap-2",
            brandLabel &&
              "[&_a]:text-white [&_a]:hover:text-white/85 [&_button]:text-white"
          )}
        >
          {showThemeToggle ? <PublicThemeToggle /> : null}
          {right}
        </div>
      </div>
    </header>
  );
}
