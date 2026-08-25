import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export interface AuthSession {
  user: User;
  userId: string;
  email: string;
}

/**
 * Enforces authenticated operator session at the server boundary.
 * If unauthenticated, throws or redirects to `/login`.
 */
export async function requireAuth(redirectTo?: string): Promise<AuthSession> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const target = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
    redirect(target);
  }

  return {
    user,
    userId: user.id,
    email: user.email || '',
  };
}

/**
 * Retrieves the currently authenticated user if one exists, without throwing or redirecting.
 */
export async function getOptionalUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
