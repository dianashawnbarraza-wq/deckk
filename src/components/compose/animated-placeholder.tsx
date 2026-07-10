"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Upload this flyer and create an event",
  "Sell a sticker for $5",
  "Paste my TikTok link",
  "Add a tip jar for supporters",
  "Share my YouTube channel",
  "Post this pop-up to my calendar",
];

export function AnimatedPlaceholder({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % SUGGESTIONS.length);
        setVisible(true);
      }, 280);
    }, 3200);
    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-0 top-3 text-base text-muted-foreground transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {SUGGESTIONS[index]}
    </span>
  );
}

export const QUICK_PROMPTS = {
  event: "Post this flyer to my calendar",
  product: "Sell this for $5",
  link: "Add this link to my deck: ",
  tip: "Create a tip jar for supporters",
  fixed: "Create a $10 support link",
} as const;
