"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StripeConnectBannerProps {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  returnTo?: string;
}

export function StripeConnectBanner({
  stripeAccountId,
  chargesEnabled,
  returnTo = "/dashboard/payments",
}: StripeConnectBannerProps) {
  const [loading, setLoading] = useState(false);

  if (chargesEnabled) return null;

  const isResume = Boolean(stripeAccountId);

  async function startOnboarding() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnTo }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertTitle>
        {isResume ? "Finish setting up payments" : "Connect Stripe to get paid"}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          {isResume
            ? "You started Stripe onboarding but haven't finished. Payment cards show as \"coming soon\" on your deck until setup is complete."
            : "Add a tip jar, payment link, or product — then connect Stripe to start accepting payments. deckk.me charges 0% on transactions."}
        </p>
        <Button onClick={startOnboarding} disabled={loading}>
          {loading
            ? "Redirecting…"
            : isResume
              ? "Resume Stripe onboarding"
              : "Connect with Stripe"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
