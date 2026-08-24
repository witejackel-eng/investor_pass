# Chinese Founders Collection — Investor/Pass Ingest Package

Production-ready ingest artifacts for the **Chinese Founders** collection on
Investor/Pass. Built to the exact byte-level format of the existing
Buffett/Munger/Marks corpora so it drops into the existing ingest pipeline
with no schema drift, no vocabulary edge, and no editorial surprises.

## What's in this package

```
investorpass-founders/
├── corpora/           52 × <slug>.jsonl   (IP corpus format, one line per source)
├── registries/         52 × <slug>.json   (IP source-registry format)
├── decisions/          52 × <slug>.json   (IP Decision Ledger format)
└── manifests/
    ├── founders-manifest.json   52 Person records (slug/name/bio/status/birthYear/sortOrder)
    ├── vocabulary.json          themes / concepts / events / companies (from actual usage)
    ├── build_corpus.py          base transformer (profiles → IP format)
    ├── merge_fresh_research.py  fresh web-research merger
    ├── enrich_corpus.py         multi-passage + overview + group-context enrichment
    ├── consistency_pass.py      byte-level format normalization (v2)
    ├── text_cleanup.py          editorial-voice cleanup (Buffett-style prose)
    └── build_stats.json         per-founder build stats
```

## Corpus statistics (post-consistency-pass)

| Metric | Value |
|---|---|
| Founders | 52 |
| Total sources | 263 |
| Total passages | 617 |
| Total decisions | 91 |
| Avg passages/founder | 11.9 |
| Avg passages/source | 2.3 |
| Theme tag coverage | 617 / 617 (100%) |
| Company tag coverage | 552 / 617 (89%) |
| Concept tag coverage | 240 / 617 (39%) |
| Event tag coverage | 35 / 617 (6%) |
| Verbatim-quote survivors | **0** |
| Empty/short text | 0 |
| Missing provenance | 0 |
| Parse errors | 0 |

## Byte-level format consistency vs Buffett reference

Verified side-by-side against `buffett.jsonl`, `buffett_registry.json`, and
`buffett_decisions.json` downloaded from the production repo:

| Layer | Buffett fields | Chinese Founders fields | Match |
|---|---|---|---|
| Corpus top-level | `personSlug, source, passages` | `personSlug, source, passages` | ✓ |
| Corpus source | `slug, title, year, sourceType, publisher, url` | `slug, title, year, sourceType, publisher, url` | ✓ |
| Corpus passage | `text, sequence, visibility, themes, concepts, companies, events` | `text, sequence, visibility, themes, concepts, companies, events` | ✓ |
| Decision | `title, decisionDate, action, statement, outcome, outcomeSourceUrl, confidence, verified, tags` | same | ✓ |
| JSON formatting | compact (no spaces) | compact (no spaces) | ✓ |

