import { createAdminClient } from './admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function verifySupabase() {
  console.log('🔍 Testing Supabase client initialization...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.warn('⚠️ Supabase environment variables not fully populated in .env.local.');
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '✅ Set' : '❌ Missing');
    console.log('  SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅ Set' : '❌ Missing');
    return;
  }

  try {
    const adminClient = createAdminClient();
    const { data: buckets, error } = await adminClient.storage.listBuckets();

    if (error) {
      console.log('ℹ️ Supabase client created. Storage probe note:', error.message);
    } else {
      console.log('✅ Supabase Admin & Storage connected. Buckets found:', buckets.map((b) => b.name));
    }
  } catch (err) {
    console.error('❌ Supabase initialization error:', err);
  }
}

verifySupabase();
