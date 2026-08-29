'use server';

import { requireOwnerSession } from '@/lib/auth';
import { CareerExperienceFormSchema, OrganizationFormSchema } from '@/validations/career';
import { CareerService } from '@/services/career.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  actionSuccess,
  actionFailure,
  actionFieldErr,
  fromError,
  type ActionResult,
} from '@/lib/action-result';

export async function createCareerExperienceAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = CareerExperienceFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    const exp = await CareerService.createCareerExperience(session.userId, parsed.data, session.userId);
    revalidatePath('/admin/career');
    revalidatePath('/os/career');
    revalidatePath('/about');
    revalidatePath('/');
    redirect(`/admin/career?created=${encodeURIComponent(exp.position)}`);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || (err instanceof Error && err.message === 'NEXT_REDIRECT')) {
      throw err;
    }
    return fromError(err);
  }
}

export async function updateCareerExperienceAction(
  id: string,
  rawInput: unknown
): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = CareerExperienceFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    await CareerService.updateCareerExperience(session.userId, id, parsed.data, session.userId);
    revalidatePath('/admin/career');
    revalidatePath('/os/career');
    revalidatePath('/about');
    revalidatePath('/');
    redirect('/admin/career?updated=true');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || (err instanceof Error && err.message === 'NEXT_REDIRECT')) {
      throw err;
    }
    return fromError(err);
  }
}

export async function archiveCareerExperienceAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await CareerService.archiveCareerExperience(session.userId, id, session.userId);
    revalidatePath('/admin/career');
    revalidatePath('/os/career');
    revalidatePath('/about');
    revalidatePath('/');
    return actionSuccess({ archived: true });
  } catch (err) {
    return fromError(err);
  }
}

export async function deleteCareerExperienceAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await CareerService.deleteCareerExperience(session.userId, id, session.userId);
    revalidatePath('/admin/career');
    revalidatePath('/os/career');
    revalidatePath('/about');
    revalidatePath('/');
    return actionSuccess({ deleted: true });
  } catch (err) {
    return fromError(err);
  }
}

export async function createOrganizationAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = OrganizationFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    const org = await CareerService.createOrganization(session.userId, parsed.data, session.userId);
    revalidatePath('/admin/career');
    revalidatePath('/os/career');
    return actionSuccess(org);
  } catch (err) {
    return fromError(err);
  }
}
