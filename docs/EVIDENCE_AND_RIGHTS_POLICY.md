# Evidence & Rights Policy

How evidence, provenance, rights, and editorial states work in Investor/Pass.
This document binds agents and contributors. Where code and this document
disagree, fix the code.

## The four evidence layers (never blur them)

1. **Raw source** — the original document at its original URL. We link; we do not host reproductions.
2. **Paraphrased research unit (passage)** — a contextual summary in our words, always carrying `sourceId`, section/page when known, and a verification state.
3. **Structured data** — canonical entities and relationships (person, theme, company, event, decision) with stable IDs.
4. **Editorial interpretation** — explainers, newsletters, trail prose. Signed by a human author. Never presented as record.

## Source metadata (schema-enforced)

`sourceId · personId · sourceType · publicationDate · publisher · originalUrl ·
rightsStatus · provenanceStatus · verificationState · quotePolicy · publicationPolicy · internalNotes`

### rightsStatus values

`LICENSED · PUBLIC_DOMAIN · PRIMARY_PUBLIC · SECONDARY_PUBLIC · ARCHIVAL ·
UNOFFICIAL_MIRROR · UNKNOWN_RIGHTS · DO_NOT_PUBLISH`

- `UNKNOWN_RIGHTS` is the default for new ingests and must be resolved before publication.
- `DO_NOT_PUBLISH` blocks every public surface, unconditionally.

### provenanceStatus values

`verified · review · imported` — `verified` requires a human check of the
original URL, publisher, and date.

### verificationState (passages & decisions)

`verified · needs_review · rejected` — **public HTML may only render
`visibility: "public"` passages that are not `needs_review`/`rejected`, and
never renders `visibility: "pro"` passages in public HTML** (release blocker).

## Quote policy

Passages are paraphrases. Short attributed quotations are permitted only as
`quotePolicy` on the source allows. **No fixed quote length is legally
safe.** Any character limit we enforce is an internal risk-control policy,
not a safe-harbor claim. When in doubt: paraphrase and link.

## Editorial states (content pipeline)

`CANDIDATE → DRAFT → REVIEW → VERIFIED → PUBLISHED`, or `CANDIDATE → REJECTED`.

- Agents/scripts may PROPOSE sources, passages, paraphrases, tags, relationships, decisions.
- Agents/scripts MUST NOT auto-set VERIFIED, invent quotes, decisions, outcomes, or investor beliefs, or publish unsupported claims.
- A human moves anything to VERIFIED/PUBLISHED.

## Internal language never leaks (release blocker)

These are ingest/editorial terms with no public meaning. They must never
render in public UI: `source sheet · priority source · gap · recovery ·
unverified · ingest notes · editorial notes · raw record IDs / cuids /
UUIDs / debug labels`.

Every user-visible card carries a human-readable research label
(entity name + count/year/type), never an identifier.

## Learn layer & newsletter (same rules)

- Explainers teach how finance works using standard, checkable domain knowledge. They may reference investors/companies/events **only via canonical graph links** — never invented beliefs or quotes.
- The newsletter may describe what the indexed record contains (with real counts) and link into the library. Founder claims stay personal and modest; no authority invention, no forecasts.
- Investor names in explainers are factual existence claims ("Einhorn ran Greenlight Capital"), not interpretive ones ("Einhorn believed X") unless backed by an indexed unit.

## Attribution & corrections

- Every public page footer: paraphrased-with-attribution notice + investment disclaimer.
- `REPORT A CORRECTION` captures entity + issue type + message; workflow: Reported → Review → Correct → Verify → Changelog (`/changelog`).
- Outcome claims on decisions must carry `outcomeSourceUrl`; outcome states are `KNOWN · PARTIAL · UNKNOWN` — never guess.
