"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DeckLogo } from "@/components/brand/deck-logo";
import { DeckWordmark } from "@/components/brand/deck-wordmark";
import { cn } from "@/lib/utils";

const ROLES = ["creators", "artists", "organizers", "anyone"] as const;

export function LandingHero({ skipLogin }: { skipLogin: boolean }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setRoleIndex((i) => (i + 1) % ROLES.length);
        setVisible(true);
      }, 280);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-hub flex-col justify-center overflow-hidden px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-16 size-[280px] rounded-full opacity-40 blur-[48px]"
        style={{
          background: "radial-gradient(circle, var(--accent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-24 size-[240px] rounded-full opacity-30 blur-[44px]"
        style={{
          background: "radial-gradient(circle, var(--accent-2), transparent 70%)",
        }}
      />

      <div className="relative z-[1]">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="deckk.me home">
          <DeckLogo size={36} />
          <span className="text-[2rem] leading-none sm:text-[2.35rem]">
            <DeckWordmark />
          </span>
        </Link>

        <h1 className="mt-10 max-w-xl font-display text-[2.35rem] leading-[1.05] tracking-tight text-ink sm:text-[3.1rem]">
          Made for{" "}
          <span
            className={cn(
              "inline-block text-primary transition-all duration-300 ease-out",
              visible ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
            )}
          >
            {ROLES[roleIndex]}
          </span>{" "}
          with something worth sharing.
        </h1>

        <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
          Build your Deckk and let it organize your links for you so what you want to
          promote can be found.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {skipLogin ? (
            <Link
              href="/dev/enter"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-[15px] font-semibold text-white transition hover:opacity-90"
            >
              Enter app
            </Link>
          ) : (
            <>
              <Link
                href="/get-started"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-[15px] font-semibold text-white shadow-[0_12px_28px_-12px_var(--accent)] transition hover:opacity-90"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-deck-card-brd bg-transparent px-6 text-[15px] font-semibold text-ink transition hover:bg-deck-card"
              >
                Sign in
              </Link>
            </>
          )}
        </div>

        <p className="mt-8 text-[13px] text-muted-foreground">
          Free to start · Your public link in minutes
        </p>
      </div>
    </main>
  );
}
