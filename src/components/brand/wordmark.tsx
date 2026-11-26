import { cn } from "@/lib/utils";
import { DeckWordmarkMark } from "@/components/brand/deck-wordmark-mark";

export function Wordmark({
  className,
  as: Tag = "span",
}: {
  className?: string;
  as?: "span" | "p" | "h1";
}) {
  return (
    <Tag className={cn("inline-flex items-center text-ink", className)}>
      <DeckWordmarkMark className="h-[1.1em] w-auto" />
    </Tag>
  );
}
