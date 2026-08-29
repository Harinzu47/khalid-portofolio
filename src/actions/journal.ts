'use server';

import { requireOwnerSession } from '@/lib/auth';
import {
  JournalFormSchema,
  JournalQuickCaptureSchema,
  JournalExtractionSchema,
} from '@/validations/journal';
import { JournalService } from '@/services/journal.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/lib/action-result';
import type { ExtractionResultDTO } from '@/types/dtos';

export async function quickCaptureJournalAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = JournalQuickCaptureSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the input errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const entry = await JournalService.quickCapture(session.userId, parsed.data);
    revalidatePath('/admin/journal');
    revalidatePath('/admin/knowledge');
    revalidatePath('/journal');
    revalidatePath('/');
    return {
      success: true,
      data: entry,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to capture journal log.',
    };
  }
}

export async function createJournalAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = JournalFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const entry = await JournalService.createJournalEntry(session.userId, parsed.data);
    revalidatePath('/admin/journal');
    revalidatePath('/admin/knowledge');
    revalidatePath('/journal');
    revalidatePath('/');
    redirect(`/admin/journal?created=${encodeURIComponent(entry.title)}`);
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create journal entry.',
    };
  }
}

export async function updateJournalAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = JournalFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await JournalService.updateJournalEntry(session.userId, id, parsed.data);
    revalidatePath('/admin/journal');
    revalidatePath('/admin/knowledge');
    revalidatePath('/journal');
    revalidatePath(`/journal/${parsed.data.slug || ''}`);
    revalidatePath('/');
    redirect('/admin/journal?updated=true');
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update journal entry.',
    };
  }
}

export async function archiveJournalAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await JournalService.archiveJournalEntry(session.userId, id);
    revalidatePath('/admin/journal');
    revalidatePath('/admin/knowledge');
    revalidatePath('/journal');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to archive journal entry.',
    };
  }
}

/**
 * @deprecated Use archiveJournalAction instead.
 */
export async function deleteJournalAction(id: string, _hardDelete?: boolean): Promise<ActionResult> {
  return archiveJournalAction(id);
}

// ==============================================================================
// EXTRACTION ACTIONS (Amendments 6, 7, 8, 9, 10)
// ==============================================================================

export async function extractJournalToTechNoteAction(
  journalId: string,
  rawOverrides?: unknown
): Promise<ActionResult<ExtractionResultDTO>> {
  const session = await requireOwnerSession();

  const parsed = JournalExtractionSchema.partial().safeParse(rawOverrides || {});
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid extraction overrides.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await JournalService.extractToTechNote(session.userId, journalId, parsed.data);
    revalidatePath('/admin/notes');
    revalidatePath('/admin/knowledge');
    revalidatePath('/admin/journal');
    return {
      success: true,
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to extract journal to Tech Note.',
    };
  }
}

export async function extractJournalToArticleAction(
  journalId: string,
  rawOverrides?: unknown
): Promise<ActionResult<ExtractionResultDTO>> {
  const session = await requireOwnerSession();

  const parsed = JournalExtractionSchema.partial().safeParse(rawOverrides || {});
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid extraction overrides.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await JournalService.extractToArticle(session.userId, journalId, parsed.data);
    revalidatePath('/admin/articles');
    revalidatePath('/admin/knowledge');
    revalidatePath('/admin/journal');
    return {
      success: true,
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to extract journal to Article.',
    };
  }
}

export async function extractJournalToADRAction(
  journalId: string,
  rawOverrides?: unknown
): Promise<ActionResult<ExtractionResultDTO>> {
  const session = await requireOwnerSession();

  const parsed = JournalExtractionSchema.partial().safeParse(rawOverrides || {});
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid extraction overrides.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await JournalService.extractToADR(session.userId, journalId, parsed.data);
    revalidatePath('/admin/adrs');
    revalidatePath('/admin/knowledge');
    revalidatePath('/admin/journal');
    return {
      success: true,
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to extract journal to ADR.',
    };
  }
}
