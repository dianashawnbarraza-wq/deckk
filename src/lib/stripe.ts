import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey(), {
      typescript: true,
    });
  }
  return stripeClient;
}

export const CHECKOUT_EXPIRY_MINUTES = 30;

export function checkoutExpiresAt(): number {
  return Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_MINUTES * 60;
}
