'use server';

import { requireAuth } from '@/lib/auth';
import { SettingsService } from '@/services/settings.service';
import {
  ProfileFormSchema,
  SocialLinkFormSchema,
} from '@/validations/settings';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './auth';

export async function updateProfileAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/settings');
  const parsed = ProfileFormSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const updated = await SettingsService.updateOperatorProfile(parsed.data, session.userId);
    revalidatePath('/admin/settings');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update profile.',
    };
  }
}

export async function upsertSocialLinkAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/settings');
  const parsed = SocialLinkFormSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const link = await SettingsService.upsertSocialLink(parsed.data, session.userId);
    revalidatePath('/admin/settings');
    revalidatePath('/');
    return { success: true, data: link };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save social link.',
    };
  }
}

export async function deleteSocialLinkAction(id: string): Promise<ActionResult> {
  const session = await requireAuth('/admin/settings');

  try {
    await SettingsService.deleteSocialLink(id, session.userId);
    revalidatePath('/admin/settings');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete social link.',
    };
  }
}

export async function exportDatabaseBackupAction(): Promise<ActionResult> {
  await requireAuth('/admin/settings');

  try {
    const backup = await SettingsService.exportFullDatabase();
    return { success: true, data: backup };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate backup.',
    };
  }
}
