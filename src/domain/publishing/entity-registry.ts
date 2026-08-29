import type { CanonicalEntityType } from '../relationships';

/**
 * 11 Canonical Publishable Entity Types
 * In accordance with HZCODE Publishing Model v1 & Phase 7 Registry (Amendments 2 & 3).
 */
export const PUBLISHABLE_ENTITY_TYPES = [
  'ARTICLE',
  'TECH_NOTE',
  'ADR',
  'JOURNAL_ENTRY',
  'PROJECT',
  'PROJECT_CASE_STUDY',
  'EXPERIENCE',
  'LEARNING_PATH',
  'ROADMAP',
  'CERTIFICATE',
  'NOW_ENTRY',
] as const;

export type PublishableEntityType = (typeof PUBLISHABLE_ENTITY_TYPES)[number];

export interface PublishableEntityCapability {
  entityType: PublishableEntityType;
  label: string;
  tableName: string;
  supportsReview: boolean;
  supportsScheduling: boolean;
  supportsPublicListing: boolean;
  supportsUnlistedDirectRoute: boolean;
  requiresSlug: boolean;
  hasIndependentPublicRoute: boolean;
  parentEntityType?: PublishableEntityType;
  publicRoutePattern?: string;
}

/**
 * Centralized capabilities registry for all publishable entities (Amendment 3).
 */
export const PUBLISHABLE_ENTITY_CAPABILITIES: Record<
  PublishableEntityType,
  PublishableEntityCapability
> = {
  ARTICLE: {
    entityType: 'ARTICLE',
    label: 'Article',
    tableName: 'articles',
    supportsReview: true,
    supportsScheduling: true,
    supportsPublicListing: true,
    supportsUnlistedDirectRoute: true,
    requiresSlug: true,
    hasIndependentPublicRoute: true,
    publicRoutePattern: '/articles/[slug]',
  },
  TECH_NOTE: {
    entityType: 'TECH_NOTE',
    label: 'Tech Note',
    tableName: 'notes',
    supportsReview: true,
    supportsScheduling: true,
    supportsPublicListing: true,
    supportsUnlistedDirectRoute: true,
    requiresSlug: true,
    hasIndependentPublicRoute: true,
    publicRoutePattern: '/notes/[slug]',
  },
  ADR: {
    entityType: 'ADR',
    label: 'Architecture Decision Record',
    tableName: 'adrs',
    supportsReview: true,
    supportsScheduling: true,
    supportsPublicListing: true,
    supportsUnlistedDirectRoute: true,
    requiresSlug: true,
    hasIndependentPublicRoute: true,
    publicRoutePattern: '/system/adrs/[slug]',
  },
  JOURNAL_ENTRY: {
    entityType: 'JOURNAL_ENTRY',
    label: 'Journal Log',
    tableName: 'journal_entries',
    supportsReview: false, // Temporal daily captures publish directly or scheduled
    supportsScheduling: true,
    supportsPublicListing: true,
    supportsUnlistedDirectRoute: true,
    requiresSlug: true,
    hasIndependentPublicRoute: true,
    publicRoutePattern: '/journal/[slug]',
  },
  PROJECT: {
    entityType: 'PROJECT',
    label: 'Project Case Study',
    tableName: 'projects',
    supportsReview: true,
    supportsScheduling: true,
    supportsPublicListing: true,
    supportsUnlistedDirectRoute: true,
    requiresSlug: true,
    hasIndependentPublicRoute: true,
    publicRoutePattern: '/projects/[slug]',
  },
  PROJECT_CASE_STUDY: {
    entityType: 'PROJECT_CASE_STUDY',
    label: 'Curated Case Study Narrative',
    tableName: 'project_case_studies',
    supportsReview: true,
    supportsScheduling: true,
    supportsPublicListing: false, // Rendered as structured deep dive on parent /projects/[slug]
    supportsUnlistedDirectRoute: false,
    requiresSlug: false, // Inherits parent project's slug
    hasIndependentPublicRoute: false,
    parentEntityType: 'PROJECT',
    publicRoutePattern: '/projects/[parentSlug]',
  },
  EXPERIENCE: {
    entityType: 'EXPERIENCE',
    label: 'Career Experience',
    tableName: 'career_experiences',
    supportsReview: false,
    supportsScheduling: true,
    supportsPublicListing: true, // Aggregated on /experience feed
    supportsUnlistedDirectRoute: false,
    requiresSlug: false,
    hasIndependentPublicRoute: false,
    publicRoutePattern: '/experience',
  },
  LEARNING_PATH: {
    entityType: 'LEARNING_PATH',
    label: 'Learning Path',
    tableName: 'learning_paths',
    supportsReview: false,
    supportsScheduling: true,
    supportsPublicListing: true, // Aggregated on /roadmap or /learning feed
    supportsUnlistedDirectRoute: true,
    requiresSlug: true,
    hasIndependentPublicRoute: false,
    publicRoutePattern: '/roadmap',
  },
  ROADMAP: {
    entityType: 'ROADMAP',
    label: 'Roadmap Milestone',
    tableName: 'roadmap_items',
    supportsReview: false,
    supportsScheduling: true,
    supportsPublicListing: true, // Aggregated on /roadmap
    supportsUnlistedDirectRoute: false,
    requiresSlug: true,
    hasIndependentPublicRoute: false,
    publicRoutePattern: '/roadmap',
  },
  CERTIFICATE: {
    entityType: 'CERTIFICATE',
    label: 'Verified Certificate',
    tableName: 'certificates',
    supportsReview: false,
    supportsScheduling: true,
    supportsPublicListing: true, // Aggregated on /certificates
    supportsUnlistedDirectRoute: false,
    requiresSlug: true,
    hasIndependentPublicRoute: false,
    publicRoutePattern: '/certificates',
  },
  NOW_ENTRY: {
    entityType: 'NOW_ENTRY',
    label: 'Now Entry',
    tableName: 'now_entries',
    supportsReview: false,
    supportsScheduling: true,
    supportsPublicListing: true, // Aggregated on /now feed
    supportsUnlistedDirectRoute: false,
    requiresSlug: false, // Schema has no slug
    hasIndependentPublicRoute: false,
    publicRoutePattern: '/now',
  },
};

export function isPublishableEntityType(type: string): type is PublishableEntityType {
  return PUBLISHABLE_ENTITY_TYPES.includes(type as PublishableEntityType);
}
