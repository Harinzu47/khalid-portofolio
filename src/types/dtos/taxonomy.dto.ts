import type { VisibilityStatus } from './common.dto';

/**
 * Stable Taxonomy DTO Contracts
 */

export interface TaxonomyListItemDTO {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  type: 'skill' | 'domain' | 'technology' | 'tag';
  description?: string | null;
  websiteUrl?: string | null;
  iconName?: string | null;
  visibility: VisibilityStatus;
  isFeatured?: boolean;
  proficiencyLevel?: number | null;
  updatedAt: string;
}

export interface SkillEditorDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  proficiencyLevel: number | null;
  isFeatured: boolean;
  visibility: VisibilityStatus;
  domainIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DomainEditorDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  visibility: VisibilityStatus;
  skillIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TechnologyEditorDTO {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  technologyType: string | null;
  description: string | null;
  websiteUrl: string | null;
  iconName: string | null;
  visibility: VisibilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TagEditorDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: VisibilityStatus;
  createdAt: string;
  updatedAt: string;
}
