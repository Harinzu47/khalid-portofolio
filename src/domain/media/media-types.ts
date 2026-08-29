/**
 * Canonical Media Types & Upload Configuration
 * per HZCODE Database Domain Model v1 & Media Architecture v1
 */

export const MEDIA_KINDS = ['IMAGE', 'DOCUMENT', 'OTHER'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

/**
 * Whitelist of allowed MIME types in v1.
 * SVG is explicitly excluded by default (Amendment 16) due to XSS risks.
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * File extension mapping for strict extension reconciliation.
 */
export const MIME_EXTENSION_MAP: Record<AllowedMimeType, readonly string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
};

/**
 * Magic-byte signatures for header validation.
 */
export const MAGIC_BYTE_SIGNATURES: Record<AllowedMimeType, { offset: number; bytes: number[] }[]> = {
  'image/jpeg': [
    { offset: 0, bytes: [0xff, 0xd8, 0xff] },
  ],
  'image/png': [
    { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  ],
  'image/gif': [
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }, // GIF89a
  ],
  'image/webp': [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF at 0..3
    // WEBP at offset 8..11 is also validated in upload-policy
  ],
  'application/pdf': [
    { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  ],
};

/**
 * Centralized upload size boundaries (Amendment 18).
 */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Derives MediaKind from technical MIME type (Amendment 37).
 */
export function getMediaKindFromMime(mimeType: string): MediaKind {
  if (mimeType.startsWith('image/')) {
    return 'IMAGE';
  }
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/') || mimeType.includes('document')) {
    return 'DOCUMENT';
  }
  return 'OTHER';
}

/**
 * Retrieves max allowed size for a MIME type.
 */
export function getMaxSizeBytesForMime(mimeType: string): number {
  const kind = getMediaKindFromMime(mimeType);
  if (kind === 'IMAGE') return MAX_IMAGE_SIZE_BYTES;
  if (kind === 'DOCUMENT') return MAX_DOCUMENT_SIZE_BYTES;
  return MAX_IMAGE_SIZE_BYTES;
}
