"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Sticky purchase bar that sends buyers to an external Stripe Payment Link. */
export function ExternalTicketsButton({
  href,
  unitPriceCents,
  label = "Get tickets",
}: {
  href: string;
  unitPriceCents: number;
  label?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !href) return <div id="event-tickets" className="scroll-mt-24" />;

  return (
    <>
      <div id="event-tickets" className="scroll-mt-24" />
      {createPortal(
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#08080c]/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-24px_48px_-8px_rgba(0,0,0,0.85),0_-8px_32px_-4px_rgba(168,85,247,0.22)] backdrop-blur-xl lg:px-6">
          <div className="mx-auto flex w-full max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1 pl-0.5">
              <p className="truncate font-display text-[34px] leading-none tracking-tight text-white sm:text-[40px]">
                {formatUsd(unitPriceCents)}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-white/55">
                per ticket · +$1 Stripe fee
              </p>
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground"
            >
              {label}
            </a>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
