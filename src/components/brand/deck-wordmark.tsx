import { cn } from "@/lib/utils";
import { DeckWordmarkMark } from "@/components/brand/deck-wordmark-mark";

/** Brand wordmark — bubbly DECKK + .me. */
export function DeckWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-0.5 text-foreground", className)}>
      <DeckWordmarkMark className="h-[1em] w-auto" />
      <span className="font-display text-[0.55em] leading-none text-primary">.me</span>
    </span>
  );
}
