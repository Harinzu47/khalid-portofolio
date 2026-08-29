/**
 * Canonical Entity Type Vocabulary — HZCODE Personal Developer OS
 * per HZCODE Relationship Model v1 (Section 7)
 */

export const CANONICAL_ENTITY_TYPES = [
  'PROJECT',
  'PROJECT_CASE_STUDY',
  'EXPERIENCE',
  'SKILL',
  'DOMAIN',
  'TECHNOLOGY',
  'ARTICLE',
  'JOURNAL_ENTRY',
  'TECH_NOTE',
  'ADR',
  'LEARNING_PATH',
  'ROADMAP',
  'CERTIFICATE',
  'NOW_ENTRY',
  'TAG',
] as const;

export type CanonicalEntityType = (typeof CANONICAL_ENTITY_TYPES)[number];

export function isCanonicalEntityType(type: string): type is CanonicalEntityType {
  return CANONICAL_ENTITY_TYPES.includes(type as CanonicalEntityType);
}

/**
 * Human-readable labels for entity types in admin UI and diagnostics.
 */
export const ENTITY_TYPE_LABELS: Record<CanonicalEntityType, string> = {
  PROJECT: 'Project',
  PROJECT_CASE_STUDY: 'Project Case Study',
  EXPERIENCE: 'Career Experience',
  SKILL: 'Skill',
  DOMAIN: 'Engineering Domain',
  TECHNOLOGY: 'Technology',
  ARTICLE: 'Article',
  JOURNAL_ENTRY: 'Journal Entry',
  TECH_NOTE: 'Tech Note',
  ADR: 'Architecture Decision Record (ADR)',
  LEARNING_PATH: 'Learning Path',
  ROADMAP: 'Roadmap Milestone',
  CERTIFICATE: 'Certificate',
  NOW_ENTRY: 'Now Focus Entry',
  TAG: 'Tag',
};
