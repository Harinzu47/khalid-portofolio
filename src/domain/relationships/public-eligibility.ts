import type { CanonicalEntityType } from './entity-types';

/**
 * Public Eligibility Rule Model — HZCODE Personal Developer OS
 * per HZCODE Relationship Model v1 & Amendments 6 & 7.
 */
export interface EntityPublicEligibilityRule {
  hasPublicationStatus: boolean;
  isPubliclyShareable: boolean;
  description: string;
}

export const PUBLIC_ELIGIBILITY_POLICIES: Record<CanonicalEntityType, EntityPublicEligibilityRule> = {
  ARTICLE: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  PROJECT: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  PROJECT_CASE_STUDY: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  TECH_NOTE: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  ADR: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  JOURNAL_ENTRY: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  LEARNING_PATH: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  ROADMAP: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  CERTIFICATE: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  NOW_ENTRY: {
    hasPublicationStatus: true,
    isPubliclyShareable: true,
    description: 'Requires visibility = public, publicationStatus = published, and not archived.',
  },
  EXPERIENCE: {
    hasPublicationStatus: false,
    isPubliclyShareable: true,
    description: 'Requires visibility = public and not archived.',
  },
  SKILL: {
    hasPublicationStatus: false,
    isPubliclyShareable: true,
    description: 'Requires visibility = public and not archived.',
  },
  DOMAIN: {
    hasPublicationStatus: false,
    isPubliclyShareable: true,
    description: 'Requires visibility = public and not archived.',
  },
  TECHNOLOGY: {
    hasPublicationStatus: false,
    isPubliclyShareable: true,
    description: 'Requires visibility = public and not archived.',
  },
  TAG: {
    hasPublicationStatus: false,
    isPubliclyShareable: true,
    description: 'Requires visibility = public and not archived.',
  },
};

/**
 * Checks whether resolved entity metadata satisfies public eligibility rules.
 */
export function isEntityPubliclyEligible(
  entityType: CanonicalEntityType,
  visibility: string,
  publicationStatus?: string | null,
  isArchived: boolean = false
): boolean {
  if (isArchived) return false;
  if (visibility !== 'public') return false; // Excludes 'private' and 'unlisted' (Amendment 26)

  const policy = PUBLIC_ELIGIBILITY_POLICIES[entityType];
  if (!policy || !policy.isPubliclyShareable) return false;

  if (policy.hasPublicationStatus) {
    return publicationStatus === 'published';
  }

  return true;
}
