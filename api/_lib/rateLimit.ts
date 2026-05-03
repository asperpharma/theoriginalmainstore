/**
 * Simple in-memory rate limiter.
 * Works well with Fluid Compute's instance-reuse model — same warm instance
 * handles concurrent requests, so counts accumulate meaningfully within a window.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Prune expired entries every minute to prevent memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (now >= val.resetAt) store.delete(key);
  }
}, 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds until reset, 0 if allowed
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfter: 0 };
}

/** Extract a stable client key from the request IP headers. */
export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const fwd = headers["x-forwarded-for"];
  if (Array.isArray(fwd)) return fwd[0]?.split(",")[0]?.trim() ?? "unknown";
  if (typeof fwd === "string") return fwd.split(",")[0]?.trim() ?? "unknown";
  return (headers["x-real-ip"] as string | undefined) ?? "unknown";
}
