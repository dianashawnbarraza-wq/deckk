"use client";

import { useMemo, type CSSProperties } from "react";

type Flake = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
  drift: string;
  spin: string;
  opacity: number;
};

function PancakeIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className="drop-shadow-[0_2px_4px_rgba(40,20,0,0.25)]"
    >
      <ellipse cx="24" cy="30" rx="18" ry="8" fill="#c47a3a" />
      <ellipse cx="24" cy="26" rx="18" ry="8" fill="#e8a45a" />
      <ellipse cx="24" cy="22" rx="18" ry="8" fill="#f0b86a" />
      <ellipse cx="24" cy="18" rx="17" ry="7.5" fill="#f6c97a" />
      <ellipse cx="24" cy="15" rx="10" ry="4" fill="#f3d9a0" opacity="0.85" />
      <path
        d="M18 14c2-3 5-4 8-3 2 .6 3 2 4 3"
        stroke="#d45a2a"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="28" cy="12" r="2.2" fill="#d45a2a" />
    </svg>
  );
}

/** Butch Brunch atmosphere: falling pancakes. */
export function ButchBrunchBackdrop() {
  const flakes = useMemo<Flake[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${3 + ((i * 11) % 94)}%`,
        delay: `${(i * 0.48) % 7}s`,
        duration: `${8.5 + (i % 5) * 1.35}s`,
        size: 22 + (i % 4) * 6,
        drift: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 7)}px`,
        spin: `${(i % 2 === 0 ? 1 : -1) * (160 + i * 18)}deg`,
        opacity: 0.4 + (i % 4) * 0.12,
      })),
    []
  );

  return (
    <div
      className="butch-brunch-scene pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0">
        {flakes.map((flake) => (
          <span
            key={flake.id}
            className="butch-brunch-flake absolute top-[-10%]"
            style={
              {
                left: flake.left,
                animationDelay: flake.delay,
                animationDuration: flake.duration,
                opacity: flake.opacity,
                "--butch-drift": flake.drift,
                "--butch-spin": flake.spin,
              } as CSSProperties
            }
          >
            <PancakeIcon size={flake.size} />
          </span>
        ))}
      </div>
    </div>
  );
}
