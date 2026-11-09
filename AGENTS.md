# Working on PaleoAtlas API

This repository contains the dinosaur catalog API only. Keep RPG rules, player state and combat attributes in a separate project.

## Before changing the domain

- Read [CONTEXT.md](CONTEXT.md) for canonical terms and [docs/SCOPE.md](docs/SCOPE.md) for eligibility rules.
- When changing source queries, normalization, taxonomic boundaries or aliases, read [docs/DATA_POLICY.md](docs/DATA_POLICY.md) and [docs/research/pbdb-count-and-pokeapi.md](docs/research/pbdb-count-and-pokeapi.md).
- When changing storage or runtime lifecycle, read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- When deploying or changing environment variables, read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Invariants

- Preserve PBDB identities, reference citations, retrieval timestamps and evidence hashes.
- Label source acceptance separately from independent scientific review.
- Resolve historical names only with an explicit source relation to an eligible accepted genus. Keep unresolved or dubious names in the report.
- Preserve homonyms by ID; ambiguous name lookups return candidates with HTTP 409.
- Quarantine inconsistent species/genus relationships. Record the reason and original record.
- Represent unknown values as absent/null or empty observation lists. Every measurement requires a source; keep methods, units and uncertainty explicit.
- Treat a change in avian boundary or source authority as a domain change requiring documentation and regression tests.

## Verification and data changes

- Run `npm run check` before handing off code. CI also verifies the PostgreSQL loading path.
- For data refreshes, review the staged report, promote with `npm run data:publish`, archive with `npm run data:archive`, and run the checks. Commit the snapshot, report and matching compressed evidence together.
- Source-only collection must not silently publish into the live catalog.
- Update the README's dated counts when publishing a new snapshot, and explain removals, ambiguous names and quarantined records in the report.
- Keep secrets in local environment variables; `.env` and temporary credential helpers stay outside version control.
- Record durable domain decisions in docs; use ADRs only for significant trade-offs. CONTEXT.md remains a glossary.
