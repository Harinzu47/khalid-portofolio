import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { isOwnerUser } from './owner-policy';
import { ForbiddenError } from './errors';

export interface AuthSession {
  user: User;
  userId: string;
  email: string;
}

/** Canonical alias for single-owner session */
export type OwnerSession = AuthSession;

/**
 * Enforces the configured owner session at every server boundary.
 * If unauthenticated, redirects to `/login`.
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

  if (!isOwnerUser(user)) throw new ForbiddenError();

  return {
    user,
    userId: user.id,
    email: user.email || '',
  };
}

/**
 * Canonical owner authorization helper for HZCODE Personal Developer OS.
 * Both guard names enforce the same configured owner identity.
 */
export async function requireOwnerSession(redirectTo?: string): Promise<OwnerSession> {
  return await requireAuth(redirectTo);
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
    return isOwnerUser(user) ? user : null;
  } catch {
    return null;
  }
}
