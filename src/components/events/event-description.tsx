"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function EventDescription({
  text,
  className,
  tone = "default",
  clamp = true,
}: {
  text: string;
  className?: string;
  tone?: "default" | "bright";
  /** When false, always show the full description (no Read more). */
  clamp?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsClamp = clamp && text.trim().length > 180;

  return (
    <div className={className}>
      <p
        className={cn(
          "whitespace-pre-wrap text-[16px] leading-relaxed lg:text-[18px]",
          tone === "bright" ? "text-white" : "text-dim",
          !expanded && needsClamp && "line-clamp-3"
        )}
      >
        {text}
      </p>
      {needsClamp ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "mt-2 text-[13px] font-semibold underline-offset-2 hover:underline",
            tone === "bright" ? "text-white/85" : "text-primary"
          )}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
