import { db as defaultDb } from '@/db/client';
import { media, projectMedia, projects, certificates, articles, type Media } from '@/db/schema';
import { eq, and, desc, sql, isNull, isNotNull, like, or, inArray } from 'drizzle-orm';
import { NotFoundError, AppError } from '@/lib/errors';
import { StorageService, StorageBucket } from '@/lib/supabase/storage';
import { MediaDeliveryService } from './media-delivery.service';
import { AuditService } from './audit.service';
import {
  validateUploadFile,
  generateStoragePath,
  getMediaKindFromMime,
  evaluateMediaPublicEligibility,
  DEFAULT_STORAGE_BUCKET,
  type MediaKind,
} from '@/domain/media';
import type {
  MediaListItemDTO,
  MediaEditorDTO,
  MediaPublicDTO,
  MediaUsageDTO,
  MediaUsageReferenceDTO,
  MediaHealthSummaryDTO,
  MediaHealthIssueDTO,
} from '@/types/dtos/media.dto';
import type { MediaFilterInput, UpdateMediaMetadataInput } from '@/validations/media';

type DatabaseExecutor = typeof defaultDb | any;

export interface UploadMediaInput {
  file: Buffer | Uint8Array;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
  caption?: string | null;
  visibility?: 'private' | 'unlisted' | 'public';
}

