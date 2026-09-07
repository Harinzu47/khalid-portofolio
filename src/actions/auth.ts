'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginSchema } from '@/validations/auth';
import { limitLogin } from '@/lib/login-rate-limit';
import { isOwnerUser } from '@/lib/owner-policy';
import { headers } from 'next/headers';
import { validateSafeRedirectUrl } from '@/lib/security';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { type ActionResult } from '@/lib/action-result';
export type { ActionResult };

/**
 * Authenticates operator with Supabase Auth using email/password.
 */
export async function loginAction(rawInput: unknown, redirectTo: string = '/admin'): Promise<ActionResult> {
  const safeRedirect = validateSafeRedirectUrl(redirectTo, '/admin');
  let rateLimitResult;
  try {
    rateLimitResult = await limitLogin(await headers());
  } catch {
    return { success: false, error: 'Login is temporarily unavailable. Please try again later.' };
  }
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !isOwnerUser(data?.user)) {
      if (!error) await supabase.auth.signOut({ scope: 'local' });
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    revalidatePath('/', 'layout');
  } catch {
    return {
      success: false,
      error: 'Unable to sign in. Please try again later.',
    };
  }

  redirect(safeRedirect);
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
