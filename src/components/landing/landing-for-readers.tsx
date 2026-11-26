"use client";

import { getDemoFixture } from "@/components/landing/demo-deck-fixtures";
import { LandingRealDeckPhone } from "@/components/landing/landing-real-deck";
import { ScrollReveal } from "@/components/deck/scroll-reveal";

const FLAT_LINKS = [
  "Shop",
  "Events",
  "Instagram",
  "Tickets",
  "Newsletter",
  "Merch",
] as const;

const kiln = getDemoFixture("kilncity");

export function LandingForReaders() {
  return (
    <section
      className="border-t border-[var(--landing-border)]"
      aria-labelledby="readers-heading"
    >
      <div className="mx-auto grid w-full max-w-[var(--landing-max)] gap-10 px-5 py-[var(--landing-space-8)] lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
        <ScrollReveal>
          <p className="landing-eyebrow">For the people who visit you</p>
          <h2
            id="readers-heading"
            className="mt-3 font-display text-[length:var(--landing-h2)] font-medium leading-tight text-[var(--landing-ink)]"
          >
            Help them find what they came for
          </h2>
          <p className="landing-muted mt-4 max-w-md text-[length:var(--landing-body)] leading-relaxed">
            Someone looking for tickets should not have to scroll past every
            other link first. On Deckk, events stay with events and products
            stay in the shop. Visitors open your page, tap once, and continue.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ScrollReveal
            className="landing-glass-card rounded-[28px] p-4"
            delayMs={40}
          >
            <div aria-hidden>
            <p className="text-[11px] font-bold text-[var(--landing-faint)]">
              Link list
            </p>
            <ul className="mt-3 space-y-2">
              {FLAT_LINKS.map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-[var(--landing-border)] bg-white/80 px-3 py-2.5 text-center text-[13px] font-bold text-[var(--landing-ink)]"
                >
                  {label}
                </li>
              ))}
            </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="landing-glass-card relative overflow-hidden rounded-[28px] bg-page p-2"
            delayMs={120}
          >
            <p className="sr-only">Deckk page example</p>
            <p className="px-2 pt-1 text-[11px] font-bold text-[var(--landing-faint)]" aria-hidden>
              Deckk page
            </p>
            <div className="mt-1 h-[340px] overflow-hidden sm:h-[380px]">
              <div className="pointer-events-none origin-top scale-[0.92]">
                <LandingRealDeckPhone deck={kiln.deck} cards={kiln.cards} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
