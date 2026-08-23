# Repository Audit

A factual inventory of the Investor/Pass codebase: what exists, how it works,
and what its known limitations are. Written against the repository as it stands
(34 Prisma models, 51 API route handlers, 11 public page routes).

## Framework and runtime

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS 4, shadcn/ui component set, custom editorial design system |
| Client state | Zustand (SPA view/routing state), TanStack Query (server state) |
| Testing | `bun test` (Bun runtime) |
| Build | `next build` with standalone server output, run with Bun |

One deployment serves two surfaces: ISR-cached public pages for crawlers and
anonymous readers, and a client SPA at `/` for signed-in research.

## Database and ORM

- Supabase Postgres accessed through Prisma (`prisma@^6.11.1`).
- Schema in `prisma/schema.prisma`: 34 models (see DATA_MODEL.md).
- Search depends on Postgres-specific objects installed by
  `scripts/db/optimize.ts` (idempotent): `pg_trgm` extension, GIN trigram
  indexes on `Passage.text` and `Source.title`, composite indexes
  `Passage(sourceId, visibility)` and `Source(personId, year)`, plus `ANALYZE`.
  Re-run after every `prisma db push`.
- Derived graph layer (`GraphNode`/`GraphEdge`) is rebuilt with
  `scripts/db/build-graph.ts` — currently 13,000 nodes / 29,663 edges.

## Authentication

- Email/password with scrypt hashing (per-user salt, `timingSafeEqual`
  comparison). Legacy SHA-256 hashes verify for compatibility and upgrade
  transparently on next login.
- Google OAuth (`/api/auth/google` → callback), redirect URI pinned to
  `PUBLIC_SITE_URL` in production.
- Hand-rolled sessions: `Session` table plus HMAC-signed tokens in an
  httpOnly cookie, 30-day TTL, verified server-side on every request.
- Single-use password reset tokens stored as SHA-256 hashes
  (`PasswordResetToken`), one live token per user.
- Rate limiting (in-memory sliding window) on login, signup, forgot, reset,
  checkout, corrections, and admin import routes.

## Payments

- Adapters for Razorpay and PayPal, mock and live modes, selected by
  `PAYMENTS_MODE`.
- `MOCK_CHECKOUT_ENABLED` (default off) can grant Pro without payment for
  pre-launch demos only.
- Webhooks at `/api/webhooks/razorpay` and `/api/webhooks/paypal` are
  signature-verified and fail closed.
- Subscription state machine: `free → checkout_started → active → past_due →
  canceled → expired`, reconciled by provider reference ID.
- Pricing: USD $19/$149, INR ₹999/₹7,999 (monthly/annual), geo-selected.

## Search architecture

- Intent parsing (`src/lib/server/intent.ts`): queries are parsed into
  structured filters (person, theme, concept, company, event, year range)
  plus free-text tokens; explicit UI filter params win over parsed entities.
- Token-based `ILIKE` matching over passage text and source title/publisher,
  `mode: "insensitive"` (required on Postgres), backed by the trigram indexes.
- Deterministic weighted ranking; matched tokens are highlighted in results.
- Broad queries return an exploration summary (references, investors, sources,
  per-investor counts) instead of a raw hit list.
- Search spans all investors unless scoped; the API is Pro-gated beyond a free
  preview, and pro counts are returned alongside free hits.

## Routes inventory

Public SEO surface (ISR, `revalidate = 3600`, detail pages prerendered via
`generateStaticParams`): `/investors`, `/investors/[slug]`,
`/investors/[slug]/topics/[theme]`, `/themes/[slug]`, `/companies/[slug]`,
`/events/[slug]`, `/years/[year]`, `/trails`, `/trails/[slug]`, `/legal/*`.

SPA at `/` with hash-routed views (Zustand `app-store`): home, investors,
investor console, timeline, topic, company, year, source, passage, concept,
event, search, trails, trail detail, graph, compare, library (bookmarks,
searches, collections, watchlist), account, upgrade, auth views, admin.

API (51 route handlers) grouped as:

| Group | Routes |
| --- | --- |
| Investors | `/api/investors`, `/[slug]`, `/[slug]/(years\|companies\|decisions\|themes\|timeline)` |
| Entities | `/api/passages/[id]`, `/sources/[slug]`, `/themes/[slug]`, `/concepts`, `/concepts/[slug]`, `/companies/[slug]`, `/events`, `/events/[slug]`, `/years/[year]`, `/trails`, `/changelog` |
| Research | `/api/search`, `/compare`, `/graph/(summary\|network\|node)` |
| Personal | `/api/bookmarks`, `/collections`, `/collections/[id]/items`, `/saved-searches`, `/follows`, `/follows/suggestions`, `/notifications`, `/new-since`, `/continue`, `/digest`, `/progress` |
| Auth | `/api/auth/(login\|signup\|logout\|forgot\|reset\|google\|google/callback)`, `/api/me` |
| Commerce | `/api/checkout`, `/api/webhooks/(razorpay\|paypal)` |
| Editorial | `/api/corrections` |
| Admin/ops | `/api/admin/analytics`, `/api/admin/import`, `/api/events` (allowlisted analytics events), `/api/errors` (client error reports), `/api/stats` (edge-cached, fails 503) |

## Schema summary

| Group | Models |
| --- | --- |
| Identity/entitlement | User, Session, Subscription, PasswordResetToken |
| Knowledge entities | Person, Source, Passage, Theme, Concept, Company, Industry, Event, Decision |
| Junctions | PassageTheme, PassageConcept, PassageCompany, PassageEvent, PersonCompany, PersonTheme, RelatedSource |
| Retention (personal) | Follow, VisitCursor, Notification, PassageProgress |
| Pro research artifacts | Bookmark, SavedSearch, Collection, CollectionItem |
| Graph layer (derived) | GraphNode, GraphEdge, InvestorRelation (seed data) |
| Editorial/ops | Correction, Changelog, SearchEvent (analytics) |

## Deployment

- Vercel with functions pinned to `icn1` (Seoul), beside the Supabase database
  (`vercel.json`).
- Pool discipline: `src/lib/db.ts` appends `connection_limit=3&pool_timeout=60`
  to the pooler URL because the Supabase session pooler caps the database at
  15 clients; default pool sizes would exhaust it (EMAXCONNSESSION).
- Environment variables per `.env.example`: `DATABASE_URL`, `SESSION_SECRET`,
  `PUBLIC_SITE_URL`, `SITE_PRELAUNCH`, `PAYMENTS_MODE`,
  `MOCK_CHECKOUT_ENABLED`, payment processor keys/plans/webhook secrets, and
  Google OAuth credentials.
- Security headers (CSP, HSTS, `X-Frame-Options: DENY`, nosniff, referrer and
  permissions policies) are set in `next.config.ts` on every response.

## Tests

`bun test` runs 32 cases across 6 suites, executed against an in-memory fake
Prisma client (`tests/helpers/fakedb.ts`) — no database or environment needed:

| Suite | Cases | Covers |
| --- | --- | --- |
| api-bookmarks | 6 | Auth gating, Pro entitlement, create/delete, duplicates |
| api-follows | 9 | Follow/unfollow, idempotent writes, validation, listing |
| api-digest | 3 | Pro gate, 7-day aggregation over notifications |
| api-new-since | 5 | Visit cursor read/advance, banner-once semantics |
| api-notifications | 5 | Fan-out reads, read/unread state |
| api-passages | 4 | Passage fetch, visibility filtering |

Additionally, `bun scripts/qa/integrity-check.ts` is the evidence integrity
gate to run before every release (see DATA_QUALITY_REPORT.md).

## Known limitations

- Payments default to mock mode; live processor keys are not yet provisioned.
- Single region deployment (`icn1`); no multi-region failover.
- Rate limiting is in-memory per instance — effective for abuse deterrence,
  not a shared-global guarantee across serverless instances.
- `PersonTheme`/`PersonCompany` junctions are sparsely populated; public
  investor↔entity relationships are derived through passages instead.
- Email digests are in-app only (`/api/digest`); outbound email delivery is
  not wired.
- Analytics instrumentation covers search events and generic events; full
  funnel coverage is partial.
