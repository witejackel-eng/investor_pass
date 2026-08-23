# Current State

Post-launch snapshot (commit 62ef27b + this release). Live at
https://investorpass.vercel.app.

## Corpus (production-verified)

31 investors · 619 sources · 12,078 research units · 42 themes · 25 concepts ·
48 companies · 17 events · 82 decisions · 3 trails · 13,000 graph nodes /
29,663 edges. Deepest records: Marks 164/4,071 · Buffett 68/3,016 (+22 decisions)
· Bogle 112/2,353. Known debt (DATA_QUALITY_REPORT): Tier-B investors thin,
mojibake apostrophes in 508 passages, decisions concentrated (Marks/Bogle/Munger
zero — their records are documentary, not transactional).

## Layers

- **LEARN** — live: 3 explainers (hedge funds, short selling, quant investing), each bridged into the graph; homepage feature section.
- **STUDY** — live: full entity consoles + ISR/SSG SEO pages + timelines.
- **RESEARCH** — live: deterministic search (trigram), compare, decision ledger (82), trails (3), graph view.
- **PERSONAL** — live: follow/save/collections/saved searches/continue/new-since/digest (Pro-gated depth).
- **NEWSLETTER** — live: issue #1 + subscribe (AppConfig KV) + founder section.
- **MONETIZATION** — launch pricing $9/$79 (save 27%) on all surfaces; checkout in mock mode until Razorpay/PayPal plan dashboards are updated to match (owner runbook in payments-spec.md).

## Release-blocker status (§93)

All clear: raw IDs never render (guest chips + passage backfill), no fabricated
content, provenance intact, Pro server-enforced, builds/tests/tsc/lint green.

## Next (by plan order)

1. Owner: update payment-plan amounts to $9/$79 → flip PAYMENTS_MODE=live.
2. Editorial: second newsletter issue; 2–3 more explainers (careers/markets).
3. /discoveries from deterministic graph queries (§62).
4. Tier-B density work per DATA_QUALITY_REPORT.
