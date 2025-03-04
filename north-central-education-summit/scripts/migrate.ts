import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Missing required environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  console.log('Starting migrations...');

  for (const file of migrationFiles) {
    if (!file.endsWith('.sql')) continue;

    console.log(`Running migration: ${file}`);
    const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: migration
      });

      if (error) throw error;
      console.log(`✅ Successfully ran migration: ${file}`);
    } catch (error) {
      console.error(`❌ Error running migration ${file}:`, error);
      process.exit(1);
    }
  }

  console.log('✨ All migrations completed successfully!');
}