export class MediaService {
  /**
   * Fetches filtered, paginated media assets for the admin library (Amendment 8).
   * Strict owner isolation, zero ownerId leaked.
   */
  static async getAdminMedia(
    ownerId: string,
    filters?: MediaFilterInput,
    executor: DatabaseExecutor = defaultDb
  ): Promise<{ data: MediaListItemDTO[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 30;
    const offset = (page - 1) * limit;

    const conditions = [eq(media.ownerId, ownerId)];

    // Archive filter
    if (filters?.archived === 'active') {
      conditions.push(isNull(media.archivedAt));
    } else if (filters?.archived === 'archived') {
      conditions.push(isNotNull(media.archivedAt));
    }

    // Visibility filter
    if (filters?.visibility) {
      conditions.push(eq(media.visibility, filters.visibility));
    }

    // MediaKind filter
    if (filters?.mediaKind) {
      if (filters.mediaKind === 'IMAGE') {
        conditions.push(like(media.mimeType, 'image/%'));
      } else if (filters.mediaKind === 'DOCUMENT') {
        conditions.push(
          or(
            eq(media.mimeType, 'application/pdf'),
            like(media.mimeType, 'text/%'),
            like(media.mimeType, '%document%')
          )!
        );
      }
    }

    // Search filter (simple metadata search on originalName or altText)
    if (filters?.search && filters.search.trim() !== '') {
      const searchPattern = `%${filters.search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${media.originalName})`, searchPattern),
          like(sql`lower(${media.altText})`, searchPattern)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [rows, countResult] = await Promise.all([
      executor.query.media.findMany({
        where: whereClause,
        orderBy: [desc(media.createdAt)],
        limit,
        offset,
      }),
      executor.select({ count: sql<number>`count(*)::int` }).from(media).where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;

    // Resolve usage counts and delivery URLs
    const mediaIds = rows.map((r: any) => r.id);
    const usageCountMap = await this.batchGetUsageCounts(ownerId, mediaIds, executor);

    const data: MediaListItemDTO[] = await Promise.all(
      rows.map(async (row: any) => {
        const deliveryUrl = await MediaDeliveryService.resolveAdminDeliveryUrl(
          row.path,
          row.storageBucket as StorageBucket
        );
        return {
          id: row.id,
          originalName: row.originalName,
          mimeType: row.mimeType,
          mediaKind: getMediaKindFromMime(row.mimeType),
          sizeBytes: Number(row.sizeBytes),
          width: row.width,
          height: row.height,
          altText: row.altText,
          caption: row.caption,
          visibility: row.visibility as 'private' | 'unlisted' | 'public',
          usageCount: usageCountMap.get(row.id) || 0,
          deliveryUrl,
          archivedAt: row.archivedAt?.toISOString() || null,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        };
      })
    );

    return { data, total, page, limit };
  }

  /**
   * Fetches single media record by ID with usage references (Amendment 8, 39).
   */
  static async getMediaById(
    ownerId: string,
    id: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<MediaEditorDTO> {
    const asset = await executor.query.media.findFirst({
      where: and(eq(media.id, id), eq(media.ownerId, ownerId)),
    });

    if (!asset) {
      throw new NotFoundError('Media', id);
    }

    const usage = await this.getMediaUsage(ownerId, id, executor);
    const deliveryUrl = await MediaDeliveryService.resolveAdminDeliveryUrl(
      asset.path,
      asset.storageBucket as StorageBucket
    );

    return {
      id: asset.id,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      mediaKind: getMediaKindFromMime(asset.mimeType),
      sizeBytes: Number(asset.sizeBytes),
      width: asset.width,
      height: asset.height,
      altText: asset.altText,
      caption: asset.caption,
      visibility: asset.visibility as 'private' | 'unlisted' | 'public',
      storageBucket: asset.storageBucket,
      storagePath: asset.path,
      deliveryUrl,
      usageCount: usage.totalReferences,
      archivedAt: asset.archivedAt?.toISOString() || null,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }

  /**
   * Compensating upload workflow (Amendments 9, 12, 15, 18, 21, 22).
   * 1. Validate file (MIME, extension, magic bytes, size limits).
   * 2. Generate server-controlled isolated storage path.
   * 3. Upload object to Supabase Storage.
   * 4. Insert metadata row into PostgreSQL + record audit log in same transaction.
   * 5. If DB insert fails -> execute compensating cleanup to delete uploaded storage object.
   */
  static async uploadMedia(
    ownerId: string,
    input: UploadMediaInput,
    actorId?: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<MediaEditorDTO> {
    // 1. Validation
    const validation = validateUploadFile(
      input.originalName,
      input.mimeType,
      input.sizeBytes,
      Buffer.isBuffer(input.file) ? input.file : Buffer.from(input.file)
    );

    if (!validation.isValid) {
      throw new AppError(validation.error || 'Invalid upload file.', 'VALIDATION_ERROR', 400);
    }

    const mediaId = crypto.randomUUID();
    const storagePath = generateStoragePath(ownerId, mediaId, input.originalName);
    const bucket = DEFAULT_STORAGE_BUCKET;

    // 2. Storage upload
    const uploadResult = await StorageService.upload({
      bucket: bucket as StorageBucket,
      path: storagePath,
      file: Buffer.isBuffer(input.file) ? input.file : Buffer.from(input.file),
      contentType: input.mimeType,
    });

    if (!uploadResult.success) {
      throw new AppError(
        `Storage upload failed: ${uploadResult.error.message}`,
        'INTERNAL_ERROR',
        500
      );
    }

    // 3. Database insert with compensating cleanup
    try {
      const isExternalTx = 'transaction' in executor;
      const executeInsert = async (tx: DatabaseExecutor) => {
        const [newMedia] = await tx
          .insert(media)
          .values({
            id: mediaId,
            ownerId,
            storageBucket: bucket,
            disk: 'supabase',
            path: storagePath,
            originalName: input.originalName,
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            altText: input.altText || null,
            caption: input.caption || null,
            visibility: input.visibility || 'private',
            uploadedBy: actorId || null,
          })
          .returning();

        await AuditService.record(tx as any, {
          actorId: actorId || ownerId,
          action: 'MEDIA_UPLOAD',
          entityType: 'media',
          entityId: newMedia.id,
          newValues: {
            id: newMedia.id,
            originalName: newMedia.originalName,
            mimeType: newMedia.mimeType,
            sizeBytes: newMedia.sizeBytes,
            visibility: newMedia.visibility,
            path: newMedia.path,
          },
        });

        return newMedia;
      };

      const inserted =
        executor !== defaultDb
          ? await executeInsert(executor)
          : await defaultDb.transaction(async (tx) => executeInsert(tx));

      const deliveryUrl = await MediaDeliveryService.resolveAdminDeliveryUrl(
        inserted.path,
        inserted.storageBucket as StorageBucket
      );

      return {
        id: inserted.id,
        originalName: inserted.originalName,
        mimeType: inserted.mimeType,
        mediaKind: getMediaKindFromMime(inserted.mimeType),
        sizeBytes: Number(inserted.sizeBytes),
        width: inserted.width,
        height: inserted.height,
        altText: inserted.altText,
        caption: inserted.caption,
        visibility: inserted.visibility as 'private' | 'unlisted' | 'public',
        storageBucket: inserted.storageBucket,
        storagePath: inserted.path,
        deliveryUrl,
        usageCount: 0,
        archivedAt: null,
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      };
    } catch (dbError) {
      // Compensating cleanup (Amendment 21)
      const deleteResult = await StorageService.deleteObject(storagePath, bucket as StorageBucket);
      if (!deleteResult.success) {
        console.error(
          `[CRITICAL] Storage compensation failed after DB insert error. Orphan path: ${storagePath}. Error: ${deleteResult.error.message}`
        );
      }
      throw dbError;
    }
  }

  /**
   * Updates metadata (altText, caption, visibility) without re-uploading file (Amendment 32).
   */
  static async updateMediaMetadata(
    ownerId: string,
    input: UpdateMediaMetadataInput,
    actorId?: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<MediaEditorDTO> {
    const existing = await executor.query.media.findFirst({
      where: and(eq(media.id, input.mediaId), eq(media.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Media', input.mediaId);
    }

    const updates: Partial<Media> = {
      updatedAt: new Date(),
    };

    if (input.altText !== undefined) updates.altText = input.altText;
    if (input.caption !== undefined) updates.caption = input.caption;
    if (input.visibility !== undefined) updates.visibility = input.visibility;

    const isExternalTx = 'transaction' in executor;
    const executeUpdate = async (tx: DatabaseExecutor) => {
      const [updated] = await tx
        .update(media)
        .set(updates)
        .where(and(eq(media.id, input.mediaId), eq(media.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx as any, {
        actorId: actorId || ownerId,
        action: 'MEDIA_UPDATE',
        entityType: 'media',
        entityId: updated.id,
        oldValues: {
          altText: existing.altText,
          caption: existing.caption,
          visibility: existing.visibility,
        },
        newValues: {
          altText: updated.altText,
          caption: updated.caption,
          visibility: updated.visibility,
        },
      });

      return updated;
    };

    const result = isExternalTx
      ? await executeUpdate(executor)
      : await defaultDb.transaction(async (tx) => executeUpdate(tx));

    return this.getMediaById(ownerId, result.id, executor);
  }

  /**
   * Canonical media usage query (Amendments 23, 24, 35).
   * Aggregates structural references from project_media, certificates, and articles.
   */
  static async getMediaUsage(
    ownerId: string,
    mediaId: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<MediaUsageDTO> {
    // 1. Verify media exists and belongs to owner
    const asset = await executor.query.media.findFirst({
      where: and(eq(media.id, mediaId), eq(media.ownerId, ownerId)),
    });

    if (!asset) {
      throw new NotFoundError('Media', mediaId);
    }

    const references: MediaUsageReferenceDTO[] = [];

    // 2. Scan project_media
    const projMediaRows = await executor
      .select({
        projectId: projects.id,
        title: projects.title,
        slug: projects.slug,
        publicationStatus: projects.publicationStatus,
        visibility: projects.visibility,
        archivedAt: projects.archivedAt,
        isCover: projectMedia.isCover,
      })
      .from(projectMedia)
      .innerJoin(projects, eq(projectMedia.projectId, projects.id))
      .where(and(eq(projectMedia.mediaId, mediaId), eq(projects.ownerId, ownerId)));

    for (const row of projMediaRows) {
      const isPublished =
        row.publicationStatus === 'published' &&
        row.visibility === 'public' &&
        row.archivedAt === null;
      references.push({
        entityType: 'PROJECT',
        entityId: row.projectId,
        title: row.title,
        role: row.isCover ? 'COVER' : 'GALLERY',
        publicRoute: `/projects/${row.slug}`,
        isPublished,
      });
    }

    // 3. Scan certificates (certificateMediaId)
    const certRows = await executor
      .select({
        id: certificates.id,
        name: certificates.name,
        publicationStatus: certificates.publicationStatus,
        visibility: certificates.visibility,
        archivedAt: certificates.archivedAt,
      })
      .from(certificates)
      .where(and(eq(certificates.certificateMediaId, mediaId), eq(certificates.ownerId, ownerId)));

    for (const row of certRows) {
      const isPublished =
        row.publicationStatus === 'published' &&
        row.visibility === 'public' &&
        row.archivedAt === null;
      references.push({
        entityType: 'CERTIFICATE',
        entityId: row.id,
        title: row.name,
        role: 'EVIDENCE',
        publicRoute: '/certificates',
        isPublished,
      });
    }

    // 4. Scan articles (ogImageId)
    const articleRows = await executor
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        publicationStatus: articles.publicationStatus,
        visibility: articles.visibility,
        archivedAt: articles.archivedAt,
      })
      .from(articles)
      .where(and(eq(articles.ogImageId, mediaId), eq(articles.ownerId, ownerId)));

    for (const row of articleRows) {
      const isPublished =
        row.publicationStatus === 'published' &&
        row.visibility === 'public' &&
        row.archivedAt === null;
      references.push({
        entityType: 'ARTICLE',
        entityId: row.id,
        title: row.title,
        role: 'OG_IMAGE',
        publicRoute: `/articles/${row.slug}`,
        isPublished,
      });
    }

    const publishedReferences = references.filter((r) => r.isPublished).length;

    return {
      mediaId,
      totalReferences: references.length,
      publishedReferences,
      references,
    };
  }

  /**
   * Soft archival of media (Amendments 28, 57).
   * BLOCKS archival if media is actively referenced by PUBLIC + PUBLISHED content.
   */
  static async archiveMedia(
    ownerId: string,
    id: string,
    actorId?: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<MediaEditorDTO> {
    const existing = await executor.query.media.findFirst({
      where: and(eq(media.id, id), eq(media.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Media', id);
    }

    // Idempotent if already archived
    if (existing.archivedAt) {
      return this.getMediaById(ownerId, id, executor);
    }

    // Safety guard: Check usage in published content (Amendment 28)
    const usage = await this.getMediaUsage(ownerId, id, executor);
    if (usage.publishedReferences > 0) {
      const publishedTitles = usage.references
        .filter((r) => r.isPublished)
        .map((r) => `"${r.title}" (${r.entityType})`)
        .join(', ');

      throw new AppError(
        `Cannot archive media because it is actively referenced by published public content: ${publishedTitles}. Remove or replace these references before archiving.`,
        'CONFLICT',
        409
      );
    }

    const isExternalTx = 'transaction' in executor;
    const executeArchive = async (tx: DatabaseExecutor) => {
      const [updated] = await tx
        .update(media)
        .set({
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(media.id, id), eq(media.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx as any, {
        actorId: actorId || ownerId,
        action: 'MEDIA_ARCHIVE',
        entityType: 'media',
        entityId: id,
        oldValues: { archivedAt: null },
        newValues: { archivedAt: updated.archivedAt },
      });

      return updated;
    };

    if (isExternalTx) {
      await executeArchive(executor);
    } else {
      await defaultDb.transaction(async (tx) => executeArchive(tx));
    }

    return this.getMediaById(ownerId, id, executor);
  }

  /**
   * Restores archived media asset (Amendment 8).
   */
  static async restoreMedia(
    ownerId: string,
    id: string,
    actorId?: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<MediaEditorDTO> {
    const existing = await executor.query.media.findFirst({
      where: and(eq(media.id, id), eq(media.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Media', id);
    }

    // Idempotent if not archived
    if (!existing.archivedAt) {
      return this.getMediaById(ownerId, id, executor);
    }

    const isExternalTx = 'transaction' in executor;
    const executeRestore = async (tx: DatabaseExecutor) => {
      const [updated] = await tx
        .update(media)
        .set({
          archivedAt: null,
          updatedAt: new Date(),
        })
        .where(and(eq(media.id, id), eq(media.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx as any, {
        actorId: actorId || ownerId,
        action: 'MEDIA_RESTORE',
        entityType: 'media',
        entityId: id,
        oldValues: { archivedAt: existing.archivedAt },
        newValues: { archivedAt: null },
      });

      return updated;
    };

    if (isExternalTx) {
      await executeRestore(executor);
    } else {
      await defaultDb.transaction(async (tx) => executeRestore(tx));
    }

    return this.getMediaById(ownerId, id, executor);
  }

  /**
   * Permanent deletion — Guarded maintenance workflow (Amendments 30, 31).
   * Allowed ONLY if:
   * 1. Media is archived.
   * 2. Zero active structural references across all entities.
   */
  static async deleteMediaPermanently(
    ownerId: string,
    id: string,
    actorId?: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<void> {
    const existing = await executor.query.media.findFirst({
      where: and(eq(media.id, id), eq(media.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Media', id);
    }

    if (!existing.archivedAt) {
      throw new AppError(
        'Cannot permanently delete an active media asset. It must be archived first.',
        'CONFLICT',
        409
      );
    }

    const usage = await this.getMediaUsage(ownerId, id, executor);
    if (usage.totalReferences > 0) {
      throw new AppError(
        `Cannot permanently delete media because it still has ${usage.totalReferences} structural reference(s). Remove all references first.`,
        'CONFLICT',
        409
      );
    }

    // Step 1: Delete storage object
    const storageResult = await StorageService.deleteObject(
      existing.path,
      existing.storageBucket as StorageBucket
    );

    if (!storageResult.success) {
      throw new AppError(
        `Failed to delete storage binary object: ${storageResult.error.message}`,
        'INTERNAL_ERROR',
        500
      );
    }

    // Step 2: Delete DB row
    const isExternalTx = 'transaction' in executor;
    const executeDelete = async (tx: DatabaseExecutor) => {
      await tx.delete(media).where(and(eq(media.id, id), eq(media.ownerId, ownerId)));

      await AuditService.record(tx as any, {
        actorId: actorId || ownerId,
        action: 'MEDIA_DELETE',
        entityType: 'media',
        entityId: id,
        oldValues: {
          originalName: existing.originalName,
          path: existing.path,
          mimeType: existing.mimeType,
          sizeBytes: existing.sizeBytes,
        },
      });
    };

    if (isExternalTx) {
      await executeDelete(executor);
    } else {
      await defaultDb.transaction(async (tx) => executeDelete(tx));
    }
  }

  /**
   * Validates a media asset for public projection (Amendments 8, 43, 75).
   * Consumed by PublishingService readiness evaluation.
   */
  static async validateMediaForPublicProjection(
    mediaId: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<{
    isEligible: boolean;
    media?: MediaPublicDTO;
    issue?: { code: string; message: string; severity: 'error' | 'warning' };
  }> {
    const asset = await executor.query.media.findFirst({
      where: eq(media.id, mediaId),
    });

    if (!asset) {
      return {
        isEligible: false,
        issue: {
          code: 'MISSING_MEDIA',
          message: 'Referenced media asset was not found in storage registry.',
          severity: 'error',
        },
      };
    }

    const eligibility = evaluateMediaPublicEligibility(asset.visibility, asset.archivedAt);
    if (!eligibility.isEligible) {
      return {
        isEligible: false,
        issue: {
          code: eligibility.issueCode || 'MEDIA_PRIVATE',
          message: eligibility.reason || 'Referenced media asset cannot be delivered publicly.',
          severity: 'warning',
        },
      };
    }

    const url = await MediaDeliveryService.resolvePublicDeliveryUrl(
      asset.path,
      asset.storageBucket as StorageBucket
    );

    return {
      isEligible: true,
      media: {
        url,
        altText: asset.altText,
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType,
      },
    };
  }

  /**
   * Resolves minimal public DTO (Amendments 34, 35, 40).
   */
  static async getPublicMediaProjection(
    mediaId: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<MediaPublicDTO | null> {
    const res = await this.validateMediaForPublicProjection(mediaId, executor);
    return res.isEligible && res.media ? res.media : null;
  }

  /**
   * Non-destructive, bounded admin health diagnostics (Amendments 38, 39, 40, 41, 42).
   */
  static async getMediaHealthDiagnostics(
    ownerId: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<MediaHealthSummaryDTO> {
    const allAssets = await executor.query.media.findMany({
      where: eq(media.ownerId, ownerId),
    });

    const issues: MediaHealthIssueDTO[] = [];
    let unusedCount = 0;
    let missingAltCount = 0;
    let archivedReferencedCount = 0;
    const brokenRefCount = 0;

    for (const asset of allAssets) {
      const usage = await this.getMediaUsage(ownerId, asset.id, executor);

      // Check 1: UNUSED (informational only, Amendment 39)
      if (usage.totalReferences === 0) {
        unusedCount++;
        issues.push({
          mediaId: asset.id,
          code: 'MEDIA_UNUSED',
          severity: 'info',
          message: `Asset "${asset.originalName}" currently has no structural references.`,
        });
      }

      // Check 2: Archived asset actively referenced
      if (asset.archivedAt && usage.totalReferences > 0) {
        archivedReferencedCount++;
        issues.push({
          mediaId: asset.id,
          code: 'ARCHIVED_MEDIA_REFERENCED',
          severity: usage.publishedReferences > 0 ? 'error' : 'warning',
          message: `Archived asset "${asset.originalName}" is still referenced by ${usage.totalReferences} entity/entities.`,
        });
      }

      // Check 3: Public image missing alt text
      if (
        asset.visibility === 'public' &&
        asset.mimeType.startsWith('image/') &&
        (!asset.altText || asset.altText.trim() === '') &&
        usage.publishedReferences > 0
      ) {
        missingAltCount++;
        issues.push({
          mediaId: asset.id,
          code: 'MEANINGFUL_IMAGE_ALT_MISSING',
          severity: 'warning',
          message: `Publicly projected image "${asset.originalName}" is missing accessibility alt text.`,
        });
      }
    }

    return {
      totalAssets: allAssets.length,
      unusedAssetsCount: unusedCount,
      brokenReferencesCount: brokenRefCount,
      missingAltTextCount: missingAltCount,
      archivedReferencedCount,
      issues,
      inspectedAt: new Date().toISOString(),
    };
  }

  /**
   * Reorders project gallery attachments transactionally (Amendment 25).
   */
  static async reorderProjectMedia(
    ownerId: string,
    projectId: string,
    mediaIds: string[],
    coverMediaId?: string | null,
    actorId?: string,
    executor: DatabaseExecutor = defaultDb
  ): Promise<void> {
    // 1. Verify project ownership
    const project = await executor.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)),
    });
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }

    // 2. Verify all media belong to owner (Amendment 24, 25)
    if (mediaIds.length > 0) {
      const ownedMedia = await executor.query.media.findMany({
        where: and(inArray(media.id, mediaIds), eq(media.ownerId, ownerId)),
      });
      if (ownedMedia.length !== mediaIds.length) {
        throw new AppError(
          'Cannot attach media belonging to another owner or nonexistent media.',
          'FORBIDDEN',
          403
        );
      }
    }

    const isExternalTx = 'transaction' in executor;
    const executeReorder = async (tx: DatabaseExecutor) => {
      // Clear existing project_media
      await tx.delete(projectMedia).where(eq(projectMedia.projectId, projectId));

      // Insert new rows with deterministic sort order
      if (mediaIds.length > 0) {
        const rows = mediaIds.map((mId, index) => ({
          projectId,
          mediaId: mId,
          sortOrder: index,
          isCover: coverMediaId ? mId === coverMediaId : index === 0,
        }));
        await tx.insert(projectMedia).values(rows);
      }

      await AuditService.record(tx as any, {
        actorId: actorId || ownerId,
        action: 'PROJECT_UPDATE',
        entityType: 'project',
        entityId: projectId,
        newValues: { reorderedMediaIds: mediaIds, coverMediaId },
      });
    };

    if (isExternalTx) {
      await executeReorder(executor);
    } else {
      await defaultDb.transaction(async (tx) => executeReorder(tx));
    }
  }

  /**
   * Helper: Batch query usage counts for a list of media IDs.
   */
  private static async batchGetUsageCounts(
    ownerId: string,
    mediaIds: string[],
    executor: DatabaseExecutor = defaultDb
  ): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (mediaIds.length === 0) return map;

    // Scan project_media
    const pmCounts = await executor
      .select({
        mediaId: projectMedia.mediaId,
        count: sql<number>`count(*)::int`,
      })
      .from(projectMedia)
      .where(inArray(projectMedia.mediaId, mediaIds))
      .groupBy(projectMedia.mediaId);

    for (const r of pmCounts) {
      map.set(r.mediaId, (map.get(r.mediaId) || 0) + r.count);
    }

    // Scan certificates
    const certCounts = await executor
      .select({
        mediaId: certificates.certificateMediaId,
        count: sql<number>`count(*)::int`,
      })
      .from(certificates)
      .where(
        and(
          inArray(certificates.certificateMediaId, mediaIds),
          eq(certificates.ownerId, ownerId)
        )
      )
      .groupBy(certificates.certificateMediaId);

    for (const r of certCounts) {
      if (r.mediaId) {
        map.set(r.mediaId, (map.get(r.mediaId) || 0) + r.count);
      }
    }

    // Scan articles
    const artCounts = await executor
      .select({
        mediaId: articles.ogImageId,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .where(
        and(
          inArray(articles.ogImageId, mediaIds),
          eq(articles.ownerId, ownerId)
        )
      )
      .groupBy(articles.ogImageId);

    for (const r of artCounts) {
      if (r.mediaId) {
        map.set(r.mediaId, (map.get(r.mediaId) || 0) + r.count);
      }
    }

    return map;
  }
}