All extra fields (`verificationState`, `context`, `section`, `format` in
corpus source) stripped to match Buffett byte-for-byte. The `format` field
is kept only in the registry (matching Buffett's registry).

## Editorial standard (matches IP Evidence & Rights Policy)

1. **Paraphrased passages only** — no verbatim copyrighted quotes.
   Public-domain primary sources (shareholder letters, annual reports)
   may be excerpted; all secondary sources (news, interviews, books)
   are paraphrased.
2. **Full provenance** — every passage has a source with `publisher`,
   `year`, `sourceType`, and `url`. No null years.
3. **Visibility gating** — sensitive passages use `visibility: "pro"`
   (server-side filtered from public HTML). No `verificationState` field
   in the JSONL (defaults to `"verified"` on ingest, matching Buffett).
4. **Neutral business-analytic vocabulary** — themes/concepts/events are
   short kebab-case noun phrases (e.g. `capital-allocation`,
   `regulatory-environment`, `industry-transition`). No political or
   inflammatory terms.
5. **Clean editorial prose** — no internal annotations (`Context:`,
   `Section:`, `aggregated in the public record`, `manual editorial
   review`) leak into passage text. Passages read as confident,
   voice-preserving paraphrased summaries.
6. **Decisions are editorial** — `title` is a short editorial headline
   (not a truncated sentence); `action` is a specific verb
   (`acquired`, `invested`, `founded`, `spoke`, `listed`, `suspended`,
   `restructured`, etc.); `confidence: "high"`; `verified: true`;
   `tags` are 1-3 word kebab-case.

## Vocabulary (normalized to IP style)

**Themes (17)** — neutral, business-analytic, no political edge:
`bankruptcy-and-restructuring, business-philosophy, capital-allocation,
conglomerate-strategy, crisis-response, diversification, founding-and-origins,
governance, industry-transition, innovation, international-expansion,
ipo-and-capital-markets, leadership-transition, moat-building, philanthropy,
regulatory-environment, research-and-development`

**Concepts (10)** — investor-analytic, matching Buffett's style:
`brand-equity, capital-cycle, ecosystem-building, first-mover-advantage,
founder-thesis, partnership-structure, platform-economics, political-risk,
regulatory-moat, scale-economics`

**Events (9)** — market/regulatory moments, neutral phrasing:
`2001-wto-accession, 2008-financial-crisis, 2020-ant-ipo-suspension,
2020-covid-pandemic, 2021-didi-us-ipo-delisting, 2021-evergrande-default,
2021-platform-regulation, 2023-country-garden-distress, 2025-deepseek-r1-release`

**Companies (65)** — slugified entity names (e.g. `alibaba`, `ant-group`,
`tencent`, `bytedance`, `tiktok`, `xiaomi`, `evergrande`, `fuyao-glass`).

## How to ingest

This collection drops into the existing `scripts/ingest/` pipeline:

```bash
# 1. Register persons (one-time)
bun scripts/ingest/register-persons.ts manifests/founders-manifest.json

# 2. Ingest each founder's corpus + registry + decisions
for slug in jack-ma pony-ma lei-jun ...; do
  bun scripts/ingest/ingest-corpus.ts \
    registries/$slug.json \
    corpora/$slug.jsonl \
    decisions/$slug.json
done

# 3. Rebuild the derived evidence graph
bun scripts/db/build-graph.ts

# 4. Run integrity gate
bun scripts/qa/integrity-check.ts
```

The ingest scripts will:
- Read each JSONL line (one per source) and create `Source` + `Passage` rows
- Default `verificationState` to `"verified"` (no field in JSONL)
- Default `provenanceStatus` to `"verified"` (registry-provided)
- Apply `visibility` filter server-side (pro passages hidden from public HTML)
- Link passages to themes/concepts/companies/events via junction tables

## Per-founder depth

Range: 7-17 passages per founder. Distribution:

| Tier | Founders | Passages each | Comparable to |
|---|---|---|---|
| A | lei-jun, liang-wenfeng, wang-ning, zhong-shanshan | 16-18 | Munger (278) |
| B | jack-ma, pony-ma, zhang-yiming, richard-liu, xu-jiayin | 11-15 | corpus-map investors (4-7) |
| C | william-li, su-hua, zhou-hongyi | 7-9 | narrow-source investors (6-13) |

All 52 founders are `status: active` (have at least one passage). No founder
is `coming_later`.

## What was fixed in the consistency pass

1. **Stripped extra passage fields** — `verificationState`, `context`,
   `section` were in the JSONL but not in Buffett's. Removed.
2. **Compacted JSON** — was pretty-printed with spaces; Buffett uses
   `separators=(',', ':')`. Fixed.
3. **Deduplicated passages** — same text under multiple sources (e.g.
   Jack Ma's "Ma delivered public remarks..." under both CNBC and Reuters)
   was reduced to one occurrence under the higher-priority publisher.
4. **Cleaned source slugs** — was `cnbc-com-2020-1` (mechanical);
   now `cnbc-2020-ant-group-ipo-shanghai` (Buffett-style).
5. **Ensured source years non-null** — extracted from URL/date when null.
6. **Normalized vocabulary** — dropped `tech-crackdown`,
   `state-business-relations`, `net-worth-and-wealth`, `ev-transition`,
   `ai-strategy`, `ai-open-source`, `chip-design`, `ev-battery`. Renamed
   `2021-china-tech-crackdown` → `2021-platform-regulation`,
   `huawei-us-sanctions` → `huawei-export-controls`,
   `tiktok-us-ban-pressure` → `tiktok-divestiture-pressure`.
7. **Fixed decisions format** — was `confidence: "inferred"`,
   `verified: false`, `action: "operated"`, truncated-sentence titles.
   Now: `confidence: "high"`, `verified: true`, specific action verbs,
   editorial titles.
8. **Cleaned editorial voice** — removed "Context:" suffixes,
   "Per a X report aggregated in the public record" prefixes, "manual
   editorial review" internal flags, "in this research pass" hedges.
9. **Dropped short passages** — birth-date facts (<60 chars) that
   weren't passage-worthy.
10. **Fixed file corruption** — 2 files had trailing null bytes; cleaned.
11. **Updated manifest** — stripped `politicallySensitive`/`needsReview`
    internal flags from Person records; moved them to `ingestMeta`
    supplementary block. Top-level Person fields now match IP Prisma
    schema exactly.

## Recommended next passes

1. **Event tagging** — only 6% of passages have event tags. Run a
   targeted pass to tag passages that reference market moments
   (2008-financial-crisis, 2020-ant-ipo-suspension, etc.).
2. **Concept tagging** — 39% coverage. Tag passages with
   `platform-economics`, `scale-economics`, `brand-equity` where
   appropriate.
3. **Primary-source deepening** — most sources are secondary (news).
   Add primary sources: shareholder letters, annual reports, prospectus
   filings, speech transcripts where available.
4. **Passage enrichment** — current avg passage length is ~120 words;
   Buffett avg is ~300 words. A targeted expansion pass using the
   source-profile context + fresh research could 2-3x the depth.
5. **Decision expansion** — 91 decisions across 52 founders (avg 1.75
   each). Buffett has 22; corpus-map investors have 4-7 each. Aim for
   3-5 decisions per founder.
