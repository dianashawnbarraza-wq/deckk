"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Card, Deck, PublicTab } from "@/types/cards";
import { PhoneShell, deckAppearance, ThemeToggleButton } from "@/components/shell/phone-shell";
import { DeckIdentityHeader } from "@/components/shell/deck-identity-header";
import { BottomNav } from "@/components/shell/bottom-nav";
import { secondaryButton } from "@/lib/secondary-surface";
import {
  EventCardRow,
  ItemCardGrid,
  LinkCardRow,
  SectionHeader,
  SectionTitle,
} from "@/components/cards/card-primitives";
import { EventsCalendarView } from "@/components/deck/events-calendar";
import {
  rankCards,
  cardsForTab,
  getNextUpcomingEvent,
  getNextUpcomingEvents,
  homeShopPreview,
} from "@/lib/ranking";
import { detectNavCapabilities } from "@/lib/card-taxonomy";
import { detectSocialPlatform } from "@/lib/social-profiles";
import {
  inferShopCategory,
  labelForCategoryId,
  resolveShopFilterCategories,
  type ShopCategoryId,
} from "@/lib/shop-category";
import { cn } from "@/lib/utils";
import { DeckLogo } from "@/components/brand/deck-logo";
import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { ShareDeckSheet } from "@/components/deck/share-deck-sheet";
import {
  FixedPaymentLinkCard,
  ProductPaymentCard,
  TipJarCard,
} from "@/components/deck/payment-cards";
import { ScrollReveal } from "@/components/deck/scroll-reveal";
import type { PaymentLink, Product } from "@/types/database";
import { X } from "lucide-react";

const ADULT_OK_KEY = "deckk-adult-ok";

export type PublicCommerce = {
  chargesEnabled: boolean;
  products: Product[];
  paymentLinks: PaymentLink[];
};

interface PublicDeckAppProps {
  deck: Deck;
  cards: Card[];
  tab: PublicTab;
  isOwner: boolean;
  previewMode?: boolean;
  shareUrl: string;
  embed?: boolean;
  /** When false, tab changes do not write to the browser URL (landing demos). */
  syncUrl?: boolean;
  commerce?: PublicCommerce | null;
  shellClassName?: string;
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
          "w-full max-w-sm rounded-[14px] border border-deck-card-brd bg-glass-strong p-5 shadow-xl backdrop-blur-xl transition-all duration-300",
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
      <div className="mb-2 flex items-center justify-center">
        <DeckLogo size={32} />
      </div>
      <p className="mx-auto max-w-[280px] text-[12px] leading-relaxed text-dim">
        Made for creators, artists, organizers, and anyone with something worth sharing.
      </p>
      <p className="mx-auto mt-2 max-w-[280px] text-[12px] leading-relaxed text-dim">
        Build your Deckk. You deserve more than a list of links.{" "}
        <Link href="/join" className="font-semibold text-primary underline-offset-2 hover:underline">
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
  embed = false,
  syncUrl = true,
  commerce = null,
  shellClassName,
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
  // Profile socials: tagged/bucketed socials + any known platform profile links
  const socialLinks = (() => {
    const byId = new Map<string, (typeof cards)[number]>();
    for (const c of ranked.socialLinks) byId.set(c.id, c);
    for (const c of cards) {
      if (c.status !== "live" || c.type !== "link" || !c.cta_url) continue;
      if (detectSocialPlatform(c) || (c.tags ?? []).some((t) => t.toLowerCase() === "social")) {
        byId.set(c.id, c);
      }
    }
    return Array.from(byId.values());
  })();
  const stripeProducts = commerce?.products ?? [];
  const tipLinks = (commerce?.paymentLinks ?? []).filter((l) => l.kind === "tip");
  const fixedLinks = (commerce?.paymentLinks ?? []).filter(
    (l) => l.kind === "fixed" || l.kind === "fundraiser"
  );
  const chargesEnabled = commerce?.chargesEnabled ?? false;
  const hasStripeShop = stripeProducts.length > 0;
  const hasStripeSupport = tipLinks.length > 0 || fixedLinks.length > 0;
  const baseCapabilities = detectNavCapabilities(cards);
  const capabilities = {
    ...baseCapabilities,
    hasShop: baseCapabilities.hasShop || hasStripeShop,
  };
  const basePath = `/${deck.handle}`;
  const nextEvent = getNextUpcomingEvent(cards);
  const upcomingEvents = getNextUpcomingEvents(cards, 50);
  const nextEvents = upcomingEvents.slice(0, 2);
  const upcomingEventsCount = upcomingEvents.length;
  const shopCards = cardsForTab(ranked, "shop");
  const shopProductCount = stripeProducts.length + shopCards.length;
  const homeShopCards = homeShopPreview(ranked, Math.max(0, 4 - Math.min(2, stripeProducts.length)));
  const showHomeShop = shopProductCount > 0;
  const [shopFilter, setShopFilter] = useState<"all" | ShopCategoryId>("all");

