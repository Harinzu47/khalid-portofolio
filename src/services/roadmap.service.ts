import { db } from '@/db/client';
import { roadmapItems, learningGoals } from '@/db/schema';
import { eq, desc, asc, and, isNull, sql, inArray } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, AppError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { RoadmapItemFormInput, RoadmapReorderInput } from '@/validations/roadmap';
import type {
  RoadmapListItemDTO,
  RoadmapEditorDTO,
  RoadmapStatus,
  PaginatedResultDTO,
} from '@/types/dtos';

export class RoadmapService {
  /**
   * Fetches public roadmap and learning goals for the public /roadmap page (Amendment 49).
   */
  static async getPublicRoadmap() {
    const [items, goals] = await Promise.all([
      db.query.roadmapItems.findMany({
        where: and(
          eq(roadmapItems.visibility, 'public'),
          eq(roadmapItems.publicationStatus, 'published'),
          isNull(roadmapItems.archivedAt)
        ),
        orderBy: [asc(roadmapItems.sortOrder), desc(roadmapItems.priority)],
      }),
      db.query.learningGoals.findMany({
        orderBy: [desc(learningGoals.updatedAt)],
      }),
    ]);

    return {
      roadmapItems: items,
      learningGoals: goals,
    };
  }

  /**
   * Owner-scoped query: Lightweight selector for form dropdowns/multi-selects.
   */
  static async getRoadmapItemsSelector(ownerId: string): Promise<{ id: string; name: string }[]> {
    const list = await db.query.roadmapItems.findMany({
      where: and(eq(roadmapItems.ownerId, ownerId), isNull(roadmapItems.archivedAt)),
      columns: { id: true, title: true },
      orderBy: [asc(roadmapItems.sortOrder), asc(roadmapItems.title)],
    });
    return list.map((item) => ({ id: item.id, name: item.title }));
  }

  /**
   * Owner-scoped query: Retrieves paginated Roadmap items for admin management.
   */
  static async getAdminRoadmapItems(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<RoadmapListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 50);

    const conditions = and(eq(roadmapItems.ownerId, ownerId));

