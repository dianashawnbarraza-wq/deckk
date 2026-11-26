"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getDemoFixture } from "@/components/landing/demo-deck-fixtures";
import { LandingRealDeckPhone } from "@/components/landing/landing-real-deck";

const fixture = getDemoFixture("kilncity");

type Phase =
  | "idle"
  | "flyer-in"
  | "event-card"
  | "product-in"
  | "shop-card"
  | "article-in"
  | "news-card"
  | "all";

const TIMELINE: { at: number; phase: Phase }[] = [
  { at: 0, phase: "idle" },
  { at: 700, phase: "flyer-in" },
  { at: 2000, phase: "event-card" },
  { at: 3400, phase: "product-in" },
  { at: 4700, phase: "shop-card" },
  { at: 6100, phase: "article-in" },
  { at: 7400, phase: "news-card" },
  { at: 8600, phase: "all" },
];

const LOOP_MS = 11500;

function phaseFromElapsed(ms: number, reduced: boolean): Phase {
  if (reduced) return "all";
  const t = ms % LOOP_MS;
  let current: Phase = "idle";
  for (const step of TIMELINE) {
    if (t >= step.at) current = step.phase;
  }
  return current;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function InputChip({
  kind,
  visible,
  image,
  label,
}: {
  kind: "flyer" | "product" | "article";
  visible: boolean;
  image?: string;
  label: string;
}) {
  const kindLabel =
    kind === "flyer" ? "Flyer" : kind === "product" ? "Product link" : "Article";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-5 top-[12%] z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "-translate-y-5 scale-95 opacity-0"
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-2.5 rounded-[18px] border border-black/10 bg-white/95 px-3 py-2.5 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.45)] backdrop-blur-md">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-[12px] object-cover"
          />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-[12px] bg-black/5 text-[12px] font-bold text-black">
            Aa
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-wide text-black/45 uppercase">
            {kindLabel}
          </p>
          <p className="truncate text-[12px] font-bold text-black">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function LandingHeroVisual() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? "all" : "idle");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced) {
      setPhase("all");
      return;
    }
    const started = performance.now();
    let raf = 0;
    let lastPausedAt = 0;
    let pausedTotal = 0;

    const tick = (now: number) => {
      if (paused) {
        if (!lastPausedAt) lastPausedAt = now;
      } else {
        if (lastPausedAt) {
          pausedTotal += now - lastPausedAt;
          lastPausedAt = 0;
        }
        setPhase(phaseFromElapsed(now - started - pausedTotal, false));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, paused]);

  const cards = useMemo(() => {
    const socials = fixture.cards.filter((c) =>
      (c.tags ?? []).some((t) => t.toLowerCase() === "social")
    );
    const events = fixture.cards.filter((c) => c.type === "event");
    const shop = fixture.cards.filter((c) => c.type === "item");
    const news = fixture.cards.filter((c) => c.type === "announcement");

    const showEvent =
      phase === "event-card" ||
      phase === "product-in" ||
      phase === "shop-card" ||
      phase === "article-in" ||
      phase === "news-card" ||
      phase === "all";
    const showShop =
      phase === "shop-card" ||
      phase === "article-in" ||
      phase === "news-card" ||
      phase === "all";
    const showNews = phase === "news-card" || phase === "all";

    return [
      ...socials,
      ...(showEvent ? events : []),
      ...(showShop ? shop : []),
      ...(showNews ? news : []),
    ];
  }, [phase]);

  const flyerImg = fixture.cards.find((c) => c.type === "event")?.media[0]?.url;
  const productImg = fixture.cards.find((c) => c.type === "item")?.media[0]?.url;

  return (
    <div
      className="relative mx-auto w-full max-w-[var(--landing-phone-w)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
      role="img"
      aria-label="Real Deckk mobile profile for Kiln City. A flyer, product link, and article become cards on the page."
    >
      <LandingRealDeckPhone
        deck={fixture.deck}
        cards={cards}
        overlay={
          <>
            <InputChip
              kind="flyer"
              visible={phase === "flyer-in"}
              image={flyerImg}
              label="open-studio-flyer.jpg"
            />
            <InputChip
              kind="product"
              visible={phase === "product-in"}
              image={productImg}
              label="etsy.com/latte-mug"
            />
            <InputChip
              kind="article"
              visible={phase === "article-in"}
              label="kilncity.studio/notes"
            />
          </>
        }
      />
      <p className="mt-3 text-center text-[12px] text-[var(--landing-faint)]">
        Real Deckk interface with sample content.{" "}
        <span className="text-[var(--landing-muted)]">Hover to pause.</span>
      </p>
    </div>
  );
}
