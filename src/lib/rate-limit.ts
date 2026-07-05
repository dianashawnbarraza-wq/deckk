import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

let checkoutLimiter: Ratelimit | null = null;

function getRedis(): Redis {
  return new Redis({
    url: env.upstashRedisUrl(),
    token: env.upstashRedisToken(),
  });
}

export function getCheckoutRateLimiter(): Ratelimit {
  if (!checkoutLimiter) {
    checkoutLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "deckk:checkout",
      analytics: true,
    });
  }
  return checkoutLimiter;
}

export async function rateLimitCheckout(ip: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
}> {
  const limiter = getCheckoutRateLimiter();
  const result = await limiter.limit(ip);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
  };
}

let reportLimiter: Ratelimit | null = null;

function getReportRateLimiter(): Ratelimit {
  if (!reportLimiter) {
    reportLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "deckk:reports",
    });
  }
  return reportLimiter;
}

export async function rateLimitReport(ip: string) {
  const result = await getReportRateLimiter().limit(ip);
  return { success: result.success };
}
