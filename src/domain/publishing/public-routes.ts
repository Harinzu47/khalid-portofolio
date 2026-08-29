import type { PublishableEntityType } from './entity-registry';

/**
 * Canonical Public Route Namespace Registry (Amendments 13 & 14).
 * Uses the CURRENT active public routes of the repository.
 */
export const PUBLIC_ROUTE_NAMESPACES: Record<PublishableEntityType, string> = {
  ARTICLE: '/articles',
  TECH_NOTE: '/notes',
  ADR: '/adrs',
  JOURNAL_ENTRY: '/journal',
  PROJECT: '/work',
  PROJECT_CASE_STUDY: '/work',
  EXPERIENCE: '/experience',
  LEARNING_PATH: '/expertise',
  ROADMAP: '/now',
  CERTIFICATE: '/expertise',
  NOW_ENTRY: '/now',
};

/**
 * Computes the public URL path for a given publishable entity.
 */
export function getPublicRouteForEntity(
  entityType: PublishableEntityType,
  slug?: string | null,
  parentSlug?: string | null
): string | null {
  const baseNamespace = PUBLIC_ROUTE_NAMESPACES[entityType];
  if (!baseNamespace) return null;

  switch (entityType) {
    case 'ARTICLE':
    case 'TECH_NOTE':
    case 'ADR':
    case 'JOURNAL_ENTRY':
    case 'PROJECT':
      return slug ? `${baseNamespace}/${slug}` : baseNamespace;

    case 'PROJECT_CASE_STUDY':
      return parentSlug ? `/work/${parentSlug}` : '/work';

    case 'EXPERIENCE':
    case 'LEARNING_PATH':
    case 'ROADMAP':
    case 'CERTIFICATE':
    case 'NOW_ENTRY':
      return baseNamespace;

    default:
      return null;
  }
}
