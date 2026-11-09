import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCatalog } from '../src/domain/catalog.js';
import { normalizePbdb, parsePbdb, pbdbUrl, type PbdbRecord } from '../src/import/pbdb.js';
import { loadCatalog } from '../src/catalog-store.js';

const genus: PbdbRecord = { oid: 'txn:1', nam: 'Examplegenus', rnk: 'genus' };
const species: PbdbRecord = { oid: 'txn:2', nam: 'Examplegenus example', rnk: 'species', par: 'txn:1', gnl: 'Examplegenus' };
const build = (overrides: Partial<Parameters<typeof normalizePbdb>[0]> = {}) => normalizePbdb({
  genera: [genus], species: [species], aliases: [], evidence: [], generatedAt: '2026-11-09T00:00:00.000Z', ...overrides,
});

test('query expresses the avian boundary, rank and published body-taxon filters', () => {
  const url = new URL(pbdbUrl('genera'));
  assert.equal(url.searchParams.get('base_name'), 'Dinosauria^Aves^Avialae');
  assert.equal(url.searchParams.get('pres'), 'regular');
  assert.equal(url.searchParams.get('published'), 'yes');
  assert.equal(url.searchParams.get('taxon_status'), 'accepted');
  assert.equal(new URL(pbdbUrl('aliases')).searchParams.get('taxon_status'), 'all');
});

test('upstream errors, warnings and empty responses fail closed', () => {
  assert.throws(() => parsePbdb({ records: [genus], warnings: ['unknown parameter'] }));
  assert.throws(() => parsePbdb({ records: [] }));
  assert.throws(() => parsePbdb({ errors: ['invalid query'] }));
});

test('unmatched and inconsistent binomials are quarantined, not guessed', () => {
  const result = build({ species: [species,
    { ...species, oid: 'txn:3', par: 'txn:99', gnl: 'Missinggenus' },
    { ...species, oid: 'txn:4', nam: 'Oldgenus example' },
  ] });
  assert.equal(result.catalog.species.length, 1);
  assert.equal(result.report.quarantine.length, 2);
});

test('dubious names never become aliases merely because PBDB supplies a target', () => {
  const result = build({ aliases: [
    { oid: 'txn:3', nam: 'Oldgenus', rnk: 'genus', tdf: 'subjective synonym of', acc: 'txn:1' },
    { oid: 'txn:4', nam: 'Dubiousgenus', rnk: 'genus', tdf: 'nomen dubium', acc: 'txn:1' },
  ] });
  assert.equal(result.catalog.aliases.length, 1);
  assert.equal(result.report.unresolved_historical_names.length, 1);
});

test('avian regressions abort import and homonyms retain distinct source identifiers', () => {
  assert.throws(() => build({ genera: [{ ...genus, nam: 'Archaeopteryx' }] }), /Avian scope/);
  const result = build({ genera: [genus, { ...genus, oid: 'txn:3' }] });
  assert.equal(result.catalog.genera.length, 2);
  assert.equal(result.report.counts.distinct_genus_names, 1);
});

test('snapshot integrity rejects duplicate identifiers and dangling species/alias targets', async () => {
  const catalog = await loadCatalog();
  assert.throws(() => parseCatalog({ ...catalog, genera: [...catalog.genera, catalog.genera[0]] }), /Duplicate taxon/);
  assert.throws(() => parseCatalog({ ...catalog, species: [{ ...catalog.species[0], genus_id: 'pbdb-999999999' }] }), /Orphan species/);
  assert.throws(() => parseCatalog({ ...catalog, aliases: [{ ...catalog.aliases[0], accepted_genus_id: 'pbdb-999999999' }] }), /Orphan alias/);
});
