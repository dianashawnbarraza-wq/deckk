"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Card, Deck, PublicTab } from "@/types/cards";
import { PhoneShell } from "@/components/shell/phone-shell";
import { DeckIdentityHeader } from "@/components/shell/deck-identity-header";
import { BottomNav } from "@/components/shell/bottom-nav";
import {
  EventCardRow,
  ItemCardGrid,
  LinkCardRow,
  SectionTitle,
} from "@/components/cards/card-primitives";
import { rankCards, cardsForTab } from "@/lib/ranking";

interface PublicDeckAppProps {
  deck: Deck;
  cards: Card[];
  tab: PublicTab;
  isOwner: boolean;
}

export function PublicDeckApp({ deck, cards, tab, isOwner }: PublicDeckAppProps) {
  const [condensed, setCondensed] = useState(false);
  const ranked = rankCards(cards);
  const visible = cardsForTab(ranked, tab);
  const basePath = `/${deck.handle}`;
  const nextEvent = ranked.pinned?.type === "event" || ranked.pinned?.type === "announcement"
    ? ranked.pinned
    : ranked.happeningSoon[0];

  useEffect(() => {
    function onScroll(e: Event) {
      const el = e.target as HTMLElement;
      setCondensed(el.scrollTop > 40);
    }
    const el = document.querySelector("[data-deck-scroll]");
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => el?.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <PhoneShell>
      <div className="relative flex h-full flex-col">
        <div
          data-deck-scroll
          className="deckk-scroll-hide absolute inset-0 overflow-y-auto pb-36"
        >
          <DeckIdentityHeader deck={deck} condensed={condensed && tab === "home"} />

          <div className="deckk-fade-up px-4 pb-4">
            {tab === "home" && (
              <>
                {!condensed && deck.bio && (
                  <p className="mb-3 text-[14.5px] leading-snug text-dim">{deck.bio}</p>
                )}
                {nextEvent && (
                  <div className="mt-2">
                    <SectionTitle>Next up</SectionTitle>
                    <EventCardRow card={nextEvent} />
                  </div>
                )}
                {ranked.evergreen.filter((c) => c.type === "link").length > 0 && (
                  <div className="mt-5">
                    <SectionTitle>Follow along</SectionTitle>
                    <div className="flex flex-col gap-2">
                      {ranked.evergreen
                        .filter((c) => c.type === "link")
                        .map((c) => (
                          <LinkCardRow key={c.id} card={c} />
                        ))}
                    </div>
                  </div>
                )}
                {visible.length === 0 && (
                  <p className="py-10 text-center text-sm text-dim">Nothing live yet.</p>
                )}
              </>
            )}

            {tab === "events" && (
              <>
                <SectionTitle>Events</SectionTitle>
                <div className="flex flex-col gap-2.5">
                  {visible.filter((c) => c.type === "event" || c.type === "announcement").length ===
                  0 ? (
                    <p className="py-8 text-center text-sm text-dim">No events scheduled.</p>
                  ) : (
                    visible
                      .filter((c) => c.type === "event" || c.type === "announcement")
                      .map((c) => <EventCardRow key={c.id} card={c} />)
                  )}
                </div>
              </>
            )}

            {tab === "shop" && (
              <>
                <SectionTitle>Shop</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {visible.filter((c) => c.type === "item").length === 0 ? (
                    <p className="col-span-2 py-8 text-center text-sm text-dim">No items yet.</p>
                  ) : (
                    visible
                      .filter((c) => c.type === "item")
                      .map((c) => <ItemCardGrid key={c.id} card={c} />)
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {isOwner && (
          <Link
            href="/studio"
            className="absolute right-4 top-[72px] z-30 rounded-full border border-deck-card-brd bg-deck-card px-3 py-1.5 text-xs font-semibold backdrop-blur-md"
          >
            Studio
          </Link>
        )}

        <BottomNav active={tab} basePath={basePath} showStudio={isOwner} />
      </div>
    </PhoneShell>
  );
}
