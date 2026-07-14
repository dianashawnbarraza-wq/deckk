"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card, Deck } from "@/types/cards";
import { ThemeToggleButton } from "@/components/shell/phone-shell";
import { SocialIconLink } from "@/components/cards/card-primitives";
import { DeckLogo } from "@/components/brand/deck-logo";

function StatusBarClock() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    function tick() {
      setTime(
        new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date())
      );
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between px-5 pt-3.5 pb-1 text-[12px] font-semibold tracking-wide text-foreground">
      <span className="tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5 opacity-70">
        <span className="inline-block h-2.5 w-[18px] rounded-[3px] border border-current">
          <span className="ml-0.5 mt-0.5 inline-block h-1.5 w-2.5 rounded-[1px] bg-current" />
        </span>
      </div>
    </div>
  );
}

function ShareIconButton({ shareUrl, title }: { shareUrl: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url: shareUrl, title });
        return;
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your deck link:", shareUrl);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      title={copied ? "Link copied" : "Share this deckk"}
      aria-label={copied ? "Link copied" : "Share this deckk"}
      className="flex size-9 items-center justify-center rounded-full border border-deck-card-brd bg-deck-card text-foreground backdrop-blur-md transition-colors"
    >
      {copied ? <Check className="size-4" /> : <ArrowUp className="size-4" strokeWidth={2.4} />}
    </button>
  );
}

interface DeckIdentityHeaderProps {
  deck: Pick<Deck, "display_name" | "bio" | "avatar_url" | "handle">;
  condensed?: boolean;
  eyebrow?: string;
  showBio?: boolean;
  /** Social links under bio — roll up when condensed. */
  socialLinks?: Card[];
  /** Show moon/sun — Studio only. */
  showThemeToggle?: boolean;
  shareUrl?: string;
  /** Owner → /studio; preview mode → close with X */
  studioHref?: string | null;
  previewMode?: boolean;
  /** Extra action slot (rarely needed). */
  actions?: React.ReactNode;
}

export function DeckIdentityHeader({
  deck,
  condensed = false,
  eyebrow,
  showBio = !condensed,
  socialLinks = [],
  showThemeToggle = false,
  shareUrl,
  studioHref,
  previewMode = false,
  actions,
}: DeckIdentityHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b border-deck-card-brd bg-glass backdrop-blur-3xl backdrop-saturate-180",
        condensed ? "pb-2.5" : "pb-4"
      )}
    >
      <StatusBarClock />

      <div className="flex items-center justify-between gap-2 px-4 py-1.5">
        <Link
          href="/signup"
          className="group flex min-w-0 items-center gap-0.5"
          title="Sign up for deckk.me"
        >
          <DeckLogo size={34} />
          <div className="ml-1 font-display text-xl leading-none text-foreground">
            deckk<span className="text-primary">.</span>me
          </div>
          <ArrowUpRight className="size-3 shrink-0 text-dim transition-colors group-hover:text-foreground" />
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {showThemeToggle && <ThemeToggleButton />}
          {shareUrl && (
            <ShareIconButton shareUrl={shareUrl} title={deck.display_name} />
          )}
          {previewMode && studioHref && (
            <Link
              href={studioHref}
              title="Back to Studio"
              aria-label="Close preview"
              className="flex size-9 items-center justify-center rounded-full border border-deck-card-brd bg-deck-card text-foreground backdrop-blur-md"
            >
              <X className="size-4" />
            </Link>
          )}
          {!previewMode && studioHref && (
            <Link
              href={studioHref}
              className="rounded-full border border-deck-card-brd bg-deck-card px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md"
            >
              Studio
            </Link>
          )}
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
          {showBio && socialLinks.length > 0 && (
            <div
              className={cn(
                "mt-3 flex flex-wrap gap-2",
                !condensed && "justify-center"
              )}
            >
              {socialLinks.map((link) => (
                <SocialIconLink key={link.id} card={link} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
