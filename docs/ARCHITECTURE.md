# Architecture

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 +
editorial tokens (`paper/ink/graphite/rule/signal`) · Bricolage Grotesque +
Newsreader (self-hosted) · Prisma 6 → Supabase Postgres (pg_trgm + GIN) ·
Zustand SPA-on-`/` view router + TanStack Query · scrypt sessions + Google
OAuth · Razorpay/PayPal (mock default) · Vercel.

## Product layers (constitution)

LEARN (`/learn`, static typed explainers, graph-bridged)
STUDY (investors/themes/companies/events/years — ISR/SSG SEO surface + SPA consoles)
RESEARCH (search/compare/decision-ledger/trails/graph)
NEWSLETTER (`/newsletter`, AppConfig-KV subscribers)
PERSONAL (follow/save/continue/new-since — Pro-gated depth)

Loop: LEARN → STUDY → RESEARCH → SAVE → FOLLOW → RETURN → NEWSLETTER.

## Data flow rules

1. Counts are live (edge-cached endpoints), never hardcoded; 503 → hide the section.
2. Every public research unit renders with provenance (source + publisher + year).
3. Pro entitlement enforced server-side (visibility: pro never in public HTML).
4. New content layers ship as typed static data first (explainers, issues, trails) — DB migration only when volume justifies it.
5. Deterministic only: no AI/RAG/embeddings before 100 subscribers (constitution).

## Key decisions (2026-02 launch)

- **Passage = Insight, Decision = PositionAction + Outcome** (see DATA_MODEL mapping) — extend, don't rename a live schema.
- **Newsletter subscribers in AppConfig KV** — zero-migration; port to a model at scale.
- **Coverage API** (`/api/themes/[slug]/coverage`) powers "Who talks about this?" from real PassageTheme joins.
- **Assets generated deterministically** (`scripts/gen-assets.ts`, sharp) — brand-exact og.png/apple-icon/icon.svg.
- **Graphify (Graphify-Labs/graphify)** audited as a dev-architecture tool: Python CLI, Apache-2.0. SELECTIVE BORROW only (confidence taxonomy EXTRACTED|INFERRED|AMBIGUOUS, deterministic scoring, seeded clustering, surprise-with-reasons). NOT a dependency: language/runtime mismatch, LLM-wired doc path conflicts with the no-AI rule. Production evidence graph remains Prisma/Postgres (GraphNode/GraphEdge).
- **Analytics**: single stack — `track()` → `/api/events` → SearchEvent. `TrackView` extends it to server-rendered pages.

## Release gates

tsc clean · 32 route tests pass · eslint clean · `next build` clean · no raw IDs in UI · no fabricated data · pricing math exact.
