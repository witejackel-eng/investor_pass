/**
 * Control Room static registries — curated single sources mirroring
 * docs/FEATURE_MATRIX.md and docs/ROUTES.md. Update alongside those docs.
 * Status vocabulary: LIVE · PARTIAL · BROKEN · NOT_BUILT · DEFERRED · UNKNOWN
 * LIVE is claimed only where the flow has been verified end-to-end.
 */
export type FeatureStatus = "LIVE" | "PARTIAL" | "BROKEN" | "NOT_BUILT" | "DEFERRED" | "UNKNOWN";

export const FEATURES: {
  name: string; status: FeatureStatus; route: string; data: string; api: string; tests: string; notes: string;
}[] = [
  { name: "Learn (explainers)", status: "LIVE", route: "/learn, /learn/[slug]", data: "src/data/learn/explainers.ts", api: "static SSG", tests: "route builds", notes: "3 explainers; graph-bridged" },
  { name: "Study — investor consoles", status: "LIVE", route: "/investors/[slug]", data: "Person+Source+Passage", api: "/api/investors/*", tests: "bun test (investors)", notes: "31 investors" },
  { name: "Search", status: "LIVE", route: "/search", data: "Passage+Source (pg_trgm)", api: "/api/search", tests: "bun test", notes: "deterministic, no AI" },
  { name: "Who Talks About This (coverage)", status: "LIVE", route: "home + /api/themes/[slug]/coverage", data: "PassageTheme joins", api: "coverage", tests: "live-verified", notes: "edge-cached counts" },
  { name: "Compare", status: "LIVE", route: "/compare", data: "theme/person aggregates", api: "/api/compare", tests: "bun test", notes: "V1 A×B×theme" },
  { name: "Decision Ledger", status: "LIVE", route: "/investors/[slug] (ledger)", data: "Decision (82)", api: "/api/investors/[slug]/decisions", tests: "live-verified", notes: "verified records only public" },
  { name: "Outcomes (documented)", status: "LIVE", route: "within decisions", data: "Decision.outcome + sourceUrl", api: "same", tests: "live-verified", notes: "no performance attribution" },
  { name: "Trails", status: "LIVE", route: "/trails, /trails/[slug]", data: "src/data/trails/trails.json", api: "/api/trails", tests: "live-verified", notes: "3 public trails" },
  { name: "Save (bookmarks/collections)", status: "LIVE", route: "/library, /bookmarks, /collections", data: "Bookmark/Collection", api: "/api/bookmarks, /collections", tests: "bun test", notes: "auth-scoped" },
  { name: "Follow", status: "LIVE", route: "watchlist", data: "Follow", api: "/api/follows", tests: "bun test", notes: "investor/theme/company/event" },
  { name: "Continue", status: "LIVE", route: "home rail (auth)", data: "PassageProgress", api: "/api/continue", tests: "bun test", notes: "server feed" },
  { name: "New Since Last Visit", status: "LIVE", route: "home rail (auth)", data: "VisitCursor", api: "/api/new-since", tests: "bun test", notes: "follow-aware" },
  { name: "Newsletter", status: "LIVE", route: "/newsletter", data: "issues.ts + AppConfig KV", api: "/api/newsletter/subscribe", tests: "live-verified", notes: "subscriber edition flagged" },
  { name: "Pro entitlement", status: "PARTIAL", route: "/upgrade", data: "Subscription", api: "/api/checkout (mock)", tests: "bun test", notes: "awaiting live plan keys ($9/$79)" },
  { name: "Export/Share/Print", status: "PARTIAL", route: "trails/investors", data: "page-actions", api: "client", tests: "manual", notes: "extend to more surfaces" },
  { name: "Corrections", status: "LIVE", route: "passage pages", data: "Correction", api: "/api/corrections", tests: "manual", notes: "workflow → changelog" },
  { name: "B2B API", status: "DEFERRED", route: "—", data: "—", api: "—", tests: "—", notes: "post-traction" },
  { name: "Advisor Portal", status: "DEFERRED", route: "—", data: "—", api: "—", tests: "—", notes: "Stage 2" },
  { name: "RAG / AI", status: "DEFERRED", route: "—", data: "—", api: "—", tests: "—", notes: "100-subscriber gate" },
  { name: "Public /discoveries", status: "NOT_BUILT", route: "—", data: "graph ready", api: "—", tests: "—", notes: "deterministic queries only" },
];

