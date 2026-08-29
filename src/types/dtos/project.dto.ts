import type { EntityRefDTO, VisibilityStatus, PublicationStatus } from './common.dto';

/**
 * Stable Project DTO Contracts
 */

export interface ProjectListItemDTO {
  id: string;
  title: string;
  slug: string;
  status: string;
  projectType: string | null;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  domains: EntityRefDTO[];
  technologies: EntityRefDTO[];
  updatedAt: string;
  publishedAt: string | null;
}

export interface ProjectCaseStudySummaryDTO {
  id: string;
  title: string | null;
  subtitle: string | null;
  executiveSummary: string | null;
  exists: boolean;
}

export interface ProjectEditorDTO {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  projectType: string | null;
  problemStatement: string | null;
  solution: string | null;
  architecture: string | null;
  role: string | null;
  roleSummary: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  repositoryUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  sortOrder: number;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  publishedAt: string | null;
  scheduledPublishAt?: string | null;
  archivedAt: string | null;
  domains: EntityRefDTO[];
  skills: EntityRefDTO[];
  technologies: EntityRefDTO[];
  tags: EntityRefDTO[];
  experienceReferences: EntityRefDTO[];
  caseStudySummary?: ProjectCaseStudySummaryDTO;
  createdAt: string;
  updatedAt: string;
}
