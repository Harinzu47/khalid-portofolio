/**
 * Pagination types and utilities for public feeds and admin tables.
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Calculates SQL limit and offset from page and pageSize.
 */
export function getPaginationOffset(params?: PaginationParams, defaultPageSize = 10) {
  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.max(1, Math.min(100, params?.pageSize || defaultPageSize));
  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    offset,
    limit: pageSize,
  };
}

/**
 * Formats data and total count into a standard PaginatedResult.
 */
export function formatPaginatedResult<T>(
  data: T[],
  totalRecords: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalRecords / pageSize);

  return {
    data,
    meta: {
      page,
      pageSize,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
