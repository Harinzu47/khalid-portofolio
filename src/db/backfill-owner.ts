import postgres from 'postgres';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/developer_os';

const OWNED_TABLES = [
  'profiles',
  'organizations',
  'career_experiences',
  'projects',
  'skills',
  'technologies',
  'media',
  'articles',
  'journal_entries',
  'notes',
  'tags',
  'certificates',
  'learning_goals',
  'roadmap_items',
  'domains',
  'project_case_studies',
  'adrs',
  'now_entries',
  'learning_paths',
  'knowledge_relationships',
];

async function runBackfill() {
  console.log('🔄 Connecting to PostgreSQL for Ownership Backfill & Finalization...');
  const sql = postgres(connectionString, { max: 1 });

  try {
    // 1. Identify canonical owner ID from auth.users or environment
    let canonicalOwnerId = process.env.OWNER_USER_ID;

    if (!canonicalOwnerId) {
      const users = await sql`
        SELECT id, email, created_at
        FROM auth.users
        ORDER BY created_at ASC
        LIMIT 1;
      `;

      if (users.length === 0) {
        throw new Error(
          '❌ No Supabase auth user found in auth.users. Please create an owner user first or supply OWNER_USER_ID.'
        );
      }

      canonicalOwnerId = users[0].id;
      console.log(`👤 Verified canonical owner from auth.users: ${users[0].email} (${canonicalOwnerId})`);
    } else {
      console.log(`👤 Using supplied OWNER_USER_ID from environment: ${canonicalOwnerId}`);
    }

    // 2. Pre-backfill Audit
    console.log('\n📊 Pre-Backfill Audit Table Status:');
    const preReport: any[] = [];
    for (const table of OWNED_TABLES) {
      const totalRes = await sql.unsafe(`SELECT count(*)::int as c FROM "${table}"`);
      const nullRes = await sql.unsafe(
        `SELECT count(*)::int as c FROM "${table}" WHERE owner_id IS NULL`
      );
      const total = totalRes[0].c;
      const nullCount = nullRes[0].c;
      preReport.push({
        table,
        total,
        nullOwner: nullCount,
        nonNullOwner: total - nullCount,
      });
    }
    console.table(preReport);

    // 3. Execute Backfill
    console.log('\n⚙️ Executing Backfill to Owner ID:', canonicalOwnerId);
    for (const table of OWNED_TABLES) {
      await sql.unsafe(
        `UPDATE "${table}" SET "owner_id" = '${canonicalOwnerId}' WHERE "owner_id" IS NULL;`
      );
    }
    console.log('✅ Backfill updates completed.');

    // 4. Verify Zero NULLs
    console.log('\n🔍 Post-Backfill Verification:');
    const postReport: any[] = [];
    let hasNulls = false;
    for (const table of OWNED_TABLES) {
      const totalRes = await sql.unsafe(`SELECT count(*)::int as c FROM "${table}"`);
      const nullRes = await sql.unsafe(
        `SELECT count(*)::int as c FROM "${table}" WHERE owner_id IS NULL`
      );
      const total = totalRes[0].c;
      const nullCount = nullRes[0].c;
      if (nullCount > 0) hasNulls = true;
      postReport.push({
        table,
        total,
        nullOwner: nullCount,
        nonNullOwner: total - nullCount,
      });
    }
    console.table(postReport);

    if (hasNulls) {
      throw new Error('❌ Verification failed: Some records still have NULL owner_id.');
    }
    console.log('✅ Verification passed: 0 NULL owner_id records across all owned tables.');

    // 5. Apply NOT NULL constraints on canonical top-level owned entities
    console.log('\n🔒 Applying NOT NULL constraints on owner_id columns...');
    for (const table of OWNED_TABLES) {
      try {
        await sql.unsafe(`ALTER TABLE "${table}" ALTER COLUMN "owner_id" SET NOT NULL;`);
        console.log(`  ✓ ${table}.owner_id -> NOT NULL`);
      } catch (err: any) {
        console.warn(`  ⚠️ Notice setting NOT NULL on ${table}:`, err.message);
      }
    }

    // 6. Apply migration 0004 (missing junctions) if not already applied
    const mig0004Path = path.resolve(process.cwd(), 'src/db/migrations/0004_missing_now_junctions.sql');
    if (fs.existsSync(mig0004Path)) {
      console.log('\n📦 Applying 0004_missing_now_junctions.sql...');
      const sqlContent = fs.readFileSync(mig0004Path, 'utf8');
      await sql.unsafe(sqlContent);
      console.log('✅ 0004_missing_now_junctions.sql applied.');
    }

    // 7. Apply migration 0005 (tightened RLS)
    const mig0005Path = path.resolve(process.cwd(), 'src/db/migrations/0005_tightened_owner_rls.sql');
    if (fs.existsSync(mig0005Path)) {
      console.log('\n🔒 Applying 0005_tightened_owner_rls.sql...');
      const sqlContent = fs.readFileSync(mig0005Path, 'utf8');
      await sql.unsafe(sqlContent);
      console.log('✅ 0005_tightened_owner_rls.sql applied.');
    }

    console.log('\n🎉 Ownership Finalization & RLS Tightening Completed Successfully!');
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runBackfill();
