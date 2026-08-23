# Changelog

Public-facing product changes. Corrections to the record appear here per the
evidence policy (Reported → Review → Correct → Verify → Changelog).

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
