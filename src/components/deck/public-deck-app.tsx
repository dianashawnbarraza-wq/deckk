"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Card, Deck, PublicTab } from "@/types/cards";
import { PhoneShell } from "@/components/shell/phone-shell";
import { DeckIdentityHeader } from "@/components/shell/deck-identity-header";
import { BottomNav } from "@/components/shell/bottom-nav";
import {
  EventCardRow,
  ItemCardGrid,
  LinkCardRow,
  SectionHeader,
  SectionTitle,
} from "@/components/cards/card-primitives";
import { EventsCalendarView } from "@/components/deck/events-calendar";
import { rankCards, cardsForTab } from "@/lib/ranking";
import { detectNavCapabilities } from "@/lib/card-taxonomy";

const ADULT_OK_KEY = "deckk-adult-ok";

interface PublicDeckAppProps {
  deck: Deck;
  cards: Card[];
  tab: PublicTab;
  isOwner: boolean;
  previewMode?: boolean;
  shareUrl: string;
}

function AgeGateModal({
  onYes,
  onNo,
}: {
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/45 px-5 pb-28 pt-10 backdrop-blur-[2px]">
      <div className="deckk-pop w-full max-w-sm rounded-[22px] border border-deck-card-brd bg-glass-strong p-5 shadow-xl backdrop-blur-xl">
        <div className="mb-2 inline-flex items-center justify-center rounded-lg border-2 border-foreground px-2 py-1 text-[13px] font-black tracking-tight text-foreground">
          18+
        </div>
        <h3 className="font-display text-[26px] leading-tight text-foreground">
          Are you 18 or older?
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-dim">
          This section links to adult platforms. Confirm your age to continue.
        </p>
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onYes}
            className="flex-1 rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground"
          >
            Yes, I am 18+
          </button>
          <button
            type="button"
            onClick={onNo}
            className="flex-1 rounded-xl border border-deck-card-brd bg-deck-card py-3 text-[13px] font-semibold text-foreground"
          >
            No
          </button>
        </div>
      </div>
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
  const router = useRouter();
  const [condensed, setCondensed] = useState(false);
  const [adultOk, setAdultOk] = useState(false);
  const [adultChecked, setAdultChecked] = useState(false);

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

  const allEvents = [
    ...(ranked.pinned &&
    (ranked.pinned.type === "event" || ranked.pinned.type === "announcement")
      ? [ranked.pinned]
      : []),
    ...ranked.happeningSoon,
    ...ranked.past,
  ].filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  useEffect(() => {
    try {
      setAdultOk(sessionStorage.getItem(ADULT_OK_KEY) === "1");
    } catch {
      // ignore
    }
    setAdultChecked(true);
  }, []);

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
  const showAgeGate = tab === "adult" && adultChecked && !adultOk;

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
                      icon="calendar"
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
                      icon="shop"
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
                    <SectionTitle icon="heart">Support</SectionTitle>
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

            {tab === "events" && <EventsCalendarView events={allEvents} />}

            {tab === "shop" && (
              <>
                <SectionTitle icon="shop">Shop</SectionTitle>
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

            {tab === "adult" && adultOk && (
              <>
                <SectionTitle>18+</SectionTitle>
                <p className="mb-3 text-[13px] text-dim">Adult content platforms.</p>
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

        {showAgeGate && (
          <AgeGateModal
            onYes={() => {
              try {
                sessionStorage.setItem(ADULT_OK_KEY, "1");
              } catch {
                // ignore
              }
              setAdultOk(true);
            }}
            onNo={() => {
              router.push(basePath);
            }}
          />
        )}

        <BottomNav active={tab} basePath={basePath} capabilities={capabilities} />
      </div>
    </PhoneShell>
  );
}

function isFeaturedId(featured: Card[], id: string) {
  return featured.some((c) => c.id === id);
}
