'use server';

import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { LearningPathService } from '@/services/learning-path.service';
import {
  LearningPathFormSchema,
  type LearningPathFormInput,
} from '@/validations/learning-path';
import type { ActionResult, LearningPathEditorDTO, LearningPathStatus } from '@/types/dtos';

export async function createLearningPathAction(
  input: LearningPathFormInput
): Promise<ActionResult<LearningPathEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = LearningPathFormSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await LearningPathService.createLearningPath(session.userId, validated.data, session.userId);
    revalidatePath('/admin/learning/paths');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create learning path.',
    };
  }
}

export async function updateLearningPathAction(
  id: string,
  input: Partial<LearningPathFormInput>
): Promise<ActionResult<LearningPathEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = LearningPathFormSchema.partial().safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await LearningPathService.updateLearningPath(session.userId, id, validated.data, session.userId);
    revalidatePath('/admin/learning/paths');
    revalidatePath(`/admin/learning/paths/${id}/edit`);
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update learning path.',
    };
  }
}

export async function setLearningPathStatusAction(
  id: string,
  status: LearningPathStatus
): Promise<ActionResult<LearningPathEditorDTO>> {
  const session = await requireOwnerSession();

  try {
    const data = await LearningPathService.setLearningPathStatus(session.userId, id, status, session.userId);
    revalidatePath('/admin/learning/paths');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update status.',
    };
  }
}

export async function archiveLearningPathAction(
  id: string
): Promise<ActionResult<void>> {
  const session = await requireOwnerSession();

  try {
    await LearningPathService.archiveLearningPath(session.userId, id, session.userId);
    revalidatePath('/admin/learning/paths');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to archive learning path.',
    };
  }
}

/**
 * @deprecated Use archiveLearningPathAction instead.
 */
export async function deleteLearningPathAction(
  id: string
): Promise<ActionResult<void>> {
  return archiveLearningPathAction(id);
}
