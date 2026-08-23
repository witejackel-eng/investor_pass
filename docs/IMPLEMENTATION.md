# Implementation Log — 2026-02 Launch Releases

## Release 2 — End-to-end execution pass (this commit)

**Homepage (§49 order, identity preserved)**
- Hero: canonical five example chips (2 → /learn, 3 → live search), GO PRO removed from hero (value before price).
- New sections: `LearnFeature` (featured "How hedge funds works" + investor bridge), `InvestorResearchFeature` (Buffett × Marks on risk — real coverage numbers from the cached coverage query), `PersonalResearchPreview` (guest conceptual; logged-in keep real rails), `NewsletterSection` (inline subscribe form → /api/newsletter/subscribe).
- Final order: HERO → LEARN/STUDY/RESEARCH → WHO TALKS (coverage) → LEARN FEATURE → RESEARCH FEATURE → DECISION DEMO → FEATURED TRAIL → START ANYWHERE → KNOWLEDGE SCALE → FROM ADITYA → NEWSLETTER → PERSONAL → THESIS → PRO → FINAL SEARCH.
- SearchBar placeholders → §50 set, led by "What are you curious about?".

**Analytics (§66)** — `TrackView` client component fires `learn_page_view`, `newsletter_view`, `newsletter_issue_open` through the existing `track()` → `/api/events` pipeline; hero example chips track `search` with source.

**Docs (§95)** — new: ROUTES.md, ARCHITECTURE.md, CURRENT_STATE.md, IMPLEMENTATION.md, CHANGELOG.md. Updated: DATA_MODEL.md (vocabulary mapping: Insight=Passage, PositionAction/Outcome=Decision), FEATURE_MATRIX.md (launch rows), EVIDENCE_AND_RIGHTS_POLICY.md (prev. release).

**Decisions** — ResearchLoop section retired from homepage render (not in §49 order; still exported). Featured Trail kept between research features and Start Anywhere (recommended-order tolerance; nothing missing).

## Release 1 — 62ef27b

Learn layer (3 explainers + pages) · Newsletter (issue #1, subscribe API, KV storage) · Homepage v2 core (coverage API `/api/themes/[slug]/coverage`, coverage demo, loop, start-anywhere, decision demo, featured trail, thesis, final CTA) · Launch pricing $9/$79 everywhere (₹499/₹3,999 provisional) · Brand assets via `scripts/gen-assets.ts` (og.png 1200×630, apple-icon 180, icon.svg) + on-brand manifest · Guest ID-leak fix (labels in recents, PassageView backfill, store labels) · EVIDENCE_AND_RIGHTS_POLICY.md · AGENTS.md/constitution/payments-spec/audit updates · sitemap + nav (LEARN, NEWSLETTER).

## Owner runbook (blocking commercialization only)

1. Razorpay + PayPal dashboards: plan amounts → $9/mo, $79/yr (₹499/₹3,999 if INR live) — payments-spec.md §setup.
2. Confirm INR launch prices, then `PAYMENTS_MODE=live`.
3. Rotate any exposed credentials (GitHub token already flagged).

## Release 3 — Final proof + visual refinement + Control Room (fd0b1b5 → db6d895)

- Blue accent token §5/§22: --signal #1647D8 / --signal-dark #10359F (light+dark).
- Hero §6/§58 replaced (three lines, middle blue); SearchBar → "SEARCH THE RECORD"; §14 outcome layer labels; §18 newsletter copy.
- **CRITICAL**: @theme color mapping for the whole editorial palette — live bundle previously contained zero such utilities (verified by grep of production CSS; root cause: mapping never existed). Now verified live (hero span rgb(16,53,159); SIGN UP ink/paper).
- Control Room: src/middleware.ts (edge HMAC gate, noindex/no-store), src/lib/ops/auth.ts (scrypt + signed session + 5/15min gate), 13 dash pages + 7 APIs, §53 integrity engine (single UNION-ALL batch), evidence-graph API, health engine (live probes + committed QA snapshot), issues ack KV, agent registry + scripts/ops-log-agent.ts, arch snapshot via scripts/gen-arch-graph.ts (162 nodes/308 edges).
- Tests 41/41 (ops-auth suite caught the token-parts bug pre-deploy). Docs: OPS_DASHBOARD.md, PRODUCTION_ACCEPTANCE.md.
