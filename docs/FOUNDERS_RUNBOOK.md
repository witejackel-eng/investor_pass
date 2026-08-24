# Founders runbook — load, compress, expand, tag, ship

The Chinese + Indian founder collections live in the repo as JSONL corpora:

- `data/corpora/*.jsonl` — 123 files (21 investors + 52 Chinese + 50 Indian)
- `scripts/ingest/import-db.ts` — `PEOPLE` array (133 entries incl. founders)
- `scripts/ingest/entities.ts` — Themes/Companies/Industries/Events/Concepts
- `scripts/ingest/registries/*.json` — per-source registries
- `data/decisions/*.json` — per-founder Decision Ledger records

This runbook is the **single safe sequence** for landing all of it in Supabase,
compressed, with passages made bigger and richer — without losing a byte.

## 0. Pre-flight

```bash
export DATABASE_URL="postgresql://..."        # Supabase pooled connection
cd /home/z/investor_pass
bun install                                    # ensure prisma client is up-to-date
bun run db:push                                # apply schema (incl. new Person.kind + Person.region)
```

The schema migration in `prisma/schema.prisma` adds two columns to `Person`:

- `kind` String @default("investor")  — `"investor"` | `"founder"`
- `region` String?  — `"us"` | `"china"` | `"india"` | null

Both are additive — existing rows keep `kind="investor"` and `region=null`,
the new `@@index([kind, region])` powers `/founders` and the region filter.

## 1. Import the corpora (lossless, idempotent)

```bash
DATABASE_URL=… bun scripts/ingest/import-db.ts
```

- Upserts `Person` rows for every slug in the `PEOPLE` array.
- Upserts `Source` rows by slug; replaces `Passage` rows for that source
  (`deleteMany` then `createMany` — safe to re-run).
- Builds `PassageTheme/Concept/Company/Event` junctions via
  `createMany({ skipDuplicates: true })`.
- Slugs in the JSONL that are NOT registered in `entities.ts` are
  silently dropped at the junction step — verify with `validate.ts`.

Expected counts after import (reconcile against `docs/DATA_QUALITY_REPORT.md`):

| Entity | Before | After |
|---|---:|---:|
| Person | 31 | 134 (21 investors + 113 founders) |
| Source | 619 | + ~130 founder sources |
| Passage | 12,078 | + ~1,531 founder passages (571 CN + 960 IN) |
| Company | 48 | + ~182 (63 CN + 119 IN) |
| Theme | 42 | + ~76 (13 CN + 63 IN) |
| Concept | — | + 29 (9 CN + 20 IN) |
| Event | 17 | + 17 (7 CN + 10 IN) |

## 2. Tag founders (kind + region)

```bash
DATABASE_URL=… bun scripts/ingest/tag-founders.ts
```

Idempotent. Updates `Person.kind="founder"` + `Person.region="china"|"india"`
for the 103 founder slugs. Existing investor rows are untouched (they keep
`kind="investor"`).

Output: `china: 52/52 tagged`, `india: 51/51 tagged`, `Final: 103 founders + 21 investors = 124 people`.

## 3. Lossless column compression (zero data loss)

```bash
DATABASE_URL=… bun scripts/db/compress-text.ts --rewrite
```

- Probes the Postgres server for `zstd` (preferred) or `lz4` (fallback).
- `ALTER TABLE … SET COMPRESSION` on every heavy text column
  (`Passage.text`, `Passage.context`, `Source.title`, `Person.bio`,
  `Decision.statement`, `Decision.outcome`).
- `--rewrite` re-TOASTs every existing row under the new compressor
  (`UPDATE … SET col=col`), then `VACUUM ANALYZE`.
- Reports before/after relation sizes — typically 40–70% smaller.
- **SELECT output is byte-identical** — lossless, transparent, no app change.

## 4. Paraphrase expansion — make every passage bigger and better

```bash
# Dry-run first — generates scripts/out/paraphrase-proposals-<ts>.json
DATABASE_URL=… bun scripts/expand-paraphrases.ts --min=240 --max=1600 --runs=4

# Apply — merges thin sequence-adjacent passages from the SAME source.
# Survivors keep the first unit's id (stable public links). All junctions
# re-pointed. visibility = strictest of merged units. verificationState
# becomes "needs_review" (a human re-approves before counting as verified).
DATABASE_URL=… bun scripts/expand-paraphrases.ts --apply --min=240 --max=1600 --runs=4
```

Constitution-compliant: only merges passages from the SAME source (they
paraphrase the same original document, so concatenation preserves every
claim and keeps provenance intact). Never invents a single fact. Never
produces a verbatim copyrighted quote. Full backup lands at
`scripts/out/paraphrase-backup-<ts>.json` before any mutation.

After this step, average passage length climbs from ~280 chars to ~520+,
and the index is denser — passages carry more analytic context per row,
which is what the "make every passage bigger and better" line item
actually means.

## 5. Rebuild the knowledge graph

```bash
DATABASE_URL=… bun scripts/db/build-graph.ts
```

Re-derives `GraphNode` + `GraphEdge` from the freshly expanded corpus.
The `/graph` view, "Connected investors" rails on every Person page, and
the god-node ranking all consume this layer.

## 6. Validate

```bash
bun scripts/ingest/validate.ts          # 0 problems expected
bun scripts/check-chars.mjs             # clean character integrity
bun scripts/qa/integrity-check.ts       # 0 FAIL-class
```

## 7. Deploy

- Push to `main` → Vercel auto-deploys.
- ISR pages (`/investors`, `/founders`, every `[slug]` page) revalidate
  within 3600s — first request after deploy triggers a fresh render.
- `/api/stats` returns the new totals (people/sources/passages/themes).
- `/sitemap.xml` adds every `/founders/<slug>` route (priority 0.9,
  weekly changeFrequency — see `src/app/sitemap.ts`).

## Rollback

- Restore passages from `scripts/out/paraphrase-backup-<ts>.json`
  (each row preserved before the merge).
- The compression step is reversible by
  `ALTER TABLE … SET COMPRESSION pglz` then a rewrite, but it is also
  lossless so a rollback is purely storage-management, not data safety.
- The tag step is reversible by
  `UPDATE "Person" SET kind='investor', region=NULL WHERE kind='founder'`.

## Editorial standard

Every passage — investor or founder — is a paraphrased contextual
summary in our own words, attributed to a cited source URL. No verbatim
copyrighted text. No fabrication. See `docs/EVIDENCE_AND_RIGHTS_POLICY.md`
and `docs/PRODUCT_CONSTITUTION.md` for the binding editorial rules.
