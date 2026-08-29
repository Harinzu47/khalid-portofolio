import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { requirePrivilegedEnv } from '@/lib/env';

/**
 * Creates a privileged Supabase Admin client with Service Role privileges.
 *
 * ⚠️ CRITICAL SECURITY WARNING:
 * This client bypasses all Row Level Security (RLS) policies.
 * It MUST NEVER be imported into Client Components or exposed in client bundles.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'CRITICAL_SECURITY_VIOLATION: createAdminClient cannot be invoked in a browser runtime. Privileged operations are strictly server-side.'
    );
  }

  const { supabaseUrl, serviceRoleKey } = requirePrivilegedEnv();

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
