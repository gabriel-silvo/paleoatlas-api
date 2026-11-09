import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { loadCatalog } from '../src/catalog-store.js';

const catalog = await loadCatalog();
const report = JSON.parse(await readFile('data/import-report.json', 'utf8'));
if (report.generated_at !== catalog.generated_at) throw new Error('Published catalog and report differ.');
const directory = join('data/evidence', catalog.generated_at.replaceAll(':', '-'));
await mkdir(directory, { recursive: true });
for (const evidence of catalog.evidence) {
  const bytes = await readFile(join(report.raw_directory, `${evidence.resource}.json`));
  if (createHash('sha256').update(bytes).digest('hex') !== evidence.sha256) {
    throw new Error(`Raw evidence hash mismatch: ${evidence.resource}`);
  }
  await writeFile(join(directory, `${evidence.resource}.json.gz`), gzipSync(bytes));
}
await writeFile(join(directory, 'manifest.json'), `${JSON.stringify({ generated_at: catalog.generated_at, evidence: catalog.evidence }, null, 2)}\n`);
console.log(`Archived source evidence: ${directory}`);
