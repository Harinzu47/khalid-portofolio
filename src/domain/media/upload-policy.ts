import path from 'path';
import {
  ALLOWED_MIME_TYPES,
  MIME_EXTENSION_MAP,
  MAGIC_BYTE_SIGNATURES,
  getMaxSizeBytesForMime,
  type AllowedMimeType,
} from './media-types';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename: string;
  detectedMimeType?: AllowedMimeType;
}

/**
 * Sanitizes original filename (Amendment 11).
 * Strips path traversal characters, spaces, and non-alphanumeric unsafe symbols.
 */
export function sanitizeFilename(originalName: string): string {
  const parsed = path.parse(originalName);
  const ext = parsed.ext.toLowerCase();
  const base = parsed.name
    .normalize('NFKD')
    .replace(/[^\w.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);

  const safeBase = base || 'asset';
  return `${safeBase}${ext}`;
}

/**
 * Generates server-controlled owner-isolated storage path (Amendments 9, 12).
 * Format: <ownerId>/<mediaId>/<sanitizedFilename>
 */
export function generateStoragePath(
  ownerId: string,
  mediaId: string,
  originalFilename: string
): string {
  const safeFilename = sanitizeFilename(originalFilename);
  return `${ownerId}/${mediaId}/${safeFilename}`;
}

/**
 * Validates magic-byte signature of buffer (Amendment 15).
 */
export function verifyMagicBytes(buffer: Buffer | Uint8Array, mimeType: AllowedMimeType): boolean {
  if (buffer.length < 8) return false;

  const signatures = MAGIC_BYTE_SIGNATURES[mimeType];
  if (!signatures || signatures.length === 0) return true;

  const matchesAny = signatures.some((sig) => {
    if (buffer.length < sig.offset + sig.bytes.length) return false;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (buffer[sig.offset + i] !== sig.bytes[i]) return false;
    }
    return true;
  });

  if (!matchesAny) return false;

  // Additional check for WebP: 'WEBP' at offset 8..11
  if (mimeType === 'image/webp') {
    if (buffer.length < 12) return false;
    const webpHeader = [buffer[8], buffer[9], buffer[10], buffer[11]];
    const expected = [0x57, 0x45, 0x42, 0x50]; // 'WEBP'
    return webpHeader.every((b, idx) => b === expected[idx]);
  }

  return true;
}

/**
 * Comprehensive server-side file upload validator (Amendments 12, 15, 16, 18).
 * Reconciles declared MIME, extension, whitelist, size limit, and magic bytes.
 */
export function validateUploadFile(
  originalName: string,
  declaredMimeType: string,
  sizeBytes: number,
  buffer?: Buffer | Uint8Array
): FileValidationResult {
  const sanitized = sanitizeFilename(originalName);
  const ext = path.extname(sanitized).toLowerCase();

  // 1. Check if MIME is in whitelist
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(declaredMimeType as AllowedMimeType);
  if (!isAllowedMime) {
    return {
      isValid: false,
      error: `Unsupported file format: "${declaredMimeType}". Allowed formats: JPEG, PNG, WebP, GIF, PDF.`,
      sanitizedFilename: sanitized,
    };
  }

  const mime = declaredMimeType as AllowedMimeType;

  // 2. Reconcile extension with MIME
  const allowedExtensions = MIME_EXTENSION_MAP[mime];
  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      error: `File extension "${ext}" does not match declared MIME type "${declaredMimeType}". Expected: ${allowedExtensions.join(', ')}`,
      sanitizedFilename: sanitized,
    };
  }

  // 3. Check size limit
  const maxSize = getMaxSizeBytesForMime(mime);
  if (sizeBytes > maxSize) {
    const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of ${maxMb} MB.`,
      sanitizedFilename: sanitized,
    };
  }

  // 4. Verify magic bytes if buffer is provided
  if (buffer && buffer.length > 0) {
    const magicValid = verifyMagicBytes(buffer, mime);
    if (!magicValid) {
      return {
        isValid: false,
        error: `File header bytes do not match expected signature for MIME type "${declaredMimeType}". The file may be corrupt or spoofed.`,
        sanitizedFilename: sanitized,
      };
    }
  }

  return {
    isValid: true,
    sanitizedFilename: sanitized,
    detectedMimeType: mime,
  };
}
