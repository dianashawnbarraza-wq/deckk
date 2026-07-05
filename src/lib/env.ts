function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  appUrl: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: () => required("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => required("STRIPE_WEBHOOK_SECRET"),
  stripePublishableKey: () => required("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  resendApiKey: () => required("RESEND_API_KEY"),
  resendFromEmail: () => optional("RESEND_FROM_EMAIL", "orders@deckk.me"),
  upstashRedisUrl: () => required("UPSTASH_REDIS_REST_URL"),
  upstashRedisToken: () => required("UPSTASH_REDIS_REST_TOKEN"),
  platformFeeBps: () => {
    const raw = optional("PLATFORM_FEE_BPS", "0");
    const bps = Number.parseInt(raw, 10);
    return Number.isFinite(bps) && bps >= 0 ? bps : 0;
  },
};
