import { db } from '@/db/client';
import { learningGoals, type LearningGoal } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import { AuditService } from './audit.service';
import type { LearningGoalFormInput } from '@/validations/roadmap';

/**
 * Isolated legacy service for historical learning_goals table per Amendment 1.
 * Retained for backwards compatibility with existing admin/learning-goals routes.
 */
export class LegacyLearningGoalsService {
  static async getLearningGoals(ownerId?: string): Promise<LearningGoal[]> {
    const conditions = ownerId ? [eq(learningGoals.ownerId, ownerId)] : [];
    return await db.query.learningGoals.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(learningGoals.updatedAt)],
    });
  }

  static async getLearningGoalById(id: string, ownerId?: string): Promise<LearningGoal> {
    const conditions = [eq(learningGoals.id, id)];
    if (ownerId) conditions.push(eq(learningGoals.ownerId, ownerId));

    const goal = await db.query.learningGoals.findFirst({
      where: and(...conditions),
    });
    if (!goal) throw new NotFoundError('Learning Goal', id);
    return goal;
  }

  static async createLearningGoal(input: LearningGoalFormInput, ownerId: string, actorId?: string) {
    const progress = typeof input.progress === 'number' ? input.progress : 0;
    const priority = input.priority || 'medium';

    return await db.transaction(async (tx) => {
      const [newGoal] = await tx
        .insert(learningGoals)
        .values({
          ownerId,
          title: input.title,
          description: input.description || null,
          status: input.status || 'planned',
          priority,
          progress,
          targetDate: input.targetDate || null,
          startedAt: input.startedAt || null,
          completedAt: input.completedAt || null,
        })
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'LEARNING_GOAL_CREATE',
        entityType: 'learning_goal',
        entityId: newGoal.id,
        newValues: newGoal,
      });

      return newGoal;
    });
  }

  static async updateLearningGoal(
    id: string,
    input: Partial<LearningGoalFormInput>,
    ownerId: string,
    actorId?: string
  ) {
    const existing = await db.query.learningGoals.findFirst({
      where: and(eq(learningGoals.id, id), eq(learningGoals.ownerId, ownerId)),
    });
    if (!existing) throw new NotFoundError('Learning Goal', id);

    const progress = input.progress !== undefined ? (typeof input.progress === 'number' ? input.progress : 0) : existing.progress;
    const priority = input.priority !== undefined ? input.priority : existing.priority;

    return await db.transaction(async (tx) => {
      const [updatedGoal] = await tx
        .update(learningGoals)
        .set({
          title: input.title !== undefined ? input.title : existing.title,
          description: input.description !== undefined ? input.description : existing.description,
          status: input.status !== undefined ? input.status : existing.status,
          priority,
          progress,
          targetDate: input.targetDate !== undefined ? input.targetDate : existing.targetDate,
          startedAt: input.startedAt !== undefined ? input.startedAt : existing.startedAt,
          completedAt: input.completedAt !== undefined ? input.completedAt : existing.completedAt,
          updatedAt: new Date(),
        })
        .where(and(eq(learningGoals.id, id), eq(learningGoals.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'LEARNING_GOAL_UPDATE',
        entityType: 'learning_goal',
        entityId: id,
        oldValues: existing,
        newValues: updatedGoal,
      });

      return updatedGoal;
    });
  }

  static async deleteLearningGoal(id: string, ownerId: string, actorId?: string) {
    const existing = await db.query.learningGoals.findFirst({
      where: and(eq(learningGoals.id, id), eq(learningGoals.ownerId, ownerId)),
    });
    if (!existing) throw new NotFoundError('Learning Goal', id);

    return await db.transaction(async (tx) => {
      await tx.delete(learningGoals).where(and(eq(learningGoals.id, id), eq(learningGoals.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'LEARNING_GOAL_DELETE',
        entityType: 'learning_goal',
        entityId: id,
        oldValues: existing,
      });
    });
  }
}
