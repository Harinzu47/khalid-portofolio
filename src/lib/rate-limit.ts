/**
 * High-performance in-memory sliding window rate limiter
 * Protects login, sensitive mutations, and public API endpoints from brute-force & DoS attacks.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired tokens periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { limit: 60, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= options.limit) {
    const resetSeconds = Math.ceil((existing.resetTime - now) / 1000);
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  existing.count += 1;
  const resetSeconds = Math.ceil((existing.resetTime - now) / 1000);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - existing.count,
    resetSeconds: Math.max(1, resetSeconds),
  };
}
