/**
 * Canonical Common DTO Contracts — HZCODE Personal Developer OS
 */

export type VisibilityStatus = 'private' | 'unlisted' | 'public';
export type PublicationStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export interface EntityRefDTO {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  type?: string;
  category?: string | null;
  iconName?: string | null;
}

export interface PaginationMetaDTO {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResultDTO<T> {
  data: T[];
  meta: PaginationMetaDTO;
}
