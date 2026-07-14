"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
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
import { rankCards, cardsForTab, getNextUpcomingEvent } from "@/lib/ranking";
import { detectNavCapabilities } from "@/lib/card-taxonomy";
import { cn } from "@/lib/utils";
import { DeckLogo } from "@/components/brand/deck-logo";

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
  closing,
}: {
  onYes: () => void;
  onNo: () => void;
  closing: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-40 flex items-end justify-center bg-black/45 px-5 pb-28 pt-10 backdrop-blur-[2px] transition-opacity duration-300",
        closing ? "opacity-0" : "opacity-100"
      )}
    >
      <div
        className={cn(
          "w-full max-w-sm rounded-[22px] border border-deck-card-brd bg-glass-strong p-5 shadow-xl backdrop-blur-xl transition-all duration-300",
          closing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100 deckk-pop"
        )}
      >
        <div className="mb-2 inline-flex items-center justify-center rounded-lg border-2 border-foreground px-2 py-1 text-[13px] font-black tracking-tight text-foreground">
          18+
        </div>
        <h3 className="font-display text-[26px] leading-tight text-foreground">
          Are you 18 or older?
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-dim">
          This section links to adult platforms. Confirm your age to continue.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onYes}
            className="w-full rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Yes, I am 18+
          </button>
          <button
            type="button"
            onClick={onNo}
            className="w-full rounded-xl border border-deck-card-brd bg-deck-card py-3 text-[13px] font-semibold text-foreground transition-transform active:scale-[0.98]"
          >
            No, return to home
          </button>
        </div>
      </div>
    </div>
  );
}

function DeckkFooter() {
  return (
    <footer className="mt-10 border-t border-deck-card-brd px-1 pb-2 pt-6 text-center">
      <div className="mb-2 flex items-center justify-center gap-1.5">
        <DeckLogo size={24} />
        <span className="font-display text-lg text-foreground">
          deckk<span className="text-primary">.</span>me
        </span>
      </div>
      <p className="mx-auto max-w-[280px] text-[12px] leading-relaxed text-dim">
        Made for creators, artists, organizers, and anyone with something worth sharing.
      </p>
      <p className="mx-auto mt-2 max-w-[280px] text-[12px] leading-relaxed text-dim">
        Build your Deckk. You deserve more than a list of links.{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-2 hover:underline">
          Join
        </Link>
      </p>
    </footer>
  );
}

export function PublicDeckApp({
  deck,
  cards,
  tab: initialTab,
  isOwner,
  previewMode = false,
  shareUrl,
}: PublicDeckAppProps) {
  const [activeTab, setActiveTab] = useState<PublicTab>(initialTab);
  const [, startTransition] = useTransition();
  const [condensed, setCondensed] = useState(false);
  const [adultOk, setAdultOk] = useState(false);
  const [adultChecked, setAdultChecked] = useState(false);
  const [gateClosing, setGateClosing] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  const ranked = rankCards(cards);
  const visible = cardsForTab(ranked, activeTab);
  const capabilities = detectNavCapabilities(cards);
  const basePath = `/${deck.handle}`;
  const nextEvent = getNextUpcomingEvent(cards);
  const upcomingCount = cards.filter((c) => {
    if (c.status !== "live") return false;
    if (c.type !== "event" && c.type !== "announcement") return false;
    const end = c.date_end ?? c.date_start;
    if (!end) return false;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return new Date(end).getTime() >= startOfToday.getTime();
  }).length;
  const showViewAllEvents = upcomingCount > 1;

  const allEvents = [
    ...ranked.happeningSoon,
    ...ranked.past,
    ...(ranked.pinned &&
    (ranked.pinned.type === "event" || ranked.pinned.type === "announcement") &&
    !ranked.happeningSoon.some((c) => c.id === ranked.pinned!.id) &&
    !ranked.past.some((c) => c.id === ranked.pinned!.id)
      ? [ranked.pinned]
      : []),
  ].filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  const selectTab = useCallback(
    (next: PublicTab) => {
      startTransition(() => {
        setActiveTab(next);
        setContentKey((k) => k + 1);
        setCondensed(false);
        const url = next === "home" ? basePath : `${basePath}?tab=${next}`;
        window.history.replaceState(null, "", url);
        const scroller = document.querySelector("[data-deck-scroll]");
        if (scroller instanceof HTMLElement) {
          scroller.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    },
    [basePath]
  );

  useEffect(() => {
    try {
      setAdultOk(sessionStorage.getItem(ADULT_OK_KEY) === "1");
    } catch {
      // ignore
    }
    setAdultChecked(true);
  }, []);

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      if (t === "events" || t === "shop" || t === "adult" || t === "listen" || t === "writing") {
        setActiveTab(t);
      } else {
        setActiveTab("home");
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
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
  const showAgeGate = activeTab === "adult" && adultChecked && !adultOk;

  function handleAgeYes() {
    setGateClosing(true);
    window.setTimeout(() => {
      try {
        sessionStorage.setItem(ADULT_OK_KEY, "1");
      } catch {
        // ignore
      }
      setAdultOk(true);
      setGateClosing(false);
    }, 280);
  }

  function handleAgeNo() {
    setGateClosing(true);
    window.setTimeout(() => {
      setGateClosing(false);
      selectTab("home");
    }, 280);
  }

  return (
    <PhoneShell>
      <div className="relative flex h-full flex-col">
        <div
          data-deck-scroll
          className="deckk-scroll-hide absolute inset-0 overflow-y-auto pb-36"
        >
          <DeckIdentityHeader
            deck={deck}
            condensed={condensed && activeTab === "home"}
            showBio={!(condensed && activeTab === "home")}
            socialLinks={ranked.socialLinks}
            showThemeToggle
            shareUrl={shareUrl}
            studioHref={studioHref}
            previewMode={previewMode}
          />

          <div
            key={contentKey}
            className="deckk-fade-up px-4 pb-4 pt-4"
          >
            {activeTab === "home" && (
              <>
                {nextEvent && (
                  <div>
                    <SectionHeader
                      title="Next up"
                      icon="calendar"
                      onAction={
                        showViewAllEvents ? () => selectTab("events") : undefined
                      }
                      linkLabel="View all"
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
                      onAction={
                        capabilities.hasShop ? () => selectTab("shop") : undefined
                      }
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
                        <LinkCardRow key={c.id} card={c} variant="support" />
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

            {activeTab === "events" && (
              <EventsCalendarView events={allEvents} nextUpcoming={nextEvent} />
            )}

            {activeTab === "shop" && (
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

            {activeTab === "adult" && adultOk && (
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

            {activeTab === "listen" && (
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

            {activeTab === "writing" && (
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

            <DeckkFooter />
          </div>
        </div>

        {showAgeGate && (
          <AgeGateModal onYes={handleAgeYes} onNo={handleAgeNo} closing={gateClosing} />
        )}

        <BottomNav
          active={activeTab}
          capabilities={capabilities}
          onSelect={selectTab}
        />
      </div>
    </PhoneShell>
  );
}

function isFeaturedId(featured: Card[], id: string) {
  return featured.some((c) => c.id === id);
}
