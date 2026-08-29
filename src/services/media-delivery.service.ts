import { StorageService, StorageBucket, STORAGE_BUCKETS } from '@/lib/supabase/storage';
import { DELIVERY_TTL, DEFAULT_STORAGE_BUCKET } from '@/domain/media';

/**
 * MediaDeliveryService — Centralized delivery URL resolution abstraction (Amendments 6, 10, 11).
 * UI and domain code consume this abstraction instead of calling low-level storage methods directly.
 */
export class MediaDeliveryService {
  /**
   * Resolves a delivery URL for admin management view.
   * Uses signed URL for private assets, public URL for public assets.
   */
  static async resolveAdminDeliveryUrl(
    path: string,
    bucket: StorageBucket = (DEFAULT_STORAGE_BUCKET as StorageBucket)
  ): Promise<string> {
    try {
      const signedResult = await StorageService.getSignedUrl(
        path,
        DELIVERY_TTL.ADMIN_SIGNED_URL_TTL,
        bucket
      );
      if (signedResult.success) {
        return signedResult.data;
      }
    } catch {
      // Fallback to public URL format if signing unavailable
    }
    return StorageService.getPublicUrl(path, bucket);
  }

  /**
   * Resolves a short-lived delivery URL for authenticated owner preview (Amendments 10, 11).
   * Never persists the signed URL.
   */
  static async resolvePreviewDeliveryUrl(
    path: string,
    bucket: StorageBucket = (DEFAULT_STORAGE_BUCKET as StorageBucket)
  ): Promise<string> {
    const signedResult = await StorageService.getSignedUrl(
      path,
      DELIVERY_TTL.PREVIEW_SIGNED_URL_TTL,
      bucket
    );
    if (signedResult.success) {
      return signedResult.data;
    }
    // Fallback
    return StorageService.getPublicUrl(path, bucket);
  }

  /**
   * Resolves a public delivery URL for public projections (Amendments 6, 18).
   * Stable delivery URL generated at projection time.
   */
  static async resolvePublicDeliveryUrl(
    path: string,
    bucket: StorageBucket = (DEFAULT_STORAGE_BUCKET as StorageBucket)
  ): Promise<string> {
    return StorageService.getPublicUrl(path, bucket);
  }
}
