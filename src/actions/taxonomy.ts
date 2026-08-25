'use server';

import { requireAuth } from '@/lib/auth';
import { SkillFormSchema, TechnologyFormSchema } from '@/validations/taxonomy';
import { TaxonomyService } from '@/services/taxonomy.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

// ==============================================================================
// 1. SKILLS ACTIONS
// ==============================================================================

export async function createSkillAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/skills/new');

  const parsed = SkillFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const skill = await TaxonomyService.createSkill(parsed.data, session.userId);
    revalidatePath('/admin/skills');
    revalidatePath('/admin/projects/new');
    revalidatePath('/');
    redirect(`/admin/skills?created=${encodeURIComponent(skill.name)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create skill.',
    };
  }
}

export async function updateSkillAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/skills/${id}/edit`);

  const parsed = SkillFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await TaxonomyService.updateSkill(id, parsed.data, session.userId);
    revalidatePath('/admin/skills');
    revalidatePath('/admin/projects/new');
    revalidatePath('/');
    redirect('/admin/skills?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update skill.',
    };
  }
}

export async function deleteSkillAction(id: string): Promise<ActionResult> {
  const session = await requireAuth('/admin/skills');

  try {
    await TaxonomyService.deleteSkill(id, session.userId);
    revalidatePath('/admin/skills');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete skill.',
    };
  }
}

// ==============================================================================
// 2. TECHNOLOGIES ACTIONS
// ==============================================================================

export async function createTechnologyAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/technologies/new');

  const parsed = TechnologyFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const tech = await TaxonomyService.createTechnology(parsed.data, session.userId);
    revalidatePath('/admin/technologies');
    revalidatePath('/admin/projects/new');
    revalidatePath('/admin/journal/new');
    revalidatePath('/');
    redirect(`/admin/technologies?created=${encodeURIComponent(tech.name)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create technology.',
    };
  }
}

export async function updateTechnologyAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/technologies/${id}/edit`);

  const parsed = TechnologyFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await TaxonomyService.updateTechnology(id, parsed.data, session.userId);
    revalidatePath('/admin/technologies');
    revalidatePath('/admin/projects/new');
    revalidatePath('/admin/journal/new');
    revalidatePath('/');
    redirect('/admin/technologies?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update technology.',
    };
  }
}

export async function deleteTechnologyAction(id: string): Promise<ActionResult> {
  const session = await requireAuth('/admin/technologies');

  try {
    await TaxonomyService.deleteTechnology(id, session.userId);
    revalidatePath('/admin/technologies');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete technology.',
    };
  }
}

// ==============================================================================
// 3. TAGS ACTIONS
// ==============================================================================

export async function deleteTagAction(id: string): Promise<ActionResult> {
  const session = await requireAuth('/admin/settings');

  try {
    await TaxonomyService.deleteTag(id, session.userId);
    revalidatePath('/admin/settings');
    revalidatePath('/articles');
    revalidatePath('/journal');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete tag.',
    };
  }
}
