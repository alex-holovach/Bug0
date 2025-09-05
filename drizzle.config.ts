import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: path.join(process.cwd(), 'bin', 'kubiks-local.db'),
  },
});
