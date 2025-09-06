import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: `file:${path.join(process.cwd(), 'bin', 'bug0-local.db')}`,
  },
});
