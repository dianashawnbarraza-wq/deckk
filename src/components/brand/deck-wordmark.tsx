import { cn } from "@/lib/utils";

/** Brand wordmark with a gothic blackletter leading d. */
export function DeckWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline leading-none", className)}>
      <span
        className="font-gothic text-[1.22em] leading-none tracking-[-0.04em] text-foreground"
        aria-hidden
      >
        d
      </span>
      <span className="font-display leading-none text-foreground">
        eckk<span className="text-primary">.</span>me
      </span>
    </span>
  );
}
