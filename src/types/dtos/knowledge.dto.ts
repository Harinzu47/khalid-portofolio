import { VisibilityStatus, PublicationStatus, EntityRefDTO } from './common.dto';

/**
 * KnowledgeListItemDTO — Unified CMS Knowledge surface listing projection.
 * Fields that do not apply uniformly across all 4 knowledge entities are optional.
 */
export interface KnowledgeListItemDTO {
  id: string;
  entityType: 'article' | 'journal' | 'note' | 'adr';
  title: string;
  slug?: string | null;
  summary?: string | null;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  status?: string | null;
  isFeatured: boolean;
  entryDate?: string | null;
  number?: number | null;
  difficulty?: string | null;
  verificationStatus?: string | null;
  domains?: EntityRefDTO[];
  technologies?: EntityRefDTO[];
  tags?: EntityRefDTO[];
  publishedAt?: string | null;
  updatedAt: string;
}

/**
 * ArticleEditorDTO — Deep aggregate DTO for long-form technical essay authoring.
 */
export interface ArticleEditorDTO {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content: string;
  status: string;
  readingTimeMinutes?: number | null;
  revision: number;
  featured: boolean;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  lastReviewedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageId?: string | null;
  archivedAt?: string | null;
  domains: EntityRefDTO[];
  skills: EntityRefDTO[];
  technologies: EntityRefDTO[];
  tags: EntityRefDTO[];
  projectIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * JournalEditorDTO — Daily engineering logs & work notes editor DTO.
 */
export interface JournalEditorDTO {
  id: string;
  title: string;
  slug: string;
  entryDate: string;
  content: string;
  summary?: string | null;
  status: string;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  sessionNumber?: number | null;
  workState?: string | null;
  isFeatured: boolean;
  reflection?: string | null;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  archivedAt?: string | null;
  domains: EntityRefDTO[];
  skills: EntityRefDTO[];
  technologies: EntityRefDTO[];
  tags: EntityRefDTO[];
  projectIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * TechNoteEditorDTO — Reusable verified technical reference DTO.
 * Physical table: notes.
 */
export interface TechNoteEditorDTO {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  difficulty?: string | null;
  verificationStatus?: string | null;
  lastVerifiedAt?: string | null;
  testedVersions?: Record<string, string> | null;
  isFeatured: boolean;
  status: string;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  archivedAt?: string | null;
  domains: EntityRefDTO[];
  skills: EntityRefDTO[];
  technologies: EntityRefDTO[];
  tags: EntityRefDTO[];
  projectIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * ADREditorDTO — Architectural Decision Record editor DTO.
 * Domain lifecycle (proposed, accepted, superseded, rejected, deprecated)
 * is strictly decoupled from publication status (draft, review, scheduled, published, archived).
 */
export interface ADREditorDTO {
  id: string;
  number?: number | null;
  title: string;
  slug: string;
  status: 'proposed' | 'accepted' | 'superseded' | 'rejected' | 'deprecated';
  context?: string | null;
  decision?: string | null;
  alternatives?: any;
  consequences?: any;
  projectId?: string | null;
  project?: EntityRefDTO | null;
  supersededById?: string | null;
  supersededBy?: EntityRefDTO | null;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  decidedAt?: string | null;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Canonical Knowledge Extraction Target Types (Uppercase per HZCODE Relationship Model v1).
 */
export type KnowledgeExtractionTargetType = 'TECH_NOTE' | 'ARTICLE' | 'ADR';

/**
 * ExtractionCandidateDTO — Input payload for journal transformation.
 */
export interface ExtractionCandidateDTO {
  sourceJournalId: string;
  targetType: KnowledgeExtractionTargetType;
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
}

/**
 * ExtractionResultDTO — Output returned after atomic extraction and provenance creation.
 */
export interface ExtractionResultDTO {
  sourceJournalId: string;
  targetType: KnowledgeExtractionTargetType;
  targetId: string;
  targetSlug: string;
  targetTitle: string;
  provenanceRelationshipId: string;
  relationshipTypeCode: 'DERIVED_INTO';
  createdAt: string;
}
