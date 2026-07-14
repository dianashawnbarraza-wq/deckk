"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const DEMO_DECKS = [
  {
    handle: "softkrush",
    name: "Soft Krush",
    blurb: "Musician · shows, merch, tips + socials",
    vibe: "hyperpop nights",
  },
  {
    handle: "kilnkid",
    name: "Kiln Kid",
    blurb: "Ceramic maker · workshops, shop + socials",
    vibe: "mud & main character energy",
  },
  {
    handle: "batchhouse",
    name: "Batch House",
    blurb: "Coffee shop · a packed events calendar",
    vibe: "oat milk + open mics",
  },
] as const;

export function DemoDeckGallery() {
  const [index, setIndex] = useState(0);
  const current = DEMO_DECKS[index];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % DEMO_DECKS.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-[340px]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-primary uppercase">
            Live examples
          </p>
          <p className="mt-0.5 text-[13px] text-dim">{current.blurb}</p>
        </div>
        <Link
          href={`/${current.handle}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-deck-card-brd bg-deck-card px-3 py-1.5 text-[12px] font-semibold text-foreground transition hover:opacity-90"
        >
          Open
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="relative mx-auto aspect-[390/760] w-full overflow-hidden rounded-[36px] border border-phone-brd bg-page shadow-[0_40px_80px_-40px_var(--deck-shadow)]">
        <iframe
          key={current.handle}
          title={`${current.name} Deckk`}
          src={`/${current.handle}?embed=1`}
          className="absolute inset-0 h-full w-full border-0 bg-page"
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {DEMO_DECKS.map((d, i) => (
          <button
            key={d.handle}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${d.name}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-white/25 hover:bg-white/40"
            )}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {DEMO_DECKS.map((d, i) => (
          <Link
            key={d.handle}
            href={`/${d.handle}`}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition",
              i === index
                ? "bg-primary text-white"
                : "border border-deck-card-brd bg-deck-card text-dim hover:text-foreground"
            )}
          >
            @{d.handle}
          </Link>
        ))}
      </div>
    </div>
  );
}
