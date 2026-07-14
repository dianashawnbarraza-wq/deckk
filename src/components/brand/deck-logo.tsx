import { DeckLogoGraphic } from "@/components/brand/deck-logo-graphic";
import { cn } from "@/lib/utils";

interface DeckLogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

/** Compact card-stack brand mark. */
export function DeckLogo({ className, size = 22, animate = false }: DeckLogoProps) {
  const height = Math.round(size * 0.95);
  return (
    <svg
      viewBox="0 0 26 24"
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