    const [data, countResult] = await Promise.all([
      db.query.roadmapItems.findMany({
        where: conditions,
        orderBy: [asc(roadmapItems.sortOrder), desc(roadmapItems.priority), desc(roadmapItems.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)::int` }).from(roadmapItems).where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;

    const formattedData: RoadmapListItemDTO[] = data.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      category: item.category,
      roadmapType: item.roadmapType,
      status: item.status as RoadmapStatus,
      priority: item.priority || 1,
      startDate: item.startDate,
      targetDate: item.targetDate,
      sortOrder: item.sortOrder,
      visibility: item.visibility as any,
      publicationStatus: item.publicationStatus,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Owner-scoped query: Retrieves roadmap item by ID for editor.
   */
  static async getRoadmapEditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<RoadmapEditorDTO> {
    const item = await executor.query.roadmapItems.findFirst({
      where: and(eq(roadmapItems.id, id), eq(roadmapItems.ownerId, ownerId)),
    });

    if (!item) {
      throw new NotFoundError('Roadmap Item', id);
    }

    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      description: item.description,
      category: item.category,
      roadmapType: item.roadmapType,
      status: item.status as RoadmapStatus,
      priority: item.priority || 1,
      startDate: item.startDate,
      targetDate: item.targetDate,
      sortOrder: item.sortOrder,
      content: item.content,
      visibility: item.visibility as any,
      publicationStatus: item.publicationStatus,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      archivedAt: item.archivedAt ? item.archivedAt.toISOString() : null,
    };
  }

  /**
   * Creates a new RoadmapItem atomically (Owner scoped).
   */
  static async createRoadmapItem(
    ownerId: string,
    input: RoadmapItemFormInput,
    actorId?: string
  ): Promise<RoadmapEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    return await db.transaction(async (tx) => {
      // Determine default sortOrder if not provided
      let sortOrder: number;
      if (input.sortOrder === undefined || input.sortOrder === 0) {
        const [maxSort] = await tx
          .select({ max: sql<number>`COALESCE(MAX(${roadmapItems.sortOrder}), 0)` })
          .from(roadmapItems)
          .where(eq(roadmapItems.ownerId, ownerId));
        sortOrder = Number(maxSort?.max || 0) + 1;
      } else {
        sortOrder = Number(input.sortOrder);
      }

      const priority = typeof input.priority === 'number' ? input.priority : 1;

      const [newItem] = await tx
        .insert(roadmapItems)
        .values({
          ownerId,
          title: input.title.trim(),
          slug: finalSlug,
          summary: input.summary || null,
          description: input.description || null,
          category: input.category || null,
          roadmapType: input.roadmapType || null,
          status: input.status || 'backlog',
          priority,
          startDate: input.startDate || null,
          targetDate: input.targetDate || null,
          sortOrder,
          content: input.content || null,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Strict DRAFT default (Amendment 14)
        })
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ROADMAP_ITEM_CREATE',
        entityType: 'roadmap_item',
        entityId: newItem.id,
        newValues: newItem,
      });

      return await RoadmapService.getRoadmapEditorById(ownerId, newItem.id, tx);
    });
  }

  /**
   * Updates an existing RoadmapItem atomically (Owner scoped).
   */
  static async updateRoadmapItem(
    ownerId: string,
    id: string,
    input: Partial<RoadmapItemFormInput>,
    actorId?: string
  ): Promise<RoadmapEditorDTO> {
    const existing = await db.query.roadmapItems.findFirst({
      where: and(eq(roadmapItems.id, id), eq(roadmapItems.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Roadmap Item', id);
    }

    const finalSlug =
      input.slug?.trim() || (input.title ? slugify(input.title) : existing.slug);

    const priority = input.priority !== undefined ? (typeof input.priority === 'number' ? input.priority : 1) : existing.priority;
    const sortOrder = input.sortOrder !== undefined ? (typeof input.sortOrder === 'number' ? input.sortOrder : 0) : existing.sortOrder;

    return await db.transaction(async (tx) => {
      const [updatedItem] = await tx
        .update(roadmapItems)
        .set({
          title: input.title !== undefined ? input.title.trim() : existing.title,
          slug: finalSlug,
          summary: input.summary !== undefined ? input.summary : existing.summary,
          description: input.description !== undefined ? input.description : existing.description,
          category: input.category !== undefined ? input.category : existing.category,
          roadmapType: input.roadmapType !== undefined ? input.roadmapType : existing.roadmapType,
          status: input.status || existing.status,
          priority,
          startDate: input.startDate !== undefined ? input.startDate : existing.startDate,
          targetDate: input.targetDate !== undefined ? input.targetDate : existing.targetDate,
          sortOrder,
          content: input.content !== undefined ? input.content : existing.content,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(roadmapItems.id, id), eq(roadmapItems.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ROADMAP_ITEM_UPDATE',
        entityType: 'roadmap_item',
        entityId: id,
        oldValues: existing,
        newValues: updatedItem,
      });

      return await RoadmapService.getRoadmapEditorById(ownerId, id, tx);
    });
  }

  /**
   * Deterministic transactional reordering of roadmap items (Amendment 12).
   * Validates that all IDs belong to owner, no duplicates, and atomic rollback on failure.
   */
  static async reorderRoadmapItems(
    ownerId: string,
    items: RoadmapReorderInput,
    actorId?: string
  ): Promise<void> {
    const ids = items.map((i) => i.id);

    // 1. Verify uniqueness of IDs and sort orders
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== items.length) {
      throw new AppError('Duplicate roadmap item IDs in reorder payload.', 'VALIDATION_ERROR', 400);
    }
    const uniqueOrders = new Set(items.map((i) => i.sortOrder));
    if (uniqueOrders.size !== items.length) {
      throw new AppError('Duplicate sortOrder values in reorder payload.', 'VALIDATION_ERROR', 400);
    }

    await db.transaction(async (tx) => {
      // 2. Verify all items exist and belong to owner
      const existingItems = await tx.query.roadmapItems.findMany({
        where: and(inArray(roadmapItems.id, ids), eq(roadmapItems.ownerId, ownerId)),
        columns: { id: true },
      });

      if (existingItems.length !== items.length) {
        throw new AppError(
          'One or more roadmap items do not exist or belong to another owner.',
          'VALIDATION_ERROR',
          400
        );
      }

      // 3. Atomically update sort_order for each item
      for (const item of items) {
        await tx
          .update(roadmapItems)
          .set({
            sortOrder: item.sortOrder,
            updatedAt: new Date(),
          })
          .where(and(eq(roadmapItems.id, item.id), eq(roadmapItems.ownerId, ownerId)));
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ROADMAP_ITEMS_REORDER',
        entityType: 'roadmap_item',
        entityId: ids[0] || 'batch',
        newValues: { items },
      });
    });
  }

  /**
   * Soft-archives a RoadmapItem: status = 'completed'/archived, archivedAt = now (Amendment 44).
   */
  static async archiveRoadmapItem(
    ownerId: string,
    id: string,
    actorId?: string
  ): Promise<void> {
    const existing = await db.query.roadmapItems.findFirst({
      where: and(eq(roadmapItems.id, id), eq(roadmapItems.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Roadmap Item', id);
    }

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(roadmapItems)
        .set({
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(roadmapItems.id, id), eq(roadmapItems.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ROADMAP_ITEM_ARCHIVE',
        entityType: 'roadmap_item',
        entityId: id,
        oldValues: existing,
        newValues: updated,
      });
    });
  }
}
