import type { SearchMode, SearchScope, SearchableEntityType } from '@/domain/search';

export interface SearchResultItemDTO {
  entity: {
    id: string;
    type: SearchableEntityType;
    title: string;
    slug: string | null;
  };
  description: string | null;
  url: string | null;
  highlights: string[];
  metadata: {
    publicationStatus?: string;
    visibility?: string;
    publishedAt?: string | null;
    updatedAt: string;
    isArchived?: boolean;
  };
  taxonomy: {
    domains: string[];
    technologies: string[];
    skills: string[];
    tags: string[];
  };
}

export interface SearchFacetValueDTO {
  value: string;
  label: string;
  count: number;
}

export interface SearchFacetDTO {
  field: string;
  label: string;
  values: SearchFacetValueDTO[];
}

export interface SearchResultDTO {
  query: string;
  mode: SearchMode;
  scope: SearchScope;
  items: SearchResultItemDTO[];
  facets: SearchFacetDTO[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CommandPaletteItemDTO {
  kind: 'ENTITY' | 'COMMAND';
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  entityType?: SearchableEntityType;
  category?: string;
  shortcut?: string;
}

export interface SearchReindexResultDTO {
  startedAt: string;
  completedAt: string;
  indexed: number;
  updated: number;
  removed: number;
  failed: number;
  details: { entityType: string; count: number }[];
}

export interface SearchHealthDTO {
  indexedDocuments: number;
  staleDocuments: number;
  orphanDocuments: number;
  missingProjections: number;
  lastReindexAt: string | null;
  byTypeBreakdown: Record<string, number>;
}
