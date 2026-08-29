'use server';

import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { RoadmapService } from '@/services/roadmap.service';
import { LegacyLearningGoalsService } from '@/services/legacy-learning-goals.service';
import {
  RoadmapItemFormSchema,
  RoadmapReorderSchema,
  LearningGoalFormSchema,
  type RoadmapItemFormInput,
  type RoadmapReorderInput,
  type LearningGoalFormInput,
} from '@/validations/roadmap';
import type { ActionResult, RoadmapEditorDTO } from '@/types/dtos';

export async function createRoadmapItemAction(
  input: RoadmapItemFormInput
): Promise<ActionResult<RoadmapEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = RoadmapItemFormSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await RoadmapService.createRoadmapItem(session.userId, validated.data, session.userId);
    revalidatePath('/admin/roadmap');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create roadmap item.',
    };
  }
}

export async function updateRoadmapItemAction(
  id: string,
  input: Partial<RoadmapItemFormInput>
): Promise<ActionResult<RoadmapEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = RoadmapItemFormSchema.partial().safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await RoadmapService.updateRoadmapItem(session.userId, id, validated.data, session.userId);
    revalidatePath('/admin/roadmap');
    revalidatePath(`/admin/roadmap/${id}/edit`);
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update roadmap item.',
    };
  }
}

export async function reorderRoadmapItemsAction(
  items: RoadmapReorderInput
): Promise<ActionResult<void>> {
  const session = await requireOwnerSession();

  const validated = RoadmapReorderSchema.safeParse(items);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid reorder payload.',
    };
  }

  try {
    await RoadmapService.reorderRoadmapItems(session.userId, validated.data, session.userId);
    revalidatePath('/admin/roadmap');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reorder roadmap items.',
    };
  }
}

export async function archiveRoadmapItemAction(
  id: string
): Promise<ActionResult<void>> {
  const session = await requireOwnerSession();

  try {
    await RoadmapService.archiveRoadmapItem(session.userId, id, session.userId);
    revalidatePath('/admin/roadmap');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to archive roadmap item.',
    };
  }
}

/**
 * @deprecated Use archiveRoadmapItemAction instead.
 */
export async function deleteRoadmapItemAction(
  id: string
): Promise<ActionResult<void>> {
  return archiveRoadmapItemAction(id);
}

// ----------------------------------------------------
// Isolated Legacy Learning Goals Actions (Amendment 1)
// ----------------------------------------------------

export async function createLearningGoalAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = LearningGoalFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const goal = await LegacyLearningGoalsService.createLearningGoal(parsed.data, session.userId, session.userId);
    revalidatePath('/admin/learning-goals');
    revalidatePath('/admin');
    return { success: true, data: goal };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create learning goal.',
    };
  }
}

export async function updateLearningGoalAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = LearningGoalFormSchema.partial().safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const goal = await LegacyLearningGoalsService.updateLearningGoal(id, parsed.data, session.userId, session.userId);
    revalidatePath('/admin/learning-goals');
    revalidatePath(`/admin/learning-goals/${id}/edit`);
    revalidatePath('/admin');
    return { success: true, data: goal };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update learning goal.',
    };
  }
}

export async function deleteLearningGoalAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await LegacyLearningGoalsService.deleteLearningGoal(id, session.userId, session.userId);
    revalidatePath('/admin/learning-goals');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete learning goal.',
    };
  }
}
