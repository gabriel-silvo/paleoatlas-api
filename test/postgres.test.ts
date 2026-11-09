import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCatalog } from '../src/catalog-store.js';

test('published PostgreSQL catalog matches the validated file snapshot', {
  skip: !process.env.DATABASE_URL,
}, async () => {
  const local = await loadCatalog();
  const database = await loadCatalog({ databaseUrl: process.env.DATABASE_URL });
  assert.deepEqual(database, local);
});
