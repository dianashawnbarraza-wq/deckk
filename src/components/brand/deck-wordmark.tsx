import { cn } from "@/lib/utils";

/** Brand wordmark — display type throughout, normal lowercase d. */
export function DeckWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display leading-none text-foreground", className)}>
      deckk<span className="text-primary">.</span>me
    </span>
  );
}
