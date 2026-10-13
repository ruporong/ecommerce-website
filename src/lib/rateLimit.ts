import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * IN-MEMORY FALLBACK LIMITER
 * WARNING: This implementation uses a local Map. It is NOT safe for distributed 
 * or serverless multi-instance production environments (where state is not shared).
 * It is retained solely as a best-effort fallback for local development or 
 * during unexpected Redis outages for critical business routes.
 */
const fallbackStore = new Map<string, { count: number; resetTime: number }>();

function fallbackRateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = fallbackStore.get(identifier);

  // Cleanup old records to prevent unbounded memory growth
  if (fallbackStore.size > 10000) {
    for (const [key, val] of fallbackStore.entries()) {
      if (val.resetTime < now) {
        fallbackStore.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    fallbackStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  fallbackStore.set(identifier, record);
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime };
}

// ----------------------------------------------------------------------------
// UPSTASH REDIS CONFIGURATION
// ----------------------------------------------------------------------------
let redis: Redis | null = null;
let ratelimits: Record<string, Ratelimit> = {};

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.warn('Failed to initialize Upstash Redis:', error);
  }
}

function getRateLimiter(windowString: string, limit: number) {
  const key = `${limit}_${windowString}`;
  if (!ratelimits[key] && redis) {
    // Note: windowString should be in the format '10 s', '1 m', etc. 
    // supported by @upstash/ratelimit
    ratelimits[key] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, windowString as any),
      analytics: true,
      prefix: 'ratelimit',
    });
  }
  return ratelimits[key];
}

/**
 * Parses windowMs into Upstash format (e.g. "10 s")
 */
function parseWindowMs(windowMs: number): string {
  if (windowMs < 1000) return '1 s'; // minimum window
  const seconds = Math.round(windowMs / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} m`;
  const hours = Math.round(minutes / 60);
  return `${hours} h`;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * DISTRIBUTED RATE LIMITER
 * Uses Upstash Redis for atomic, distributed rate limiting.
 * Falls back to in-memory store if Redis is unavailable or fails.
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  policy: 'fail-closed' | 'fail-open' = 'fail-closed'
): Promise<RateLimitResult> {
  const windowString = parseWindowMs(windowMs);

  if (redis) {
    try {
      const limiter = getRateLimiter(windowString, limit);
      if (limiter) {
        const { success, limit: resLimit, remaining, reset } = await limiter.limit(identifier);
        return {
          success,
          limit: resLimit,
          remaining,
          reset
        };
      }
    } catch (error) {
      console.warn(`Upstash Redis rate limit failed for ${identifier}. Fallback policy: ${policy}. Error:`, error);
      
      if (policy === 'fail-closed') {
        // Security-sensitive endpoints (Login, Admin) should reject requests if Redis is completely broken
        // rather than falling back to an isolated per-instance Map that attackers can easily abuse.
        return { success: false, limit, remaining: 0, reset: Date.now() + windowMs };
      }
      
      // Business-critical endpoints (Checkout, Payment Init) fail-open by falling back to the local memory limit
      // to avoid blocking legitimate revenue during a Redis outage.
    }
  }

  // Fallback to local memory limiter
  return fallbackRateLimit(identifier, limit, windowMs);
}
