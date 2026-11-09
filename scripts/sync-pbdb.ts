import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { normalizePbdb, parsePbdb, pbdbUrl } from '../src/import/pbdb.js';
import type { Evidence } from '../src/domain/catalog.js';

const args = process.argv.slice(2);
if (args.length) throw new Error('Usage: npm run data:sync (downloads a draft; publication is a separate command).');
const generatedAt = new Date().toISOString();
const stamp = generatedAt.replaceAll(':', '-');
const rawDir = join('data/raw', stamp);
await mkdir(rawDir, { recursive: true });
await mkdir('data/staging', { recursive: true });
const records = { genera: [], species: [], aliases: [] } as Record<Evidence['resource'], ReturnType<typeof parsePbdb>>;
const evidence: Evidence[] = [];
// Sequential requests avoid putting unnecessary load on the upstream service.
for (const resource of ['genera', 'species', 'aliases'] as const) {
  const url = pbdbUrl(resource);
  console.log(`Downloading ${resource}: ${url}`);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(120_000),
    headers: { 'User-Agent': 'PaleoAtlasAPI/0.1 (+https://github.com/gabriel-silvo/paleoatlas-api)', Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`PBDB ${response.status}: no catalog was published.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const retrievedAt = new Date().toISOString();
  await writeFile(join(rawDir, `${resource}.json`), bytes);
  records[resource] = parsePbdb(JSON.parse(bytes.toString('utf8')));
  evidence.push({ resource, url, retrieved_at: retrievedAt,
    sha256: createHash('sha256').update(bytes).digest('hex'), record_count: records[resource].length });
}
const { catalog, report } = normalizePbdb({ ...records, evidence, generatedAt });
let previousCounts = null;
try {
  const previous = JSON.parse(await readFile('data/catalog.json', 'utf8'));
  previousCounts = { genera: previous.genera.length, species: previous.species.length, aliases: previous.aliases.length };
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
}
await writeFile('data/staging/catalog.json', `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile('data/staging/report.json', `${JSON.stringify({ ...report, previous_counts: previousCounts, raw_directory: rawDir }, null, 2)}\n`);
console.log(JSON.stringify({ ...report.counts, previous_counts: previousCounts, draft: 'data/staging/catalog.json', report: 'data/staging/report.json' }, null, 2));
console.log('Review the draft and report, then run npm run data:publish. The published catalog is unchanged.');
