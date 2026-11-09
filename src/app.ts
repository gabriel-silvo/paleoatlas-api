import { createHash } from 'node:crypto';
import { STATUS_CODES } from 'node:http';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import { catalogSchema, evidenceSchema, genusSchema, speciesSchema, type Catalog } from './domain/catalog.js';

const resource = {
  type: 'object', required: ['id', 'name', 'url'], additionalProperties: false,
  properties: { id: { type: 'string' }, name: { type: 'string' }, url: { type: 'string' } },
} as const;
const pagination = {
  type: 'object', additionalProperties: false,
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    offset: { type: 'integer', minimum: 0, default: 0 },
    search: { type: 'string', minLength: 1, maxLength: 100 },
  },
} as const;
type PageQuery = { limit?: number; offset?: number; search?: string };
const pageResponse = {
  type: 'object', required: ['count', 'next', 'previous', 'results'],
  properties: {
    count: { type: 'integer' },
    next: { type: ['string', 'null'] },
    previous: { type: ['string', 'null'] },
    results: { type: 'array', items: resource },
  },
} as const;
const params = {
  type: 'object', required: ['identifier'],
  properties: { identifier: { type: 'string', minLength: 1, maxLength: 120 } },
} as const;
const errorSchema = {
  type: 'object', properties: {
    statusCode: { type: 'integer' }, error: { type: 'string' }, message: { type: 'string' },
  }, required: ['statusCode', 'error', 'message'],
} as const;
const metadataSchema = catalogSchema.omit({ genera: true, species: true, aliases: true }).extend({
  counts: z.object({ accepted_genera: z.number().int(), distinct_genus_names: z.number().int(),
    accepted_species: z.number().int(), historical_names: z.number().int() }),
  count_interpretation: z.string(),
});
const sourcesSchema = z.object({ results: z.array(z.object({
  name: z.string(), url: z.url(), license: z.string(), license_url: z.url(),
  attribution: z.string(), evidence: z.array(evidenceSchema),
})) });

