import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });

async function enableForceRls() {
  const tables = [
    'profiles', 'organizations', 'technologies', 'skills', 'domains',
    'projects', 'project_case_studies', 'project_links', 'project_media',
    'media', 'articles', 'journal_entries', 'notes', 'tags',
    'adrs', 'learning_paths', 'certificates', 'learning_goals',
    'roadmap_items', 'now_entries', 'knowledge_relationships'
  ];

  console.log('Enabling FORCE ROW LEVEL SECURITY on all owned tables...');
  for (const t of tables) {
    await sql.unsafe(`ALTER TABLE "${t}" FORCE ROW LEVEL SECURITY;`);
  }
  console.log('✅ FORCE ROW LEVEL SECURITY successfully enabled!');
  await sql.end();
}

enableForceRls().catch((err) => {
  console.error('Failed to enable FORCE RLS:', err);
  process.exit(1);
});
