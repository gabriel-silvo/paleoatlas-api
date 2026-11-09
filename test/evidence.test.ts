import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { gunzipSync } from 'node:zlib';
import { loadCatalog } from '../src/catalog-store.js';
import { normalizePbdb, parsePbdb } from '../src/import/pbdb.js';
import type { Evidence } from '../src/domain/catalog.js';

test('published catalog can be rebuilt exactly from archived upstream evidence', async () => {
  const catalog = await loadCatalog();
  const directory = join('data/evidence', catalog.generated_at.replaceAll(':', '-'));
  const records = { genera: [], species: [], aliases: [] } as Record<Evidence['resource'], ReturnType<typeof parsePbdb>>;
  for (const evidence of catalog.evidence) {
    const bytes = gunzipSync(await readFile(join(directory, `${evidence.resource}.json.gz`)));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), evidence.sha256);
    records[evidence.resource] = parsePbdb(JSON.parse(bytes.toString('utf8')));
    assert.equal(records[evidence.resource].length, evidence.record_count);
  }
  const rebuilt = normalizePbdb({ ...records, evidence: catalog.evidence, generatedAt: catalog.generated_at });
  assert.deepEqual(rebuilt.catalog, catalog);
  const report = JSON.parse(await readFile('data/import-report.json', 'utf8'));
  assert.deepEqual(rebuilt.report.counts, report.counts);
});
