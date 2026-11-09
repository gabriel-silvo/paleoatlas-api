import { z } from 'zod';

export const referenceSchema = z.object({
  source_id: z.string(),
  citation: z.string(),
  url: z.url(),
});

export const measurementSchema = z.object({
  kind: z.enum(['length', 'hip_height', 'head_height', 'mass']),
  minimum: z.number().nonnegative().nullable(),
  maximum: z.number().nonnegative().nullable(),
  unit: z.enum(['m', 'kg']),
  method: z.string().nullable(),
  specimen: z.string().nullable(),
  reference: referenceSchema,
});

const commonTaxon = {
  id: z.string().regex(/^pbdb-\d+$/),
  source_id: z.string().regex(/^txn:\d+$/),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
  authority: z.string().nullable(),
  family: z.string().nullable(),
  source_status: z.literal('accepted'),
  curation_status: z.literal('imported_unreviewed'),
  reference: referenceSchema.nullable(),
  source_modified_at: z.string().nullable(),
  measurements: z.array(measurementSchema),
};

export const genusSchema = z.object({ ...commonTaxon, rank: z.literal('genus') });
export const speciesSchema = z.object({
  ...commonTaxon,
  rank: z.literal('species'),
  genus_id: z.string().regex(/^pbdb-\d+$/),
  epithet: z.string().min(1),
});
export const aliasSchema = z.object({
  id: z.string().regex(/^pbdb-\d+$/),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
  accepted_genus_id: z.string().regex(/^pbdb-\d+$/),
  source_status: z.string().min(1),
  reference: referenceSchema.nullable(),
});
export const evidenceSchema = z.object({
  resource: z.enum(['genera', 'species', 'aliases']),
  url: z.url(),
  retrieved_at: z.iso.datetime(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  record_count: z.number().int().nonnegative(),
});
export const catalogSchema = z.object({
  schema_version: z.literal(1),
  generated_at: z.iso.datetime(),
  scope: z.literal('non-avian-dinosaurs'),
  source: z.literal('PBDB'),
  license: z.literal('CC-BY-4.0'),
  attribution: z.string().min(1),
  exclusions: z.array(z.string()),
  evidence: z.array(evidenceSchema),
  caveats: z.array(z.string()),
  genera: z.array(genusSchema),
  species: z.array(speciesSchema),
  aliases: z.array(aliasSchema),
});

export type Genus = z.infer<typeof genusSchema>;
export type Species = z.infer<typeof speciesSchema>;
export type Alias = z.infer<typeof aliasSchema>;
export type Catalog = z.infer<typeof catalogSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;

/** Validate references as well as syntax before any snapshot can be served. */
export function parseCatalog(input: unknown): Catalog {
  const catalog = catalogSchema.parse(input);
  const ids = new Set<string>();
  const genusIds = new Set(catalog.genera.map((genus) => genus.id));
  for (const taxon of [...catalog.genera, ...catalog.species, ...catalog.aliases]) {
    if (ids.has(taxon.id)) throw new Error(`Duplicate taxon id: ${taxon.id}`);
    ids.add(taxon.id);
  }
  for (const species of catalog.species) {
    if (!genusIds.has(species.genus_id)) throw new Error(`Orphan species: ${species.id}`);
  }
  for (const alias of catalog.aliases) {
    if (!genusIds.has(alias.accepted_genus_id)) throw new Error(`Orphan alias: ${alias.id}`);
  }
  return catalog;
}
