import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseCatalog } from '../src/domain/catalog.js';

const draft = parseCatalog(JSON.parse(await readFile('data/staging/catalog.json', 'utf8')));
if (!draft.genera.length || !draft.species.length) throw new Error('Refusing to publish an empty catalog.');
const report = JSON.parse(await readFile('data/staging/report.json', 'utf8'));
if (report.generated_at !== draft.generated_at) throw new Error('Draft and report timestamps differ.');
const encoded = `${JSON.stringify(draft, null, 2)}\n`;
await mkdir('data', { recursive: true });
await writeFile('data/catalog.json.tmp', encoded);
await rename('data/catalog.json.tmp', 'data/catalog.json');
await writeFile('data/import-report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`Published local snapshot ${createHash('sha256').update(encoded).digest('hex')}. Restart the API to load it.`);
