import { cn } from "@/lib/utils";
import { DeckWordmarkMark } from "@/components/brand/deck-wordmark-mark";
import { DeckMarkD } from "@/components/brand/deck-mark-d";

interface DeckLogoProps {
  className?: string;
  /** Visual height in px for the DECKK wordmark. */
  size?: number;
  animate?: boolean;
  priority?: boolean;
  /** Light mark for photo / dark headers. */
  soft?: boolean;
  /** Show only the bubbly D mark. */
  markOnly?: boolean;
}

/** Bubbly DECKK wordmark — lilac balloons in light, white in dark, black on lilac theme. */
export function DeckLogo({
  className,
  size = 28,
  animate = false,
  soft = false,
  markOnly = false,
}: DeckLogoProps) {
  const height = size;
  const width = markOnly
    ? Math.round(size * 0.92)
    : Math.round(size * (1511 / 415));

  return (
    <span
      className={cn(
        "deck-logo-glass inline-flex items-center",
        animate ? "deck-logo-bounce" : null,
        soft ? "text-white" : "text-[color:var(--logo)]",
        className
      )}
    >
      {markOnly ? (
        <DeckMarkD
          className="shrink-0"
          style={{ width, height }}
          soft={soft}
        />
      ) : (
        <DeckWordmarkMark
          className="shrink-0"
          style={{ width, height }}
        />
      )}
    </span>
  );
}
