/**
 * Content Security Policy (CSP) & Production HTTP Security Headers Configuration
 */

export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP_DIRECTIVES,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
};

/**
 * Applies all security headers to a Response or Headers object.
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}

const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Validates and sanitizes public external URLs (Amendment 6).
 * Disallows unsafe schemes like javascript:, data:, vbscript:.
 */
export function sanitizePublicUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Relative URLs starting with '/' are permitted
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (ALLOWED_URL_SCHEMES.includes(parsed.protocol)) {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates post-login or internal redirection targets to prevent Open Redirect attacks.
 * Rejects protocol-relative URLs (`//evil.com`), scheme payloads (`javascript:`), and foreign hosts.
 */
export function validateSafeRedirectUrl(
  url: string | null | undefined,
  fallback = '/admin'
): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Strict local relative path check: starts with single '/', no protocol relative '//' or '\\'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }

  // If absolute URL provided, verify exact origin against NEXT_PUBLIC_SITE_URL
  try {
    const parsed = new URL(trimmed);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      const siteOrigin = new URL(siteUrl).origin;
      if (parsed.origin === siteOrigin) {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    }
  } catch {
    // Malformed URL
  }

  return fallback;
}

