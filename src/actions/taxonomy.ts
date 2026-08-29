'use server';

import { requireOwnerSession } from '@/lib/auth';
import {
  SkillFormSchema,
  DomainFormSchema,
  TechnologyFormSchema,
  TagFormSchema,
} from '@/validations/taxonomy';
import { TaxonomyService } from '@/services/taxonomy.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { actionSuccess, actionFailure, actionFieldErr, type ActionResult } from '@/lib/action-result';

// ==============================================================================
// 1. SKILLS ACTIONS
// ==============================================================================

export async function createSkillAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = SkillFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    const skill = await TaxonomyService.createSkill(session.userId, parsed.data, session.userId);
    revalidatePath('/admin/skills');
    revalidatePath('/admin/projects/new');
    revalidatePath('/');
    redirect(`/admin/skills?created=${encodeURIComponent(skill.name)}`);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return actionFailure(err instanceof Error ? err.message : 'Failed to create skill.');
  }
}

export async function updateSkillAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = SkillFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    await TaxonomyService.updateSkill(session.userId, id, parsed.data, session.userId);
    revalidatePath('/admin/skills');
    revalidatePath('/admin/projects/new');
    revalidatePath('/');
    redirect('/admin/skills?updated=true');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return actionFailure(err instanceof Error ? err.message : 'Failed to update skill.');
  }
}

export async function archiveSkillAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TaxonomyService.archiveSkill(session.userId, id, session.userId);
    revalidatePath('/admin/skills');
    revalidatePath('/');
    return actionSuccess({ archived: true });
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to archive skill.');
  }
}

export async function deleteSkillAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TaxonomyService.deleteSkill(session.userId, id, session.userId);
    revalidatePath('/admin/skills');
    revalidatePath('/');
    return actionSuccess({ deleted: true });
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to delete skill.');
  }
}

// ==============================================================================
// 2. DOMAINS ACTIONS
// ==============================================================================

export async function createDomainAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = DomainFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    const domain = await TaxonomyService.createDomain(session.userId, parsed.data, session.userId);
    revalidatePath('/admin/domains');
    revalidatePath('/admin/projects/new');
    revalidatePath('/');
    redirect(`/admin/domains?created=${encodeURIComponent(domain.name)}`);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return actionFailure(err instanceof Error ? err.message : 'Failed to create domain.');
  }
}

export async function updateDomainAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = DomainFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    await TaxonomyService.updateDomain(session.userId, id, parsed.data, session.userId);
    revalidatePath('/admin/domains');
    revalidatePath('/admin/projects/new');
    revalidatePath('/');
    redirect('/admin/domains?updated=true');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return actionFailure(err instanceof Error ? err.message : 'Failed to update domain.');
  }
}

export async function archiveDomainAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TaxonomyService.archiveDomain(session.userId, id, session.userId);
    revalidatePath('/admin/domains');
    revalidatePath('/');
    return actionSuccess({ archived: true });
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to archive domain.');
  }
}

export async function deleteDomainAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TaxonomyService.deleteDomain(session.userId, id, session.userId);
    revalidatePath('/admin/domains');
    revalidatePath('/');
    return actionSuccess({ deleted: true });
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to delete domain.');
  }
}

// ==============================================================================
// 3. TECHNOLOGIES ACTIONS
// ==============================================================================

export async function createTechnologyAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = TechnologyFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    const tech = await TaxonomyService.createTechnology(session.userId, parsed.data, session.userId);
    revalidatePath('/admin/technologies');
    revalidatePath('/admin/projects/new');
    revalidatePath('/admin/journal/new');
    revalidatePath('/');
    redirect(`/admin/technologies?created=${encodeURIComponent(tech.name)}`);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return actionFailure(err instanceof Error ? err.message : 'Failed to create technology.');
  }
}

export async function updateTechnologyAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = TechnologyFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    await TaxonomyService.updateTechnology(session.userId, id, parsed.data, session.userId);
    revalidatePath('/admin/technologies');
    revalidatePath('/admin/projects/new');
    revalidatePath('/admin/journal/new');
    revalidatePath('/');
    redirect('/admin/technologies?updated=true');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return actionFailure(err instanceof Error ? err.message : 'Failed to update technology.');
  }
}

export async function archiveTechnologyAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TaxonomyService.archiveTechnology(session.userId, id, session.userId);
    revalidatePath('/admin/technologies');
    revalidatePath('/');
    return actionSuccess({ archived: true });
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to archive technology.');
  }
}

export async function deleteTechnologyAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TaxonomyService.deleteTechnology(session.userId, id, session.userId);
    revalidatePath('/admin/technologies');
    revalidatePath('/');
    return actionSuccess({ deleted: true });
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to delete technology.');
  }
}

// ==============================================================================
// 4. TAGS ACTIONS
// ==============================================================================

export async function createTagAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = TagFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    const tag = await TaxonomyService.createTag(session.userId, parsed.data, session.userId);
    revalidatePath('/admin/tags');
    revalidatePath('/admin/settings');
    return actionSuccess(tag);
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to create tag.');
  }
}

export async function updateTagAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = TagFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    const tag = await TaxonomyService.updateTag(session.userId, id, parsed.data, session.userId);
    revalidatePath('/admin/tags');
    revalidatePath('/admin/settings');
    return actionSuccess(tag);
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to update tag.');
  }
}

export async function archiveTagAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TaxonomyService.archiveTag(session.userId, id, session.userId);
    revalidatePath('/admin/tags');
    return actionSuccess({ archived: true });
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to archive tag.');
  }
}

export async function deleteTagAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await TaxonomyService.deleteTag(session.userId, id, session.userId);
    revalidatePath('/admin/tags');
    revalidatePath('/admin/settings');
    return actionSuccess({ deleted: true });
  } catch (err) {
    return actionFailure(err instanceof Error ? err.message : 'Failed to delete tag.');
  }
}
