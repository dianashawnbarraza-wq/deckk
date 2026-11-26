"use client";

import { cn } from "@/lib/utils";

/** Soft lilac orbs behind the hero — Floating Gradient / Bubble Background. */
export function LandingAtmosphere({ className }: { className?: string }) {
  return (
    <div className={cn("landing-atmosphere", className)} aria-hidden>
      <div className="landing-atmosphere__orb landing-atmosphere__orb-a" />
      <div className="landing-atmosphere__orb landing-atmosphere__orb-b" />
      <div className="landing-atmosphere__orb landing-atmosphere__orb-c" />
    </div>
  );
}
