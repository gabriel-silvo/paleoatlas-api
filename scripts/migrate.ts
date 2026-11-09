import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  // This bootstrap migration is idempotent. Add a migration ledger before adding subsequent migrations.
  await pool.query(await readFile('migrations/001_catalog_snapshots.sql', 'utf8'));
  console.log('Catalog snapshot tables are ready.');
} finally { await pool.end(); }
