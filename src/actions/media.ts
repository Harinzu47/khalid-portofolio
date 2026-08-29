'use server';

import { requireOwnerSession } from '@/lib/auth';
import { MediaService } from '@/services/media.service';
import {
  UpdateMediaMetadataSchema,
  ReorderProjectMediaSchema,
  type UpdateMediaMetadataInput,
  type ReorderProjectMediaInput,
} from '@/validations/media';
import { revalidatePath } from 'next/cache';
import { actionOk, actionErr, type ActionResult } from '@/lib/action-result';
import type {
  MediaEditorDTO,
  MediaUsageDTO,
  MediaHealthSummaryDTO,
} from '@/types/dtos/media.dto';

/**
 * Uploads a new media asset using compensating workflow (Amendments 9, 12, 15, 18, 21, 22).
 */
export async function uploadMediaAction(formData: FormData): Promise<ActionResult<MediaEditorDTO>> {
  const session = await requireOwnerSession();
  const file = formData.get('file') as File | null;
  const altText = (formData.get('altText') as string) || null;
  const caption = (formData.get('caption') as string) || null;
  const visibility = (formData.get('visibility') as 'private' | 'unlisted' | 'public') || 'private';

  if (!file || file.size === 0) {
    return actionErr('No file provided for upload.', 'VALIDATION_ERROR');
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await MediaService.uploadMedia(
      session.userId,
      {
        file: buffer,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        altText,
        caption,
        visibility,
      },
      session.userId
    );

    revalidatePath('/admin/media');
    return actionOk(result);
  } catch (err: any) {
    return actionErr(err.message || 'Failed to upload media asset.', 'INTERNAL_ERROR');
  }
}

/**
 * Updates metadata (altText, caption, visibility) without re-uploading file.
 */
export async function updateMediaMetadataAction(
  rawInput: unknown
): Promise<ActionResult<MediaEditorDTO>> {
  const session = await requireOwnerSession();
  const parsed = UpdateMediaMetadataSchema.safeParse(rawInput);

  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message || 'Invalid metadata input.', 'VALIDATION_ERROR');
  }

  try {
    const result = await MediaService.updateMediaMetadata(
      session.userId,
      parsed.data,
      session.userId
    );

    revalidatePath('/admin/media');
    return actionOk(result);
  } catch (err: any) {
    return actionErr(err.message || 'Failed to update media metadata.', 'INTERNAL_ERROR');
  }
}

/**
 * Soft archives a media asset with published reference protection (Amendments 28, 57).
 */
export async function archiveMediaAction(id: string): Promise<ActionResult<MediaEditorDTO>> {
  const session = await requireOwnerSession();

  try {
    const result = await MediaService.archiveMedia(session.userId, id, session.userId);
    revalidatePath('/admin/media');
    return actionOk(result);
  } catch (err: any) {
    return actionErr(err.message || 'Failed to archive media asset.', 'INTERNAL_ERROR');
  }
}

/**
 * Restores an archived media asset.
 */
export async function restoreMediaAction(id: string): Promise<ActionResult<MediaEditorDTO>> {
  const session = await requireOwnerSession();

  try {
    const result = await MediaService.restoreMedia(session.userId, id, session.userId);
    revalidatePath('/admin/media');
    return actionOk(result);
  } catch (err: any) {
    return actionErr(err.message || 'Failed to restore media asset.', 'INTERNAL_ERROR');
  }
}

/**
 * Permanently deletes an archived, unreferenced media asset (Amendments 30, 31).
 */
export async function deleteMediaPermanentlyAction(id: string): Promise<ActionResult<void>> {
  const session = await requireOwnerSession();

  try {
    await MediaService.deleteMediaPermanently(session.userId, id, session.userId);
    revalidatePath('/admin/media');
    return actionOk(undefined);
  } catch (err: any) {
    return actionErr(err.message || 'Failed to delete media asset permanently.', 'INTERNAL_ERROR');
  }
}

/**
 * Retrieves detailed structural usage references for an asset.
 */
export async function getMediaUsageAction(id: string): Promise<ActionResult<MediaUsageDTO>> {
  const session = await requireOwnerSession();

  try {
    const usage = await MediaService.getMediaUsage(session.userId, id);
    return actionOk(usage);
  } catch (err: any) {
    return actionErr(err.message || 'Failed to retrieve media usage.', 'INTERNAL_ERROR');
  }
}

/**
 * Runs bounded on-demand health diagnostics for the owner's media library (Amendments 41, 42).
 */
export async function getMediaHealthDiagnosticsAction(): Promise<
  ActionResult<MediaHealthSummaryDTO>
> {
  const session = await requireOwnerSession();

  try {
    const diagnostics = await MediaService.getMediaHealthDiagnostics(session.userId);
    return actionOk(diagnostics);
  } catch (err: any) {
    return actionErr(err.message || 'Failed to retrieve media health diagnostics.', 'INTERNAL_ERROR');
  }
}

/**
 * Reorders project gallery attachments transactionally (Amendment 25).
 */
export async function reorderProjectMediaAction(rawInput: unknown): Promise<ActionResult<void>> {
  const session = await requireOwnerSession();
  const parsed = ReorderProjectMediaSchema.safeParse(rawInput);

  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message || 'Invalid reorder input.', 'VALIDATION_ERROR');
  }

  try {
    await MediaService.reorderProjectMedia(
      session.userId,
      parsed.data.projectId,
      parsed.data.mediaIds,
      parsed.data.coverMediaId,
      session.userId
    );
    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/${parsed.data.projectId}/edit`);
    return actionOk(undefined);
  } catch (err: any) {
    return actionErr(err.message || 'Failed to reorder project media.', 'INTERNAL_ERROR');
  }
}
