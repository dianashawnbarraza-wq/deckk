"use client";

import { cn } from "@/lib/utils";

/** Word Fade In — splits a line into staggered words. */
export function LandingWordReveal({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2";
}) {
  const words = text.trim().split(/\s+/);

  return (
    <Tag className={cn("landing-word-reveal", className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{ ["--i" as string]: i }}
          className={i < words.length - 1 ? "mr-[0.28em]" : undefined}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
