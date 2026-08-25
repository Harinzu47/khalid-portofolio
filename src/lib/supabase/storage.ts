import { createClient } from './server';
import { Result, ok, err } from '../result';

export const STORAGE_BUCKETS = {
  PORTFOLIO: 'portfolio',
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export interface UploadOptions {
  bucket?: StorageBucket;
  path: string;
  file: Buffer | Blob | Uint8Array;
  contentType: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl?: string;
}

/**
 * Storage helpers for managing assets in Supabase Object Storage.
 */
export class StorageService {
  /**
   * Uploads a file to Supabase Storage.
   */
  static async upload(options: UploadOptions): Promise<Result<UploadResult, Error>> {
    try {
      const supabase = await createClient();
      const bucket = options.bucket || STORAGE_BUCKETS.PORTFOLIO;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(options.path, options.file, {
          contentType: options.contentType,
          upsert: options.upsert ?? false,
        });

      if (error) {
        return err(new Error(`Supabase storage upload failed: ${error.message}`));
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return ok({
        path: data.path,
        fullPath: `${bucket}/${data.path}`,
        publicUrl: publicUrlData?.publicUrl,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Generates a signed URL for a private asset with time-limited access.
   */
  static async getSignedUrl(
    path: string,
    expiresInSeconds: number = 3600,
    bucket: StorageBucket = STORAGE_BUCKETS.PORTFOLIO
  ): Promise<Result<string, Error>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);

      if (error) {
        return err(new Error(`Failed to create signed URL: ${error.message}`));
      }

      return ok(data.signedUrl);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Resolves the public URL for a publicly accessible asset.
   */
  static async getPublicUrl(
    path: string,
    bucket: StorageBucket = STORAGE_BUCKETS.PORTFOLIO
  ): Promise<string> {
    const supabase = await createClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
