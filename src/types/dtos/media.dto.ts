import type { MediaKind } from '@/domain/media';

/**
 * MediaListItemDTO — Summarized projection for admin library listing and pickers.
 * Zero ownerId leakage.
 */
export interface MediaListItemDTO {
  id: string;
  originalName: string;
  mimeType: string;
  mediaKind: MediaKind;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  visibility: 'private' | 'unlisted' | 'public';
  usageCount: number;
  deliveryUrl: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * MediaEditorDTO — Detailed projection for asset inspection and metadata editing.
 * Zero ownerId leakage.
 */
export interface MediaEditorDTO {
  id: string;
  originalName: string;
  mimeType: string;
  mediaKind: MediaKind;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  visibility: 'private' | 'unlisted' | 'public';
  storageBucket: string;
  storagePath: string;
  deliveryUrl: string;
  usageCount: number;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * MediaPublicDTO — Minimal, sanitized public asset representation (Amendments 34, 35, 40).
 * Excludes ownerId, storageBucket, storagePath, checksums, and private metadata.
 */
export interface MediaPublicDTO {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType: string;
}

/**
 * Structural reference descriptor for media usage tracking.
 */
export interface MediaUsageReferenceDTO {
  entityType: 'PROJECT' | 'CERTIFICATE' | 'ARTICLE';
  entityId: string;
  title: string;
  role: 'COVER' | 'GALLERY' | 'EVIDENCE' | 'OG_IMAGE';
  publicRoute?: string | null;
  isPublished: boolean;
}

/**
 * MediaUsageDTO — Aggregate usage response from getMediaUsage (Amendment 23, 35).
 */
export interface MediaUsageDTO {
  mediaId: string;
  totalReferences: number;
  publishedReferences: number;
  references: MediaUsageReferenceDTO[];
}

/**
 * Stable diagnostic codes for media health (Amendment 41).
 */
export type MediaHealthCode =
  | 'MEDIA_UNUSED'
  | 'STORAGE_OBJECT_MISSING'
  | 'ARCHIVED_MEDIA_REFERENCED'
  | 'PUBLIC_REQUIRED_MEDIA_UNAVAILABLE'
  | 'MEANINGFUL_IMAGE_ALT_MISSING'
  | 'INVALID_MEDIA_METADATA';

export interface MediaHealthIssueDTO {
  mediaId: string;
  code: MediaHealthCode;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: Record<string, any>;
}

export interface MediaHealthSummaryDTO {
  totalAssets: number;
  unusedAssetsCount: number;
  brokenReferencesCount: number;
  missingAltTextCount: number;
  archivedReferencedCount: number;
  issues: MediaHealthIssueDTO[];
  inspectedAt: string;
}
