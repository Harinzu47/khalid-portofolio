'use server';

import { requireAuth } from '@/lib/auth';
import { JournalFormSchema } from '@/validations/journal';
import { JournalService } from '@/services/journal.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createJournalAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/journal/new');

  const parsed = JournalFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const entry = await JournalService.createJournalEntry(parsed.data, session.userId);
    revalidatePath('/admin/journal');
    revalidatePath('/journal');
    revalidatePath('/');
    redirect(`/admin/journal?created=${encodeURIComponent(entry.title)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create journal entry.',
    };
  }
}

export async function updateJournalAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/journal/${id}/edit`);

  const parsed = JournalFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await JournalService.updateJournalEntry(id, parsed.data, session.userId);
    revalidatePath('/admin/journal');
    revalidatePath('/journal');
    revalidatePath(`/journal/${parsed.data.slug || ''}`);
    revalidatePath('/');
    redirect('/admin/journal?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update journal entry.',
    };
  }
}

export async function deleteJournalAction(id: string, permanent = false): Promise<ActionResult> {
  const session = await requireAuth('/admin/journal');

  try {
    await JournalService.deleteJournalEntry(id, session.userId, permanent);
    revalidatePath('/admin/journal');
    revalidatePath('/journal');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete journal entry.',
    };
  }
}
