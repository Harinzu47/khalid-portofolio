'use server';

import { requireOwnerSession } from '@/lib/auth';
import { ArticleFormSchema } from '@/validations/article';
import { ArticlesService } from '@/services/articles.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createArticleAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = ArticleFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const article = await ArticlesService.createArticle(session.userId, parsed.data);
    revalidatePath('/admin/articles');
    revalidatePath('/admin/knowledge');
    revalidatePath('/articles');
    revalidatePath('/');
    redirect(`/admin/articles?created=${encodeURIComponent(article.title)}`);
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create article.',
    };
  }
}

export async function updateArticleAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireOwnerSession();

  const parsed = ArticleFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await ArticlesService.updateArticle(session.userId, id, parsed.data);
    revalidatePath('/admin/articles');
    revalidatePath('/admin/knowledge');
    revalidatePath('/articles');
    revalidatePath(`/articles/${parsed.data.slug || ''}`);
    revalidatePath('/');
    redirect('/admin/articles?updated=true');
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update article.',
    };
  }
}

export async function archiveArticleAction(id: string): Promise<ActionResult> {
  const session = await requireOwnerSession();

  try {
    await ArticlesService.archiveArticle(session.userId, id);
    revalidatePath('/admin/articles');
    revalidatePath('/admin/knowledge');
    revalidatePath('/articles');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to archive article.',
    };
  }
}

/**
 * @deprecated Use archiveArticleAction instead. Knowledge content uses soft-archive only.
 */
export async function deleteArticleAction(id: string, _hardDelete?: boolean): Promise<ActionResult> {
  return archiveArticleAction(id);
}
