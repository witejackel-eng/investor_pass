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
