# Investor/Pass

**The public record, properly indexed.**

Live: <https://investorpass.vercel.app> · Source: <https://github.com/witejackel-eng/investor_pass>

## Contents

- [What it is](#what-it-is)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Search and performance](#search-and-performance)
- [Security](#security)
- [Editorial and legal](#editorial-and-legal)
- [License](#license)

---

## What it is

Investor/Pass is a premium research product that indexes the public record of exceptional investors — shareholder letters, interviews, speeches, and appearances — into a single, searchable, cross-referenced library of investor thought.

The launch collection is Warren Buffett: roughly 420 sources and 12,000 passages spanning 1977–2024, organized across more than 40 themes and 40 companies, from economic moats and market cycles to specific decisions on specific businesses. Charlie Munger, Howard Marks, Peter Lynch, John Bogle, Benjamin Graham and more are staged to follow, each indexed the same way: sources broken into passages, passages tagged by theme, concept, company, and event, and every record connected back to where it came from.

The product thesis is that a research library becomes a research habit only when it remembers what you care about. So indexing is half the work: the other half is the follow layer — watch what you follow, tell you what is new since your last visit, and keep your place in the record. Discover, search, understand, compare, follow, save, return. The site is built to make that loop effortless.

The editorial standard is strict and deliberate. Every record carries full provenance — publisher, date, source type, and a link to the original. Passages are paraphrased contextual summaries with attribution, never verbatim copyrighted quotes. And everything on the site is historical reference material for the study of investor thinking, never investment advice.

## Features

### Research

- **Deterministic search with intent parsing** — queries are parsed into structured filters (investor, theme, company, concept, event, year or decade) plus free-text tokens, then ranked by weighted scoring. Search spans all investors at once unless you scope it to one.
- **Research trails** — curated multi-stop paths through the corpus, connecting passages across sources, years, and ideas.
- **Compare** — investors side by side, on the ideas and companies where their records overlap.
- **Decision ledger** — the public record on specific decisions: what was said, when, and in what context.
- **Entitlement enforced server-side** — pro passages are never sent to clients that are not entitled to them.

### Reading experience

- **Timelines** — a person's record laid out year by year.
- **Theme pages** — everything an investor has said about a subject (moats, inflation, risk), across decades.
- **Company and event pages** — the record attached to a business or a moment in market history.
- **Year pages** — what was being said in 1987, 2008, or any year in the corpus.

### Account

- **Free and Pro tiers** — free readers get a bounded view of every page (the full reference count is always shown, as the paywall teaser: "Showing 5 of 37 references"); Pro unlocks the complete library, billed monthly or annually through Razorpay or PayPal, priced in USD and INR.
- **Bookmarks and collections** — save individual passages and organize them.
- **Saved searches** — keep the queries that matter.
- **Following (a watchlist for ideas, not stocks)** — follow investors, themes, companies, and events; get alerts and a "new since your last visit" brief when new references land.
- **Weekly digest** — a deterministic recap of activity across what you follow, in-product and by email.
- **Reading progress** — passage-by-passage progress is tracked, and the home surface offers to pick up where you left off.
- **Personal home** — your follows, recently viewed passages, and what is new, on one screen.

### Platform

- **Google OAuth and email/password sign-in**, with hand-rolled sessions.
- **ISR-cached public pages** — server-rendered, crawler-friendly routes at `/investors`, `/themes`, `/companies`, `/events`, and `/years`, revalidated on an hourly cycle.
- **Edge-cached library statistics** — counts served with `s-maxage` caching; if the database is unreachable, the API fails to 503 so the UI hides the stat rows rather than ever showing stale-wrong numbers.
- **Dark mode**, a command palette, and keyboard shortcuts throughout.
- **One app, two surfaces** — ISR-cached public pages for search engines and anonymous readers; the full client application for signed-in research.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 with the shadcn/ui component set and a custom editorial design system |
| Database | Supabase Postgres, accessed through Prisma ORM |
| Client state | Zustand (SPA state) and TanStack Query (server state) |
| Authentication | Email/password (scrypt hashing) plus Google OAuth, with hand-rolled HMAC-signed sessions |
| Payments | Razorpay and PayPal adapters, with mock and live modes |
| Testing | `bun test` — 32 API-route cases |
| Deployment | Vercel, with functions pinned to `icn1` (Seoul), next to the Supabase database |

The public SEO surface is a set of ISR-cached, server-rendered routes (`/investors`, `/themes`, `/companies`, `/events`, `/years`, and the legal pages); the signed-in product is a client SPA at `/` served by the same app. Anonymous HTML only ever contains `visibility: "public"` passages — pro records are filtered out server-side before rendering, never hidden client-side.

## Getting started

### Prerequisites

- [Bun](https://bun.sh) 1.2 or newer
- A Supabase Postgres project (any Postgres with the `pg_trgm` extension available will also work)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/witejackel-eng/investor_pass.git
   cd investor_pass
   ```

2. Install dependencies (this also runs `prisma generate` via postinstall):

   ```bash
   bun install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Then fill in `.env`. The key variables:

   | Variable | Purpose |
   | --- | --- |
   | `DATABASE_URL` | Supabase Postgres connection string (pooler URL, session mode) |
   | `SESSION_SECRET` | HMAC signing key for session tokens — generate with `openssl rand -hex 32` |
   | `PUBLIC_SITE_URL` | Canonical site origin (used for OAuth redirects, SEO metadata) |
   | `SITE_PRELAUNCH` | `"true"` hides the site from crawlers and enables the testable password-reset flow; unset is production behavior |
   | `PAYMENTS_MODE` | `"mock"` keeps the demo checkout flow; `"live"` routes through the real processors |
   | `MOCK_CHECKOUT_ENABLED` | Grants Pro without payment — opt-in, pre-launch only |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials; redirect URI is `{PUBLIC_SITE_URL}/api/auth/google/callback` |

   Razorpay and PayPal credentials (keys, webhook secrets, plan IDs) are only needed when `PAYMENTS_MODE=live`. See `.env.example` for the full list.

4. Push the schema and build the search indexes:

   ```bash
   bun run db:push
   bun scripts/db/optimize.ts
   ```

   `optimize.ts` is idempotent: it enables `pg_trgm`, creates the trigram and composite indexes the search path depends on, and refreshes planner statistics. Re-run it after any `prisma db push`, which drops indexes it cannot express in the schema.

5. Start the dev server:

   ```bash
   bun run dev
   ```

   The app runs at `http://localhost:3000`.

The passage corpora ship with the repository as JSONL under `data/corpora/`, alongside source registries under `scripts/ingest/registries/` and the ingest pipeline under `scripts/ingest/` for validating, building, and importing them.

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `bun run dev` | Start the Next.js dev server on port 3000 (output also logged to `dev.log`) |
| `build` | `bun run build` | Production build, assembled into a standalone server output |
| `start` | `bun run start` | Run the standalone production server with Bun |
| `lint` | `bun run lint` | ESLint across the repository |
| `test` | `bun test` | API-route test suites (32 cases) |
| `db:push` | `bun run db:push` | Push the Prisma schema to the database |
| `db:generate` | `bun run db:generate` | Generate the Prisma client |
| `db:migrate` | `bun run db:migrate` | Create and apply a development migration |
| `db:reset` | `bun run db:reset` | Reset the database and reapply migrations |

The test suites run the API route handlers directly against an in-memory fake of the Prisma client (`tests/helpers/fakedb.ts`), so `bun test` needs no database connection and no environment configuration.

## Project structure

```text
src/app                 App Router entry, root layout, SPA shell at /
src/app/(public)        ISR-cached public pages: /investors, /themes, /companies, /events, /years, /legal
src/app/api             API route handlers: search, auth, follows, bookmarks, collections,
                        saved searches, digest, checkout, payment webhooks, admin
src/components/investor Product UI: views, search bar, masthead, command palette, decision ledger
src/components/ui       shadcn/ui primitives
src/lib                 Shared modules: db client, pricing, rate limiting, site config
src/lib/server          Server-only modules: search and intent parsing, public-page data,
                        JSON-LD, follow fanout
src/stores              Zustand stores
src/hooks               Client hooks (keyboard shortcuts, recently viewed, investors)
prisma                  Prisma schema (Person, Source, Passage, Theme, Concept, Company,
                        Event, Decision, User, Session, Subscription, and relations)
scripts                 Ingest pipeline, seed scripts, and db/optimize.ts
data                    Source registries and passage corpora (JSONL), decision records
docs                    Master plan, execution plans, product and payments specs
tests                   bun test suites for API routes
```

## Search and performance

- **Trigram indexes.** Search runs token-based `ILIKE` matching over passage text and source titles, backed by `pg_trgm` GIN indexes created by `scripts/db/optimize.ts`. Without them, every query is a sequential scan; with them, per-token lookups become index scans.
- **Composite indexes for hot shapes.** `Passage(sourceId, visibility)` covers every public-page passage filter; `Source(personId, year)` covers directory counts and year spans.
- **Per-person SQL aggregation.** Public entity pages compute their counts and relationships in SQL on the server; the client receives page-ready data, never the corpus.
- **ISR on public routes.** Public pages revalidate on a one-hour cycle, so crawlers and anonymous readers get fast static HTML while the data stays fresh.
- **Region pinning.** Vercel functions are pinned to `icn1` (Seoul), in the same region as the Supabase database, keeping query round-trips short.

## Security

- **Password hashing with scrypt** (per-user salts, `timingSafeEqual` comparison); legacy hashes are verified for compatibility and transparently upgraded on next login.
- **HMAC-signed session tokens** in an httpOnly cookie, verified server-side on every request.
- **Rate limiting** on authentication endpoints via a sliding-window limiter.
- **Signed, fail-closed payment webhooks** — Razorpay and PayPal events are signature-verified before anything is applied.
- **Security headers on every response** — CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies.
- **Secrets live only in environment variables.** `.env.example` is the template; real secrets are never committed.

## Editorial and legal

- **Paraphrase policy.** Passages are paraphrased contextual summaries written for this product, with attribution to the original source. Verbatim copyrighted quotes are not reproduced.
- **Provenance on every record.** Publisher, date, source type, and a link to the original accompany every source and passage.
- **Historical reference only.** Nothing on Investor/Pass is investment advice, and nothing in the corpus should be read as a recommendation.
- **Corrections and takedowns.** Factual corrections are part of the editorial standard. Rights holders with an attribution concern can reach the operator at `contact@investorpass.app`; the notice-and-takedown procedure is published at `/legal/copyright`.

## License

Proprietary — all rights reserved. © Investor/Pass