  const shopEntries = useMemo(() => {
    type Entry =
      | {
          kind: "product";
          id: string;
          category: ShopCategoryId;
          product: (typeof stripeProducts)[number];
        }
      | {
          kind: "card";
          id: string;
          category: ShopCategoryId;
          card: (typeof shopCards)[number];
        };
    const entries: Entry[] = [
      ...stripeProducts.map((product) => ({
        kind: "product" as const,
        id: product.id,
        category: inferShopCategory({
          title: product.title,
          description: product.description,
        }),
        product,
      })),
      ...shopCards.map((card) => ({
        kind: "card" as const,
        id: card.id,
        category: inferShopCategory({
          title: card.title,
          description: card.description,
          tags: card.tags,
        }),
        card,
      })),
    ];
    return entries;
  }, [stripeProducts, shopCards]);

  const shopCategories = useMemo(() => {
    const present = shopEntries.map((e) => e.category);
    return resolveShopFilterCategories({
      theme: (deck.theme ?? null) as Record<string, unknown> | null,
      presentIds: present,
    });
  }, [shopEntries, deck.theme]);

  const filteredShopEntries = useMemo(() => {
    if (shopFilter === "all") return shopEntries;
    return shopEntries.filter((e) => e.category === shopFilter);
  }, [shopEntries, shopFilter]);

