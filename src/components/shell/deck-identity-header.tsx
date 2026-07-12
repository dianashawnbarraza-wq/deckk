"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Deck } from "@/types/cards";
import { ThemeToggleButton } from "@/components/shell/phone-shell";

interface DeckIdentityHeaderProps {
  deck: Pick<Deck, "display_name" | "bio" | "avatar_url">;
  condensed?: boolean;
  eyebrow?: string;
  showBio?: boolean;
  actions?: React.ReactNode;
  showThemeToggle?: boolean;
}

export function DeckIdentityHeader({
  deck,
  condensed = false,
  eyebrow,
  showBio = !condensed,
  actions,
  showThemeToggle = true,
}: DeckIdentityHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b border-deck-card-brd bg-glass backdrop-blur-3xl backdrop-saturate-180",
        condensed ? "pb-2.5" : "pb-4"
      )}
    >
      <div className="flex items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-[9px] bg-primary text-[15px] text-primary-foreground">
            ✦
          </div>
          <div className="font-display text-xl text-foreground">
            deckk<span className="text-primary">.</span>me
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showThemeToggle && <ThemeToggleButton />}
          {actions}
        </div>
      </div>

      <div
        className={cn(
          "flex transition-all duration-[340ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          condensed
            ? "flex-row items-center gap-2.5 px-[18px]"
            : "flex-col items-center gap-3 px-6 text-center"
        )}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-full border border-deck-card-brd transition-all duration-[340ms]",
            condensed ? "size-[38px] border-[1.5px]" : "size-[84px] border-2 shadow-lg"
          )}
        >
          {deck.avatar_url ? (
            <Image src={deck.avatar_url} alt="" fill className="object-cover" sizes="84px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-deck-card font-display text-2xl text-primary">
              {deck.display_name.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className={cn("min-w-0", condensed && "flex-1 text-left")}>
          {!condensed && eyebrow && (
            <div className="mb-2 inline-flex items-center gap-1.5">
              <span className="text-[9px] font-semibold tracking-[0.18em] text-dim uppercase">
                {eyebrow}
              </span>
            </div>
          )}
          <div className={cn("flex items-center gap-2", !condensed && "justify-center")}>
            <h1
              className={cn(
                "font-display leading-none text-foreground transition-all duration-[340ms]",
                condensed ? "text-[23px]" : "text-[48px] leading-[0.92]"
              )}
            >
              {deck.display_name}
            </h1>
          </div>
          {showBio && deck.bio && (
            <p className="mt-3 text-[14.5px] leading-snug text-dim">{deck.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
