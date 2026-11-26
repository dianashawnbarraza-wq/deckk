import Link from "next/link";
import { DeckLogo } from "@/components/brand/deck-logo";
import { JoinBetaButton } from "@/components/landing/join-beta-button";

export function LandingNav() {
  return (
    <header className="landing-nav-glass">
      <div className="mx-auto flex w-full max-w-[var(--landing-max)] items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-[var(--landing-radius-sm)]"
          aria-label="Deckk home"
        >
          <DeckLogo size={40} priority animate />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4" aria-label="Primary">
          <Link
            href="/login"
            className="rounded-[var(--landing-radius-sm)] px-2 py-1.5 text-[13px] font-semibold text-[var(--landing-ink)] underline-offset-[0.18em] transition hover:underline"
          >
            Login
          </Link>
          <JoinBetaButton size="md" />
        </nav>
      </div>
    </header>
  );
}
