'use server';

import { requireOwnerSession } from '@/lib/auth';
import { ADRFormSchema } from '@/validations/adrs';
import { ADRService } from '@/services/adrs.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createADRAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = ADRFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const adr = await ADRService.createADR(session.userId, parsed.data);
    revalidatePath('/admin/adrs');
    revalidatePath('/admin/knowledge');
    revalidatePath('/');
    redirect(`/admin/adrs?created=${encodeURIComponent(adr.title)}`);
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create ADR.',
    };
  }
}

export async function updateADRAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = ADRFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await ADRService.updateADR(session.userId, id, parsed.data);
    revalidatePath('/admin/adrs');
    revalidatePath('/admin/knowledge');
    revalidatePath('/');
    redirect('/admin/adrs?updated=true');
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update ADR.',
    };
  }
}

export async function archiveADRAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await ADRService.archiveADR(session.userId, id);
    revalidatePath('/admin/adrs');
    revalidatePath('/admin/knowledge');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to archive ADR.',
    };
  }
}

/**
 * @deprecated Use archiveADRAction instead. Knowledge content uses soft-archive only.
 */
export async function deleteADRAction(id: string): Promise<ActionResult> {
  return archiveADRAction(id);
}
