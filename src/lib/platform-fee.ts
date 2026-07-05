import { env } from "@/lib/env";

/** Platform fee in basis points (default 0 = deckk.me charges 0% per §11). */
export function getPlatformFeeBps(): number {
  return env.platformFeeBps();
}

/** application_fee_amount for Stripe destination charges (integer cents). */
export function calculateApplicationFeeCents(amountCents: number): number {
  const bps = getPlatformFeeBps();
  if (bps === 0) return 0;
  return Math.floor((amountCents * bps) / 10_000);
}
