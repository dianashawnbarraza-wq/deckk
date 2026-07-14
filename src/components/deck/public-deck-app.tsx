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
import { detectNavCapabilities } from "@/lib/card-taxonomy";

interface PublicDeckAppProps {
  deck: Deck;
  cards: Card[];
  tab: PublicTab;
  isOwner: boolean;
  previewMode?: boolean;
  shareUrl: string;
}

function SectionHeader({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3">
      <h2 className="font-display text-[22px] text-foreground">{title}</h2>
      {href && (
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

export function PublicDeckApp({
  deck,
  cards,
  tab,
  isOwner,
  previewMode = false,
  shareUrl,
}: PublicDeckAppProps) {
  const [condensed, setCondensed] = useState(false);
  const ranked = rankCards(cards);
  const visible = cardsForTab(ranked, tab);
  const capabilities = detectNavCapabilities(cards);
  const basePath = `/${deck.handle}`;
  const nextEvent =
    ranked.pinned?.type === "event" || ranked.pinned?.type === "announcement"
      ? ranked.pinned
      : ranked.happeningSoon[0];
  const upcomingCount =
    (ranked.pinned &&
    (ranked.pinned.type === "event" || ranked.pinned.type === "announcement")
      ? 1
      : 0) +
    ranked.happeningSoon.filter((c) => c.id !== ranked.pinned?.id).length;
  const showViewAllEvents = upcomingCount > 1;

  useEffect(() => {
    function onScroll(e: Event) {
      const el = e.target as HTMLElement;
      setCondensed(el.scrollTop > 40);
    }
    const el = document.querySelector("[data-deck-scroll]");
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => el?.removeEventListener("scroll", onScroll);
  }, []);

  const studioHref = isOwner || previewMode ? "/studio" : null;

  return (
    <PhoneShell>
      <div className="relative flex h-full flex-col">
        <div
          data-deck-scroll
          className="deckk-scroll-hide absolute inset-0 overflow-y-auto pb-36"
        >
          <DeckIdentityHeader
            deck={deck}
            condensed={condensed && tab === "home"}
            showBio={!(condensed && tab === "home")}
            socialLinks={ranked.socialLinks}
            showThemeToggle={false}
            shareUrl={shareUrl}
            studioHref={studioHref}
            previewMode={previewMode}
          />

          <div className="deckk-fade-up px-4 pb-4 pt-4">
            {tab === "home" && (
              <>
                {nextEvent && (
                  <div>
                    <SectionHeader
                      title="Next up"
                      href={showViewAllEvents ? `${basePath}?tab=events` : undefined}
                    />
                    <EventCardRow card={nextEvent} />
                  </div>
                )}

                {(ranked.featuredItems.length > 0 ||
                  ranked.freshItems.filter((c) => !isFeaturedId(ranked.featuredItems, c.id))
                    .length > 0) && (
                  <div className="mt-5">
                    <SectionHeader
                      title="Featured shop"
                      href={capabilities.hasShop ? `${basePath}?tab=shop` : undefined}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {(ranked.featuredItems.length > 0
                        ? ranked.featuredItems
                        : ranked.freshItems.slice(0, 4)
                      ).map((c) => (
                        <ItemCardGrid key={c.id} card={c} />
                      ))}
                    </div>
                  </div>
                )}

                {ranked.supportLinks.length > 0 && (
                  <div className="mt-5">
                    <SectionTitle>Support</SectionTitle>
                    <div className="flex flex-col gap-2">
                      {ranked.supportLinks.map((c) => (
                        <LinkCardRow key={c.id} card={c} />
                      ))}
                    </div>
                  </div>
                )}

                {ranked.evergreen.filter((c) => c.type === "link").length > 0 && (
                  <div className="mt-5">
                    <SectionTitle>More</SectionTitle>
                    <div className="flex flex-col gap-2">
                      {ranked.evergreen
                        .filter((c) => c.type === "link")
                        .map((c) => (
                          <LinkCardRow key={c.id} card={c} />
                        ))}
                    </div>
                  </div>
                )}

                {!nextEvent &&
                  ranked.featuredItems.length === 0 &&
                  ranked.freshItems.length === 0 &&
                  ranked.supportLinks.length === 0 &&
                  ranked.evergreen.length === 0 && (
                    <p className="py-10 text-center text-sm text-dim">Nothing live yet.</p>
                  )}
              </>
            )}

            {tab === "events" && (
              <>
                <SectionTitle>Events</SectionTitle>
                <div className="flex flex-col gap-2.5">
                  {visible.filter((c) => c.type === "event" || c.type === "announcement")
                    .length === 0 ? (
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

            {tab === "adult" && (
              <>
                <SectionTitle>18+</SectionTitle>
                <p className="mb-3 text-[13px] text-dim">
                  Adult content platforms — proceed if you&apos;re 18+.
                </p>
                <div className="flex flex-col gap-2">
                  {ranked.adultLinks.length === 0 ? (
                    <p className="py-8 text-center text-sm text-dim">No links yet.</p>
                  ) : (
                    ranked.adultLinks.map((c) => <LinkCardRow key={c.id} card={c} />)
                  )}
                </div>
              </>
            )}

            {tab === "listen" && (
              <>
                <SectionTitle>Listen</SectionTitle>
                <div className="flex flex-col gap-2">
                  {ranked.listenLinks.length === 0 ? (
                    <p className="py-8 text-center text-sm text-dim">No music links yet.</p>
                  ) : (
                    ranked.listenLinks.map((c) => <LinkCardRow key={c.id} card={c} />)
                  )}
                </div>
              </>
            )}

            {tab === "writing" && (
              <>
                <SectionTitle>Writing</SectionTitle>
                <div className="flex flex-col gap-2">
                  {ranked.writingLinks.length === 0 ? (
                    <p className="py-8 text-center text-sm text-dim">No writing links yet.</p>
                  ) : (
                    ranked.writingLinks.map((c) => <LinkCardRow key={c.id} card={c} />)
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <BottomNav active={tab} basePath={basePath} capabilities={capabilities} />
      </div>
    </PhoneShell>
  );
}

function isFeaturedId(featured: Card[], id: string) {
  return featured.some((c) => c.id === id);
}
