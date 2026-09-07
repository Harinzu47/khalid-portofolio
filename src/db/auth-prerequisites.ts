import type postgres from 'postgres';

/** Check prerequisites without creating or replacing provider-owned auth objects. */
export async function assertAuthPrerequisites(client: Pick<postgres.Sql, 'unsafe'>): Promise<void> {
  const rows = await client.unsafe(`
    SELECT to_regprocedure('auth.uid()') IS NOT NULL AS has_uid,
           to_regprocedure('auth.role()') IS NOT NULL AS has_role,
           to_regrole('anon') IS NOT NULL AS has_anon,
           to_regrole('authenticated') IS NOT NULL AS has_authenticated,
           to_regrole('service_role') IS NOT NULL AS has_service_role
  `);
  const state = rows[0];
  if (!state?.has_uid || !state.has_role || !state.has_anon ||
      !state.has_authenticated || !state.has_service_role) {
    throw new Error(
      'Auth database prerequisites are missing. Use an initialized Supabase database, ' +
      'or provision JWT-aware auth helpers and roles separately for standalone PostgreSQL. ' +
      'Migrations will not install placeholder auth functions.',
    );
  }
}
