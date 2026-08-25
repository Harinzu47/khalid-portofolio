'use server';

import { requireAuth } from '@/lib/auth';
import { LearningGoalFormSchema, RoadmapItemFormSchema } from '@/validations/roadmap';
import { RoadmapService } from '@/services/roadmap.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

// ==============================================================================
// 1. LEARNING GOALS ACTIONS
// ==============================================================================

export async function createLearningGoalAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/learning-goals/new');

  const parsed = LearningGoalFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const goal = await RoadmapService.createLearningGoal(parsed.data, session.userId);
    revalidatePath('/admin/learning-goals');
    revalidatePath('/admin/roadmap');
    revalidatePath('/roadmap');
    revalidatePath('/');
    redirect(`/admin/learning-goals?created=${encodeURIComponent(goal.title)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create learning goal.',
    };
  }
}

export async function updateLearningGoalAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/learning-goals/${id}/edit`);

  const parsed = LearningGoalFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await RoadmapService.updateLearningGoal(id, parsed.data, session.userId);
    revalidatePath('/admin/learning-goals');
    revalidatePath('/admin/roadmap');
    revalidatePath('/roadmap');
    revalidatePath('/');
    redirect('/admin/learning-goals?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update learning goal.',
    };
  }
}

export async function deleteLearningGoalAction(id: string): Promise<ActionResult> {
  const session = await requireAuth('/admin/learning-goals');

  try {
    await RoadmapService.deleteLearningGoal(id, session.userId);
    revalidatePath('/admin/learning-goals');
    revalidatePath('/admin/roadmap');
    revalidatePath('/roadmap');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete learning goal.',
    };
  }
}

// ==============================================================================
// 2. ROADMAP ITEMS ACTIONS
// ==============================================================================

export async function createRoadmapItemAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/roadmap/new');

  const parsed = RoadmapItemFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const item = await RoadmapService.createRoadmapItem(parsed.data, session.userId);
    revalidatePath('/admin/roadmap');
    revalidatePath('/roadmap');
    revalidatePath('/');
    redirect(`/admin/roadmap?created=${encodeURIComponent(item.title)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create roadmap item.',
    };
  }
}

export async function updateRoadmapItemAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/roadmap/${id}/edit`);

  const parsed = RoadmapItemFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await RoadmapService.updateRoadmapItem(id, parsed.data, session.userId);
    revalidatePath('/admin/roadmap');
    revalidatePath('/roadmap');
    revalidatePath('/');
    redirect('/admin/roadmap?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update roadmap item.',
    };
  }
}

export async function deleteRoadmapItemAction(id: string): Promise<ActionResult> {
  const session = await requireAuth('/admin/roadmap');

  try {
    await RoadmapService.deleteRoadmapItem(id, session.userId);
    revalidatePath('/admin/roadmap');
    revalidatePath('/roadmap');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete roadmap item.',
    };
  }
}
