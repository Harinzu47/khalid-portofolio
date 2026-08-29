'use server';

import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { NowService } from '@/services/now.service';
import {
  NowEntryFormSchema,
  NowQuickAddSchema,
  type NowEntryFormInput,
  type NowQuickAddInput,
} from '@/validations/now';
import type {
  ActionResult,
  NowEntryEditorDTO,
} from '@/types/dtos';

export async function createNowEntryAction(
  input: NowEntryFormInput
): Promise<ActionResult<NowEntryEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = NowEntryFormSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await NowService.createNowEntry(session.userId, validated.data, session.userId);
    revalidatePath('/admin/now');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create now entry.',
    };
  }
}

export async function quickAddNowAction(
  input: NowQuickAddInput
): Promise<ActionResult<NowEntryEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = NowQuickAddSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await NowService.quickAddNow(session.userId, validated.data, session.userId);
    revalidatePath('/admin/now');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to quick add now entry.',
    };
  }
}

export async function updateNowEntryAction(
  id: string,
  input: Partial<NowEntryFormInput>
): Promise<ActionResult<NowEntryEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = NowEntryFormSchema.partial().safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await NowService.updateNowEntry(session.userId, id, validated.data, session.userId);
    revalidatePath('/admin/now');
    revalidatePath(`/admin/now/${id}/edit`);
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update now entry.',
    };
  }
}

export async function completeNowEntryAction(
  id: string
): Promise<ActionResult<NowEntryEditorDTO>> {
  const session = await requireOwnerSession();

  try {
    const data = await NowService.completeNowEntry(session.userId, id, session.userId);
    revalidatePath('/admin/now');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to complete now entry.',
    };
  }
}

export async function archiveNowEntryAction(
  id: string
): Promise<ActionResult<void>> {
  const session = await requireOwnerSession();

  try {
    await NowService.archiveNowEntry(session.userId, id, session.userId);
    revalidatePath('/admin/now');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to archive now entry.',
    };
  }
}

/**
 * @deprecated Use archiveNowEntryAction instead.
 */
export async function deleteNowEntryAction(
  id: string
): Promise<ActionResult<void>> {
  return archiveNowEntryAction(id);
}
