import { buildApp } from './app.js';
import { loadCatalog } from './catalog-store.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
const catalog = await loadCatalog({ path: process.env.CATALOG_PATH, databaseUrl: process.env.DATABASE_URL });
const app = await buildApp(catalog, {
  logger: true, logLevel: process.env.LOG_LEVEL, corsOrigin: process.env.CORS_ORIGIN,
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { void app.close().then(() => process.exit(0)); });
}
await app.listen({ host: process.env.HOST ?? '127.0.0.1', port });
