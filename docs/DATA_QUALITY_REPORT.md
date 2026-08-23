# Data Quality Report

Corpus state, integrity results, and coverage profile for the 31-investor
collection. Counts below were re-verified directly against the production
database at the time of writing; the integrity gate
(`bun scripts/qa/integrity-check.ts`) passes clean.

## Corpus counts (verified)

| Entity | Count |
| --- | --- |
| Active investors | 31 |
| Sources | 619 |
| Passages | 12,078 |
| Themes | 42 |
| Concepts | 25 |
| Companies | 48 |
| Events | 17 |
| Decisions | 82 |
| Graph nodes | 13,000 |
| Graph edges | 29,663 |
| Research trails | 3 |

Event coverage includes the four market moments the product is indexed
around: 2008 (financial crisis), 1987 (Black Monday), the dot-com era
(bubble and crash), and COVID (crash), alongside 2022-rate-shock, LTCM-1998,
Salomon, and others.

## Integrity check results

Run: `bun scripts/qa/integrity-check.ts` — all checks pass.

| Check | Result |
| --- | --- |
| Passages without a source | 0 |
| Decisions without a source | 0 (100% coverage) |
| Public passages in needs_review/rejected | 0 |
| Cross-investor contamination (decision.person ≠ source.person) | 0 |
| Orphaned junction rows | 0 |
| Active investors with no public passages | 0 (none thin) |
| Malformed source URLs | 0 |
| Duplicate entity slugs | 0 (impossible — `@unique` schema constraint) |
| Double-encoded mojibake (Ã / â€ / Â sequences) | 0 |
| Verification states | 12,078/12,078 passages `verified` (no provisional/needs_review/rejected rows present) |

## Coverage by investor

Sources / passages / decisions per active investor, grouped by coverage tier.
Passage depth is where the tiers diverge: Tier B investors carry
research-map-grade source registries but thin passage depth (4-7 passages
each vs Buffett's 3,016).

| Tier | Investor | Sources | Passages | Decisions |
| --- | --- | --- | --- | --- |
| A — deep | marks | 164 | 4,071 | 0 |
| A — deep | buffett | 68 | 3,016 | 22 |
| A — deep | bogle | 112 | 2,353 | 0 |
| A — deep | munger | 15 | 278 | 0 |
| A — deep | pabrai | 30 | 203 | 0 |
| A — deep | smith | 13 | 326 | 0 |
| B — corpus-map | michael-burry | 20 | 7 | 7 |
| B — corpus-map | prem-watsa | 19 | 7 | 7 |
| B — corpus-map | francois-rochon | 18 | 7 | 7 |
| B — corpus-map | robert-vinall | 18 | 7 | 7 |
| B — corpus-map | tweedy-browne | 18 | 6 | 6 |
| B — corpus-map | david-einhorn | 17 | 5 | 5 |
| B — corpus-map | guy-spier | 16 | 4 | 4 |
| B — corpus-map | li-lu | 16 | 4 | 4 |
| B — corpus-map | thomas-russo | 16 | 4 | 4 |
| B — corpus-map | chuck-akre | 15 | 4 | 4 |
| B — corpus-map | nicholas-sleep | 14 | 5 | 5 |
| C — narrow-source | druckenmiller | 3 | 130 | 0 |
| C — narrow-source | graham | 3 | 96 | 0 |
| C — narrow-source | lynch | 2 | 94 | 0 |
| C — narrow-source | simons | 2 | 47 | 0 |
| C — narrow-source | livermore | 1 | 888 | 0 |
| C — narrow-source | klarman | 1 | 48 | 0 |
| C — narrow-source | swensen | 1 | 71 | 0 |
| C — narrow-source | soros | 1 | 29 | 0 |
| C — narrow-source | dalio | 1 | 6 | 0 |
| C — narrow-source | templeton | 1 | 6 | 0 |
| C — narrow-source | greenblatt | 1 | 13 | 0 |
| C — narrow-source | ackman | 2 | 310 | 0 |
| C — narrow-source | icahn | 7 | 17 | 0 |
| C — narrow-source | fisher | 4 | 16 | 0 |

Tier C investors are flagged for source deepening: most rest on 1-3 sources,
and several (dalio, templeton, greenblatt, icahn, fisher) are thin in both
sources and passages.

## Known gaps

1. Tier B passage depth. The 11 corpus-map investors have verified source
   registries (14-20 sources each, 4-7 decisions each) but only 4-7 passages
   each. The registries are ready; passage generation is the bottleneck.
2. Tier C source breadth. lynch, graham, klarman, soros, dalio, templeton,
   livermore, druckenmiller, simons, and greenblatt each rest on 1-3 sources;
   the deepening pipeline should widen these before adding new investors.
3. Decisions are concentrated. All 82 decisions belong to Buffett (22) and
   the 11 corpus-map investors (60). Marks, Bogle, Munger and the other deep
   corpora have no decision records yet.
4. Burry FCIC audio. The FCIC staff interview audio (May 18, 2010, Stanford
   FCIC static mirror) is confirmed to exist but has no transcript — it is
   indexed as a source lead, not yet as passages.
5. Greenlight letters login-gated. Einhorn's investor letters remain behind
   the greenlightcapital.com login; decks are open. Letter-derived passages
   await an access path.
6. Apostrophe artifact. 508 passages (Buffett corpus, plus one occurrence in
   livermore.jsonl) contain U+FFFD replacement characters where typographic
   apostrophes should be (for example "See�s", "don�t", "Poor�s"). The
   artifact originates in the corpus JSONL source files (1,300 occurrences in
   buffett.jsonl), not the import step. Cosmetic, but a cleanup pass over the
   source files plus re-import is warranted.

## Standing QA commands

Run before every release:

```bash
bun scripts/qa/integrity-check.ts   # evidence integrity gate (exits 1 on CRITICAL)
bun test                           # 32 API-route cases, no DB required
```

After any corpus import, also rebuild the derived graph layer:

```bash
bun scripts/db/build-graph.ts
```
