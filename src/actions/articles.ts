'use server';

import { requireAuth } from '@/lib/auth';
import { ArticleFormSchema } from '@/validations/article';
import { ArticlesService } from '@/services/articles.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createArticleAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/articles/new');

  const parsed = ArticleFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const article = await ArticlesService.createArticle(parsed.data, session.userId);
    revalidatePath('/admin/articles');
    revalidatePath('/articles');
    revalidatePath('/');
    redirect(`/admin/articles?created=${encodeURIComponent(article.title)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create article.',
    };
  }
}

export async function updateArticleAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/articles/${id}/edit`);

  const parsed = ArticleFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await ArticlesService.updateArticle(id, parsed.data, session.userId);
    revalidatePath('/admin/articles');
    revalidatePath('/articles');
    revalidatePath(`/articles/${parsed.data.slug || ''}`);
    revalidatePath('/');
    redirect('/admin/articles?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update article.',
    };
  }
}

export async function deleteArticleAction(id: string, permanent = false): Promise<ActionResult> {
  const session = await requireAuth('/admin/articles');

  try {
    await ArticlesService.deleteArticle(id, session.userId, permanent);
    revalidatePath('/admin/articles');
    revalidatePath('/articles');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete article.',
    };
  }
}
