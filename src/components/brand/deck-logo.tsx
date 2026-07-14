import { DeckLogoGraphic } from "@/components/brand/deck-logo-graphic";
import { cn } from "@/lib/utils";

interface DeckLogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

/** Floating tarot card stack with a D — brand mark. */
export function DeckLogo({ className, size = 32, animate = true }: DeckLogoProps) {
  const height = Math.round(size * 0.9);
  return (
    <svg
      viewBox="0 0 56 48"
      width={size}
      height={height}
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
