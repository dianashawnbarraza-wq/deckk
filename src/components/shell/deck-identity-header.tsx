"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pencil, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card, Deck } from "@/types/cards";
import { ThemeToggleButton } from "@/components/shell/phone-shell";
import { SocialIconLink } from "@/components/cards/card-primitives";
import { DeckLogo } from "@/components/brand/deck-logo";
import { ShareDeckSheet } from "@/components/deck/share-deck-sheet";
import { secondaryButton, secondaryPill } from "@/lib/secondary-surface";

function StudioCtaLabel() {
  return (
    <span className="relative inline-flex h-4 w-[2.6rem] items-center justify-center overflow-hidden">
      <span className="deckk-studio-label-a absolute inset-0 flex items-center justify-center gap-0.5">
        <Pencil className="size-3" strokeWidth={2.4} />
        Edit
      </span>
      <span className="deckk-studio-label-b absolute inset-0 flex items-center justify-center gap-0.5">
        <Plus className="size-3.5" strokeWidth={2.4} />
        Link
      </span>
    </span>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

interface DeckIdentityHeaderProps {
  deck: Pick<Deck, "display_name" | "bio" | "avatar_url" | "handle" | "theme">;
  condensed?: boolean;
  eyebrow?: string;
  showBio?: boolean;
  /** Social profile icons that link out — always shown when present. */
  socialLinks?: Card[];
  /** Show moon/sun — Studio only (creator picks public appearance). */
  showThemeToggle?: boolean;
  shareUrl?: string;
  /** Owner → /studio; preview mode → close with X/Close */
  studioHref?: string | null;
  previewMode?: boolean;
  /** e.g. View live + Settings — rendered next to Share on one row */
  actions?: ReactNode;
  /**
   * Soft entrance on first load: bio block expands open under the name
   * (no avatar swipe).
   */
  animateFromInstagram?: boolean;
  /** When false, identity desktop band omits action buttons (e.g. they live in PublicSiteHeader). */
  desktopActions?: boolean;
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
  animateFromInstagram = false,
  desktopActions = true,
}: DeckIdentityHeaderProps) {
  const expandedDetails = showBio && !condensed;
  const hasSocials = socialLinks.length > 0;
  const reducedMotion = usePrefersReducedMotion();
  const introPlayedRef = useRef(false);
  const [igEntered, setIgEntered] = useState(true);
  const [igReady, setIgReady] = useState(() => !animateFromInstagram);
  const [introComplete, setIntroComplete] = useState(() => !animateFromInstagram);

  useLayoutEffect(() => {
    if (!animateFromInstagram || introComplete) return;

    const prefersReduced =
      reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || condensed) {
      introPlayedRef.current = true;
      setIgEntered(true);
      setIgReady(true);
      setIntroComplete(true);
      return;
    }

    if (introPlayedRef.current) return;

    introPlayedRef.current = true;
    setIgEntered(false);
    setIgReady(true);

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIgEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [animateFromInstagram, condensed, introComplete, reducedMotion]);

  useLayoutEffect(() => {
    if (!animateFromInstagram || !igEntered || introComplete || !igReady) return;
    const id = window.setTimeout(() => setIntroComplete(true), 700);
    return () => window.clearTimeout(id);
  }, [animateFromInstagram, igEntered, igReady, introComplete]);

  const runIgIntro =
    animateFromInstagram &&
    !reducedMotion &&
    !condensed &&
    igReady &&
    !introComplete;

  const desktopTextRef = useRef<HTMLDivElement>(null);
  const [desktopAvatarPx, setDesktopAvatarPx] = useState(140);

  useLayoutEffect(() => {
    const el = desktopTextRef.current;
    if (!el) return;

    const sync = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h <= 0) return;
      setDesktopAvatarPx(Math.min(200, Math.max(120, h)));
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    deck.display_name,
    deck.bio,
    deck.theme?.pronouns,
    deck.theme?.location,
    hasSocials,
    socialLinks.length,
  ]);

  return (
    <div
      data-deck-identity
      data-collapsed={condensed ? "true" : "false"}
      className={cn(
        "sticky top-0 z-20 [overflow-anchor:none] border-b border-deck-card-brd bg-glass-strong pt-3 backdrop-blur-xl",
        "transform-gpu will-change-transform [backface-visibility:hidden]",
        "transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        "lg:static lg:border-b-0 lg:bg-transparent lg:pt-0 lg:backdrop-blur-none lg:transition-none",
        // Lilac: solid page wash (not frosted) — glass rule sits below instead
        "[[data-theme=lilac]_&]:border-transparent [[data-theme=lilac]_&]:bg-page [[data-theme=lilac]_&]:backdrop-blur-none",
        "[[data-theme=lilac]_&]:lg:bg-page",
        condensed ? "pb-2.5 lg:pb-0" : "pb-2 lg:pb-0",
        runIgIntro && "deckk-ig-entry",
        runIgIntro && igEntered && "deckk-ig-entry-done"
      )}
    >
      {/* Mobile chrome — logo + actions */}
      <div
        data-ig-chrome
        className="flex items-center justify-between gap-2 px-4 pb-1.5 lg:hidden"
      >
        <Link
          href="/"
          className="inline-flex min-w-0 items-center"
          title="deckk.me"
          aria-label="deckk.me home"
        >
          <DeckLogo size={28} />
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {previewMode ? (
            <>
              {studioHref && (
                <Link
                  href={studioHref}
                  title="Back to Studio"
                  className={cn(secondaryButton, "h-9 gap-1 px-2 text-[13px] backdrop-blur-md")}
                >
                  <X className="size-3.5" strokeWidth={2.4} />
                  Close
                </Link>
              )}
              {shareUrl && (
                <ShareDeckSheet
                  shareUrl={shareUrl}
                  title={deck.display_name}
                  trigger="button"
                  label="Share"
                />
              )}
            </>
          ) : (
            <>
              {actions}
              {showThemeToggle && <ThemeToggleButton />}
              {shareUrl && (
                <ShareDeckSheet shareUrl={shareUrl} title={deck.display_name} />
              )}
              {studioHref && (
                <Link
                  href={studioHref}
                  title="Studio — edit your deck or add a link"
                  aria-label="Studio — edit or add a link"
                  className={cn(secondaryButton, "h-9 px-2 text-xs backdrop-blur-md")}
                >
                  <StudioCtaLabel />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop full-bleed identity band */}
      <div className="relative hidden border-b border-deck-card-brd [[data-theme=lilac]_&]:border-transparent lg:block">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-8 py-8">
          <div
            className="relative shrink-0 overflow-hidden rounded-full border-2 border-deck-card-brd shadow-lg"
            style={{ width: desktopAvatarPx, height: desktopAvatarPx }}
          >
            {deck.avatar_url ? (
              <Image
                src={deck.avatar_url}
                alt=""
                fill
                className="object-cover"
                sizes="200px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-deck-card font-display text-4xl text-primary">
                {deck.display_name.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div ref={desktopTextRef} className="min-w-0 flex-1">
            <h1 className="font-display text-[48px] font-medium leading-[1.05] tracking-normal text-foreground">
              {deck.display_name}
            </h1>
            {(deck.theme?.pronouns || deck.theme?.location) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {deck.theme?.pronouns && (
                  <span className={cn(secondaryPill, "px-2.5 py-1 text-[11px] font-semibold tracking-wide")}>
                    {deck.theme.pronouns}
                  </span>
                )}
                {deck.theme?.location && (
                  <span className={cn(secondaryPill, "px-2.5 py-1 text-[11px] font-semibold tracking-wide")}>
                    {deck.theme.location}
                  </span>
                )}
              </div>
            )}
            {deck.bio && (
              <p className="mt-3 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-dim">
                {deck.bio}
              </p>
            )}
            {hasSocials && (
              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <SocialIconLink key={link.id} card={link} />
                ))}
              </div>
            )}
          </div>
          {desktopActions ? (
            <div className="flex shrink-0 items-center gap-2">
              {previewMode ? (
                <>
                  {studioHref && (
                    <Link
                      href={studioHref}
                      className={cn(secondaryButton, "h-10 gap-1 px-3 text-[13px]")}
                    >
                      <X className="size-3.5" strokeWidth={2.4} />
                      Close
                    </Link>
                  )}
                  {shareUrl && (
                    <ShareDeckSheet
                      shareUrl={shareUrl}
                      title={deck.display_name}
                      trigger="button"
                      label="Share"
                    />
                  )}
                </>
              ) : (
                <>
                  {actions}
                  {showThemeToggle && <ThemeToggleButton />}
                  {shareUrl && (
                    <ShareDeckSheet shareUrl={shareUrl} title={deck.display_name} />
                  )}
                  {studioHref && (
                    <Link
                      href={studioHref}
                      className={cn(secondaryButton, "h-10 px-3 text-xs")}
                    >
                      <StudioCtaLabel />
                    </Link>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile identity */}
      <div
        data-ig-mobile
        className={cn(
          "mt-1.5 flex px-[18px] transition-[gap,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:hidden",
          condensed
            ? "flex-row items-center gap-2.5"
            : "flex-col items-center gap-3.5 px-6 text-center"
        )}
      >
        <div
          data-ig-avatar
          className={cn(
            "relative shrink-0 overflow-hidden rounded-full border border-deck-card-brd",
            condensed ? "border-[1.5px] shadow-none" : "border-2 shadow-lg"
          )}
        >
          {deck.avatar_url ? (
            <Image
              src={deck.avatar_url}
              alt=""
              fill
              className="object-cover"
              sizes="84px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-deck-card font-display text-2xl text-primary">
              {deck.display_name.charAt(0) || "?"}
            </div>
          )}
        </div>

        <div
          data-ig-detail
          className={cn(
            "min-w-0 transition-[flex-grow,text-align] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            condensed ? "flex-1 text-left" : "w-full"
          )}
        >
          {eyebrow && (
            <div
              data-ig-eyebrow
              className={cn(
                "mb-2 inline-flex items-center gap-1.5 overflow-hidden",
                condensed && "pointer-events-none"
              )}
            >
              <span className="text-[9px] font-semibold tracking-[0.18em] text-dim uppercase">
                {eyebrow}
              </span>
            </div>
          )}
          <div
            className={cn(
              "flex items-center gap-2",
              !condensed && "justify-center"
            )}
          >
            <h1
              data-ig-title
              className={cn(
                "min-w-0 break-words font-display font-medium tracking-normal text-foreground",
                condensed ? "leading-snug" : "leading-[1.08]"
              )}
            >
              {deck.display_name}
            </h1>
          </div>

          <div
            data-ig-bio-expand
            className={cn(
              !runIgIntro && "deckk-ig-bio-collapse",
              !expandedDetails && "pointer-events-none"
            )}
            aria-hidden={!expandedDetails}
          >
            <div data-ig-bio-inner>
              {(deck.theme?.pronouns || deck.theme?.location) && (
                <div
                  className={cn(
                    "mt-3.5 flex flex-wrap gap-1.5",
                    !condensed && "justify-center"
                  )}
                >
                  {deck.theme?.pronouns && (
                    <span className={cn(secondaryPill, "px-2.5 py-1 text-[11px] font-semibold tracking-wide")}>
                      {deck.theme.pronouns}
                    </span>
                  )}
                  {deck.theme?.location && (
                    <span className={cn(secondaryPill, "px-2.5 py-1 text-[11px] font-semibold tracking-wide")}>
                      {deck.theme.location}
                    </span>
                  )}
                </div>
              )}
              {deck.bio && (
                <p className="mt-2.5 whitespace-pre-line text-[14.5px] leading-snug text-dim">
                  {deck.bio}
                </p>
              )}
              {hasSocials && !condensed && (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {socialLinks.map((link) => (
                    <SocialIconLink key={link.id} card={link} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {hasSocials && !condensed && !expandedDetails && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {socialLinks.map((link) => (
                <SocialIconLink key={link.id} card={link} />
              ))}
            </div>
          )}
        </div>

        {hasSocials && condensed && (
          <div className="flex shrink-0 items-center gap-1.5">
            {socialLinks.slice(0, 4).map((link) => (
              <SocialIconLink key={link.id} card={link} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
