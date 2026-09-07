import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { assertAuthPrerequisites } from './auth-prerequisites';

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

async function runMigrations() {
  console.log('🔄 Connecting to PostgreSQL database for migrations...');
  console.log(`📡 URL: ${rawUrl.replace(/:[^:@]+@/, ':****@')}`);

  await ensureDatabaseExists(rawUrl);

  const migrationClient = postgres(rawUrl, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    // Validate before applying any migrations; auth functions belong to the provider.
    await assertAuthPrerequisites(migrationClient);
    const migrationsFolder = path.resolve(process.cwd(), 'src/db/migrations');
    console.log(`📁 Applying Drizzle migrations from: ${migrationsFolder}`);

    // 1. Run Drizzle generated migrations
    await migrate(db, { migrationsFolder });
    console.log('✅ Base schema migrations applied successfully.');

    // 2. Run custom migrations in sequential order.
    const customFiles = fs
      .readdirSync(migrationsFolder)
      .filter((file) => file.endsWith('.sql') && !file.startsWith('0000') && !file.startsWith('0001') && !file.startsWith('0002'))
      .sort();

    for (const customFile of customFiles) {
      const filePath = path.join(migrationsFolder, customFile);
      console.log(`📦 Applying custom migration from: ${customFile}...`);
      try {
        const customSql = fs.readFileSync(filePath, 'utf8');
        await migrationClient.unsafe(customSql);
        console.log(`✅ ${customFile} applied successfully.`);
      } catch (err: unknown) {
        const pgErr = err as { code?: string; message?: string };
        if (pgErr?.code === '42710' || (pgErr?.message && pgErr.message.includes('already exists'))) {
          console.log(`ℹ️ Objects in ${customFile} already present, skipping duplicate creation.`);
        } else {
          throw err;
        }
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
