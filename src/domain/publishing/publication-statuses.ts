/**
 * Canonical Publication Statuses & Visibilities
 * In accordance with HZCODE Publishing Model v1 & Phase 7 Guidelines.
 */

export const PUBLICATION_STATUSES = [
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const VISIBILITIES = ['private', 'unlisted', 'public'] as const;

export type Visibility = (typeof VISIBILITIES)[number];

/**
 * Determines whether a visibility change increases external audience exposure (Amendment 5 & 49).
 * Exposure-increasing transitions require full publication readiness validation if published.
 */
export function isExposureIncreasing(from: Visibility, to: Visibility): boolean {
  if (from === to) return false;
  if (from === 'private' && (to === 'unlisted' || to === 'public')) return true;
  if (from === 'unlisted' && to === 'public') return true;
  return false;
}

/**
 * Determines whether a visibility change reduces external audience exposure (Amendment 6 & 49).
 */
export function isExposureReducing(from: Visibility, to: Visibility): boolean {
  if (from === to) return false;
  if (from === 'public' && (to === 'unlisted' || to === 'private')) return true;
  if (from === 'unlisted' && to === 'private') return true;
  return false;
}

/**
 * Canonical Public Discoverability Rule (Amendments 4, 34, 40, 51).
 * An entity is normally discoverable (listing, search, sitemap, public graph) if and only if:
 * visibility = 'public' AND publication_status = 'published' AND isArchived = false.
 */
export function isPubliclyDiscoverable(
  visibility: Visibility | string,
  publicationStatus: PublicationStatus | string,
  isArchived: boolean = false
): boolean {
  return visibility === 'public' && publicationStatus === 'published' && !isArchived;
}

/**
 * Direct Route Resolution Rule (Amendments 34, 35, 51).
 * An unlisted entity is directly resolvable if and only if:
 * visibility = 'unlisted' AND publication_status = 'published' AND isArchived = false.
 */
export function isDirectlyResolvable(
  visibility: Visibility | string,
  publicationStatus: PublicationStatus | string,
  isArchived: boolean = false
): boolean {
  if (isArchived) return false;
  if (publicationStatus !== 'published') return false;
  return visibility === 'public' || visibility === 'unlisted';
}