export const ROUTES: {
  url: string; page: string; auth: string; component: string; data: string; api: string;
}[] = [
  { url: "/", page: "Home (SPA)", auth: "public", component: "HomeView + home-sections", data: "stats/coverage/ledger/trails via API", api: "/api/stats, /api/themes/[slug]/coverage, /api/investors/buffett/decisions, /api/trails" },
  { url: "/investors", page: "Directory (ISR)", auth: "public", component: "investors/page.tsx", data: "Person (active)", api: "public-pages lib" },
  { url: "/investors/[slug]", page: "Investor console (SSG)", auth: "public", component: "investors/[slug]/page.tsx", data: "Person+Source+Passage+Decision", api: "/api/investors/[slug]{,/themes,/decisions,/timeline}" },
  { url: "/investors/[slug]/topics/[theme]", page: "Investor × theme", auth: "public", component: "topics/page.tsx", data: "PassageTheme", api: "/api/themes/[slug]?investor=" },
  { url: "/themes/[slug]", page: "Theme page (SSG)", auth: "public", component: "themes/[slug]/page.tsx", data: "Theme+PassageTheme", api: "/api/themes/[slug]{,/coverage}" },
  { url: "/companies/[slug]", page: "Company (SSG)", auth: "public", component: "companies/[slug]/page.tsx", data: "PassageCompany+Decision", api: "/api/companies/[slug]" },
  { url: "/events/[slug]", page: "Event (SSG)", auth: "public", component: "events/[slug]/page.tsx", data: "PassageEvent", api: "/api/events/[slug]" },
  { url: "/years/[year]", page: "Year (SSG)", auth: "public", component: "years/[year]/page.tsx", data: "Source.year", api: "/api/years/[year]" },
  { url: "/learn, /learn/[slug]", page: "Explainers (SSG)", auth: "public", component: "learn pages", data: "explainers.ts (graph links)", api: "static" },
  { url: "/trails, /trails/[slug]", page: "Trails (ISR/SSG)", auth: "public", component: "trails pages", data: "trails.json + refCounts", api: "/api/trails" },
  { url: "/newsletter, /newsletter/[slug]", page: "Newsletter", auth: "public", component: "newsletter pages", data: "issues.ts + AppConfig", api: "/api/newsletter/subscribe" },
  { url: "/search", page: "Search (SPA)", auth: "public (pro depth)", component: "SearchView", data: "trigram search", api: "/api/search" },
  { url: "/compare", page: "Compare (SPA)", auth: "public", component: "CompareView", data: "aggregates", api: "/api/compare" },
  { url: "/library, /bookmarks, /watchlist", page: "Personal (SPA)", auth: "auth", component: "Library views", data: "Bookmark/Collection/Follow", api: "/api/bookmarks, /collections, /follows" },
  { url: "/upgrade, /login, /signup", page: "Commerce/Auth (SPA)", auth: "public", component: "views-auth", data: "User/Subscription", api: "/api/checkout, /api/auth/*" },
  { url: "/legal, /legal/[slug], /changelog", page: "Legal/Changelog (ISR)", auth: "public", component: "legal pages", data: "legal.ts, Changelog", api: "/api/changelog" },
  { url: "/ops/*", page: "Control Room", auth: "ops-session", component: "ops pages", data: "live DB + snapshots", api: "/api/ops/*" },
];
