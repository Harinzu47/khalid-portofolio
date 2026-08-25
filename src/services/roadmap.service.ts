import { db } from '@/db/client';
import { learningGoals, roadmapItems } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import { AuditService } from './audit.service';
import type { LearningGoalFormInput, RoadmapItemFormInput } from '@/validations/roadmap';

export class RoadmapService {
  // ==========================================
  // 1. PUBLIC ROADMAP
  // ==========================================

  static async getPublicRoadmap() {
    const [items, goals] = await Promise.all([
      db.query.roadmapItems.findMany({
        orderBy: [asc(roadmapItems.sortOrder), desc(roadmapItems.priority)],
      }),
      db.query.learningGoals.findMany({
        orderBy: [desc(roadmapItems.priority), desc(learningGoals.progress)],
      }),
    ]);

    return {
      roadmapItems: items,
      learningGoals: goals,
    };
  }

  // ==========================================
  // 2. LEARNING GOALS
  // ==========================================

  static async getLearningGoals() {
    return await db.query.learningGoals.findMany({
      orderBy: [desc(learningGoals.updatedAt)],
    });
  }

  static async getLearningGoalById(id: string) {
    const goal = await db.query.learningGoals.findFirst({
      where: eq(learningGoals.id, id),
    });
    if (!goal) throw new NotFoundError('Learning Goal', id);
    return goal;
  }

  static async createLearningGoal(input: LearningGoalFormInput, actorId?: string) {
    return await db.transaction(async (tx) => {
      const [newGoal] = await tx
        .insert(learningGoals)
        .values({
          title: input.title,
          description: input.description || null,
          status: input.status,
          priority: input.priority,
          progress: input.progress,
          targetDate: input.targetDate || null,
          startedAt: input.startedAt || null,
          completedAt: input.completedAt || null,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'LEARNING_GOAL_CREATE',
        entityType: 'learning_goal',
        entityId: newGoal.id,
        newValues: newGoal,
      });

      return newGoal;
    });
  }

  static async updateLearningGoal(id: string, input: LearningGoalFormInput, actorId?: string) {
    const existing = await db.query.learningGoals.findFirst({
      where: eq(learningGoals.id, id),
    });
    if (!existing) throw new NotFoundError('Learning Goal', id);

    return await db.transaction(async (tx) => {
      const [updatedGoal] = await tx
        .update(learningGoals)
        .set({
          title: input.title,
          description: input.description || null,
          status: input.status,
          priority: input.priority,
          progress: input.progress,
          targetDate: input.targetDate || null,
          startedAt: input.startedAt || null,
          completedAt: input.completedAt || null,
          updatedAt: new Date(),
        })
        .where(eq(learningGoals.id, id))
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'LEARNING_GOAL_UPDATE',
        entityType: 'learning_goal',
        entityId: id,
        oldValues: existing,
        newValues: updatedGoal,
      });

      return updatedGoal;
    });
  }

  static async deleteLearningGoal(id: string, actorId?: string) {
    const existing = await db.query.learningGoals.findFirst({
      where: eq(learningGoals.id, id),
    });
    if (!existing) throw new NotFoundError('Learning Goal', id);

    return await db.transaction(async (tx) => {
      await tx.delete(learningGoals).where(eq(learningGoals.id, id));

      await AuditService.record(tx, {
        actorId,
        action: 'LEARNING_GOAL_DELETE',
        entityType: 'learning_goal',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  // ==========================================
  // 3. ROADMAP ITEMS
  // ==========================================

  static async getRoadmapItems() {
    return await db.query.roadmapItems.findMany({
      orderBy: [asc(roadmapItems.sortOrder), desc(roadmapItems.priority)],
    });
  }

  static async getRoadmapItemById(id: string) {
    const item = await db.query.roadmapItems.findFirst({
      where: eq(roadmapItems.id, id),
    });
    if (!item) throw new NotFoundError('Roadmap Item', id);
    return item;
  }

  static async createRoadmapItem(input: RoadmapItemFormInput, actorId?: string) {
    return await db.transaction(async (tx) => {
      const [newItem] = await tx
        .insert(roadmapItems)
        .values({
          title: input.title,
          description: input.description || null,
          category: input.category || null,
          status: input.status,
          priority: input.priority,
          targetDate: input.targetDate || null,
          sortOrder: input.sortOrder || 0,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'ROADMAP_ITEM_CREATE',
        entityType: 'roadmap_item',
        entityId: newItem.id,
        newValues: newItem,
      });

      return newItem;
    });
  }

  static async updateRoadmapItem(id: string, input: RoadmapItemFormInput, actorId?: string) {
    const existing = await db.query.roadmapItems.findFirst({
      where: eq(roadmapItems.id, id),
    });
    if (!existing) throw new NotFoundError('Roadmap Item', id);

    return await db.transaction(async (tx) => {
      const [updatedItem] = await tx
        .update(roadmapItems)
        .set({
          title: input.title,
          description: input.description || null,
          category: input.category || null,
          status: input.status,
          priority: input.priority,
          targetDate: input.targetDate || null,
          sortOrder: input.sortOrder || 0,
          updatedAt: new Date(),
        })
        .where(eq(roadmapItems.id, id))
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'ROADMAP_ITEM_UPDATE',
        entityType: 'roadmap_item',
        entityId: id,
        oldValues: existing,
        newValues: updatedItem,
      });

      return updatedItem;
    });
  }

  static async deleteRoadmapItem(id: string, actorId?: string) {
    const existing = await db.query.roadmapItems.findFirst({
      where: eq(roadmapItems.id, id),
    });
    if (!existing) throw new NotFoundError('Roadmap Item', id);

    return await db.transaction(async (tx) => {
      await tx.delete(roadmapItems).where(eq(roadmapItems.id, id));

      await AuditService.record(tx, {
        actorId,
        action: 'ROADMAP_ITEM_DELETE',
        entityType: 'roadmap_item',
        entityId: id,
        oldValues: existing,
      });
    });
  }
}
