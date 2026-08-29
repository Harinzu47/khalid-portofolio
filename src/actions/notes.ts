'use server';

import { requireOwnerSession } from '@/lib/auth';
import { TechNoteFormSchema } from '@/validations/note';
import { TechNoteService } from '@/services/notes.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createNoteAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = TechNoteFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const note = await TechNoteService.createTechNote(session.userId, parsed.data);
    revalidatePath('/admin/notes');
    revalidatePath('/admin/knowledge');
    revalidatePath('/notes');
    revalidatePath('/');
    redirect(`/admin/notes?created=${encodeURIComponent(note.title)}`);
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create note.',
    };
  }
}

export async function updateNoteAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = TechNoteFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await TechNoteService.updateTechNote(session.userId, id, parsed.data);
    revalidatePath('/admin/notes');
    revalidatePath('/admin/knowledge');
    revalidatePath('/notes');
    revalidatePath(`/notes/${parsed.data.slug || ''}`);
    revalidatePath('/');
    redirect('/admin/notes?updated=true');
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update note.',
    };
  }
}

export async function archiveNoteAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TechNoteService.archiveTechNote(session.userId, id);
    revalidatePath('/admin/notes');
    revalidatePath('/admin/knowledge');
    revalidatePath('/notes');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to archive note.',
    };
  }
}

/**
 * @deprecated Use archiveNoteAction instead.
 */
export async function deleteNoteAction(id: string, _hardDelete?: boolean): Promise<ActionResult> {
  return archiveNoteAction(id);
}
