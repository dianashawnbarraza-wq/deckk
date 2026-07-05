"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirectToStripeIfNeeded } from "@/lib/stripe-onboarding-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentLinkForm({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<"tip" | "fixed">("tip");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;

    const amountCents =
      kind === "fixed"
        ? Math.round(Number.parseFloat(amount) * 100)
        : null;

    if (kind === "fixed" && (!amountCents || amountCents <= 0)) return;

    setLoading(true);
    try {
      await fetch("/api/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          kind,
          title,
          amountCents,
        }),
      });
      setTitle("");
      setAmount("");
      router.refresh();
      await redirectToStripeIfNeeded("/dashboard/payments");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border p-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={kind === "tip" ? "default" : "outline"}
          onClick={() => setKind("tip")}
        >
          Tip jar
        </Button>
        <Button
          type="button"
          variant={kind === "fixed" ? "default" : "outline"}
          onClick={() => setKind("fixed")}
        >
          Fixed link
        </Button>
      </div>
      <div>
        <Label htmlFor="link-title">Title</Label>
        <Input
          id="link-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "tip" ? "Support my work" : "Commission deposit"}
          required
        />
      </div>
      {kind === "fixed" && (
        <div>
          <Label htmlFor="link-amount">Amount (USD)</Label>
          <Input
            id="link-amount"
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Adding…" : "Add payment link"}
      </Button>
    </form>
  );
}
