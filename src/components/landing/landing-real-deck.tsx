"use client";

import { PublicDeckApp } from "@/components/deck/public-deck-app";
import type { Card, Deck } from "@/types/cards";
import { cn } from "@/lib/utils";

/** Real Deckk mobile profile UI (PublicDeckApp embed) with fixture content. */
export function LandingRealDeckPhone({
  deck,
  cards,
  className,
  overlay,
}: {
  deck: Deck;
  cards: Card[];
  className?: string;
  overlay?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[2.25rem] border border-black/12 bg-page shadow-[0_40px_80px_-36px_rgba(26,26,26,0.5)]",
        className
      )}
      style={{ aspectRatio: "390 / 760" }}
    >
      {overlay}
      <div className="absolute inset-0 overflow-hidden">
        <PublicDeckApp
          deck={deck}
          cards={cards}
          tab="home"
          isOwner={false}
          previewMode
          shareUrl={`https://deckk.me/${deck.handle}`}
          embed
          syncUrl={false}
          shellClassName="!h-full"
        />
      </div>
    </div>
  );
}
