import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * PostgreSQL connection string from environment.
 * Fallback to dummy string for static build step when DB is not yet provisioned.
 */
const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

/**
 * Cache connection across hot reloads in development.
 */
declare global {
  var __postgresClient: postgres.Sql | undefined;
}

const client =
  globalThis.__postgresClient ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Required for Supabase transaction pooler (port 6543)
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__postgresClient = client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
