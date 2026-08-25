'use server';

import { requireAuth } from '@/lib/auth';
import { NoteFormSchema } from '@/validations/note';
import { NotesService } from '@/services/notes.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createNoteAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/notes/new');

  const parsed = NoteFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const note = await NotesService.createNote(parsed.data, session.userId);
    revalidatePath('/admin/notes');
    revalidatePath('/notes');
    revalidatePath('/');
    redirect(`/admin/notes?created=${encodeURIComponent(note.title)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create note.',
    };
  }
}

export async function updateNoteAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/notes/${id}/edit`);

  const parsed = NoteFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await NotesService.updateNote(id, parsed.data, session.userId);
    revalidatePath('/admin/notes');
    revalidatePath('/notes');
    revalidatePath(`/notes/${parsed.data.slug || ''}`);
    revalidatePath('/');
    redirect('/admin/notes?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update note.',
    };
  }
}

export async function deleteNoteAction(id: string, permanent = false): Promise<ActionResult> {
  const session = await requireAuth('/admin/notes');

  try {
    await NotesService.deleteNote(id, session.userId, permanent);
    revalidatePath('/admin/notes');
    revalidatePath('/notes');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete note.',
    };
  }
}
