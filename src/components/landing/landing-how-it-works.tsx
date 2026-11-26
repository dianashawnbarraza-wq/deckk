"use client";

import { ScrollReveal } from "@/components/deck/scroll-reveal";

const STEPS = [
  {
    n: "01",
    title: "Add your content",
    body: "Upload a flyer, paste a product link, or add a post. Use the same things you already share elsewhere.",
  },
  {
    n: "02",
    title: "Review and publish",
    body: "Deckk reads titles, dates, prices, and places when it can, then builds cards on your page. Events go to Events. Products go to Shop. You fix anything that needs fixing, then publish.",
  },
  {
    n: "03",
    title: "Share one link",
    body: "Put deckk.me/you in your bio and email. Visitors open a page with Home, Events, and Shop instead of scrolling a long list of links.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section className="border-t border-[var(--landing-border)]" aria-labelledby="how-heading">
      <div className="mx-auto w-full max-w-[var(--landing-max)] px-5 py-[var(--landing-space-8)] lg:px-8">
        <ScrollReveal>
          <h2
            id="how-heading"
            className="font-display text-[length:var(--landing-h2)] font-medium leading-tight text-[var(--landing-ink)]"
          >
            How it works
          </h2>
          <p className="landing-muted mt-3 max-w-2xl text-[length:var(--landing-body)] leading-relaxed">
            Add what you share. Deckk organizes it into a page. You review,
            then go live.
          </p>
        </ScrollReveal>
        <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.n} as="li" delayMs={i * 90}>
              <div className="landing-glass-card rounded-[var(--landing-radius-xl)] p-5">
                <p className="font-display text-[1.35rem] font-medium tabular-nums text-[var(--landing-faint)]">
                  {step.n}
                </p>
                <h3 className="mt-3 text-[1.05rem] font-semibold text-[var(--landing-ink)]">
                  {step.title}
                </h3>
                <p className="landing-muted mt-2 text-[length:var(--landing-body)] leading-relaxed">
                  {step.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
