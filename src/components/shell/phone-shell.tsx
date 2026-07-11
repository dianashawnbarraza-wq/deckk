"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PhoneShellProps {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}

export function PhoneShell({ children, dark, className }: PhoneShellProps) {
  return (
    <div
      data-theme={dark ? "dark" : undefined}
      className={cn(
        "flex min-h-dvh items-center justify-center bg-backdrop p-3.5 transition-colors duration-500 sm:p-5",
        dark && "dark",
        className
      )}
    >
      <div className="relative h-[868px] w-full max-w-phone max-h-[calc(100dvh-30px)] overflow-hidden rounded-[46px] border border-phone-brd bg-page shadow-[0_50px_90px_-40px_var(--deck-shadow),0_10px_30px_-20px_var(--deck-shadow)] transition-colors duration-500">
        <div
          className="pointer-events-none absolute -left-10 -top-[60px] h-[260px] w-[260px] rounded-full opacity-50 blur-[30px]"
          style={{
            background: "radial-gradient(circle, var(--accent), transparent 70%)",
            animation: "deckk-float 14s ease-in-out infinite",
          }}
        />
        <div
          className="pointer-events-none absolute -right-[70px] top-[220px] h-[240px] w-[240px] rounded-full opacity-40 blur-[34px]"
          style={{
            background: "radial-gradient(circle, #6a4c86, transparent 70%)",
            animation: "deckk-float 18s ease-in-out infinite reverse",
          }}
        />
        <div
          className="pointer-events-none absolute -left-[50px] bottom-10 h-[230px] w-[230px] rounded-full opacity-35 blur-[34px]"
          style={{
            background: "radial-gradient(circle, var(--accent-2), transparent 70%)",
            animation: "deckk-float 16s ease-in-out infinite",
          }}
        />
        {children}
      </div>
    </div>
  );
}
