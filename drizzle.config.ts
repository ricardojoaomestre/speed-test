import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  config({ path: '.env.local' });
  config({ path: '.env' });
}

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Use .env.local locally or set DATABASE_URL (and optionally DATABASE_URL_UNPOOLED for migrations) in Vercel.',
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
