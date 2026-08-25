'use server';

import { requireAuth } from '@/lib/auth';
import { MediaService } from '@/services/media.service';
import { StorageService } from '@/lib/supabase/storage';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/validations/media';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './auth';

export async function uploadMediaAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth('/admin/media');

  const file = formData.get('file') as File | null;
  const altText = (formData.get('altText') as string) || '';

  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      success: false,
      error: `Unsupported file format: ${file.type}. Allowed types: images, SVGs, WebP, PDFs.`,
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `uploads/${timestamp}-${sanitizedName}`;

    // Upload to Supabase Storage
    await StorageService.upload({
      path: storagePath,
      file: buffer,
      contentType: file.type,
    });

    const newMedia = await MediaService.registerMedia(
      {
        originalName: file.name,
        path: storagePath,
        mimeType: file.type,
        sizeBytes: file.size,
        altText: altText || null,
      },
      session.userId
    );

    revalidatePath('/admin/media');
    return { success: true, data: newMedia };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to upload media asset.',
    };
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  const session = await requireAuth('/admin/media');

  try {
    await MediaService.deleteMedia(id, session.userId);
    revalidatePath('/admin/media');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete media asset.',
    };
  }
}
