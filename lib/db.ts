import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import path from 'path';
import fs from 'fs';

// Ensure bin directory exists
const binDir = path.join(process.cwd(), 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Database file path in bin folder
const dbPath = path.join(binDir, 'bug0-local.db');

// Create LibSQL client
const client = createClient({
  url: `file:${dbPath}`,
});

// Create Drizzle instance
const db = drizzle(client);

// Function to check if tables exist and run migrations if needed
async function ensureTablesExist() {
  try {
    // Check if the projects table exists (using it as a representative table)
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'");

    if (result.rows.length === 0) {
      console.log('Database tables not found. Running migrations...');

      // Check if migrations folder exists
      const migrationsFolder = './drizzle';
      if (fs.existsSync(migrationsFolder)) {
        const migrationFiles = fs.readdirSync(migrationsFolder)
          .filter(file => file.endsWith('.sql') && !file.includes('meta'));

        if (migrationFiles.length > 0) {
          console.log(`Running ${migrationFiles.length} migration(s)...`);
          await migrate(db, { migrationsFolder });
          console.log('✅ Database migrations completed successfully!');
        } else {
          console.warn('No migration files found in drizzle folder');
        }
      } else {
        console.warn('Migrations folder not found. Please run "npm run db:generate" first.');
      }
    }
  } catch (error) {
    console.error('Error checking/running migrations:', error);
    // Don't throw - let the app continue, but log the error
  }
}

// Run migration check on initialization
ensureTablesExist();

export { db };
