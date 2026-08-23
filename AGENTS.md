# AGENTS.md — Agent Constitution

Every coding agent working in this repository reads this file first and works
under it. Where this document conflicts with convenience, this document wins.

## What this product is

Investor/Pass is a source-first research operating system for studying how
exceptional investors thought, what they documented, what they did, how their
ideas evolved, where their records overlap or differ, and what the researcher
wants to follow next.

The corpus is evidence, not content: every passage resolves to a source, every
source to a person, every decision to a documented record. Passages are
paraphrased contextual summaries with attribution — never verbatim copyrighted
quotes.

## The core loop

Every feature must serve this loop:

SEARCH → UNDERSTAND → CROSS-REFERENCE → COMPARE → DECIDE → SAVE → FOLLOW → RETURN

If a change does not move a researcher through this loop, it does not belong in
this repository.

## Never

- Invent evidence.
- Invent investor beliefs.
- Fabricate quotes.
- Invent decisions or outcomes.
- Break provenance: every passage keeps its source; every decision carries a
  source; every source carries publisher, date, type, and original URL.
- Replace canonical entities (Person, Theme, Concept, Company, Event) with
  free text.
- Create duplicate systems for something the schema already models.
- Add AI features without explicit authorization.
- Render `visibility: "pro"` passages or `needs_review`/`rejected` passages in
  public HTML.

## Agent permissions

Agents may identify sources and propose passages, tags, relationships,
corrections, and duplicate entities. Agents may not automatically declare
anything verified, invent a decision or outcome, create a quote, claim an
investor believed something, or fabricate a source relationship. Editorial
state moves PROPOSED → REVIEW → VERIFIED → PUBLIC (or PROPOSED → REJECTED);
only a human advances a record past REVIEW.

## Operational rules

1. Inspect before planning. Plan before implementing. Never edit blind.
2. Work on feature branches. Never overwrite a working feature to ship another.
3. Implement → test → build → report. A feature is not done because it was
   written; it is done when it is proven.
4. Public counts and statistics come from the database. Never hardcode them.
5. Feature flags for anything risky; deploy incrementally.

## Definition of Done

An agent may not report "feature implemented" without proving every box:

- Database: schema updated, migrations/indexes handled.
- API: route handles success, error, and permission cases.
- UI: loading, empty, and error states all exist.
- Mobile and desktop both verified.
- Permissions enforced server-side (entitlement is never client-side hiding).
- Analytics events emitted where the feature is used.
- Tests written and passing (`bun test`).
- SEO handled if the surface is public (metadata, ISR, sitemap).
- Accessibility checked (keyboard, labels, contrast).
- No duplication of existing data or systems.
- No regressions to existing features.

## The AI rule

No RAG or AI-powered public features until Investor/Pass reaches 100 paying
subscribers. AI is an interface over the evidence graph, not the evidence graph
itself. Do not add LLM calls, embeddings, or chat surfaces without explicit
authorization.
