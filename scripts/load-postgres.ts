import { createHash } from 'node:crypto';
import { loadCatalog } from '../src/catalog-store.js';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const catalog = await loadCatalog({ path: process.env.CATALOG_PATH });
const document = JSON.stringify(catalog);
const hash = createHash('sha256').update(document).digest('hex');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(
    'INSERT INTO catalog_snapshots(hash, document, generated_at) VALUES ($1, $2, $3) ON CONFLICT (hash) DO NOTHING',
    [hash, document, catalog.generated_at],
  );
  await client.query(
    'INSERT INTO catalog_current(singleton, snapshot_hash) VALUES (true, $1) ON CONFLICT (singleton) DO UPDATE SET snapshot_hash = EXCLUDED.snapshot_hash',
    [hash],
  );
  await client.query('COMMIT');
  console.log(`PostgreSQL now serves snapshot ${hash}. Restart the API to load it.`);
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally { client.release(); await pool.end(); }
