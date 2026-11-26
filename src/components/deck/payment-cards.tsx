"use client";

import { useState } from "react";
import Image from "next/image";
import type { PaymentLink, Product } from "@/types/database";
import { cn } from "@/lib/utils";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

interface PaymentCardProps {
  handle: string;
  chargesEnabled: boolean;
}

export function ProductPaymentCard({
  product,
  handle,
  chargesEnabled,
  framed = true,
}: PaymentCardProps & { product: Product; framed?: boolean }) {
  const [loading, setLoading] = useState(false);
  const soldOut =
    product.inventory_qty !== null && product.inventory_qty <= 0;

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product",
          handle,
          productId: product.id,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  const body = (
    <>
      <div
        className={cn(
          "relative aspect-[4/3] w-full shrink-0 bg-page/40",
          !framed && "overflow-hidden rounded-[12px]"
        )}
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 420px"
          />
        ) : null}
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col space-y-2",
          framed ? "p-2.5 lg:space-y-3 lg:p-5" : "pt-2.5 lg:pt-4"
        )}
      >
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground lg:font-display lg:text-[24px] lg:leading-tight">
          {product.title}
        </p>
        {product.description ? (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-dim lg:text-[14px]">
            {product.description}
          </p>
        ) : (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-transparent lg:text-[14px]" aria-hidden>
            &nbsp;
          </p>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[13px] font-bold text-foreground lg:text-[17px]">
              {formatUsd(product.price_cents)}
            </span>
            {product.inventory_qty !== null && (
              <span className="rounded-full border border-deck-card-brd bg-page/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-dim uppercase lg:px-2.5 lg:py-1 lg:text-[11px]">
                {soldOut ? "Sold out" : `${product.inventory_qty} left`}
              </span>
            )}
          </div>
          {!chargesEnabled ? (
            <button
              type="button"
              disabled
              className="w-full rounded-xl border border-deck-card-brd bg-page/50 py-2 text-[12px] font-semibold text-dim lg:rounded-2xl lg:py-3 lg:text-[14px]"
            >
              Coming soon
            </button>
          ) : soldOut ? (
            <button
              type="button"
              disabled
              className="w-full rounded-xl border border-deck-card-brd bg-page/50 py-2 text-[12px] font-semibold text-dim lg:rounded-2xl lg:py-3 lg:text-[14px]"
            >
              Sold out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void checkout()}
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2 text-[12px] font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60 lg:rounded-2xl lg:py-3 lg:text-[14px]"
            >
              {loading ? "Loading…" : "Buy now"}
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (!framed) return <div className="flex h-full flex-col">{body}</div>;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[14px] border border-deck-card-brd bg-deck-card shadow-[0_10px_30px_-18px_var(--deck-shadow)] backdrop-blur-xl lg:rounded-[24px] lg:shadow-[0_24px_50px_-28px_var(--deck-shadow)]">
      {body}
    </div>
  );
}

export function TipJarCard({
  link,
  handle,
  chargesEnabled,
}: PaymentCardProps & { link: PaymentLink }) {
  const [amount, setAmount] = useState("5");
  const [loading, setLoading] = useState(false);

  async function checkout() {
    const dollars = Number.parseFloat(amount);
    if (!Number.isFinite(dollars) || dollars < 1 || dollars > 25000) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tip",
          handle,
          paymentLinkId: link.id,
          customAmountCents: Math.round(dollars * 100),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[14px] border border-deck-card-brd bg-deck-card p-3 backdrop-blur-xl">
      <p className="mb-0.5 text-[9px] font-bold tracking-[0.14em] text-primary uppercase">
        Support
      </p>
      <p className="text-[15px] font-semibold text-foreground">{link.title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-dim">
        Any amount from $1 up
      </p>
      {!chargesEnabled ? (
        <button
          type="button"
          disabled
          className="mt-3 w-full rounded-xl border border-deck-card-brd bg-page/50 py-2.5 text-[13px] font-semibold text-dim"
        >
          Coming soon
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-dim">$</span>
            <input
              type="number"
              min={1}
              max={25000}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Tip amount in dollars"
              className="min-w-0 flex-1 rounded-xl border border-deck-card-brd bg-page/60 px-3 py-2 text-[16px] text-foreground outline-none focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => void checkout()}
            disabled={loading}
            className="w-full rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Loading…" : "Send support"}
          </button>
        </div>
      )}
    </div>
  );
}

export function FixedPaymentLinkCard({
  link,
  handle,
  chargesEnabled,
}: PaymentCardProps & { link: PaymentLink }) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "fixed",
          handle,
          paymentLinkId: link.id,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-deck-card-brd bg-deck-card p-3 backdrop-blur-xl">
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[9px] font-bold tracking-[0.14em] text-primary uppercase">
          Pay
        </p>
        <p className="truncate text-[14px] font-semibold text-foreground">
          {link.title}
        </p>
        {link.amount_cents ? (
          <p className="mt-0.5 text-[13px] font-bold text-foreground">
            {formatUsd(link.amount_cents)}
          </p>
        ) : null}
      </div>
      {!chargesEnabled ? (
        <button
          type="button"
          disabled
          className="shrink-0 rounded-xl border border-deck-card-brd bg-page/50 px-3 py-2 text-[12px] font-semibold text-dim"
        >
          Soon
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void checkout()}
          disabled={loading}
          className="shrink-0 rounded-xl bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "…" : "Pay"}
        </button>
      )}
    </div>
  );
}