export async function buildApp(catalog: Catalog, options: {
  logger?: boolean;
  logLevel?: string;
  corsOrigin?: string;
} = {}) {
  const app = Fastify({ logger: options.logger ? { level: options.logLevel ?? 'info' } : false });
  await app.register(cors, {
    origin: !options.corsOrigin || options.corsOrigin === '*' ? '*' : options.corsOrigin.split(',').map((s) => s.trim()),
    methods: ['GET', 'HEAD'],
  });
  await app.register(helmet);
  await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'PaleoAtlas API', version: '0.1.0',
        description: 'Source-backed non-avian dinosaur taxonomy. Imported PBDB acceptance is not a universal consensus. No invented measurements.',
      },
      tags: [{ name: 'Catalog' }, { name: 'Genera' }, { name: 'Species' }],
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  const catalogHash = createHash('sha256').update(JSON.stringify(catalog)).digest('hex');
  app.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/v1/') && ['GET', 'HEAD'].includes(request.method)) {
      const etag = `"${createHash('sha256').update(`${catalogHash}:${request.url}`).digest('hex')}"`;
      reply.header('ETag', etag);
      reply.header('Cache-Control', 'public, max-age=300');
      if (request.headers['if-none-match'] === etag) return reply.code(304).send();
    }
  });
  app.setErrorHandler((error, request, reply) => {
    const knownError = error instanceof Error ? error : new Error('Unknown error');
    const code = 'statusCode' in knownError && typeof knownError.statusCode === 'number' ? knownError.statusCode : 500;
    const status = code >= 400 && code < 500 ? code : 500;
    if (status === 500) request.log.error(error);
    return reply.code(status).send({
      statusCode: status, error: STATUS_CODES[status] ?? 'Error',
      message: status === 500 ? 'An unexpected error occurred.' : knownError.message,
    });
  });
  const missing = (reply: import('fastify').FastifyReply) => reply.code(404).send({
    statusCode: 404, error: 'Not Found', message: 'Taxon not found in this catalog snapshot.',
  });
  const genera = [...catalog.genera].sort((a, b) => a.slug.localeCompare(b.slug));
  const species = [...catalog.species].sort((a, b) => a.slug.localeCompare(b.slug));

  function page<T extends { id: string; name: string; slug: string }>(rows: T[], query: PageQuery, path: string) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const selected = query.search
      ? rows.filter((row) => row.name.toLowerCase().includes(query.search!.toLowerCase())) : rows;
    const link = (at: number) => {
      const search = new URLSearchParams({ limit: String(limit), offset: String(at) });
      if (query.search) search.set('search', query.search);
      return `${path}?${search}`;
    };
    return {
      count: selected.length,
      next: offset + limit < selected.length ? link(offset + limit) : null,
      previous: offset > 0 ? link(Math.max(0, offset - limit)) : null,
      results: selected.slice(offset, offset + limit).map((row) => ({
        id: row.id, name: row.name, url: `${path}/${row.id}`,
      })),
    };
  }

  app.get('/', { schema: { hide: true } }, async () => ({
    name: 'PaleoAtlas API', documentation: '/docs', api: '/api/v1/',
  }));
  app.get('/health', { schema: { summary: 'Process readiness', tags: ['Catalog'],
    response: { 200: z.toJSONSchema(z.object({ status: z.literal('ok'), catalog_generated_at: z.iso.datetime() })) } } }, async () => ({
    status: 'ok', catalog_generated_at: catalog.generated_at,
  }));
  app.get('/api/v1/', { schema: { summary: 'Discover resources', tags: ['Catalog'],
    response: { 200: z.toJSONSchema(z.object({ genera: z.string(), species: z.string(), catalog: z.string(), sources: z.string() })) } } }, async () => ({
    genera: '/api/v1/genera', species: '/api/v1/species', catalog: '/api/v1/catalog', sources: '/api/v1/sources',
  }));
  app.get('/api/v1/catalog', { schema: { summary: 'Coverage, retrieval dates and caveats', tags: ['Catalog'],
    response: { 200: z.toJSONSchema(metadataSchema) } } }, async () => ({
    ...catalog, genera: undefined, species: undefined, aliases: undefined,
    counts: { accepted_genera: genera.length, distinct_genus_names: new Set(genera.map((g) => g.slug)).size,
      accepted_species: species.length, historical_names: catalog.aliases.length },
    count_interpretation: 'PBDB accepted taxa matching the documented query at retrieval time; not a universal census.',
  }));
  app.get('/api/v1/sources', { schema: { summary: 'Data attribution', tags: ['Catalog'],
    response: { 200: z.toJSONSchema(sourcesSchema) } } }, async () => ({
    results: [{ name: 'Paleobiology Database', url: 'https://paleobiodb.org/',
      license: catalog.license, license_url: 'https://creativecommons.org/licenses/by/4.0/',
      attribution: catalog.attribution, evidence: catalog.evidence }],
  }));
  app.get<{ Querystring: PageQuery }>('/api/v1/genera', {
    schema: { summary: 'List accepted genera', tags: ['Genera'], querystring: pagination, response: { 200: pageResponse, 400: errorSchema } },
  }, async (request) => page(genera, request.query, '/api/v1/genera'));
  app.get<{ Params: { identifier: string } }>('/api/v1/genera/:identifier', {
    schema: {
      summary: 'Find a genus by name, id or historical name', tags: ['Genera'], params,
      response: {
        200: {
          type: 'object', required: ['data', 'resolution'],
          properties: {
            data: { ...z.toJSONSchema(genusSchema), properties: {
              ...z.toJSONSchema(genusSchema).properties,
              species: { type: 'array', items: z.toJSONSchema(speciesSchema) },
              historical_names: { type: 'array', items: { type: 'string' } },
            } },
            resolution: {
              type: 'object', properties: {
                requested: { type: 'string' }, matched_historical_name: { type: ['string', 'null'] },
                canonical_url: { type: 'string' }, notice: { type: ['string', 'null'] },
              },
            },
          },
        }, 404: errorSchema,
        409: { type: 'object', properties: {
          statusCode: { type: 'integer' }, error: { type: 'string' }, message: { type: 'string' },
          candidates: { type: 'array', items: resource },
        } },
      },
    },
  }, async (request, reply) => {
    const identifier = request.params.identifier.toLowerCase();
    const exact = genera.find((row) => row.id === identifier);
    const matchingAliases = catalog.aliases.filter((row) => row.slug === identifier || row.id === identifier);
    const candidates = exact ? [exact] : genera.filter((row) => row.slug === identifier || matchingAliases.some((a) => a.accepted_genus_id === row.id));
    if (candidates.length > 1) return reply.code(409).send({
      statusCode: 409, error: 'Ambiguous Name', message: 'Multiple source records match this name. Use an identifier.',
      candidates: candidates.map((row) => ({ id: row.id, name: row.name, url: `/api/v1/genera/${row.id}` })),
    });
    const genus = candidates[0];
    if (!genus) return missing(reply);
    const alias = matchingAliases.find((row) => row.accepted_genus_id === genus.id);
    const canonicalUrl = `/api/v1/genera/${genus.id}`;
    reply.header('Content-Location', canonicalUrl);
    return {
      data: { ...genus, species: species.filter((row) => row.genus_id === genus.id),
        historical_names: catalog.aliases.filter((row) => row.accepted_genus_id === genus.id).map((row) => row.name) },
      resolution: {
        requested: request.params.identifier, matched_historical_name: alias?.name ?? null,
        canonical_url: canonicalUrl,
        notice: alias ? `${alias.name} is a historical name resolved to ${genus.name} by PBDB; source status: ${alias.source_status}.` : null,
      },
    };
  });
  app.get<{ Querystring: PageQuery }>('/api/v1/species', {
    schema: { summary: 'List accepted species', tags: ['Species'], querystring: pagination, response: { 200: pageResponse, 400: errorSchema } },
  }, async (request) => page(species, request.query, '/api/v1/species'));
  app.get<{ Params: { identifier: string } }>('/api/v1/species/:identifier', {
    schema: { summary: 'Find a species by binomial slug or id', tags: ['Species'], params,
      response: { 200: z.toJSONSchema(speciesSchema), 404: errorSchema,
        409: { type: 'object', properties: {
          statusCode: { type: 'integer' }, error: { type: 'string' }, message: { type: 'string' },
          candidates: { type: 'array', items: resource },
        } } } },
  }, async (request, reply) => {
    const id = request.params.identifier.toLowerCase();
    const candidates = species.filter((row) => row.id === id || row.slug === id);
    if (candidates.length > 1) return reply.code(409).send({
      statusCode: 409, error: 'Ambiguous Name', message: 'Multiple source records match this name. Use an identifier.',
      candidates: candidates.map((row) => ({ id: row.id, name: row.name, url: `/api/v1/species/${row.id}` })),
    });
    return candidates[0] ?? missing(reply);
  });
  await app.ready();
  return app;
}
