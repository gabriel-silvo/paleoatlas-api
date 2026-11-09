import { z } from 'zod';
import { parseCatalog, type Alias, type Evidence, type Genus, type Species } from '../domain/catalog.js';

export const PBDB_SCOPE = 'Dinosauria^Aves^Avialae';
export function pbdbUrl(resource: Evidence['resource']): string {
  const query = new URLSearchParams({
    base_name: PBDB_SCOPE, rank: resource === 'species' ? 'species' : 'genus',
    taxon_status: resource === 'aliases' ? 'all' : 'accepted',
    pres: 'regular', published: 'yes', limit: 'all', show: 'attr,class,ref,crmod',
  });
  return `https://paleobiodb.org/data1.2/taxa/list.json?${query}`;
}

const recordSchema = z.object({
  oid: z.string().regex(/^txn:\d+$/), nam: z.string().min(1), rnk: z.string(),
  att: z.string().optional(), par: z.string().optional(), gnl: z.string().optional(),
  fml: z.string().optional(), rid: z.string().optional(), ref: z.string().optional(),
  dmd: z.string().optional(), tdf: z.string().optional(), acc: z.string().optional(),
}).passthrough();
export type PbdbRecord = z.infer<typeof recordSchema>;
export function parsePbdb(input: unknown): PbdbRecord[] {
  const response = z.object({
    records: z.array(recordSchema).min(1),
    warnings: z.array(z.unknown()).optional(),
    errors: z.array(z.unknown()).optional(),
  }).parse(input);
  if (response.warnings?.length || response.errors?.length) {
    throw new Error('PBDB returned warnings/errors; inspect the response before importing.');
  }
  return response.records;
}
const id = (oid: string) => oid.replace('txn:', 'pbdb-');
const slug = (name: string) => name.toLowerCase().replaceAll(' ', '-');
function reference(row: PbdbRecord) {
  return row.rid && row.ref ? {
    source_id: row.rid, citation: row.ref,
    url: `https://paleobiodb.org/classic/displayReference?reference_no=${row.rid.replace('ref:', '')}`,
  } : null;
}
function common(row: PbdbRecord) {
  return {
    id: id(row.oid), source_id: row.oid, name: row.nam, slug: slug(row.nam),
    authority: row.att ?? null,
    family: !row.fml || row.fml.startsWith('NO_') ? null : row.fml,
    source_status: 'accepted' as const, curation_status: 'imported_unreviewed' as const,
    reference: reference(row), source_modified_at: row.dmd ?? null, measurements: [],
  };
}
export function normalizePbdb(inputs: {
  genera: PbdbRecord[]; species: PbdbRecord[]; aliases: PbdbRecord[];
  evidence: Evidence[]; generatedAt: string;
}) {
  const genera: Genus[] = inputs.genera.map((row) => {
    if (row.rnk !== 'genus' || row.tdf) throw new Error(`Unexpected accepted genus: ${row.oid}`);
    return { ...common(row), rank: 'genus' };
  });
  const genusById = new Map(genera.map((row) => [row.id, row]));
  const genusByName = new Map<string, Genus[]>();
  for (const genus of genera) genusByName.set(genus.name, [...(genusByName.get(genus.name) ?? []), genus]);
  // A source taxonomy change must be reviewed instead of silently widening our scope.
  const forbiddenNames = new Set(['Aves', 'Avialae', 'Gallus', 'Archaeopteryx', 'Ichthyornis', 'Hesperornis', 'Baminornis']);
  for (const genus of genera) {
    if (forbiddenNames.has(genus.name)) throw new Error(`Avian scope regression: ${genus.name}`);
  }
  const quarantine: { id: string; name: string; reason: string; raw: PbdbRecord }[] = [];
  const species: Species[] = [];
  for (const row of inputs.species) {
    const byName = genusByName.get(row.gnl ?? '') ?? [];
    const genus = (row.par ? genusById.get(id(row.par)) : undefined) ?? (byName.length === 1 ? byName[0] : undefined);
    if (!genus || row.rnk !== 'species' || row.tdf || !row.nam.startsWith(`${genus.name} `)) {
      quarantine.push({ id: row.oid, name: row.nam, reason: 'No unambiguous accepted genus/binomial in this scope.', raw: row });
      continue;
    }
    species.push({ ...common(row), rank: 'species', genus_id: genus.id, epithet: row.nam.slice(genus.name.length + 1) });
  }
  const redirectStatuses = new Set(['subjective synonym of', 'objective synonym of', 'replaced by']);
  const aliases: Alias[] = [];
  const unresolvedHistoricalNames: { id: string; name: string; status: string; target: string | null }[] = [];
  for (const row of inputs.aliases) {
    if (!row.tdf) continue;
    const target = row.acc ? genusById.get(id(row.acc)) : undefined;
    if (redirectStatuses.has(row.tdf) && target) {
      aliases.push({ id: id(row.oid), name: row.nam, slug: slug(row.nam),
        accepted_genus_id: target.id, source_status: row.tdf, reference: reference(row) });
    } else {
      unresolvedHistoricalNames.push({ id: row.oid, name: row.nam, status: row.tdf, target: row.acc ?? null });
    }
  }
  const byName = (a: { slug: string }, b: { slug: string }) => a.slug.localeCompare(b.slug);
  const catalog = parseCatalog({
    schema_version: 1, generated_at: inputs.generatedAt, scope: 'non-avian-dinosaurs',
    source: 'PBDB', license: 'CC-BY-4.0',
    attribution: 'Paleobiology Database and its contributors; original references are preserved per taxon. Data normalized by PaleoAtlas API.',
    exclusions: ['Aves', 'Avialae', 'ichnotaxa', 'form taxa', 'unpublished sources'],
    evidence: inputs.evidence,
    caveats: [
      'Accepted means accepted in the PBDB classification at retrieval, not universal scientific consensus.',
      'published=yes is a source filter, not an independent audit of ICZN nomenclatural availability.',
      'Aves and Avialae are both excluded because the source represents their descendants in separate branches.',
      'Taxonomy has not been independently reviewed; uncertain or outdated placements may remain. Homonymous source records are preserved by identifier.',
      `${quarantine.length} species were quarantined because their genus/binomial could not be resolved within this scope.`,
      'Measurements, occurrence localities, images and narrative descriptions are not yet imported.',
      'The avian exclusion is operational; boundary taxa and alternative phylogenies require scientific review.',
    ],
    genera: genera.sort(byName), species: species.sort(byName), aliases: aliases.sort(byName),
  });
  return {
    catalog,
    report: {
      generated_at: inputs.generatedAt,
      counts: { raw_genera: inputs.genera.length, raw_species: inputs.species.length,
        accepted_genera: genera.length, distinct_genus_names: genusByName.size,
        published_species: species.length, resolved_aliases: aliases.length,
        quarantined_species: quarantine.length, unresolved_historical_names: unresolvedHistoricalNames.length },
      ambiguous_genus_names: [...genusByName.entries()].filter(([, rows]) => rows.length > 1)
        .map(([name, rows]) => ({ name, ids: rows.map((row) => row.id) })),
      quarantine, unresolved_historical_names: unresolvedHistoricalNames,
    },
  };
}
