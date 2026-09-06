import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";

/**
 * Falls back to an in-memory limiter when Upstash isn't configured (local
 * dev, or before Phase 5's env vars are set in production) — real rate
 * limiting either way, just not distributed across server instances until
 * Upstash is wired up.
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count += 1;
  const success = entry.count <= limit;
  return { success, remaining: Math.max(0, limit - entry.count), reset: entry.resetAt };
}

const hasUpstash = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

const upstashLimiter = hasUpstash
  ? new Ratelimit({
      redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL!,
        token: env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "estate-bureau",
    })
  : null;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Limits a public POST action by a caller-supplied key (usually the client
 * IP, sometimes combined with a resource id). Default: 5 requests/minute.
 */
export async function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): Promise<RateLimitResult> {
  if (upstashLimiter) {
    const result = await upstashLimiter.limit(key);
    return { success: result.success, remaining: result.remaining, reset: result.reset };
  }
  return memoryLimit(key, limit, windowMs);
}
