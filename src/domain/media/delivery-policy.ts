/**
 * Delivery Policy & Storage Configuration
 * per HZCODE Publishing Model v1 & Media Architecture v1
 */

/**
 * Centralized signed URL TTLs in seconds (Amendment 11).
 */
export const DELIVERY_TTL = {
  PREVIEW_SIGNED_URL_TTL: 3600, // 1 hour for owner preview
  ADMIN_SIGNED_URL_TTL: 7200,   // 2 hours for admin console
} as const;

export const DEFAULT_STORAGE_BUCKET = 'portfolio';

/**
 * Media Visibility types.
 */
export const MEDIA_VISIBILITIES = ['private', 'unlisted', 'public'] as const;
export type MediaVisibility = (typeof MEDIA_VISIBILITIES)[number];
