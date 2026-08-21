"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TICKET_PLATFORM_FEE_CENTS } from "@/lib/platform-fee";
import type { TicketTierId } from "@/lib/ticket-tiers";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export type TicketTierOption = {
  id: TicketTierId;
  label: string;
  unitPriceCents: number;
  maxQuantity: number;
  soldOut?: boolean;
};

export function BuyTicketsButton({
  handle,
  cardId,
  unitPriceCents,
  maxQuantity = 8,
  soldOut,
  className,
  stickyPurchase = false,
  tiers,
  showCheckoutHint = false,
  stickyTheme = "default",
  stickyProceeds,
}: {
  handle: string;
  cardId: string;
  unitPriceCents: number;
  maxQuantity?: number;
  soldOut?: boolean;
  className?: string;
  /** Lock price + Get tickets at the bottom of the viewport (portaled). */
  stickyPurchase?: boolean;
  /** When set, buyer picks a tier (e.g. GA + test). */
  tiers?: TicketTierOption[];
  /** Optional Stripe handoff copy under the button. */
  showCheckoutHint?: boolean;
  /** High-contrast electric violet bar + black CTA. */
  stickyTheme?: "default" | "electric";
  /** Shown under the price on the sticky bar (replaces fee line). */
  stickyProceeds?: string;
}) {
  const tierList = tiers && tiers.length > 0 ? tiers : null;
  const defaultTier: TicketTierOption[] = tierList ?? [
    {
      id: "ga",
      label: "General admission",
      unitPriceCents,
      maxQuantity,
      soldOut,
    },
  ];

  const firstAvailable =
    defaultTier.find((t) => !t.soldOut && t.maxQuantity > 0) ?? defaultTier[0];

  const [tierId, setTierId] = useState<TicketTierId>(firstAvailable.id);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTier =
    defaultTier.find((t) => t.id === tierId) ?? defaultTier[0];
  const priceCents = activeTier.unitPriceCents;
  const tierSoldOut = Boolean(activeTier.soldOut) || activeTier.maxQuantity < 1;
  const feeCents = TICKET_PLATFORM_FEE_CENTS;
  const allSoldOut = defaultTier.every((t) => t.soldOut || t.maxQuantity < 1);
  const showTier = defaultTier.length > 1;

  async function buy() {
    if (tierSoldOut || buying) return;
    setBuying(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ticket",
          handle,
          cardId,
          quantity: 1,
          tier: activeTier.id,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      setError(
        typeof data.error === "string" && data.error
          ? data.error
          : "Checkout unavailable"
      );
    } catch {
      setError("Checkout unavailable");
    } finally {
      setBuying(false);
    }
  }

  const buttonClass =
    className ??
    "inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground disabled:opacity-50";

  const tierBlock = showTier ? (
    <fieldset className="block">
      <legend className="mb-1.5 block text-[11px] font-bold tracking-[0.14em] text-faint uppercase">
        Ticket type
      </legend>
      <div className="flex flex-col gap-2">
        {defaultTier.map((t) => {
          const disabled = Boolean(t.soldOut) || t.maxQuantity < 1;
          return (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-[14px] ${
                tierId === t.id
                  ? "border-primary bg-primary/10"
                  : "border-deck-card-brd bg-page"
              } ${disabled ? "opacity-50" : ""}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <input
                  type="radio"
                  name="ticket-tier"
                  className="accent-primary"
                  checked={tierId === t.id}
                  disabled={disabled}
                  onChange={() => setTierId(t.id)}
                />
                <span className="truncate font-semibold text-foreground">
                  {t.label}
                </span>
              </span>
              <span className="shrink-0 tabular-nums font-semibold text-foreground">
                {disabled ? "Sold out" : formatUsd(t.unitPriceCents)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  ) : null;

  if (!stickyPurchase) {
    return (
      <div id="event-tickets" className="flex scroll-mt-24 flex-col gap-3">
        {tierBlock}
        <button
          type="button"
          disabled={tierSoldOut || buying || allSoldOut}
          onClick={() => void buy()}
          className={buttonClass}
        >
          {buying
            ? "Taking you to Stripe…"
            : tierSoldOut || allSoldOut
              ? "Sold out"
              : "Get tickets"}
        </button>
        {showCheckoutHint ? (
          <p className="text-center text-[12px] leading-relaxed text-dim">
            Finish checking out securely with Stripe. You can adjust the number
            of tickets there.
          </p>
        ) : null}
        {error ? (
          <p className="text-center text-[13px] text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const stickyBar =
    mounted && !allSoldOut
      ? createPortal(
          <div
            className={
              stickyTheme === "electric"
                ? "fixed inset-x-0 bottom-0 z-[60] border-t border-black/15 bg-[#b967ff] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-18px_40px_-10px_rgba(0,0,0,0.45)] lg:px-6"
                : "fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#08080c]/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-24px_48px_-8px_rgba(0,0,0,0.85),0_-8px_32px_-4px_rgba(168,85,247,0.22)] backdrop-blur-xl lg:px-6"
            }
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {showTier ? (
                <div
                  className={
                    stickyTheme === "electric"
                      ? "text-black [&_.text-dim]:text-black/65 [&_.text-faint]:text-black/50 [&_.text-foreground]:text-black [&_label]:border-black/20 [&_label]:bg-white/25"
                      : "mb-0 text-white [&_.text-dim]:text-white/60 [&_.text-faint]:text-white/45 [&_.text-foreground]:text-white"
                  }
                >
                  {tierBlock}
                </div>
              ) : null}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  type="button"
                  disabled={buying || tierSoldOut}
                  onClick={() => void buy()}
                  className={
                    stickyTheme === "electric"
                      ? "inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-black px-5 text-[15px] font-semibold text-white disabled:opacity-50"
                      : "inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground disabled:opacity-50"
                  }
                >
                  {buying ? "Taking you to Stripe…" : "Get tickets"}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      stickyTheme === "electric"
                        ? "truncate font-display text-[28px] leading-none tracking-tight text-black sm:text-[34px]"
                        : "truncate font-display text-[34px] leading-none tracking-tight text-white sm:text-[40px]"
                    }
                  >
                    {formatUsd(priceCents)}
                  </p>
                  {stickyProceeds ? (
                    <p
                      className={
                        stickyTheme === "electric"
                          ? "mt-0.5 text-[12px] leading-snug font-medium text-black/80 sm:text-[13px]"
                          : "mt-0.5 text-[12px] leading-snug text-white/70 sm:text-[13px]"
                      }
                    >
                      {stickyProceeds}
                    </p>
                  ) : (
                    <p
                      className={
                        stickyTheme === "electric"
                          ? "mt-0.5 truncate text-[11px] text-black/60"
                          : "mt-0.5 truncate text-[11px] text-white/55"
                      }
                    >
                      per ticket · +{formatUsd(feeCents)} fee
                    </p>
                  )}
                </div>
              </div>
              {error ? (
                <p
                  className={
                    stickyTheme === "electric"
                      ? "text-center text-[13px] font-semibold text-black"
                      : "text-center text-[13px] text-red-400"
                  }
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {allSoldOut ? (
        <p className="text-[15px] font-semibold text-foreground">Sold out</p>
      ) : null}
      {stickyBar}
    </>
  );
}
