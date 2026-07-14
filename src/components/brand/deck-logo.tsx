import { DeckLogoGraphic } from "@/components/brand/deck-logo-graphic";
import { cn } from "@/lib/utils";

interface DeckLogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

/** Floating purple card with a D — brand mark. */
export function DeckLogo({ className, size = 28, animate = true }: DeckLogoProps) {
  return (
    <svg
      viewBox="0 0 40 34"
      width={size}
      height={Math.round(size * 0.85)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-foreground", animate && "deck-logo-levitate", className)}
      role="img"
      aria-label="deckk"
    >
      <DeckLogoGraphic />
    </svg>
  );
}
