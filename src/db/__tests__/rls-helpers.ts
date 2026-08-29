import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables for test runner
dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: '.env' });
}

export const TEST_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
export const TEST_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

/**
 * Creates an anonymous Supabase client representing a public, unauthenticated visitor.
 */
export function createAnonymousClient(): SupabaseClient {
  return createClient(TEST_SUPABASE_URL, TEST_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Checks if a live Supabase environment is reachable for integration tests.
 */
export async function isSupabaseReachable(): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false;
  }

  try {
    const client = createAnonymousClient();
    const { error } = await client.from('projects').select('id').limit(1);
    // If no error or error is not connection error (e.g., table empty or RLS empty response), it is reachable
    return !error || !error.message.includes('fetch failed');
  } catch {
    return false;
  }
}
