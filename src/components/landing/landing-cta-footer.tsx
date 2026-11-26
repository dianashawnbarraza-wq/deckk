"use client";

import { JoinBetaButton } from "@/components/landing/join-beta-button";
import { ScrollReveal } from "@/components/deck/scroll-reveal";

export function LandingCtaFooter() {
  return (
    <footer className="border-t border-[var(--landing-border)]">
      <div className="mx-auto w-full max-w-[var(--landing-max)] px-5 py-[var(--landing-space-8)] lg:px-8">
        <ScrollReveal className="landing-glass-card max-w-xl rounded-[var(--landing-radius-xl)] p-6 sm:p-8">
          <h2 className="font-display text-[length:var(--landing-h2)] font-medium leading-tight text-[var(--landing-ink)]">
            Start with Deckk
          </h2>
          <p className="landing-muted mt-4 text-[length:var(--landing-body)] leading-relaxed">
            Join the beta to build your page early. We open soon, and early
            feedback helps shape the product.
          </p>
          <div className="mt-7">
            <JoinBetaButton size="lg" />
          </div>
        </ScrollReveal>

        <p className="landing-muted mt-16 text-[length:var(--landing-small)] leading-relaxed">
          Made in Los Angeles. Built by D. Barraza, a product designer.
        </p>
      </div>
    </footer>
  );
}