  const allEvents = [
    ...ranked.happeningSoon,
    ...ranked.past,
  ].filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  const selectTab = useCallback(
    (next: PublicTab) => {
      startTransition(() => {
        setActiveTab(next);
        setContentKey((k) => k + 1);
        // Home expands for identity; other tabs condense to show content first.
        setCondensed(next !== "home");
        if (syncUrl) {
          const url = next === "home" ? basePath : `${basePath}?tab=${next}`;
          window.history.replaceState(null, "", url);
        }
        const scroller = document.querySelector("[data-deck-scroll]");
        if (scroller instanceof HTMLElement) {
          scroller.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    },
    [basePath, syncUrl]
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
    if (!syncUrl) return;
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      if (t === "events" || t === "shop" || t === "adult" || t === "listen" || t === "writing") {
        setActiveTab(t);
        setCondensed(true);
      } else {
        setActiveTab("home");
        setCondensed(false);
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [syncUrl]);

  useEffect(() => {
    // SSR / deep-link into a content tab should start condensed.
    if (initialTab !== "home") setCondensed(true);
  }, [initialTab]);

  useEffect(() => {
    // Scroll-linked header collapse. Expand (scroll up) eases slower than
    // collapse so the roll-out feels elegant instead of snappy.
    const RANGE = 110;
    const ENTER = 0.78;
    const EXIT = 0.12;
    const LERP_DOWN = 0.22;
    const LERP_UP = 0.075;
    let frame = 0;
    let current = 0;
    let target = 0;
    let headerEl: HTMLElement | null = null;

    function applyCondensed(p: number) {
      setCondensed((prev) => {
        if (!prev && p >= ENTER) return true;
        if (prev && p <= EXIT) return false;
        return prev;
      });
    }

    function paint() {
      frame = 0;
      if (!headerEl) return;
      const expanding = target < current - 0.001;
      const alpha = expanding ? LERP_UP : LERP_DOWN;
      current += (target - current) * alpha;
      if (Math.abs(target - current) < 0.0015) current = target;
      headerEl.style.setProperty("--deck-collapse", current.toFixed(4));
      applyCondensed(current);
      if (current !== target) {
        frame = requestAnimationFrame(paint);
      }
    }

    function syncFromScroller(scroller: HTMLElement) {
      const header = scroller.querySelector("[data-deck-identity]");
      if (!(header instanceof HTMLElement)) return;
      headerEl = header;

      if (window.matchMedia("(min-width: 1024px)").matches) {
        header.style.removeProperty("--deck-collapse");
        current = 0;
        target = 0;
        setCondensed(false);
        return;
      }

      if (activeTab !== "home") {
        current = 1;
        target = 1;
        header.style.setProperty("--deck-collapse", "1");
        setCondensed(true);
        return;
      }

      const y = Math.max(0, scroller.scrollTop);
      target = Math.min(1, y / RANGE);
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function onScroll(e: Event) {
      const el = e.target as HTMLElement;
      if (!el || typeof el.scrollTop !== "number") return;
      syncFromScroller(el);
    }

    const el = document.querySelector("[data-deck-scroll]");
    if (el instanceof HTMLElement) syncFromScroller(el);
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el?.removeEventListener("scroll", onScroll);
    };
  }, [activeTab]);

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
    <PhoneShell
      embed={embed}
      layout={embed ? "phone" : "responsive"}
      appearance={deckAppearance(deck.theme)}
      className={shellClassName}
    >
      <div
        className={cn(
          "relative flex h-full flex-col lg:h-auto",
          !embed && "min-h-dvh"
        )}
      >
        <div className="hidden lg:block">
          <PublicSiteHeader
            showThemeToggle={false}
            right={
              <>
                <ThemeToggleButton />
                {previewMode && studioHref ? (
                  <Link
                    href={studioHref}
                    className={cn(secondaryButton, "h-10 gap-1 px-3 text-[13px]")}
                  >
                    <X className="size-3.5" strokeWidth={2.4} />
                    Close
                  </Link>
                ) : null}
                {shareUrl ? (
                  <ShareDeckSheet
                    shareUrl={shareUrl}
                    title={deck.display_name}
                    trigger="button"
                    label="Share"
                  />
                ) : null}
                {!previewMode && studioHref ? (
                  <Link
                    href={studioHref}
                    className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
                  >
                    Open Studio
                  </Link>
                ) : null}
              </>
            }
          />
        </div>

        <div
          data-deck-scroll
          className="deckk-scroll-hide absolute inset-0 overflow-y-auto overscroll-y-contain pb-36 [-webkit-overflow-scrolling:touch] lg:static lg:inset-auto lg:overflow-visible lg:pb-12"
        >
          <DeckIdentityHeader
            deck={deck}
            condensed={condensed}
            showBio={!condensed}
            socialLinks={socialLinks}
            shareUrl={shareUrl}
            studioHref={studioHref}
            previewMode={previewMode}
            animateFromInstagram
          />

          <div
            data-deck-glass-rule
            className="mx-auto w-full max-w-2xl px-4 lg:max-w-6xl lg:px-8"
            aria-hidden
          >
            <span />
          </div>

          <BottomNav
            active={activeTab}
            capabilities={capabilities}
            onSelect={selectTab}
            variant="bar"
          />

          <div
            key={contentKey}
            className={cn(
              "deckk-fade-up mx-auto w-full max-w-2xl px-4 pb-4 pt-4 lg:max-w-6xl lg:px-8 lg:pb-20 lg:pt-6 [[data-theme=lilac]_&]:pt-4 [[data-theme=lilac]_&]:lg:pt-4",
              !condensed && "deckk-ig-content-delay"
            )}
          >
            {activeTab === "home" && (
              <>
                <div className="flex flex-col gap-8 lg:gap-14">
                  {nextEvents.length > 0 && (
                    <section className="flex flex-col gap-4 lg:gap-5">
                      <SectionHeader
                        title="Upcoming events"
                        icon="calendar"
                        count={upcomingEventsCount}
                        onAction={() => selectTab("events")}
                        linkLabel="View all"
                        className="mb-0 lg:mb-0"
                      />
                      <div className="flex flex-col gap-4">
                        {nextEvents.map((c, i) => (
                          <ScrollReveal key={c.id} delayMs={80 + i * 70}>
                            <EventCardRow card={c} handle={deck.handle} />
                          </ScrollReveal>
                        ))}
                      </div>
                    </section>
                  )}

                  {showHomeShop && (
                    <section className="flex flex-col gap-4 lg:gap-5">
                      <SectionHeader
                        title="Featured shop"
                        icon="shop"
                        count={shopProductCount}
                        onAction={
                          capabilities.hasShop ? () => selectTab("shop") : undefined
                        }
                        linkLabel="View all"
                        className="mb-0 lg:mb-0"
                      />
                      <div className="grid grid-cols-2 gap-4 lg:gap-5">
                        {stripeProducts.slice(0, 2).map((product, i) => (
                          <ScrollReveal key={product.id} className="h-full" delayMs={90 + i * 80}>
                            <ProductPaymentCard
                              product={product}
                              handle={deck.handle}
                              chargesEnabled={chargesEnabled}
                            />
                          </ScrollReveal>
                        ))}
                        {homeShopCards.map((c, i) =>
                          c.type === "item" || c.media?.[0]?.url ? (
                            <ScrollReveal
                              key={c.id}
                              className="h-full"
                              delayMs={90 + (stripeProducts.slice(0, 2).length + i) * 80}
                            >
                              <ItemCardGrid card={c} />
                            </ScrollReveal>
                          ) : (
                            <ScrollReveal
                              key={c.id}
                              className="col-span-2"
                              delayMs={90 + (stripeProducts.slice(0, 2).length + i) * 80}
                            >
                              <LinkCardRow card={c} />
                            </ScrollReveal>
                          )
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {(ranked.supportLinks.length > 0 || hasStripeSupport) && (
                  <div className="mt-8 lg:mt-14">
                    <ScrollReveal>
                      <SectionTitle icon="heart">Support</SectionTitle>
                    </ScrollReveal>
                    <div className="flex flex-col gap-2 lg:gap-3">
                      {tipLinks.map((link, i) => (
                        <ScrollReveal key={link.id} delayMs={60 + i * 60}>
                          <TipJarCard
                            link={link}
                            handle={deck.handle}
                            chargesEnabled={chargesEnabled}
                          />
                        </ScrollReveal>
                      ))}
                      {fixedLinks.map((link, i) => (
                        <ScrollReveal key={link.id} delayMs={60 + i * 60}>
                          <FixedPaymentLinkCard
                            link={link}
                            handle={deck.handle}
                            chargesEnabled={chargesEnabled}
                          />
                        </ScrollReveal>
                      ))}
                      {ranked.supportLinks.map((c, i) => (
                        <ScrollReveal key={c.id} delayMs={60 + i * 60}>
                          <LinkCardRow card={c} variant="support" />
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                )}

                {(() => {
                  const moreLinks = ranked.evergreen.filter((c) => c.type === "link");
                  if (moreLinks.length === 0) return null;
                  return (
                    <div className="mt-8 lg:mt-14">
                      <ScrollReveal>
                        <SectionTitle>More</SectionTitle>
                      </ScrollReveal>
                      <div className="flex flex-col gap-2 lg:gap-3">
                        {moreLinks.map((c, i) => (
                          <ScrollReveal key={c.id} delayMs={60 + i * 60}>
                            <LinkCardRow card={c} />
                          </ScrollReveal>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {nextEvents.length === 0 &&
                  ranked.featuredItems.length === 0 &&
                  ranked.freshItems.length === 0 &&
                  ranked.supportLinks.length === 0 &&
                  ranked.evergreen.length === 0 &&
                  !hasStripeShop &&
                  !hasStripeSupport && (
                    <p className="py-10 text-center text-sm text-dim">Nothing live yet.</p>
                  )}
              </>
            )}

            {activeTab === "events" && (
              <EventsCalendarView
                events={allEvents}
                nextUpcoming={nextEvent}
                handle={deck.handle}
              />
            )}

            {activeTab === "shop" && (
              <>
                <ScrollReveal>
                  <SectionHeader title="Shop" icon="shop" count={filteredShopEntries.length} />
                  {shopCategories.length > 0 ? (
                    <div
                      className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      role="tablist"
                      aria-label="Shop categories"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={shopFilter === "all"}
                        onClick={() => setShopFilter("all")}
                        className={cn(
                          "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
                            shopFilter === "all"
                            ? "bg-primary text-primary-foreground"
                            : "border border-secondary-stroke bg-secondary text-secondary-foreground hover:opacity-90"
                        )}
                      >
                        All
                      </button>
                      {shopCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          role="tab"
                          aria-selected={shopFilter === cat.id}
                          onClick={() => setShopFilter(cat.id)}
                          className={cn(
                            "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
                            shopFilter === cat.id
                              ? "bg-primary text-primary-foreground"
                              : "border border-secondary-stroke bg-secondary text-secondary-foreground hover:opacity-90"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </ScrollReveal>
                <div className="mt-4 grid grid-cols-2 gap-4 lg:gap-5">
                  {filteredShopEntries.length === 0 ? (
                    <p className="col-span-2 py-8 text-center text-sm text-dim">
                      {shopEntries.length === 0
                        ? "No items yet."
                        : `No items in ${
                            shopFilter === "all"
                              ? "shop"
                              : labelForCategoryId(
                                  shopFilter,
                                  shopCategories
                                )
                          }.`}
                    </p>
                  ) : (
                    filteredShopEntries.map((entry, i) =>
                      entry.kind === "product" ? (
                        <ScrollReveal key={entry.id} className="h-full" delayMs={70 + i * 70}>
                          <ProductPaymentCard
                            product={entry.product}
                            handle={deck.handle}
                            chargesEnabled={chargesEnabled}
                          />
                        </ScrollReveal>
                      ) : entry.card.type === "item" ||
                        entry.card.media?.[0]?.url ? (
                        <ScrollReveal key={entry.id} className="h-full" delayMs={70 + i * 70}>
                          <ItemCardGrid card={entry.card} />
                        </ScrollReveal>
                      ) : (
                        <ScrollReveal
                          key={entry.id}
                          className="col-span-2"
                          delayMs={70 + i * 70}
                        >
                          <LinkCardRow card={entry.card} />
                        </ScrollReveal>
                      )
                    )
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
          variant="floating"
        />
      </div>
    </PhoneShell>
  );
}