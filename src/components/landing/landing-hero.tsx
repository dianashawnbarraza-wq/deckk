"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingHeroVisual } from "@/components/landing/landing-hero-visual";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingForReaders } from "@/components/landing/landing-for-readers";
import { LandingAudienceMarquee } from "@/components/landing/landing-audience-marquee";
import { LandingExamples } from "@/components/landing/landing-examples";
import { LandingCtaFooter } from "@/components/landing/landing-cta-footer";
import { LandingAtmosphere } from "@/components/landing/landing-atmosphere";
import { LandingWordReveal } from "@/components/landing/landing-word-reveal";
import { JoinBetaButton } from "@/components/landing/join-beta-button";
import { ScrollReveal } from "@/components/deck/scroll-reveal";

export function LandingHero() {
  return (
    <div data-theme="lilac" data-landing className="min-h-dvh font-sans">
      <LandingNav />

      <main>
        <section className="relative overflow-hidden">
          <LandingAtmosphere />
          <div className="relative z-[1] mx-auto grid w-full max-w-[var(--landing-max)] items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
            <div className="min-w-0">
              <h1 className="max-w-xl font-display text-[length:var(--landing-h1)] font-medium leading-[1.05] tracking-tight text-[var(--landing-ink)]">
                <LandingWordReveal
                  text="Everything you share. One clear page."
                  as="span"
                />
              </h1>
              <p className="landing-muted mt-5 max-w-lg text-[length:var(--landing-body)] leading-relaxed">
                Most bio links are just a list. Deckk turns flyers, products,
                and posts into a structured page. Events show dates and
                details. Products live in a shop. You share one link on
                Instagram, in email, anywhere. People find tickets, buy what
                they need, and move on.
              </p>
              <div className="mt-8">
                <JoinBetaButton size="lg" />
              </div>
              <p className="landing-muted mt-3 text-[length:var(--landing-small)]">
                Public beta opens soon. Join the list today.
              </p>
            </div>

            <ScrollReveal className="relative flex min-w-0 justify-center lg:justify-end">
              <LandingHeroVisual />
            </ScrollReveal>
          </div>
        </section>

        <LandingHowItWorks />
        <LandingForReaders />
        <LandingAudienceMarquee />
        <LandingExamples />
        <LandingCtaFooter />
      </main>
    </div>
  );
}
