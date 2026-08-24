# Changelog

Public-facing product changes. Corrections to the record appear here per the
evidence policy (Reported → Review → Correct → Verify → Changelog).

## 2026-08-24 — Free-everywhere release

### Preview-build outage fix + US founders collection (this release)
- FIXED (P0, third build-outage class): every preview deployment on
  content branches (founders-collection dd1dff2…8463b6d) died at "Collecting
  page data" with `PrismaClientConstructorValidationError: Invalid value
  undefined for datasource "db"`. Root cause: `src/lib/db.ts` passed
  `datasources: { db: { url: undefined } }` when DATABASE_URL was absent in
  the build environment (the env var is scoped Production-only in Vercel),
  which throws at module-evaluation time — before any failure-safe wrapper
  can degrade. Fix: omit `datasources` entirely when the URL is missing;
  validation then defers to first query where the safe()/try-catch layers
  handle it. Verified locally: full `bun run build` with DATABASE_URL unset
  now completes exit-0 (all 702 routes; sitemap degrades to static entries,
  generateStaticParams return [] and pages render on demand).
- NEW: **US founders collection** — merged the founders-collection branch:
  Andrew Carnegie, J.P. Morgan, John D. Rockefeller, Henry Ford, Bill Gates,
  Steve Jobs, Jeff Bezos, Elon Musk (8 founders, 133 sources, 329
  paraphrased passages at 140-180 words each, 57 decisions). Ingested via
  import-db + seed-decisions + tag-founders (kind="founder", region="us").
- NEW: /founders region filter gains UNITED STATES (us|china|india); US
  founders sort first (sortOrder 1-8, chronological).
- PAYWALL: final visible-paywall sweep — removed the START PRO gate asides
  from /investors and /founders, replaced PassageBoundary's paywall copy
  with a neutral "search the full library" nudge (it was showing "Showing
  9,999 of N references" on every truncated entity page), and dropped the
  "Upgrade to Pro" ⌘K palette item. Database: all 14,175 passages now
  visibility="public"; all users entitlement="pro"; imports always land
  public while the paywall is dormant.
- DATA: Druckenmiller +16 sources (165 passages) and Swensen +20 sources
  (106 passages) from the expand-paraphrases pass ingested.

## 2026-02 — Launch releases

### End-to-end execution pass
- Homepage: canonical §49 order; "How finance works" feature with investor bridge; "Buffett × Marks on risk" research feature (live counts); personal-research preview for guests; newsletter section with inline subscribe.
- Search examples on the hero now open real explainers or run real searches; placeholder set led by "What are you curious about?"
- View analytics for Learn and Newsletter pages (existing events pipeline).

### Launch release (62ef27b)
- NEW: **How Finance Works** (`/learn`) — hedge funds, short selling, quantitative investing — every explainer connected to the indexed record.
- NEW: **Newsletter** (`/newsletter`) — issue #1 "Why I'm indexing the public record"; free subscribe.
- NEW: "Who talks about risk?" — live per-investor coverage on the homepage (real counts from the database).
- NEW: Decision-ledger demo (Buffett · 1988 · Coca-Cola, verified, sourced) and featured 2008 trail on the homepage.
- CHANGED: Pro launch pricing — **$9/month · $79/year (save 27%)**; ₹499/₹3,999 provisional in India.
- CHANGED: brand-exact social card, app icon, and apple icon.
- FIXED: raw passage identifiers no longer appear anywhere in the interface ("Continue exploring" now shows readable research labels).

### Final acceptance + Control Room (db6d895)
- NEW: **Control Room** — private ops dashboard at `/ops/*` (ops.investorpass.com): server-side scrypt auth, 13 sections (overview, software architecture graph, live evidence graph, data completeness, §53 integrity, features, routes, agents, changes, deployments, external services, issues, docs), read-only.
- CHANGED: hero → "Understand the money. Study the minds. Follow the evidence." (blue on the middle line); one accent token `--signal #1647D8`.
- CRITICAL FIX: the editorial palette utilities (bg-ink, bg-paper, text-signal-dark, …) were silently missing from production CSS since launch — now mapped and verified live.
- Search CTA reads "SEARCH THE RECORD"; decision demo labeled DOCUMENTED → ACTION → WHAT HAPPENED NEXT?

### Database-outage fix (23c7d96)
- FIXED (P0): intermittent site-wide "database unavailable" — Supabase session-pooler (15-client cap) exhausted by frozen serverless instances pinning session slots (EMAXCONNSESSION). Prisma now routes through the transaction pooler (`:6543` + `pgbouncer=true`, auto-rewritten in `src/lib/db.ts`; opt-out `IP_DB_SESSION_POOLER=1`), with `connection_limit=1` + transient retry retained. Verified: 8/8 and 15/15 concurrent search bursts pass (previously 5/8 failed); ops DATABASE check PASS.

### Founder grant + paraphrase/expansion tooling (this release)
- NEW: owner test grant — witejackel@gmail.com receives Pro automatically on next login (server-side, idempotent, auditable via Subscription provider "founder_grant").
- NEW: scripts/expand-paraphrases.ts — same-source adjacent-unit merge pipeline for fuller research units (dry-run default, --apply with backup, needs_review gating per evidence policy).
- NEW: scripts/db/compress-text.ts — lossless zstd/lz4 TOAST compression for text columns (+ /ops/data paraphrase-depth profile panel).

### BUILD-OUTAGE postmortem + fix (this release)
- REGRESSION (23c7d96–0ffb912): every production build failed at static generation — the 5432→6543 transaction-pooler auto-rewrite made heavy SSG queries (investor pages; Marks = 4,071 passages) far slower without prepared statements, queueing the 3 build workers past pool_timeout=60. Five commits (23c7d96, 2a0512f, 5e2b1db, 2436642, 0ffb912) therefore never deployed; the live site kept serving b315e7c.
- FIX: db.ts no longer rewrites pooler URLs, ever. Phase-aware limits (build: connection_limit=3 — the configuration every successful deployment used; runtime: connection_limit=1 + transient retry — the b315e7c runtime configuration verified under 15-way concurrency). Explicit :6543 URLs still get pgbouncer=true appended (operator's choice, honored).
- middleware.ts → proxy.ts (Next 16 convention; removes the deprecation warning in every build log).
- Indexing audit: junction tables are covered by composite PKs (passageId leftmost); trigram + composite indexes live via scripts/db/optimize.ts — re-run it after any future `prisma migrate` (README rule).

### SEO: real paths for the app's crown jewels (this release)
- NEW /search and /compare — real, shareable, server-rendered URLs replacing the #/view=… hash islands (hash fragments are never sent to servers and cannot be indexed). Bare pages are indexable SEO landings (server-rendered h1/lede/internal links + metadata); /search?q=… is noindex,follow per Google's internal-search guidance. In-app hash navigation keeps working inside the same AppRoot shell.
- Homepage hero example chips + START RESEARCHING + masthead SEARCH/COMPARE now link to real URLs (crawlable internal links); public header SEARCH THE LIBRARY → /search.
- JSON-LD: Article schema on learn explainers + newsletter issues (Person already on investors; breadcrumbs sitewide).
- sitemap.xml: +/search +/compare (375 URLs).
