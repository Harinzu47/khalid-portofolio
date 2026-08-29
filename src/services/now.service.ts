import { db } from '@/db/client';
import {
  nowEntries,
  nowProjects,
  nowLearningPaths,
  nowRoadmaps,
  nowDomains,
  nowTechnologies,
  projects,
  learningPaths,
  roadmapItems,
  domains,
  technologies,
} from '@/db/schema';
import { eq, desc, and, isNull, sql, inArray } from 'drizzle-orm';
import { NotFoundError, AppError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { NowEntryFormInput, NowQuickAddInput } from '@/validations/now';
import type {
  NowEntryListItemDTO,
  NowEntryEditorDTO,
  NowCurrentOverviewDTO,
  NowEntryType,
  PaginatedResultDTO,
} from '@/types/dtos';

/**
 * Validates that all referenced junction entities belong to the authenticated owner (Amendment 13).
 */
async function validateNowRelationsOwnership(
  tx: any,
  ownerId: string,
  relations: {
    projectIds?: string[];
    learningPathIds?: string[];
    roadmapIds?: string[];
    domainIds?: string[];
    technologyIds?: string[];
  }
) {
  if (relations.projectIds && relations.projectIds.length > 0) {
    const found = await tx.query.projects.findMany({
      where: and(inArray(projects.id, relations.projectIds), eq(projects.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.projectIds.length) {
      throw new AppError(
        'One or more linked projects do not exist or belong to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }

  if (relations.learningPathIds && relations.learningPathIds.length > 0) {
    const found = await tx.query.learningPaths.findMany({
      where: and(inArray(learningPaths.id, relations.learningPathIds), eq(learningPaths.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.learningPathIds.length) {
      throw new AppError(
        'One or more linked learning paths do not exist or belong to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }

  if (relations.roadmapIds && relations.roadmapIds.length > 0) {
    const found = await tx.query.roadmapItems.findMany({
      where: and(inArray(roadmapItems.id, relations.roadmapIds), eq(roadmapItems.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.roadmapIds.length) {
      throw new AppError(
        'One or more linked roadmap items do not exist or belong to another owner.',
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

export class NowService {
  /**
   * Owner-scoped query: Retrieves paginated NowEntries for administrative listing.
   */
  static async getAdminNowEntries(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<NowEntryListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 50);

    const conditions = and(eq(nowEntries.ownerId, ownerId));

    const [data, countResult] = await Promise.all([
      db.query.nowEntries.findMany({
        where: conditions,
        orderBy: [desc(nowEntries.isCurrent), desc(nowEntries.startedAt), desc(nowEntries.createdAt)],
        limit,
        offset,
        with: {
          projects: { with: { project: true } },
          learningPaths: { with: { learningPath: true } },
          roadmaps: { with: { roadmap: true } },
          domains: { with: { domain: true } },
          technologies: { with: { technology: true } },
        },
      }),
      db.select({ count: sql<number>`count(*)::int` }).from(nowEntries).where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;

    const formattedData: NowEntryListItemDTO[] = data.map((entry) => ({
      id: entry.id,
      entryType: entry.entryType as NowEntryType,
      title: entry.title,
      description: entry.description,
      status: entry.status as any,
      isCurrent: entry.isCurrent,
      startedAt: entry.startedAt,
      endedAt: entry.endedAt,
      sortOrder: entry.sortOrder,
      visibility: entry.visibility as any,
      publicationStatus: entry.publicationStatus,
      projectNames: (entry.projects || []).map((p: any) => p.project?.title || p.project?.name).filter(Boolean),
      learningPathNames: (entry.learningPaths || []).map((lp: any) => lp.learningPath?.title).filter(Boolean),
      roadmapItemNames: (entry.roadmaps || []).map((r: any) => r.roadmap?.title).filter(Boolean),
      domainNames: (entry.domains || []).map((d: any) => d.domain?.name).filter(Boolean),
      technologyNames: (entry.technologies || []).map((t: any) => t.technology?.name).filter(Boolean),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Owner-scoped query: Retrieves currently active NowEntries grouped by canonical entry type (Amendment 14).
   */
  static async getCurrentNowEntries(ownerId: string): Promise<NowCurrentOverviewDTO> {
    const rawEntries = await db.query.nowEntries.findMany({
      where: and(
        eq(nowEntries.ownerId, ownerId),
        eq(nowEntries.isCurrent, true),
        isNull(nowEntries.archivedAt)
      ),
      orderBy: [desc(nowEntries.sortOrder), desc(nowEntries.createdAt)],
      with: {
        projects: { with: { project: true } },
        learningPaths: { with: { learningPath: true } },
        roadmaps: { with: { roadmap: true } },
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
      },
    });

    const groupedByType: Record<NowEntryType, NowEntryListItemDTO[]> = {
      building: [],
      learning: [],
      managing: [],
      researching: [],
      reading: [],
      watching: [],
      exploring: [],
      using: [],
    };

    rawEntries.forEach((entry) => {
      const type = entry.entryType as NowEntryType;
      const dto: NowEntryListItemDTO = {
        id: entry.id,
        entryType: type,
        title: entry.title,
        description: entry.description,
        status: entry.status as any,
        isCurrent: entry.isCurrent,
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
        sortOrder: entry.sortOrder,
        visibility: entry.visibility as any,
        publicationStatus: entry.publicationStatus,
        projectNames: (entry.projects || []).map((p: any) => p.project?.title || p.project?.name).filter(Boolean),
        learningPathNames: (entry.learningPaths || []).map((lp: any) => lp.learningPath?.title).filter(Boolean),
        roadmapItemNames: (entry.roadmaps || []).map((r: any) => r.roadmap?.title).filter(Boolean),
        domainNames: (entry.domains || []).map((d: any) => d.domain?.name).filter(Boolean),
        technologyNames: (entry.technologies || []).map((t: any) => t.technology?.name).filter(Boolean),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      };

      if (groupedByType[type]) {
        groupedByType[type].push(dto);
      }
    });

    return {
      totalCurrent: rawEntries.length,
      groupedByType,
    };
  }

  /**
   * Owner-scoped query: Retrieves single NowEntry for editing.
   */
  static async getNowEntryEditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<NowEntryEditorDTO> {
    const entry = await executor.query.nowEntries.findFirst({
      where: and(eq(nowEntries.id, id), eq(nowEntries.ownerId, ownerId)),
      with: {
        projects: { with: { project: true } },
        learningPaths: { with: { learningPath: true } },
        roadmaps: { with: { roadmap: true } },
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
      },
    });

    if (!entry) {
      throw new NotFoundError('Now Entry', id);
    }

    return {
      id: entry.id,
      entryType: entry.entryType as NowEntryType,
      title: entry.title,
      description: entry.description,
      status: entry.status as any,
      isCurrent: entry.isCurrent,
      startedAt: entry.startedAt,
      endedAt: entry.endedAt,
      sortOrder: entry.sortOrder,
      visibility: entry.visibility as any,
      publicationStatus: entry.publicationStatus,
      projectIds: (entry.projects || []).map((p: any) => p.projectId),
      learningPathIds: (entry.learningPaths || []).map((lp: any) => lp.learningPathId),
      roadmapIds: (entry.roadmaps || []).map((r: any) => r.roadmapId),
      domainIds: (entry.domains || []).map((d: any) => d.domainId),
      technologyIds: (entry.technologies || []).map((t: any) => t.technologyId),
      projects: (entry.projects || []).map((p: any) => ({
        id: p.project?.id || p.projectId,
        name: p.project?.title || p.project?.name || 'Project',
      })),
      learningPaths: (entry.learningPaths || []).map((lp: any) => ({
        id: lp.learningPath?.id || lp.learningPathId,
        name: lp.learningPath?.title || 'Learning Path',
      })),
      roadmaps: (entry.roadmaps || []).map((r: any) => ({
        id: r.roadmap?.id || r.roadmapId,
        name: r.roadmap?.title || 'Roadmap Item',
      })),
      domains: (entry.domains || []).map((d: any) => ({
        id: d.domain?.id || d.domainId,
        name: d.domain?.name || 'Domain',
      })),
      technologies: (entry.technologies || []).map((t: any) => ({
        id: t.technology?.id || t.technologyId,
        name: t.technology?.name || 'Technology',
      })),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      archivedAt: entry.archivedAt ? entry.archivedAt.toISOString() : null,
    };
  }

  /**
   * Creates a new NowEntry atomically with junction relations (Owner scoped).
   */
  static async createNowEntry(
    ownerId: string,
    input: NowEntryFormInput,
    actorId?: string
  ): Promise<NowEntryEditorDTO> {
    return await db.transaction(async (tx) => {
      // 1. Validate relationship ownership (Amendment 13)
      await validateNowRelationsOwnership(tx, ownerId, {
        projectIds: input.projectIds,
        learningPathIds: input.learningPathIds,
        roadmapIds: input.roadmapIds,
        domainIds: input.domainIds,
        technologyIds: input.technologyIds,
      });

      // 2. Determine isCurrent and dates based on invariants (Amendment 3)
      const status = input.status || 'active';
      let isCurrent = input.isCurrent ?? true;
      if (status === 'completed' || status === 'archived') {
        isCurrent = false;
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      const startedAt = input.startedAt || todayStr;

      // 3. Insert row
      const [newEntry] = await tx
        .insert(nowEntries)
        .values({
          ownerId,
          entryType: input.entryType,
          title: input.title.trim(),
          description: input.description || null,
          status,
          isCurrent,
          startedAt,
          endedAt: input.endedAt || null,
          sortOrder: input.sortOrder ?? 0,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Strict DRAFT default (Amendment 14)
        })
        .returning();

      // 4. Sync Junctions
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(nowProjects).values(
          input.projectIds.map((projectId) => ({
            nowId: newEntry.id,
            projectId,
          }))
        );
      }

      if (input.learningPathIds && input.learningPathIds.length > 0) {
        await tx.insert(nowLearningPaths).values(
          input.learningPathIds.map((learningPathId) => ({
            nowId: newEntry.id,
            learningPathId,
          }))
        );
      }

      if (input.roadmapIds && input.roadmapIds.length > 0) {
        await tx.insert(nowRoadmaps).values(
          input.roadmapIds.map((roadmapId) => ({
            nowId: newEntry.id,
            roadmapId,
          }))
        );
      }

      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(nowDomains).values(
          input.domainIds.map((domainId) => ({
            nowId: newEntry.id,
            domainId,
          }))
        );
      }

      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(nowTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            nowId: newEntry.id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'NOW_CREATE',
        entityType: 'now_entry',
        entityId: newEntry.id,
        newValues: newEntry,
      });

      return await NowService.getNowEntryEditorById(ownerId, newEntry.id, tx);
    });
  }

  /**
   * Low-friction Quick Add capture for current activities (Amendments 15, 16).
   */
  static async quickAddNow(
    ownerId: string,
    input: NowQuickAddInput,
    actorId?: string
  ): Promise<NowEntryEditorDTO> {
    const todayStr = new Date().toISOString().slice(0, 10);

    return await NowService.createNowEntry(
      ownerId,
      {
        entryType: input.entryType,
        title: input.title,
        description: input.description || null,
        status: 'active',
        isCurrent: true,
        startedAt: todayStr,
        endedAt: null,
        sortOrder: 0,
        visibility: 'private',
        projectIds: input.projectIds || [],
        learningPathIds: input.learningPathIds || [],
        roadmapIds: [],
        domainIds: input.domainIds || [],
        technologyIds: input.technologyIds || [],
      },
      actorId
    );
  }

  /**
   * Updates an existing NowEntry atomically (Owner scoped).
   * Note: publicationStatus is never directly modified here (Amendment 14).
   */
  static async updateNowEntry(
    ownerId: string,
    id: string,
    input: Partial<NowEntryFormInput>,
    actorId?: string
  ): Promise<NowEntryEditorDTO> {
    const existing = await db.query.nowEntries.findFirst({
      where: and(eq(nowEntries.id, id), eq(nowEntries.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Now Entry', id);
    }

    return await db.transaction(async (tx) => {
      // 1. Validate relation ownership on update
      await validateNowRelationsOwnership(tx, ownerId, {
        projectIds: input.projectIds,
        learningPathIds: input.learningPathIds,
        roadmapIds: input.roadmapIds,
        domainIds: input.domainIds,
        technologyIds: input.technologyIds,
      });

      // 2. Invariants enforcement (Amendment 3)
      const status = input.status || existing.status;
      let isCurrent = input.isCurrent !== undefined ? input.isCurrent : existing.isCurrent;
      if (status === 'completed' || status === 'archived') {
        isCurrent = false;
      }

      const [updatedEntry] = await tx
        .update(nowEntries)
        .set({
          entryType: input.entryType || existing.entryType,
          title: input.title !== undefined ? input.title.trim() : existing.title,
          description: input.description !== undefined ? input.description : existing.description,
          status,
          isCurrent,
          startedAt: input.startedAt !== undefined ? input.startedAt : existing.startedAt,
          endedAt: input.endedAt !== undefined ? input.endedAt : existing.endedAt,
          sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(nowEntries.id, id), eq(nowEntries.ownerId, ownerId)))
        .returning();

      // 3. Sync Junctions if provided
      if (input.projectIds !== undefined) {
        await tx.delete(nowProjects).where(eq(nowProjects.nowId, id));
        if (input.projectIds.length > 0) {
          await tx.insert(nowProjects).values(
            input.projectIds.map((projectId) => ({
              nowId: id,
              projectId,
            }))
          );
        }
      }

      if (input.learningPathIds !== undefined) {
        await tx.delete(nowLearningPaths).where(eq(nowLearningPaths.nowId, id));
        if (input.learningPathIds.length > 0) {
          await tx.insert(nowLearningPaths).values(
            input.learningPathIds.map((learningPathId) => ({
              nowId: id,
              learningPathId,
            }))
          );
        }
      }

      if (input.roadmapIds !== undefined) {
        await tx.delete(nowRoadmaps).where(eq(nowRoadmaps.nowId, id));
        if (input.roadmapIds.length > 0) {
          await tx.insert(nowRoadmaps).values(
            input.roadmapIds.map((roadmapId) => ({
              nowId: id,
              roadmapId,
            }))
          );
        }
      }

      if (input.domainIds !== undefined) {
        await tx.delete(nowDomains).where(eq(nowDomains.nowId, id));
        if (input.domainIds.length > 0) {
          await tx.insert(nowDomains).values(
            input.domainIds.map((domainId) => ({
              nowId: id,
              domainId,
            }))
          );
        }
      }

      if (input.technologyIds !== undefined) {
        await tx.delete(nowTechnologies).where(eq(nowTechnologies.nowId, id));
        if (input.technologyIds.length > 0) {
          await tx.insert(nowTechnologies).values(
            input.technologyIds.map((technologyId) => ({
              nowId: id,
              technologyId,
            }))
          );
        }
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'NOW_UPDATE',
        entityType: 'now_entry',
        entityId: id,
        oldValues: existing,
        newValues: updatedEntry,
      });

      return await NowService.getNowEntryEditorById(ownerId, id, tx);
    });
  }

  /**
   * Completes a NowEntry: status = 'completed', isCurrent = false, preserves valid endedAt or sets today (Amendments 4, 5).
   */
  static async completeNowEntry(
    ownerId: string,
    id: string,
    actorId?: string
  ): Promise<NowEntryEditorDTO> {
    const existing = await db.query.nowEntries.findFirst({
      where: and(eq(nowEntries.id, id), eq(nowEntries.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Now Entry', id);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    // Preserve existing endedAt if already valid (Amendment 4)
    const finalEndedAt = existing.endedAt || todayStr;

    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(nowEntries)
        .set({
          status: 'completed',
          isCurrent: false,
          endedAt: finalEndedAt,
          updatedAt: new Date(),
        })
        .where(and(eq(nowEntries.id, id), eq(nowEntries.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'NOW_COMPLETE',
        entityType: 'now_entry',
        entityId: id,
        oldValues: existing,
        newValues: updated,
      });

      return await NowService.getNowEntryEditorById(ownerId, id, tx);
    });
  }

  /**
   * Soft-archives a NowEntry: status = 'archived', isCurrent = false, archivedAt = now, preserves endedAt (Amendment 5).
   */
  static async archiveNowEntry(
    ownerId: string,
    id: string,
    actorId?: string
  ): Promise<void> {
    const existing = await db.query.nowEntries.findFirst({
      where: and(eq(nowEntries.id, id), eq(nowEntries.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Now Entry', id);
    }

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(nowEntries)
        .set({
          status: 'archived',
          isCurrent: false,
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(nowEntries.id, id), eq(nowEntries.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'NOW_ARCHIVE',
        entityType: 'now_entry',
        entityId: id,
        oldValues: existing,
        newValues: updated,
      });
    });
  }
}
