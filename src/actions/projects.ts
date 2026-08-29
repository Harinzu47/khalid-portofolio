'use server';

import { requireOwnerSession } from '@/lib/auth';
import { ProjectFormSchema } from '@/validations/project';
import { ProjectsService } from '@/services/projects.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  type ActionResult,
  actionFieldErr,
  actionOk,
  actionSuccess,
  fromError,
} from '@/lib/action-result';

export async function createProjectAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = ProjectFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    const project = await ProjectsService.createProject(session.userId, parsed.data, session.userId);
    revalidatePath('/admin/projects');
    revalidatePath('/os/projects');
    revalidatePath('/projects');
    revalidatePath('/');
    redirect(`/admin/projects?created=${encodeURIComponent(project.title)}`);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || (err instanceof Error && err.message === 'NEXT_REDIRECT')) {
      throw err;
    }
    return fromError(err);
  }
}

export async function updateProjectAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = ProjectFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return actionFieldErr(parsed.error.flatten().fieldErrors);
  }

  try {
    await ProjectsService.updateProject(session.userId, id, parsed.data, session.userId);
    revalidatePath('/admin/projects');
    revalidatePath('/os/projects');
    revalidatePath('/projects');
    revalidatePath(`/projects/${parsed.data.slug || ''}`);
    revalidatePath('/');
    redirect('/admin/projects?updated=true');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || (err instanceof Error && err.message === 'NEXT_REDIRECT')) {
      throw err;
    }
    return fromError(err);
  }
}

export async function archiveProjectAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await ProjectsService.archiveProject(session.userId, id, session.userId);
    revalidatePath('/admin/projects');
    revalidatePath('/os/projects');
    revalidatePath('/projects');
    revalidatePath('/');
    return actionSuccess({ archived: true });
  } catch (err) {
    return fromError(err);
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await ProjectsService.deleteProject(session.userId, id, session.userId);
    revalidatePath('/admin/projects');
    revalidatePath('/os/projects');
    revalidatePath('/projects');
    revalidatePath('/');
    return actionOk();
  } catch (err) {
    return fromError(err);
  }
}
