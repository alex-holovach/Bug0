#!/usr/bin/env tsx

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';

async function runMigrations() {
  try {
    // Ensure bin directory exists
    const binDir = path.join(process.cwd(), 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    // Database file path in bin folder
    const dbPath = path.join(binDir, 'kubiks-local.db');

    console.log(`Connecting to database at: ${dbPath}`);

    // Create SQLite database connection
    const sqlite = new Database(dbPath);

    // Create Drizzle instance
    const db = drizzle(sqlite);

    // Check if there are any migration files
    const migrationsFolder = './drizzle';
    if (!fs.existsSync(migrationsFolder)) {
      console.log('No migrations folder found. Skipping migrations.');
      sqlite.close();
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsFolder)
      .filter(file => file.endsWith('.sql') && !file.includes('meta'));

    if (migrationFiles.length === 0) {
      console.log('No migration files found. Skipping migrations.');
      sqlite.close();
      return;
    }

    console.log(`Found ${migrationFiles.length} migration file(s): ${migrationFiles.join(', ')}`);
    console.log('Running database migrations...');

    // Run migrations
    await migrate(db, { migrationsFolder });

    console.log('✅ Database migrations completed successfully!');

    // Close the database connection
    sqlite.close();

  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}
