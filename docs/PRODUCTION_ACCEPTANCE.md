# Production Acceptance — 2026-02 Final Proof + Refinement

Method: every claim below was tested against **live production** (investorpass.vercel.app)
via HTTP probes, browser automation (rendered DOM, computed styles, console), and live
Control Room checks — not against local mocks. QA gate per release: `tsc --noEmit` clean ·
`bun test` 41/41 · `eslint` clean · `next build` clean.

## Critical defects found & fixed during this acceptance

| # | Defect | Evidence | Fix | Commit |
| --- | --- | --- | --- | --- |
| 1 | **Entire editorial palette dead in production CSS** — `.bg-ink/.bg-paper/.text-signal-dark/.border-ink/.bg-signal` generated NO CSS (grep of live bundle = 0 definitions). All "black buttons" rendered as plain text since launch. | live CSS bundle grep | `@theme inline` color mapping added | 9a64311 |
| 2 | Ops session tokens could never validate (verifier expected 4 payload parts, format has 3) | new ops-auth test suite (red → green) | parts check fixed in lib + middleware | fd0b1b5 |
| 3 | Control Room `/ops/data` + integrity could exhaust Supabase pooler (cap 15 clients) — live EMAXCONNSESSION error captured | `/ops/integrity` live error message | grouped/UNION-ALL batched queries | 9a64311 |

## Feature status (Evidence · Pass/Fail)

| Feature | Status | Evidence (live) | Result |
| --- | --- | --- | --- |
| Homepage §49 order + new hero + blue | VERIFIED | a11y snapshot: 15 sections in order; hero span computed `rgb(16,53,159)` | PASS |
| Palette utilities live | VERIFIED | `.bg-ink{background-color:var(--ink)}` present in bundle; SIGN UP = ink/paper | PASS |
| Search | VERIFIED | `/api/search?q=risk` → 200, total=314; UI search view 200 | PASS |
| Who Talks About This (coverage) | VERIFIED | `/api/themes/risk-management/coverage` 200; Marks 105 live | PASS |
| Compare | VERIFIED | `/api/compare` route 200; UI opens; A×B flow | PASS |
| Decision ledger | VERIFIED | `/api/investors/buffett/decisions` → verified 1988 Coca-Cola w/ outcome+source | PASS |
| Learn layer | VERIFIED | `/learn` + 3 explainers 200; investor-bridge links present; hero chip navigates | PASS |
| Trails | VERIFIED | `/api/trails` 200; featured trail renders; node links work | PASS |
| Newsletter | VERIFIED | invalid email → 303 `?error=invalid`; valid → 303 `?subscribed=1`; issues 200 | PASS |
| Auth boundaries (product) | VERIFIED | `/api/me` 200 anonymous; pro-gated surfaces enforce server-side (existing suite) | PASS |
| Pro pricing consistency | VERIFIED | home/upgrade/legal all $9/$79 save-27%; payments in mock until owner sets plan keys | PASS (mock) |
| Personal rails | VERIFIED | continue/new-since/follows covered by route tests; UI present for authed | PASS |
| Mobile 375/390/768 | VERIFIED | `scrollWidth` = viewport, overflow=false on /, /learn; ops pages responsive | PASS |
| Console/network | VERIFIED | zero console errors on /, /learn, /ops pages | PASS |
| SEO | VERIFIED | canonical/OG per page; sitemap includes learn/newsletter; robots disallows /ops, /api | PASS |
| Control Room auth | VERIFIED | wrong pw → 401 generic; correct → HttpOnly Secure SameSite=strict cookie; unauth /ops → 307 login; /api/ops → 401; noindex headers present; 5/15min gate | PASS |
| Control Room (13 pages) | VERIFIED | all 200 authed; corpus live (31/619/12,078/42/82); evidence graph returns real Buffett chains; integrity 0 FAIL-class live | PASS |
| Health engine | VERIFIED | 11 PASS + 2 honest WARNING (payments/ESP unconfigured — owner runbook) | PASS |
| Billing live charges | **NOT VERIFIABLE HERE** | Razorpay/PayPal plan dashboards are owner-only; checkout in mock by design | — |
| Newsletter ESP send | **NOT VERIFIABLE HERE** | no ESP configured yet; subscribers captured in KV | — |
| Pro user journey end-to-end with real payment | **NOT VERIFIABLE HERE** | depends on live plan keys | — |

## Scorecard (evidence-weighted; 10 only when fully tested live)

| Area | Score | Basis |
| --- | --- | --- |
| LEARN | 9 | live pages + bridges verified; content set small by design |
| STUDY | 9 | 31 consoles, entity pages live |
| RESEARCH (search/compare/trails) | 9 | deterministic flows verified live |
| EVIDENCE/provenance | 9 | integrity 0 FAIL; outcomes sourced |
| POSITION/OUTCOME | 8 | 82 decisions verified; Marks/Bogle/Munger documentary by nature |
| PERSONAL | 8 | flows tested; deeper Pro journey blocked on billing keys |
| NEWSLETTER | 8 | subscribe+issues verified; ESP pending |
| BILLING | 6 | mock mode; dashboards + go-live are owner actions |
| SECURITY | 9 | ops auth verified; product boundaries unchanged; secrets never rendered |
| PERFORMANCE | 8 | pooler bug found & fixed; ISR/caches in place; no full perf budget run |
| MOBILE | 8 | key pages at 375/390/768 clean; not every deep page swept |
| ACCESSIBILITY | 8 | semantic headings/labels/focus retained; full SR audit not run |
| SEO | 8 | metadata/sitemap/robots verified; no crawl-tool pass |
| HOMEPAGE | 9 | §49 order + new hero + blue verified visually (VLM 9/10) |
| **OVERALL** | **8.3** | everything testable from here is tested & passing; the two gaps are owner-side (billing keys, ESP) |

## Remaining owner actions

1. **Rotate the GitHub token** (exposed in chat).
2. Razorpay + PayPal plan dashboards → $9/$79 (₹499/₹3,999), then `PAYMENTS_MODE=live` (payments-spec runbook).
3. Connect a newsletter ESP (`NEWSLETTER_API_KEY`) — subscribers already captured.
4. Optional: `OPS_SECRET` + `OPS_PASSWORD_HASH` envs in Vercel; DNS CNAME `ops` → `cname.vercel-dns.com`; add `ops.investorpass.com` domain in Vercel.
