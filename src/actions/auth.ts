'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginSchema } from '@/validations/auth';
import { rateLimit } from '@/lib/rate-limit';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { type ActionResult } from '@/lib/action-result';
export type { ActionResult };

/**
 * Authenticates operator with Supabase Auth using email/password.
 */
export async function loginAction(rawInput: unknown, redirectTo: string = '/admin'): Promise<ActionResult> {
  const rateLimitResult = rateLimit('login:action', { limit: 10, windowSeconds: 60 });
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Too many login attempts. Please wait ${rateLimitResult.resetSeconds}s before retrying.`,
    };
  }

  const parsed = LoginSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Invalid email or password.',
      };
    }

    revalidatePath('/', 'layout');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected authentication error occurred.',
    };
  }

  redirect(redirectTo);
}

/**
 * Signs out the operator and clears HTTP-only session cookies.
 */
export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
  } catch (err) {
    console.error('Logout error:', err);
  }

  redirect('/login');
}
