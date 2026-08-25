import { describe, it, expect } from 'vitest';
import { SECURITY_HEADERS, applySecurityHeaders } from '@/lib/security';

describe('Security & CSP Engine', () => {
  it('defines essential production security headers', () => {
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(SECURITY_HEADERS['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain("default-src 'self'");
  });

  it('correctly populates Headers instance with all security headers', () => {
    const headers = new Headers();
    applySecurityHeaders(headers);

    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Content-Security-Policy')).toBeDefined();
  });
});
