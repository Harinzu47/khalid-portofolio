import { CANONICAL_ENTITY_TYPES, type CanonicalEntityType } from '../relationships/entity-types';
import type { SearchMode } from './search-types';

export const SEARCHABLE_ENTITY_TYPES = [
  ...CANONICAL_ENTITY_TYPES,
  'MEDIA',
] as const;

export type SearchableEntityType = (typeof SEARCHABLE_ENTITY_TYPES)[number];

export function isSearchableEntityType(type: string): type is SearchableEntityType {
  return SEARCHABLE_ENTITY_TYPES.includes(type as SearchableEntityType);
}

export interface SearchEntityCapability {
  entityType: SearchableEntityType;
  label: string;
  tableName: string;
  ownerSearchable: boolean;
  publicKnowledge: boolean;
  publicWork: boolean;
  pickerSearchable: boolean;
  facetEligible: boolean;
  modePriority: Record<SearchMode, number>;
  publicRoutePrefix: string | null;
}

/**
 * Centralized capabilities registry for all searchable entities (Amendments 1, 2, 3).
 * Note: MEDIA and NOW_ENTRY are strictly ownerSearchable and excluded from public discovery.
 */
export const SEARCH_ENTITY_REGISTRY: Record<SearchableEntityType, SearchEntityCapability> = {
  ARTICLE: {
    entityType: 'ARTICLE',
    label: 'Article',
    tableName: 'articles',
    ownerSearchable: true,
    publicKnowledge: true,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: true,
    modePriority: { GLOBAL: 80, KNOWLEDGE: 90, WORK: 30, ENTITY_PICKER: 50, RELATIONSHIP_PICKER: 50, COMMAND: 0 },
    publicRoutePrefix: '/articles',
  },
  TECH_NOTE: {
    entityType: 'TECH_NOTE',
    label: 'Tech Note',
    tableName: 'notes',
    ownerSearchable: true,
    publicKnowledge: true,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: true,
    modePriority: { GLOBAL: 85, KNOWLEDGE: 100, WORK: 20, ENTITY_PICKER: 50, RELATIONSHIP_PICKER: 50, COMMAND: 0 },
    publicRoutePrefix: '/notes',
  },
  ADR: {
    entityType: 'ADR',
    label: 'Architecture Decision Record',
    tableName: 'adrs',
    ownerSearchable: true,
    publicKnowledge: true,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: true,
    modePriority: { GLOBAL: 75, KNOWLEDGE: 80, WORK: 20, ENTITY_PICKER: 50, RELATIONSHIP_PICKER: 50, COMMAND: 0 },
    publicRoutePrefix: '/adrs',
  },
  JOURNAL_ENTRY: {
    entityType: 'JOURNAL_ENTRY',
    label: 'Journal Entry',
    tableName: 'journal_entries',
    ownerSearchable: true,
    publicKnowledge: true, // Only if explicitly PUBLIC + PUBLISHED
    publicWork: false,
    pickerSearchable: true,
    facetEligible: true,
    modePriority: { GLOBAL: 70, KNOWLEDGE: 70, WORK: 10, ENTITY_PICKER: 40, RELATIONSHIP_PICKER: 40, COMMAND: 0 },
    publicRoutePrefix: '/journal',
  },
  PROJECT: {
    entityType: 'PROJECT',
    label: 'Project',
    tableName: 'projects',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: true,
    pickerSearchable: true,
    facetEligible: true,
    modePriority: { GLOBAL: 90, KNOWLEDGE: 40, WORK: 100, ENTITY_PICKER: 60, RELATIONSHIP_PICKER: 60, COMMAND: 0 },
    publicRoutePrefix: '/projects',
  },
  PROJECT_CASE_STUDY: {
    entityType: 'PROJECT_CASE_STUDY',
    label: 'Project Case Study',
    tableName: 'project_case_studies',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: true,
    pickerSearchable: true,
    facetEligible: true,
    modePriority: { GLOBAL: 85, KNOWLEDGE: 50, WORK: 90, ENTITY_PICKER: 50, RELATIONSHIP_PICKER: 50, COMMAND: 0 },
    publicRoutePrefix: '/projects', // Uses parent project route
  },
  EXPERIENCE: {
    entityType: 'EXPERIENCE',
    label: 'Career Experience',
    tableName: 'career_experiences',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: true,
    pickerSearchable: true,
    facetEligible: true,
    modePriority: { GLOBAL: 60, KNOWLEDGE: 10, WORK: 70, ENTITY_PICKER: 40, RELATIONSHIP_PICKER: 40, COMMAND: 0 },
    publicRoutePrefix: null, // Experience is rendered inline on /about, no standalone slug route
  },
  SKILL: {
    entityType: 'SKILL',
    label: 'Skill',
    tableName: 'skills',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: false,
    modePriority: { GLOBAL: 50, KNOWLEDGE: 20, WORK: 20, ENTITY_PICKER: 80, RELATIONSHIP_PICKER: 80, COMMAND: 0 },
    publicRoutePrefix: null,
  },
  DOMAIN: {
    entityType: 'DOMAIN',
    label: 'Domain',
    tableName: 'domains',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: false,
    modePriority: { GLOBAL: 50, KNOWLEDGE: 20, WORK: 20, ENTITY_PICKER: 80, RELATIONSHIP_PICKER: 80, COMMAND: 0 },
    publicRoutePrefix: null,
  },
  TECHNOLOGY: {
    entityType: 'TECHNOLOGY',
    label: 'Technology',
    tableName: 'technologies',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: false,
    modePriority: { GLOBAL: 55, KNOWLEDGE: 25, WORK: 25, ENTITY_PICKER: 85, RELATIONSHIP_PICKER: 85, COMMAND: 0 },
    publicRoutePrefix: null,
  },
  LEARNING_PATH: {
    entityType: 'LEARNING_PATH',
    label: 'Learning Path',
    tableName: 'learning_paths',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: false,
    modePriority: { GLOBAL: 45, KNOWLEDGE: 30, WORK: 10, ENTITY_PICKER: 40, RELATIONSHIP_PICKER: 40, COMMAND: 0 },
    publicRoutePrefix: '/learning',
  },
  ROADMAP: {
    entityType: 'ROADMAP',
    label: 'Roadmap Milestone',
    tableName: 'roadmap_items',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: false,
    modePriority: { GLOBAL: 40, KNOWLEDGE: 10, WORK: 30, ENTITY_PICKER: 30, RELATIONSHIP_PICKER: 30, COMMAND: 0 },
    publicRoutePrefix: '/roadmap',
  },
  CERTIFICATE: {
    entityType: 'CERTIFICATE',
    label: 'Certificate',
    tableName: 'certificates',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: false,
    modePriority: { GLOBAL: 40, KNOWLEDGE: 10, WORK: 40, ENTITY_PICKER: 30, RELATIONSHIP_PICKER: 30, COMMAND: 0 },
    publicRoutePrefix: '/certificates',
  },
  NOW_ENTRY: {
    entityType: 'NOW_ENTRY',
    label: 'Now Entry',
    tableName: 'now_entries',
    ownerSearchable: true,
    publicKnowledge: false, // Owner-only in global search
    publicWork: false,
    pickerSearchable: false,
    facetEligible: false,
    modePriority: { GLOBAL: 30, KNOWLEDGE: 0, WORK: 0, ENTITY_PICKER: 10, RELATIONSHIP_PICKER: 10, COMMAND: 0 },
    publicRoutePrefix: null,
  },
  TAG: {
    entityType: 'TAG',
    label: 'Tag',
    tableName: 'tags',
    ownerSearchable: true,
    publicKnowledge: false,
    publicWork: false,
    pickerSearchable: true,
    facetEligible: false,
    modePriority: { GLOBAL: 20, KNOWLEDGE: 0, WORK: 0, ENTITY_PICKER: 70, RELATIONSHIP_PICKER: 30, COMMAND: 0 },
    publicRoutePrefix: null,
  },
  MEDIA: {
    entityType: 'MEDIA',
    label: 'Media Asset',
    tableName: 'media',
    ownerSearchable: true,
    publicKnowledge: false, // Owner-only metadata search
    publicWork: false,
    pickerSearchable: true,
    facetEligible: false,
    modePriority: { GLOBAL: 25, KNOWLEDGE: 0, WORK: 0, ENTITY_PICKER: 60, RELATIONSHIP_PICKER: 0, COMMAND: 0 },
    publicRoutePrefix: null,
  },
};
