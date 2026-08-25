import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const rawUrl =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/developer_os';

async function ensureDatabaseExists(urlStr: string) {
  try {
    const url = new URL(urlStr);
    const targetDb = url.pathname.replace(/^\//, '') || 'developer_os';

    if (targetDb === 'postgres') return; // root db always exists

    // Connect to maintenance database 'postgres' to ensure targetDb exists
    url.pathname = '/postgres';
    const maintenanceSql = postgres(url.toString(), { max: 1 });

    try {
      const existing =
        await maintenanceSql`SELECT 1 FROM pg_database WHERE datname = ${targetDb}`;
      if (existing.length === 0) {
        console.log(`📦 Database "${targetDb}" not found. Creating database "${targetDb}"...`);
        await maintenanceSql.unsafe(`CREATE DATABASE "${targetDb}"`);
        console.log(`✅ Database "${targetDb}" created successfully.`);
      }
    } catch (e) {
      console.warn('⚠️ Could not auto-create database:', e instanceof Error ? e.message : e);
    } finally {
      await maintenanceSql.end();
    }
  } catch {
    // URL parsing fallback
  }
}

async function ensureSupabaseEnvironment(client: postgres.Sql) {
  try {
    await client.unsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
          CREATE ROLE service_role NOLOGIN;
        END IF;
      END
      $$;

      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
      CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT 'anon'::text $$;
    `);
  } catch (e) {
    console.warn('⚠️ Supabase environment setup notice:', e instanceof Error ? e.message : e);
  }
}

async function runMigrations() {
  console.log('🔄 Connecting to PostgreSQL database for migrations...');
  console.log(`📡 URL: ${rawUrl.replace(/:[^:@]+@/, ':****@')}`);

  await ensureDatabaseExists(rawUrl);

  const migrationClient = postgres(rawUrl, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    const migrationsFolder = path.resolve(process.cwd(), 'src/db/migrations');
    console.log(`📁 Applying Drizzle migrations from: ${migrationsFolder}`);

    // 1. Run Drizzle generated migrations
    await migrate(db, { migrationsFolder });
    console.log('✅ Base schema migrations applied successfully.');

    // 2. Ensure auth roles and schema exist before applying RLS
    await ensureSupabaseEnvironment(migrationClient);

    // 3. Run custom RLS policies migration if present
    const rlsMigrationPath = path.join(migrationsFolder, '0002_rls_policies.sql');
    if (fs.existsSync(rlsMigrationPath)) {
      console.log('🔒 Applying Row-Level Security (RLS) policies...');
      try {
        const rlsSql = fs.readFileSync(rlsMigrationPath, 'utf8');
        await migrationClient.unsafe(rlsSql);
        console.log('✅ RLS policies applied successfully.');
      } catch (err: unknown) {
        const pgErr = err as { code?: string; message?: string };
        if (pgErr?.code === '42710' || (pgErr?.message && pgErr.message.includes('already exists'))) {
          console.log('ℹ️ RLS policies already present, retaining active security policies.');
        } else {
          throw err;
        }
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
