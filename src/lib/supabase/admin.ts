import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a privileged Supabase Admin client with Service Role privileges.
 *
 * ⚠️ CRITICAL SECURITY WARNING:
 * This client bypasses all Row Level Security (RLS) policies.
 * It MUST NEVER be imported into Client Components or exposed in client bundles.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin configuration: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in environment variables.'
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
