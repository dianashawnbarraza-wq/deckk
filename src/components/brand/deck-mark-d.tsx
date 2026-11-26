"use client";

import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Bubbly D mark — balloon fill with counter hole (Gander-style). */
export function DeckMarkD({
  className,
  style,
  soft = false,
  title = "DECKK",
}: {
  className?: string;
  style?: CSSProperties;
  soft?: boolean;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const fillId = `deck-d-fill-${uid}`;
  const fill = soft ? "#ffffff" : "currentColor";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn("overflow-visible", className)}
      style={style}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.72" />
          <stop offset="38%" stopColor={fill} stopOpacity="1" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.84" />
        </linearGradient>
        <linearGradient id={`${fillId}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${fillId})`}
        fillRule="evenodd"
        d="M14 12.5c0-3.4 2.4-5.8 5.9-5.8h13.8c14.2 0 25.3 10.4 25.3 23.3S47.9 53.3 33.7 53.3H19.9c-3.5 0-5.9-2.4-5.9-5.8V12.5Zm20.2 12.2c-5.1 0-8.5 3.6-8.5 7.3s3.4 7.3 8.5 7.3 8.5-3.6 8.5-7.3-3.4-7.3-8.5-7.3Z"
      />
      <ellipse
        cx="30"
        cy="16"
        rx="18"
        ry="7"
        fill={`url(#${fillId}-shine)`}
        opacity="0.55"
        style={{ mixBlendMode: "soft-light" }}
        pointerEvents="none"
      />
    </svg>
  );
}
