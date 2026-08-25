import { db } from '@/db/client';
import { media, projectMedia } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';

export interface RegisterMediaInput {
  originalName: string;
  path: string;
  disk?: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
  uploadedBy?: string | null;
}

export class MediaService {
  /**
   * Fetches paginated media assets for the media library.
   */
  static async getMedia(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 30);

    const [data, countResult] = await Promise.all([
      db.query.media.findMany({
        orderBy: [desc(media.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)::int` }).from(media),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Fetches single media record by ID.
   */
  static async getMediaById(id: string) {
    const asset = await db.query.media.findFirst({
      where: eq(media.id, id),
    });
    if (!asset) throw new NotFoundError('Media', id);
    return asset;
  }

  /**
   * Registers a newly uploaded media asset in the database.
   */
  static async registerMedia(input: RegisterMediaInput, actorId?: string) {
    return await db.transaction(async (tx) => {
      const [newMedia] = await tx
        .insert(media)
        .values({
          originalName: input.originalName,
          path: input.path,
          disk: input.disk || 'supabase',
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          altText: input.altText || null,
          uploadedBy: actorId || null,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'MEDIA_UPLOAD',
        entityType: 'media',
        entityId: newMedia.id,
        newValues: newMedia,
      });

      return newMedia;
    });
  }

  /**
   * Deletes a media asset from the database.
   */
  static async deleteMedia(id: string, actorId?: string) {
    const existing = await db.query.media.findFirst({
      where: eq(media.id, id),
    });
    if (!existing) throw new NotFoundError('Media', id);

    return await db.transaction(async (tx) => {
      await tx.delete(projectMedia).where(eq(projectMedia.mediaId, id));
      await tx.delete(media).where(eq(media.id, id));

      await AuditService.record(tx, {
        actorId,
        action: 'MEDIA_DELETE',
        entityType: 'media',
        entityId: id,
        oldValues: existing,
      });

      return existing;
    });
  }
}
