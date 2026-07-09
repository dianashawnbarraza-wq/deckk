import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  as: Tag = "span",
}: {
  className?: string;
  as?: "span" | "p" | "h1";
}) {
  return (
    <Tag
      className={cn(
        "font-display text-[1.75rem] italic leading-[1.02] tracking-tight text-ink",
        className
      )}
    >
      deckk
    </Tag>
  );
}
