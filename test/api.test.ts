import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { buildApp } from '../src/app.js';
import { loadCatalog } from '../src/catalog-store.js';

const catalog = await loadCatalog();
const app = await buildApp(catalog);
after(() => app.close());

test('paginated lists preserve total count and navigable stable resource links', async () => {
  const response = await app.inject('/api/v1/genera?limit=2&offset=2');
  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.count, catalog.genera.length);
  assert.equal(body.results.length, 2);
  assert.equal(body.next, '/api/v1/genera?limit=2&offset=4');
  assert.equal(body.previous, '/api/v1/genera?limit=2&offset=0');
  assert.equal((await app.inject(body.results[0].url)).statusCode, 200);
});

test('genus lookup embeds species and resolves Dynamosaurus without losing the original query', async () => {
  const direct = (await app.inject('/api/v1/genera/Tyrannosaurus')).json();
  assert.equal(direct.data.rank, 'genus');
  assert.deepEqual(direct.data.species.map((s: { epithet: string }) => s.epithet).sort(), ['mcraeensis', 'rex']);
  assert.deepEqual(direct.data.measurements, []);
  const response = await app.inject('/api/v1/genera/dynamosaurus');
  assert.equal(response.statusCode, 200);
  const historical = response.json();
  assert.equal(historical.data.id, direct.data.id);
  assert.equal(historical.resolution.matched_historical_name, 'Dynamosaurus');
  assert.match(historical.resolution.notice, /historical name/);
  assert.equal(response.headers['content-location'], `/api/v1/genera/${direct.data.id}`);
});

test('source homonyms return a conflict with usable identifiers', async () => {
  const response = await app.inject('/api/v1/genera/saurornithoides');
  assert.equal(response.statusCode, 409);
  const candidates = response.json().candidates;
  assert.equal(candidates.length, 2);
  for (const candidate of candidates) {
    assert.equal((await app.inject(candidate.url)).statusCode, 200);
  }
});

test('unresolved invalid names and excluded avian taxa are not presented as accepted genera', async () => {
  for (const name of ['archaeopteryx', 'gallus', 'ichthyornis', 'not-a-dinosaur']) {
    assert.equal((await app.inject(`/api/v1/genera/${name}`)).statusCode, 404);
  }
  assert.equal((await app.inject('/api/v1/species/tyrannosaurus-rex')).json().genus_id, 'pbdb-38613');
});

test('pagination rejects invalid bounds and filters before pagination', async () => {
  for (const query of ['limit=0', 'limit=101', 'offset=-1', 'limit=hello']) {
    assert.equal((await app.inject(`/api/v1/genera?${query}`)).statusCode, 400);
  }
  const page = (await app.inject('/api/v1/genera?search=tyranno&limit=1')).json();
  assert.equal(page.count, catalog.genera.filter((row) => row.name.toLowerCase().includes('tyranno')).length);
  assert.equal(page.results.length, 1);
  assert.match(page.next, /search=tyranno/);
});

test('ETags validate the same representation and differ across resources', async () => {
  const first = await app.inject('/api/v1/genera?limit=1');
  const etag = String(first.headers.etag);
  assert.equal((await app.inject({ url: '/api/v1/genera?limit=1', headers: { 'if-none-match': etag } })).statusCode, 304);
  assert.equal((await app.inject({ url: '/api/v1/species?limit=1', headers: { 'if-none-match': etag } })).statusCode, 200);
});

test('catalog exposes attribution, retrieval evidence and distinct name counts', async () => {
  const body = (await app.inject('/api/v1/catalog')).json();
  assert.equal(body.counts.accepted_genera, catalog.genera.length);
  assert.equal(body.counts.distinct_genus_names, new Set(catalog.genera.map((g) => g.name)).size);
  assert.equal(body.genera, undefined);
  assert.equal(body.license, 'CC-BY-4.0');
  assert.equal(body.evidence.length, 3);
});

test('OpenAPI and documentation are served and mutation routes are absent', async () => {
  const spec = (await app.inject('/docs/json')).json();
  assert.equal(spec.info.title, 'PaleoAtlas API');
  assert.ok(spec.paths['/api/v1/genera/{identifier}'].get.responses['409']);
  assert.equal((await app.inject({ url: '/api/v1/genera', method: 'POST', payload: {} })).statusCode, 404);
});
