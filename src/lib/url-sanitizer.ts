/**
 * Centralized URL sanitization policy for HZCODE technical content rendering.
 *
 * Allowed schemes: https, http, mailto, and relative paths.
 * Rejects dangerous schemes: javascript, data, vbscript, file, blob.
 *
 * Normalizes input before validation to defend against casing and whitespace attacks:
 *   JaVaScRiPt:
 *   \x20javascript:
 *   java%0ascript:
 *   java\nscript:
 *
 * Amendment 3: Centralized — do NOT scatter ad-hoc URL checks in components.
 */

const ALLOWED_SCHEMES = ['https:', 'http:', 'mailto:'];

/**
 * Normalizes a URL string by stripping control characters, whitespace,
 * and decoding percent-encoded characters before scheme extraction.
 */
function normalizeUrl(url: string): string {
  // Strip leading/trailing whitespace
  let normalized = url.trim();

  // Remove ASCII control characters (0x00–0x1F, 0x7F) and zero-width characters
  // eslint-disable-next-line no-control-regex
  normalized = normalized.replace(/[\x00-\x1f\x7f\u200b\u200c\u200d\ufeff]/g, '');

  // Decode percent-encoded characters for scheme detection
  // This catches java%0ascript:, java%09script:, etc.
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // If decoding fails, use the stripped version
  }

  // Strip whitespace again after decoding
  // eslint-disable-next-line no-control-regex
  normalized = normalized.replace(/[\x00-\x1f\x7f\s]/g, '');

  return normalized;
}

/**
 * Validates whether a URL is safe for use in rendered technical content.
 *
 * @returns The original URL if safe, or `undefined` if dangerous.
 */
export function sanitizeUrl(url: string | undefined | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Relative URLs: paths starting with / or # or ? are always allowed
  if (/^[/#?]/.test(trimmed)) {
    return trimmed;
  }

  // Fragment-only and query-only are fine
  if (trimmed.startsWith('#') || trimmed.startsWith('?')) {
    return trimmed;
  }

  // Normalize for scheme detection
  const normalized = normalizeUrl(trimmed).toLowerCase();

  // Extract scheme (everything before the first colon)
  const colonIndex = normalized.indexOf(':');
  if (colonIndex === -1) {
    // No scheme — treat as relative path (safe)
    return trimmed;
  }

  const scheme = normalized.slice(0, colonIndex + 1);

  // Check against allowed schemes
  if (ALLOWED_SCHEMES.includes(scheme)) {
    return trimmed;
  }

  // Reject all other schemes (javascript:, data:, vbscript:, file:, blob:, etc.)
  return undefined;
}

/**
 * Returns true if the URL is considered safe for rendering.
 */
export function isUrlSafe(url: string | undefined | null): boolean {
  return sanitizeUrl(url) !== undefined;
}
