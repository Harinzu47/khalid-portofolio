import type { EntityRefDTO, VisibilityStatus, PublicationStatus } from './common.dto';

/**
 * Stable Experience & Organization DTO Contracts
 */

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  organizationType: string | null;
  location: string | null;
  description: string | null;
  websiteUrl: string | null;
  logoPath: string | null;
  visibility: VisibilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceListItemDTO {
  id: string;
  position: string;
  organizationId: string;
  organization: EntityRefDTO;
  employmentType: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description?: string | null;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  sortOrder: number;
  updatedAt: string;
}

export interface ExperienceEditorDTO {
  id: string;
  position: string;
  organizationId: string;
  organization: EntityRefDTO;
  employmentType: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  responsibilities: string[] | null;
  sortOrder: number;
  visibility: VisibilityStatus;
  publicationStatus: PublicationStatus;
  projects: EntityRefDTO[];
  skills: EntityRefDTO[];
  domains: EntityRefDTO[];
  technologies: EntityRefDTO[];
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
