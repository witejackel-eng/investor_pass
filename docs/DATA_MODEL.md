# Data Model

The Prisma schema (`prisma/schema.prisma`, Postgres) in one document: how the
34 models relate, what the important fields mean, the invariants the product
depends on, and which data is derived.

## Entity relationship map

```text
IDENTITY / ENTITLEMENT
User ─┬─ Session, PasswordResetToken
      ├─ Subscription (state machine, provider ref)
      └─ SearchEvent (analytics, no FK)

KNOWLEDGE CORE
Person ──── Source ──── Passage
  │           │           │
  │           │           ├── PassageTheme ──── Theme
  │           │           ├── PassageConcept ── Concept
  │           │           ├── PassageCompany ── Company ── Industry
  │           │           └── PassageEvent ──── Event
  │           ├── RelatedSource (source ↔ source)
  │           └─ (decisions may cite a Source)
  ├── PersonTheme ──── Theme          (sparse; pages derive via passages)
  ├── PersonCompany ── Company        (sparse; pages derive via passages)
  └── Decision ──┬─ Company? (REGARDING)
                ├─ Event?
                └─ Source? (evidence)

PERSONAL / RETENTION
User ─┬─ Follow (person|topic|concept|company|event|source|search)
      ├─ VisitCursor (new-since-last-visit, one row)
      ├─ Notification (fan-out, read state)
      ├─ PassageProgress (userId, passageId) — reading continuity
      ├─ Bookmark / SavedSearch
      └─ Collection ── CollectionItem

GRAPH LAYER (derived, rebuildable)
GraphNode (person|source|passage|theme|concept|company|event|year|decision)
GraphEdge (typed relations, EXTRACTED|INFERRED confidence)
InvestorRelation (seed: lineage/apprenticeship/cohort edges)

EDITORIAL
Correction (entity, issue, state machine)   Changelog (public editorial log)
```

## Model notes

### Person
- `status`: `"active" | "coming_later"` — only active investors are indexed,
  counted in stats (31 active), and listed in the sitemap.
- `slug` is unique and canonical; every entity reference in the UI resolves
  through slugs, never free text.

### Source
- `sourceType`: shareholder_letter | annual_report | speech | interview |
  meeting_transcript | news | book.
- `provenanceStatus`: `"verified" | "review" | "imported"` — how the record
  entered the corpus.
- Carries publisher, year, publicationDate, URL, description; indexed on
  `(personId, year)` and `year` for directory and year-span queries.
- `RelatedSource` links sources to each other (sequence reading).

### Passage
- `text` is a paraphrased contextual summary — never a verbatim copyrighted
  quote. `context`, `page`, `section`, `sequence` preserve position inside the
  source for continuous reading.
- `visibility`: `"public" | "pro"` — anonymous HTML and free users only ever
  receive public passages; filtering happens server-side.
- `verificationState`: `"verified" | "provisional" | "needs_review" |
  "rejected"` — editorial gate. Public surfaces never render
  `needs_review`/`rejected` content, and it is excluded from retrieval.
- Indexed on `(sourceId, visibility)` — the hot shape for every public page.

### Theme vs Concept
Two distinct tables, deliberately not merged: a Theme is a broad subject
(Risk, Capital Allocation); a Concept is a named analytical idea (Margin of
Safety, Share Repurchases). Both hang off passages through junctions.

### Company / Event / Industry
- Company: `slug` canonical, `canonicalName`, optional `ticker`, optional
  Industry.
- Event: dated market moments (black-monday-1987, dot-com-crash,
  covid-crash, 2008-financial-crisis, ...) linked to passages and decisions.

### Decision
- Core fields: `title`, `date`, `description`, optional `companyId`,
  `eventId`, `sourceId`.
- Decision Ledger extensions: `statement` → `action` → `outcome`, plus
  `outcomeSourceUrl` (where the outcome is documented) and `decisionDate`.
- `confidence`: `"high" | "medium" | "inferred"`; `verified` boolean.
- 82 decisions in the corpus; Buffett 22, the 11 corpus-map investors 4-7
  each.

### Junctions
`PassageTheme`, `PassageConcept`, `PassageCompany`, `PassageEvent`,
`PersonCompany`, `PersonTheme`, `RelatedSource` — all composite-PK join
tables with cascade deletes. `PersonTheme`/`PersonCompany` are sparsely
populated; investor↔entity relationships are derived through passages.

### Personal layer
- `Follow`: entityType + entityId (+ denormalized `label` for fast UI),
  `alertFrequency` (`off | weekly | instant`), unique per
  (user, entityType, entityId).
- `VisitCursor`: one row per user; advanced by `/api/new-since` — banner-once
  semantics.
- `Notification`: write-time fan-out (see `src/lib/server/fanout.ts`), read
  state via `readAt`.
- `PassageProgress`: composite PK (userId, passageId); powers "Continue
  reading".
- `Bookmark` (Pro write), `SavedSearch`, `Collection`/`CollectionItem`.

### Graph layer
- `GraphNode`: `id` strings like `person:buffett`, `theme:compounding`,
  `year:1988`; `kind`, `label`, `slug`, `href` (deep link), `weight`
  (degree — god-node ranking), `communityId`.
- `GraphEdge`: deterministic MD5 id (`md5(sourceId|targetId|relation)`),
  `relation`, `confidence` (`EXTRACTED` from schema relations vs `INFERRED`
  from shared-tag analysis), `weight`.
- Relations emitted by the builder: WROTE, CONTAINS, TAGGED, COVERS, MENTIONS,
  REFERENCES, PUBLISHED_IN, MADE, REGARDING, ASSOCIATED_WITH, FOCUSES_ON,
  RELATED_TO, SHARED_THEME, SHARED_COMPANY (INFERRED), and
  STUDIES_WITH / LINEAGE_OF / COHORT_OF from `InvestorRelation` seeds.
- Communities: label propagation over the investor x theme x company graph
  (12 async rounds); when the dense graph collapses propagation, the builder
  falls back to per-investor ego clusters.

### Editorial
- `Correction`: entityKind/entityId, issueType (factual | sourcing |
  attribution | tagging | duplicate | other), state machine
  `submitted → reviewed → corrected | rejected`, optional submitter email.
- `Changelog`: dated, categorized (corpus | feature | editorial | fix),
  markdown-lite body, rendered on the public changelog surface.

## Invariants

1. Every passage has a source (FK-enforced; integrity check guards against
   empty-string sourceIds).
2. Public HTML only shows `visibility = "public"` passages, and never
   `needs_review`/`rejected` ones — enforced in `src/lib/server/public-pages.ts`
   and the search layer, server-side only.
3. Decisions always carry a `sourceId` (verified 100% coverage).
4. A decision's person always matches its source's person (no cross-investor
   contamination).
5. Entity slugs are unique by schema constraint (`@unique`); canonical IDs,
   never free text.
6. Passages are paraphrases with attribution — the editorial rule the whole
   corpus is written under.

## Derived data

`GraphNode`/`GraphEdge` are fully derived from the relational core: rebuild
with `bun scripts/db/build-graph.ts` after any corpus import. `InvestorRelation`
rows (seeded by `scripts/ingest/import-corpus-map.ts`) are consumed by the
builder as lineage/apprenticeship/cohort edges. Never edit graph tables by
hand; change the source data and rebuild.
