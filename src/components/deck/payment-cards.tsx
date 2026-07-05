"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PaymentLink, Product } from "@/types/database";

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
}: PaymentCardProps & { product: Product }) {
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

  return (
    <Card className="overflow-hidden shadow-sm">
      {product.images[0] && (
        <div className="relative aspect-square w-full bg-muted">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{product.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">{formatUsd(product.price_cents)}</span>
          {product.inventory_qty !== null && (
            <Badge variant="secondary">
              {soldOut ? "Sold out" : `${product.inventory_qty} left`}
            </Badge>
          )}
        </div>
        {!chargesEnabled ? (
          <Button disabled className="w-full">
            Coming soon
          </Button>
        ) : soldOut ? (
          <Button disabled className="w-full">
            Sold out
          </Button>
        ) : (
          <Button onClick={checkout} disabled={loading} className="w-full">
            {loading ? "Loading…" : "Buy now"}
          </Button>
        )}
      </CardContent>
    </Card>
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
    if (!Number.isFinite(dollars) || dollars < 1 || dollars > 500) return;

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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{link.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Support with any amount from $1 to $500
        </p>
        {!chargesEnabled ? (
          <Button disabled className="w-full">
            Coming soon
          </Button>
        ) : (
          <>
            <div className="flex gap-2">
              <span className="flex items-center text-muted-foreground">$</span>
              <Input
                type="number"
                min={1}
                max={500}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label="Tip amount in dollars"
              />
            </div>
            <Button onClick={checkout} disabled={loading} className="w-full">
              {loading ? "Loading…" : "Send support"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{link.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {link.amount_cents && (
          <p className="font-semibold">{formatUsd(link.amount_cents)}</p>
        )}
        {!chargesEnabled ? (
          <Button disabled className="w-full">
            Coming soon
          </Button>
        ) : (
          <Button onClick={checkout} disabled={loading} className="w-full">
            {loading ? "Loading…" : "Pay now"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
