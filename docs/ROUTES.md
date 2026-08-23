# Routes

Complete public map (App Router). SPA = hash views under `/` rendered by
`src/app/page.tsx` via the Zustand view router (`src/stores/app-store.ts`).

## Static / ISR public pages (`src/app/(public)`)

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | SPA shell | Homepage v2 (§49 order) + all app views |
| `/investors` | ISR 1h | Investor directory (SEO surface) |
| `/investors/[slug]` | SSG | Investor research console |
| `/investors/[slug]/topics/[theme]` | Dynamic | Investor × theme coverage |
| `/themes/[slug]` · `/companies/[slug]` · `/events/[slug]` · `/years/[year]` | SSG | Entity research pages |
| `/learn` | ISR 1h | How Finance Works index |
| `/learn/[slug]` | SSG | Explainers (3) — graph-bridged |
| `/trails` · `/trails/[slug]` | ISR/SSG | Public research trails (3) |
| `/newsletter` · `/newsletter/[slug]` | ISR/SSG | Newsletter + issue #1 |
| `/changelog` | ISR | Corrections/change feed |
| `/legal` · `/legal/[terms\|privacy\|cookies\|copyright\|disclaimer\|refunds]` | ISR | Legal |

## SPA views (`/#/view=…`)

`home · investors · investor · timeline · topic · company · year · source ·
passage · concept · event · search (&q=, &person=, &theme=…) · trails ·
trailDetail · graph · compare · library · bookmarks · searches · collections ·
watchlist · account · upgrade · login · signup · forgot · reset · admin`

## API (`src/app/api`)

Research: `search · compare · graph/summary|network|node · trails · changelog · stats`
Entities: `investors(/[slug](/years|companies|decisions|themes|timeline)) ·
passages/[id] · sources/[slug] · themes/[slug](/coverage) · concepts(/[slug]) ·
companies/[slug] · events(/[slug]) · years/[year]`
Personal: `bookmarks · collections(/items) · saved-searches · follows(/suggestions) ·
notifications · new-since · continue · digest · progress`
Auth: `auth/login|signup|logout|forgot|reset|google(/callback) · me`
Commerce: `checkout · webhooks/razorpay|paypal`
Content/ops: `newsletter/subscribe · corrections · admin/* · events · errors`

## Deep-link conventions

- Search: `/#/view=search&q=<uri>` (helper `spaSearch`)
- Source/passage/topic/company/event: `/#/view=<view>&slug=|id=`
- Compare: `/#/view=compare` (picker-driven)
