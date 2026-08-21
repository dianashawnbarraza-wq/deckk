"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Parts = { days: number; hours: number; mins: number; secs: number };

function diffParts(targetMs: number, nowMs: number): Parts | null {
  const delta = targetMs - nowMs;
  if (delta <= 0) return null;
  const totalSecs = Math.floor(delta / 1000);
  return {
    days: Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    mins: Math.floor((totalSecs % 3600) / 60),
    secs: totalSecs % 60,
  };
}

function Unit({
  value,
  label,
  subdued,
}: {
  value: number;
  label: string;
  subdued?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-[4.25rem] rounded-xl px-3 py-2.5 text-center sm:min-w-[5rem] sm:px-3.5 sm:py-3",
        subdued
          ? "border border-white/8 bg-black/25 backdrop-blur-sm"
          : "border border-white/15 bg-black/55 backdrop-blur-md"
      )}
    >
      <p
        className={cn(
          "font-display leading-none tabular-nums sm:text-[36px]",
          subdued
            ? "text-[24px] text-white/55 sm:text-[28px]"
            : "text-[28px] text-white"
        )}
      >
        {String(value).padStart(2, "0")}
      </p>
      <p
        className={cn(
          "mt-1.5 text-[10px] font-bold tracking-[0.14em] uppercase sm:text-[11px]",
          subdued ? "text-white/40" : "text-white/70"
        )}
      >
        {label}
      </p>
    </div>
  );
}

export function EventCountdown({
  startIso,
  className,
  subdued = false,
}: {
  startIso: string;
  className?: string;
  /** Quieter contrast for hero lockups. */
  subdued?: boolean;
}) {
  const targetMs = new Date(startIso).getTime();
  const [parts, setParts] = useState<Parts | null>(() =>
    Number.isFinite(targetMs) ? diffParts(targetMs, Date.now()) : null
  );

  useEffect(() => {
    if (!Number.isFinite(targetMs)) return;
    const tick = () => setParts(diffParts(targetMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (!parts) return null;

  return (
    <div
      className={cn("inline-flex items-end gap-2 sm:gap-2.5", className)}
      aria-live="polite"
      aria-label={`Starts in ${parts.days} days, ${parts.hours} hours, ${parts.mins} minutes`}
    >
      <Unit value={parts.days} label="Days" subdued={subdued} />
      <Unit value={parts.hours} label="Hrs" subdued={subdued} />
      <Unit value={parts.mins} label="Min" subdued={subdued} />
      <Unit value={parts.secs} label="Sec" subdued={subdued} />
    </div>
  );
}
