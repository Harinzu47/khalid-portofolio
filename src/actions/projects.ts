'use server';

import { requireAuth } from '@/lib/auth';
import { ProjectFormSchema } from '@/validations/project';
import { ProjectsService } from '@/services/projects.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createProjectAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/projects/new');

  const parsed = ProjectFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const project = await ProjectsService.createProject(parsed.data, session.userId);
    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath('/');
    redirect(`/admin/projects?created=${encodeURIComponent(project.title)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create project.',
    };
  }
}

export async function updateProjectAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/projects/${id}/edit`);

  const parsed = ProjectFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await ProjectsService.updateProject(id, parsed.data, session.userId);
    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath(`/projects/${parsed.data.slug || ''}`);
    revalidatePath('/');
    redirect('/admin/projects?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update project.',
    };
  }
}

export async function deleteProjectAction(id: string, permanent = false): Promise<ActionResult> {
  const session = await requireAuth('/admin/projects');

  try {
    await ProjectsService.deleteProject(id, session.userId, permanent);
    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete project.',
    };
  }
}
