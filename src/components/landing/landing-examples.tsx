"use client";

import Link from "next/link";
import { DEMO_DECK_FIXTURES } from "@/components/landing/demo-deck-fixtures";
import { LandingRealDeckPhone } from "@/components/landing/landing-real-deck";
import { ScrollReveal } from "@/components/deck/scroll-reveal";

export function LandingExamples() {
  return (
    <section
      className="border-t border-[var(--landing-border)]"
      aria-labelledby="examples-heading"
    >
      <div className="mx-auto w-full max-w-[var(--landing-max)] px-5 py-[var(--landing-space-8)] lg:px-8">
        <ScrollReveal>
          <h2
            id="examples-heading"
            className="font-display text-[length:var(--landing-h2)] font-medium leading-tight text-[var(--landing-ink)]"
          >
            See Deckk in action
          </h2>
        </ScrollReveal>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_DECK_FIXTURES.map((ex, i) => {
            const rotate =
              i % 4 === 1 ? "sm:rotate-1" : i % 4 === 2 ? "sm:-rotate-1" : "";
            return (
              <ScrollReveal key={ex.id} as="li" delayMs={i * 70}>
                <Link
                  href={ex.href}
                  className={`landing-glass-card group flex h-full flex-col overflow-hidden rounded-[var(--landing-radius-xl)] ${rotate}`}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-page px-4 pt-4">
                    <div className="pointer-events-none mx-auto h-full w-full max-w-[240px] origin-top scale-[0.92]">
                      <LandingRealDeckPhone deck={ex.deck} cards={ex.cards} />
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--landing-surface)] to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-[1.45rem] font-medium leading-tight text-[var(--landing-ink)]">
                      {ex.deck.display_name}
                    </h3>
                    <p className="landing-muted mt-1.5 text-[length:var(--landing-small)] leading-snug">
                      {ex.caption}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
