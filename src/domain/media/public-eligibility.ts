import type { MediaVisibility } from './delivery-policy';

export interface MediaPublicValidationResult {
  isEligible: boolean;
  reason?: string;
  issueCode?: 'MEDIA_NOT_FOUND' | 'MEDIA_ARCHIVED' | 'MEDIA_PRIVATE' | 'MEDIA_UNLISTED';
}

/**
 * Evaluates whether a media asset can be emitted in public projections (Amendments 7, 8).
 * Content publication does NOT automatically mutate media visibility.
 */
export function evaluateMediaPublicEligibility(
  visibility: string,
  archivedAt: Date | string | null
): MediaPublicValidationResult {
  if (archivedAt) {
    return {
      isEligible: false,
      reason: 'Media asset is archived and cannot be delivered publicly.',
      issueCode: 'MEDIA_ARCHIVED',
    };
  }

  if (visibility !== 'public') {
    return {
      isEligible: false,
      reason: `Media asset visibility is "${visibility}". Only "public" media can be projected to public views.`,
      issueCode: visibility === 'unlisted' ? 'MEDIA_UNLISTED' : 'MEDIA_PRIVATE',
    };
  }

  return { isEligible: true };
}
