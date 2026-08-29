import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });

async function run() {
  console.log('Applying 0006_knowledge_compatibility_matrix.sql...');
  const migrationPath = path.join(process.cwd(), 'src/db/migrations/0006_knowledge_compatibility_matrix.sql');
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  await sql.unsafe(sqlContent);
  console.log('✅ Migration 0006 applied successfully!');
  await sql.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
