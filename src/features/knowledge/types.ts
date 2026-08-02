import { TocHeading } from '../mdx/types';

/**
 * All supported content node types in the Developer OS Knowledge Graph
 */
export type ContentNodeType =
  | 'article'
  | 'journal'
  | 'project'
  | 'career'
  | 'certificate'
  | 'note'
  | 'resume'
  | 'uses'
  | 'now'
  | 'page';

/**
 * All supported relationship types between content nodes
 */
export type RelationType =
  | 'references'
  | 'related'
  | 'dependsOn'
  | 'implements'
  | 'extends'
  | 'mentions'
  | 'uses'
  | 'learnedFrom'
  | 'documents'
  | 'belongsTo';

/**
 * Type-safe node relationship link
 */
export interface NodeRelation {
  sourceId: string;
  targetId: string;
  type: RelationType;
  metadata?: Record<string, string>;
}

/**
 * Skill Node as a First-Class Knowledge Entity
 */
export interface SkillNode {
  id: string;
  name: string;
  category: 'languages' | 'frameworks' | 'infrastructure' | 'networking' | 'databases' | 'ai' | 'soft-skills';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
}

/**
 * Technology Node as a First-Class Entity
 */
export interface TechnologyNode {
  id: string;
  name: string;
  category: 'infra' | 'networking' | 'web' | 'ai' | 'database' | 'tooling';
  website?: string;
  iconName?: string;
}

/**
 * Taxonomy classifications
 */
export interface Taxonomy {
  tags: string[];
  categories: string[];
  topics: string[];
  series?: string;
  domain: 'Infrastructure' | 'Networking' | 'Web Dev' | 'AI' | 'General';
}

/**
 * Learning Track Node Progression
 */
export interface LearningTrackStep {
  step: number;
  nodeId: string;
  title: string;
  prerequisites?: string[];
}

export interface LearningTrack {
  id: string;
  title: string;
  description: string;
  domain: string;
  steps: LearningTrackStep[];
}

/**
 * Central Unified Content Node Model
 */
export interface ContentNode {
  id: string;
  slug: string;
  type: ContentNodeType;
  title: string;
  description: string;
  summary?: string;
  status: 'draft' | 'published' | 'archived' | 'evergreen' | 'growing' | 'seed';
  draft: boolean;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: string;
  wordCount?: number;
  taxonomy: Taxonomy;
  authors: string[];
  coverImage?: string;
  featured: boolean;
  language: string;
  canonicalURL?: string;
  headings: TocHeading[];
  references: string[]; // Slugs or IDs of referenced nodes
  relatedContent: string[];
  skills: string[]; // Skill IDs
  technologies: string[]; // Tech IDs
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  content: string;
}

/**
 * Unified Timeline Item across all domains
 */
export interface TimelineItem {
  id: string;
  title: string;
  date: string;
  type: ContentNodeType;
  category?: string;
  description?: string;
  slug: string;
  skills: string[];
  technologies: string[];
}

/**
 * Normalized Search Record ready for Pagefind / FlexSearch
 */
export interface NormalizedSearchItem {
  id: string;
  slug: string;
  type: ContentNodeType;
  title: string;
  description: string;
  contentSnippet: string;
  tags: string[];
  categories: string[];
  skills: string[];
  technologies: string[];
  publishedAt: string;
}
