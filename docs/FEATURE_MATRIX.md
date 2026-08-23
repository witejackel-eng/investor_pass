# Feature Matrix

Per-feature inventory of Investor/Pass: what is live, what is partial, and
what is planned, with the data, API, and UI layers named for each.

State legend:

- LIVE — data, API, and UI all working and verified.
- PARTIAL — one or more layers missing, incomplete, or awaiting activation.
- PLANNED — designed in the master plan, not built.

| Feature | State | Data | API | UI | Notes |
| --- | --- | --- | --- | --- | --- |
| Search (intent-parsed) | LIVE | Passage, Source, entities | `/api/search` | SPA search view | Queries parsed into structured filters (person/theme/concept/company/event/year) + free tokens; token ILIKE over trigram indexes; matched tokens highlighted; broad queries return an exploration summary (references, investors, sources, per-investor counts — "who talks about X"); free users see public passages plus a `proTotal` teaser. |
| Investor research console | LIVE | Person + relations | `/api/investors/[slug]` + `/themes` `/companies` `/decisions` `/timeline` `/years` | SPA investor view | Decisions, timeline, themes, companies, and sources for all 31 active investors. |
| Public entity pages (Theme, Company, Event, Year) | LIVE | Theme/Company/Event/Year + passages | Server components (no API needed) | ISR pages under `/themes`, `/companies`, `/events`, `/years` | 42 themes, 25 concepts, 48 companies, 17 events; `revalidate = 3600`, prerendered via `generateStaticParams`; anonymous HTML shows public passages only. |
| Decision Ledger | LIVE | Decision | `/api/investors/[slug]/decisions` | Investor console (decision ledger component) | 82 decisions (Buffett 22; the 11 corpus-map investors 4-7 each). Statement → action → outcome with `outcomeSourceUrl`, confidence (high/medium/inferred), verified flag. Free = first 3 verified entries + total count; Pro = full ledger. |
| Compare | LIVE | Passages + entity tags | `/api/compare` | SPA compare view | 2-4 investors × query/theme/concept; representative passages per column plus shared themes/companies/concepts/events. Decision-overlap surfacing: PARTIAL (not yet built). |
| Graph network | LIVE | GraphNode, GraphEdge (13,000 nodes / 29,663 edges) | `/api/graph/summary`, `/network`, `/node` | SPA graph view | God nodes ranked by degree; communities via label propagation with per-investor ego-cluster fallback; clickable nodes deep-link into the app. |
| Trails | LIVE | `src/data/trails/trails.json` (3 trails) | `/api/trails` | Public `/trails` + `/trails/[slug]` pages, SPA view | 3 trails: How Buffett Learned to Value Quality; 2008 Through Five Investors; Margin of Safety: Graham to Klarman. Public pages prerendered; share, print, and Markdown export. |
| Follow / Watchlist | LIVE | Follow | `/api/follows`, `/follows/suggestions` | Watchlist view | Free-tier feature; follow person/topic/concept/company/event/source/search; `alertFrequency` off/weekly/instant; writes fan out to notifications. |
| New Since Visit | LIVE | VisitCursor + new passages/sources | `/api/new-since` | Banner + personal home rail | Advances the cursor after reading (banner-once semantics); prioritizes followed entities. |
| Continue | LIVE | PassageProgress | `/api/continue` | Personal home rail | Pick up reading where the user stopped. |
| Bookmarks / Collections / Saved Searches | LIVE | Bookmark, Collection, CollectionItem, SavedSearch | `/api/bookmarks`, `/api/collections` (+`/items`), `/api/saved-searches` | Library views | Bookmark creation Pro-gated and server-enforced; unique per (user, kind, entity); collections hold passage/source/company/theme items. |
| Personal Home | LIVE | Follows + progress + new-since | `/api/new-since`, `/api/continue`, `/api/follows` | Personal home component | Rails for continue reading, new since last visit, and watchlist on one screen. |
| Notifications | LIVE | Notification | `/api/notifications` | SPA | Unread counts, mark-read/mark-all; created at ingest/follow time by the fan-out layer. |
| Auth | LIVE | User, Session, PasswordResetToken | `/api/auth/*`, `/api/me` | Auth views | Email/password (scrypt, legacy upgrade path) + Google OAuth; HMAC-signed session cookies (30-day); rate limiting; no user enumeration in recovery flows. |
| Payments | PARTIAL | Subscription | `/api/checkout`, `/api/webhooks/razorpay`, `/api/webhooks/paypal` | Upgrade + account views | Razorpay/PayPal adapters built, mock mode default; HMAC-verified webhooks fail closed. Awaiting live processor keys. USD $9/$79 launch pricing, INR ₹499/₹3,999 (plan dashboards must be updated to match). |
| Corrections | PARTIAL | Correction (queue) | `/api/corrections` (POST) | Not yet wired | API live and rate-limited: validated submissions enter `submitted → reviewed → corrected/rejected` queue. Submission UI and admin review UI not built. |
| Changelog | PARTIAL | Changelog | `/api/changelog` | Not yet wired | API live: dated entries in corpus/feature/editorial/fix categories, edge-cached, fails 503. No rendering surface consumes it yet. |
| Share / Print / Export | LIVE | — (client-side) | — | `page-actions` component | Share URL, print, and Markdown export on public investor and trail pages. |
| Library stats | LIVE | Aggregated counts | `/api/stats` | Stat rows | Edge-cached (`s-maxage=300`); fails to 503 rather than showing stale numbers. |
| Analytics | PARTIAL | SearchEvent | `/api/events` (22 allowlisted event names), `/api/admin/analytics` | Admin panel | Search events and funnel events (search_started … public_page_viewed) captured best-effort; full funnel instrumentation across all surfaces is partial. |
| Density dashboard | PARTIAL | SearchEvent-derived | `/api/admin/analytics` | Admin view (role-gated) | Top queries, zero-result rate, daily counts over 30 days; theme-density metrics partial. |
| Email digests | PLANNED | Notification | `/api/digest` (in-app digest LIVE) | Watchlist view | In-app weekly brief live and Pro-gated (rendered in the watchlist view); outbound email delivery not wired. |
| RAG / AI | PLANNED | — | — | — | Blocked until 100 paying subscribers (see PRODUCT_CONSTITUTION.md). AI is an interface over the evidence graph, never a substitute for it. |

## Summary

- LIVE: search, investor console, public entity pages, decision ledger,
  compare, graph, trails, follow/watchlist, new-since-visit, continue,
  bookmarks/collections/saved searches, personal home, notifications, auth,
  share/print/export, stats.
- PARTIAL: payments (awaiting live keys), corrections and changelog (APIs
  live without UI), analytics and density dashboard (instrumentation partial),
  compare decision overlap.
- PLANNED: email digests (in-app digest already live), RAG/AI
  (post-100-subscribers).
