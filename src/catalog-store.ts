import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { parseCatalog, type Catalog } from './domain/catalog.js';

export async function loadCatalog(options: {
  path?: string;
  databaseUrl?: string;
} = {}): Promise<Catalog> {
  if (!options.databaseUrl) {
    return parseCatalog(JSON.parse(await readFile(options.path ?? 'data/catalog.json', 'utf8')));
  }
  const pool = new Pool({ connectionString: options.databaseUrl });
  try {
    const result = await pool.query<{ document: unknown }>(
      `SELECT s.document FROM catalog_snapshots s
       JOIN catalog_current c ON c.snapshot_hash = s.hash WHERE c.singleton = true`,
    );
    if (!result.rows[0]) throw new Error('Database has no published catalog. Run npm run db:load.');
    return parseCatalog(result.rows[0].document);
  } finally {
    await pool.end();
  }
}
