'use server';

import { requireAuth } from '@/lib/auth';
import { CareerExperienceFormSchema, OrganizationFormSchema } from '@/validations/career';
import { CareerService } from '@/services/career.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createCareerExperienceAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/career/new');

  const parsed = CareerExperienceFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const exp = await CareerService.createCareerExperience(parsed.data, session.userId);
    revalidatePath('/admin/career');
    revalidatePath('/about');
    revalidatePath('/');
    redirect(`/admin/career?created=${encodeURIComponent(exp.position)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create career experience.',
    };
  }
}

export async function updateCareerExperienceAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/career/${id}/edit`);

  const parsed = CareerExperienceFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await CareerService.updateCareerExperience(id, parsed.data, session.userId);
    revalidatePath('/admin/career');
    revalidatePath('/about');
    revalidatePath('/');
    redirect('/admin/career?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update career experience.',
    };
  }
}

export async function deleteCareerExperienceAction(id: string, permanent = false): Promise<ActionResult> {
  const session = await requireAuth('/admin/career');

  try {
    await CareerService.deleteCareerExperience(id, session.userId, permanent);
    revalidatePath('/admin/career');
    revalidatePath('/about');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete career experience.',
    };
  }
}

export async function createOrganizationAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/career');

  const parsed = OrganizationFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid organization data.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await CareerService.createOrganization(parsed.data, session.userId);
    revalidatePath('/admin/career');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create organization.',
    };
  }
}
