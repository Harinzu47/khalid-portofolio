import { describe, it, expect } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('Rate Limiter Engine', () => {
  it('allows requests within threshold limits', () => {
    const key = `test-ip-${Date.now()}`;
    const res1 = rateLimit(key, { limit: 3, windowSeconds: 10 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = rateLimit(key, { limit: 3, windowSeconds: 10 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = rateLimit(key, { limit: 3, windowSeconds: 10 });
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('blocks requests once threshold is exhausted', () => {
    const key = `exhausted-ip-${Date.now()}`;
    // Exhaust limit
    rateLimit(key, { limit: 2, windowSeconds: 10 });
    rateLimit(key, { limit: 2, windowSeconds: 10 });

    // 3rd attempt must be rejected
    const blockedRes = rateLimit(key, { limit: 2, windowSeconds: 10 });
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetSeconds).toBeGreaterThan(0);
  });
});
