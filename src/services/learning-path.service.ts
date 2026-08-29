import { db } from '@/db/client';
import {
  learningPaths,
  learningPathSkills,
  learningPathDomains,
  learningPathTechnologies,
  skills,
  domains,
  technologies,
} from '@/db/schema';
import { eq, desc, asc, and, isNull, sql, inArray } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError, AppError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { LearningPathFormInput } from '@/validations/learning-path';
import type {
  LearningPathListItemDTO,
  LearningPathEditorDTO,
  LearningPathStatus,
  PaginatedResultDTO,
} from '@/types/dtos';

/**
 * Validates ownership of all taxonomy relations before updating junctions (Amendment 13).
 */
async function validateLearningPathTaxonomyOwnership(
  tx: any,
  ownerId: string,
  relations: {
    skillIds?: string[];
    domainIds?: string[];
    technologyIds?: string[];
  }
) {
  if (relations.skillIds && relations.skillIds.length > 0) {
    const found = await tx.query.skills.findMany({
      where: and(inArray(skills.id, relations.skillIds), eq(skills.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.skillIds.length) {
      throw new AppError(
        'One or more linked skills do not exist or belong to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }

  if (relations.domainIds && relations.domainIds.length > 0) {
    const found = await tx.query.domains.findMany({
      where: and(inArray(domains.id, relations.domainIds), eq(domains.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.domainIds.length) {
      throw new AppError(
        'One or more linked domains do not exist or belong to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }

  if (relations.technologyIds && relations.technologyIds.length > 0) {
    const found = await tx.query.technologies.findMany({
      where: and(inArray(technologies.id, relations.technologyIds), eq(technologies.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.technologyIds.length) {
      throw new AppError(
        'One or more linked technologies do not exist or belong to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }
}

export class LearningPathService {
  /**
   * Owner-scoped query: Lightweight selector for form dropdowns/multi-selects.
   */
  static async getLearningPathsSelector(ownerId: string): Promise<{ id: string; name: string }[]> {
    const list = await db.query.learningPaths.findMany({
      where: and(eq(learningPaths.ownerId, ownerId), isNull(learningPaths.archivedAt)),
      columns: { id: true, title: true },
      orderBy: [asc(learningPaths.title)],
    });
    return list.map((lp) => ({ id: lp.id, name: lp.title }));
  }

  /**
   * Owner-scoped query: Retrieves paginated learning paths for admin listing.
   */
  static async getAdminLearningPaths(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<LearningPathListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = and(eq(learningPaths.ownerId, ownerId));

    const [data, countResult] = await Promise.all([
      db.query.learningPaths.findMany({
        where: conditions,
        orderBy: [desc(learningPaths.createdAt)],
        limit,
        offset,
        with: {
          skills: { with: { skill: true } },
          domains: { with: { domain: true } },
          technologies: { with: { technology: true } },
        },
      }),
      db.select({ count: sql<number>`count(*)::int` }).from(learningPaths).where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;

    const formattedData: LearningPathListItemDTO[] = data.map((lp) => ({
      id: lp.id,
      title: lp.title,
      slug: lp.slug,
      summary: lp.summary,
      status: lp.status as LearningPathStatus,
      startedAt: lp.startedAt,
      completedAt: lp.completedAt,
      progressMode: lp.progressMode as any,
      progressValue: lp.progressValue,
      currentFocus: lp.currentFocus,
      visibility: lp.visibility as any,
      publicationStatus: lp.publicationStatus,
      skills: (lp.skills || []).map((s: any) => ({
        id: s.skill?.id || s.skillId,
        name: s.skill?.name || 'Skill',
      })),
      domains: (lp.domains || []).map((d: any) => ({
        id: d.domain?.id || d.domainId,
        name: d.domain?.name || 'Domain',
      })),
      technologies: (lp.technologies || []).map((t: any) => ({
        id: t.technology?.id || t.technologyId,
        name: t.technology?.name || 'Technology',
      })),
      createdAt: lp.createdAt.toISOString(),
      updatedAt: lp.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Owner-scoped query: Retrieves learning path by ID for editor.
   */
  static async getLearningPathEditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<LearningPathEditorDTO> {
    const lp = await executor.query.learningPaths.findFirst({
      where: and(eq(learningPaths.id, id), eq(learningPaths.ownerId, ownerId)),
      with: {
        skills: { with: { skill: true } },
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
      },
    });

    if (!lp) {
      throw new NotFoundError('Learning Path', id);
    }

    return {
      id: lp.id,
      title: lp.title,
      slug: lp.slug,
      summary: lp.summary,
      status: lp.status as LearningPathStatus,
      startedAt: lp.startedAt,
      completedAt: lp.completedAt,
      progressMode: lp.progressMode as any,
      progressValue: lp.progressValue,
      currentFocus: lp.currentFocus,
      content: lp.content,
      visibility: lp.visibility as any,
      publicationStatus: lp.publicationStatus,
      skillIds: (lp.skills || []).map((s: any) => s.skillId),
      domainIds: (lp.domains || []).map((d: any) => d.domainId),
      technologyIds: (lp.technologies || []).map((t: any) => t.technologyId),
      skills: (lp.skills || []).map((s: any) => ({
        id: s.skill?.id || s.skillId,
        name: s.skill?.name || 'Skill',
      })),
      domains: (lp.domains || []).map((d: any) => ({
        id: d.domain?.id || d.domainId,
        name: d.domain?.name || 'Domain',
      })),
      technologies: (lp.technologies || []).map((t: any) => ({
        id: t.technology?.id || t.technologyId,
        name: t.technology?.name || 'Technology',
      })),
      createdAt: lp.createdAt.toISOString(),
      updatedAt: lp.updatedAt.toISOString(),
      archivedAt: lp.archivedAt ? lp.archivedAt.toISOString() : null,
    };
  }

  /**
   * Creates a new LearningPath atomically (Owner scoped).
   */
  static async createLearningPath(
    ownerId: string,
    input: LearningPathFormInput,
    actorId?: string
  ): Promise<LearningPathEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    const existingSlug = await db.query.learningPaths.findFirst({
      where: and(eq(learningPaths.slug, finalSlug), eq(learningPaths.ownerId, ownerId)),
    });
    if (existingSlug) {
      throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
    }

    // Invariant: completed requires completedAt; completed/archived clears currentFocus (Amendment 6)
    const status = input.status || 'planned';
    let currentFocus = input.currentFocus || null;
    if (status === 'completed' || status === 'archived') {
      currentFocus = null;
    }
    if (status === 'completed' && !input.completedAt) {
      throw new AppError(
        'Completed learning paths require a completion date.',
        'VALIDATION_ERROR',
        400
      );
    }

    return await db.transaction(async (tx) => {
      // 1. Validate taxonomy ownership (Amendment 13)
      await validateLearningPathTaxonomyOwnership(tx, ownerId, {
        skillIds: input.skillIds,
        domainIds: input.domainIds,
        technologyIds: input.technologyIds,
      });

      // 2. Insert row
      const [newPath] = await tx
        .insert(learningPaths)
        .values({
          ownerId,
          title: input.title.trim(),
          slug: finalSlug,
          summary: input.summary || null,
          status,
          startedAt: input.startedAt || null,
          completedAt: input.completedAt || null,
          progressMode: input.progressMode || 'none',
          progressValue: input.progressValue ?? null,
          currentFocus,
          content: input.content || null,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Strict DRAFT default (Amendment 14)
        })
        .returning();

      // 3. Sync Junctions
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(learningPathSkills).values(
          input.skillIds.map((skillId) => ({
            learningPathId: newPath.id,
            skillId,
          }))
        );
      }

      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(learningPathDomains).values(
          input.domainIds.map((domainId) => ({
            learningPathId: newPath.id,
            domainId,
          }))
        );
      }

      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(learningPathTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            learningPathId: newPath.id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'LEARNING_PATH_CREATE',
        entityType: 'learning_path',
        entityId: newPath.id,
        newValues: newPath,
      });

      return await LearningPathService.getLearningPathEditorById(ownerId, newPath.id, tx);
    });
  }

  /**
   * Updates an existing LearningPath atomically (Owner scoped).
   */
  static async updateLearningPath(
    ownerId: string,
    id: string,
    input: Partial<LearningPathFormInput>,
    actorId?: string
  ): Promise<LearningPathEditorDTO> {
    const existing = await db.query.learningPaths.findFirst({
      where: and(eq(learningPaths.id, id), eq(learningPaths.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Learning Path', id);
    }

    const finalSlug =
      input.slug?.trim() || (input.title ? slugify(input.title) : existing.slug);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.learningPaths.findFirst({
        where: and(
          eq(learningPaths.slug, finalSlug),
          eq(learningPaths.ownerId, ownerId),
          sql`${learningPaths.id} != ${id}`
        ),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    // Invariant: completed requires completedAt; completed/archived clears currentFocus (Amendment 6)
    const status = input.status || existing.status;
    let currentFocus = input.currentFocus !== undefined ? input.currentFocus : existing.currentFocus;
    if (status === 'completed' || status === 'archived') {
      currentFocus = null;
    }
    const completedAt = input.completedAt !== undefined ? input.completedAt : existing.completedAt;
    if (status === 'completed' && !completedAt) {
      throw new AppError(
        'Completed learning paths require a completion date.',
        'VALIDATION_ERROR',
        400
      );
    }

    return await db.transaction(async (tx) => {
      // 1. Validate taxonomy ownership (Amendment 13)
      await validateLearningPathTaxonomyOwnership(tx, ownerId, {
        skillIds: input.skillIds,
        domainIds: input.domainIds,
        technologyIds: input.technologyIds,
      });

      // 2. Update scalar fields
      const [updatedPath] = await tx
        .update(learningPaths)
        .set({
          title: input.title !== undefined ? input.title.trim() : existing.title,
          slug: finalSlug,
          summary: input.summary !== undefined ? input.summary : existing.summary,
          status,
          startedAt: input.startedAt !== undefined ? input.startedAt : existing.startedAt,
          completedAt,
          progressMode: input.progressMode !== undefined ? input.progressMode : existing.progressMode,
          progressValue: input.progressValue !== undefined ? input.progressValue : existing.progressValue,
          currentFocus,
          content: input.content !== undefined ? input.content : existing.content,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(learningPaths.id, id), eq(learningPaths.ownerId, ownerId)))
        .returning();

      // 3. Sync Junctions if provided
      if (input.skillIds !== undefined) {
        await tx.delete(learningPathSkills).where(eq(learningPathSkills.learningPathId, id));
        if (input.skillIds.length > 0) {
          await tx.insert(learningPathSkills).values(
            input.skillIds.map((skillId) => ({
              learningPathId: id,
              skillId,
            }))
          );
        }
      }

      if (input.domainIds !== undefined) {
        await tx.delete(learningPathDomains).where(eq(learningPathDomains.learningPathId, id));
        if (input.domainIds.length > 0) {
          await tx.insert(learningPathDomains).values(
            input.domainIds.map((domainId) => ({
              learningPathId: id,
              domainId,
            }))
          );
        }
      }

      if (input.technologyIds !== undefined) {
        await tx.delete(learningPathTechnologies).where(eq(learningPathTechnologies.learningPathId, id));
        if (input.technologyIds.length > 0) {
          await tx.insert(learningPathTechnologies).values(
            input.technologyIds.map((technologyId) => ({
              learningPathId: id,
              technologyId,
            }))
          );
        }
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'LEARNING_PATH_UPDATE',
        entityType: 'learning_path',
        entityId: id,
        oldValues: existing,
        newValues: updatedPath,
      });

      return await LearningPathService.getLearningPathEditorById(ownerId, id, tx);
    });
  }

  /**
   * Sets lifecycle status of a LearningPath with invariant enforcement (Amendment 6).
   */
  static async setLearningPathStatus(
    ownerId: string,
    id: string,
    status: LearningPathStatus,
    actorId?: string
  ): Promise<LearningPathEditorDTO> {
    const existing = await db.query.learningPaths.findFirst({
      where: and(eq(learningPaths.id, id), eq(learningPaths.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Learning Path', id);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const completedAt = status === 'completed' ? (existing.completedAt || todayStr) : existing.completedAt;
    const currentFocus = (status === 'completed' || status === 'archived') ? null : existing.currentFocus;

    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(learningPaths)
        .set({
          status,
          completedAt,
          currentFocus,
          updatedAt: new Date(),
        })
        .where(and(eq(learningPaths.id, id), eq(learningPaths.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'LEARNING_PATH_STATUS_CHANGE',
        entityType: 'learning_path',
        entityId: id,
        oldValues: existing,
        newValues: updated,
      });

      return await LearningPathService.getLearningPathEditorById(ownerId, id, tx);
    });
  }

  /**
   * Soft-archives a LearningPath: status = 'archived', archivedAt = now, clears currentFocus (Amendment 6).
   */
  static async archiveLearningPath(
    ownerId: string,
    id: string,
    actorId?: string
  ): Promise<void> {
    const existing = await db.query.learningPaths.findFirst({
      where: and(eq(learningPaths.id, id), eq(learningPaths.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Learning Path', id);
    }

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(learningPaths)
        .set({
          status: 'archived',
          currentFocus: null,
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(learningPaths.id, id), eq(learningPaths.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'LEARNING_PATH_ARCHIVE',
        entityType: 'learning_path',
        entityId: id,
        oldValues: existing,
        newValues: updated,
      });
    });
  }
}
