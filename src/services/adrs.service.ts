import { db } from '@/db/client';
import { adrs, projects } from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError, AppError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { ADRFormInput } from '@/validations/adrs';
import type { KnowledgeListItemDTO, ADREditorDTO, PaginatedResultDTO } from '@/types/dtos';

export class ADRService {
  /**
   * Public query: Retrieves paginated published public ADRs.
   */
  static async getPublicADRs(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 10);

    const conditions = and(
      eq(adrs.visibility, 'public'),
      eq(adrs.publicationStatus, 'published'),
      isNull(adrs.archivedAt)
    );

    const [data, countResult] = await Promise.all([
      db.query.adrs.findMany({
        where: conditions,
        orderBy: [desc(adrs.number), desc(adrs.createdAt)],
        limit,
        offset,
        with: {
          // Project relation
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(adrs)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Public query: Retrieves single published ADR by slug.
   */
  static async getPublicADRBySlug(slug: string) {
    const adr = await db.query.adrs.findFirst({
      where: and(
        eq(adrs.slug, slug),
        eq(adrs.visibility, 'public'),
        eq(adrs.publicationStatus, 'published'),
        isNull(adrs.archivedAt)
      ),
    });

    if (!adr) {
      throw new NotFoundError('ADR', slug);
    }

    return adr;
  }

  /**
   * Owner-scoped query: Retrieves paginated ADRs for the Admin Knowledge Surface.
   */
  static async getAdminADRs(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<KnowledgeListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = and(eq(adrs.ownerId, ownerId));

    const [data, countResult] = await Promise.all([
      db.query.adrs.findMany({
        where: conditions,
        orderBy: [desc(adrs.number), desc(adrs.createdAt)],
        limit,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(adrs)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    const formattedData: KnowledgeListItemDTO[] = data.map((a) => ({
      id: a.id,
      entityType: 'adr' as const,
      title: a.title,
      slug: a.slug,
      summary: a.context ? a.context.slice(0, 180) : null,
      number: a.number,
      visibility: a.visibility as any,
      publicationStatus: a.publicationStatus as any,
      status: a.status,
      isFeatured: false,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      updatedAt: a.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Owner-scoped query: Retrieves ADR by ID for editor.
   */
  static async getADREditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<ADREditorDTO> {
    const adr = await executor.query.adrs.findFirst({
      where: and(eq(adrs.id, id), eq(adrs.ownerId, ownerId)),
    });

    if (!adr) {
      throw new NotFoundError('ADR', id);
    }

    // Resolve project reference if associated
    let projectRef = null;
    if (adr.projectId) {
      const proj = await executor.query.projects.findFirst({
        where: eq(projects.id, adr.projectId),
      });
      if (proj) {
        projectRef = {
          id: proj.id,
          name: proj.title,
          slug: proj.slug,
        };
      }
    }

    // Resolve supersededBy reference if applicable
    let supersededByRef = null;
    if (adr.supersededById) {
      const sup = await executor.query.adrs.findFirst({
        where: eq(adrs.id, adr.supersededById),
      });
      if (sup) {
        supersededByRef = {
          id: sup.id,
          name: sup.title,
          slug: sup.slug,
        };
      }
    }

    return {
      id: adr.id,
      number: adr.number,
      title: adr.title,
      slug: adr.slug,
      status: adr.status as any,
      context: adr.context,
      decision: adr.decision,
      alternatives: adr.alternatives,
      consequences: adr.consequences,
      projectId: adr.projectId,
      project: projectRef,
      supersededById: adr.supersededById,
      supersededBy: supersededByRef,
      visibility: adr.visibility as any,
      publicationStatus: adr.publicationStatus as any,
      decidedAt: adr.decidedAt ? adr.decidedAt.toISOString() : null,
      publishedAt: adr.publishedAt ? adr.publishedAt.toISOString() : null,
      archivedAt: adr.archivedAt ? adr.archivedAt.toISOString() : null,
      createdAt: adr.createdAt.toISOString(),
      updatedAt: adr.updatedAt.toISOString(),
    };
  }

  /**
   * Creates a new ADR atomically with owner isolation.
   * Invariant: Sets publicationStatus = 'draft' by default.
   */
  static async createADR(
    ownerId: string,
    input: ADRFormInput,
    actorId?: string
  ): Promise<ADREditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    const existing = await db.query.adrs.findFirst({
      where: eq(adrs.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`An ADR with slug "${finalSlug}" already exists.`);
    }

    // Auto-calculate sequential number if not provided
    let adrNumber = input.number;
    if (!adrNumber) {
      const [maxResult] = await db
        .select({ maxNum: sql<number>`COALESCE(MAX(${adrs.number}), 0)::int` })
        .from(adrs)
        .where(eq(adrs.ownerId, ownerId));
      adrNumber = (maxResult?.maxNum || 0) + 1;
    }

    return await db.transaction(async (tx) => {
      // Validate supersededById if provided (Amendment 10)
      if (input.supersededById) {
        const targetSup = await tx.query.adrs.findFirst({
          where: and(eq(adrs.id, input.supersededById), eq(adrs.ownerId, ownerId)),
        });
        if (!targetSup) {
          throw new AppError(
            'Superseded ADR target does not exist or does not belong to the current owner.',
            'VALIDATION_ERROR',
            400
          );
        }
      }

      // If supersededById is set, enforce status = 'superseded' per Amendment 10
      const status = input.supersededById ? 'superseded' : (input.status || 'proposed');

      const [newADR] = await tx
        .insert(adrs)
        .values({
          ownerId,
          number: adrNumber,
          title: input.title.trim(),
          slug: finalSlug,
          status,
          context: input.context || null,
          decision: input.decision || null,
          alternatives: input.alternatives || null,
          consequences: input.consequences || null,
          projectId: input.projectId || null,
          supersededById: input.supersededById || null,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Strict DRAFT default
          decidedAt: input.decidedAt ? new Date(input.decidedAt) : null,
        })
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ADR_CREATE',
        entityType: 'adr',
        entityId: newADR.id,
        newValues: newADR,
      });

      return await ADRService.getADREditorById(ownerId, newADR.id, tx);
    });
  }

  /**
   * Updates an existing ADR atomically (Owner scoped).
   * Note: Does NOT modify publicationStatus.
   */
  static async updateADR(
    ownerId: string,
    id: string,
    input: Partial<ADRFormInput>,
    actorId?: string
  ): Promise<ADREditorDTO> {
    const existing = await db.query.adrs.findFirst({
      where: and(eq(adrs.id, id), eq(adrs.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('ADR', id);
    }

    // Validate self-reference rejection (Amendment 10)
    if (input.supersededById && input.supersededById === id) {
      throw new AppError(
        'An ADR cannot supersede itself.',
        'VALIDATION_ERROR',
        400
      );
    }

    const finalSlug =
      input.slug?.trim() || (input.title ? slugify(input.title) : existing.slug);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.adrs.findFirst({
        where: and(eq(adrs.slug, finalSlug), sql`${adrs.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      // Validate superseded target ownership & existence (Amendment 10)
      if (input.supersededById) {
        const targetSup = await tx.query.adrs.findFirst({
          where: and(eq(adrs.id, input.supersededById), eq(adrs.ownerId, ownerId)),
        });
        if (!targetSup) {
          throw new AppError(
            'Superseded ADR target does not exist or does not belong to the current owner.',
            'VALIDATION_ERROR',
            400
          );
        }
      }

      // Status becomes 'superseded' when supersededById is assigned per Amendment 10
      let finalStatus = input.status || existing.status;
      if (input.supersededById) {
        finalStatus = 'superseded';
      }

      const [updatedADR] = await tx
        .update(adrs)
        .set({
          number: input.number !== undefined ? input.number : existing.number,
          title: input.title !== undefined ? input.title.trim() : existing.title,
          slug: finalSlug,
          status: finalStatus as any,
          context: input.context !== undefined ? input.context : existing.context,
          decision: input.decision !== undefined ? input.decision : existing.decision,
          alternatives:
            input.alternatives !== undefined ? input.alternatives : existing.alternatives,
          consequences:
            input.consequences !== undefined ? input.consequences : existing.consequences,
          projectId: input.projectId !== undefined ? input.projectId : existing.projectId,
          supersededById:
            input.supersededById !== undefined ? input.supersededById : existing.supersededById,
          visibility: input.visibility || existing.visibility,
          decidedAt: input.decidedAt ? new Date(input.decidedAt) : existing.decidedAt,
          updatedAt: new Date(),
        })
        .where(and(eq(adrs.id, id), eq(adrs.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ADR_UPDATE',
        entityType: 'adr',
        entityId: id,
        oldValues: existing,
        newValues: updatedADR,
      });

      return await ADRService.getADREditorById(ownerId, id, tx);
    });
  }

  /**
   * Soft-archives an ADR (Owner scoped).
   */
  static async archiveADR(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.adrs.findFirst({
      where: and(eq(adrs.id, id), eq(adrs.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('ADR', id);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(adrs)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(adrs.id, id), eq(adrs.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ADR_ARCHIVE',
        entityType: 'adr',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Maintenance delete for backward compatibility.
   */
  static async deleteADR(ownerId: string, id: string, actorId?: string) {
    const existing = await db.query.adrs.findFirst({
      where: and(eq(adrs.id, id), eq(adrs.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('ADR', id);

    return await db.transaction(async (tx) => {
      await tx.delete(adrs).where(and(eq(adrs.id, id), eq(adrs.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ADR_DELETE_PERMANENT',
        entityType: 'adr',
        entityId: id,
        oldValues: existing,
      });

      return existing;
    });
  }
}
