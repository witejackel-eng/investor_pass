# Investor/Pass — Full UX & Product Specification

> **Product:** Investor/Pass
>
> **Brand:** SECOND / PASS
>
> **Category:** Investor thinking, historical decision-making, source-linked research
>
> **Launch pricing:** $19/month or $149/year
>
> **Launch universe:** 20 exceptional investors
>
> **Core loop:** **SEARCH → EXPLORE → COMPARE → SAVE → RETURN**
>
> **Primary north star:** Turn information that is technically public but practically difficult to navigate into an exceptionally good research product.

---

## 0. Executive Product Thesis

Investor/Pass should not be built as a website that happens to contain 20 investor archives.

It should be built as a **research environment** where a user can arrive with a question, find primary-source evidence, follow the connections around that evidence, compare how investors approached similar problems, save what matters, and return later without losing the thread.

The product succeeds when the user stops thinking in terms of pages and starts thinking in terms of a connected library.

The core experience is therefore:

```text
I have a question
       ↓
SEARCH
       ↓
I found something useful
       ↓
EXPLORE
       ↓
I want to understand the relationship
       ↓
COMPARE
       ↓
I want to keep the research
       ↓
SAVE
       ↓
I return later
       ↓
DISCOVER
       ↓
SEARCH again
```

The product should make that loop feel so natural that a serious user would rather research inside Investor/Pass than open 10–15 browser tabs, manually cross-reference documents, maintain personal notes, and repeatedly search the web for the same material.

### The strategic category

Investor/Pass is deliberately **not**:

- a real-time market terminal
- a stock screener
- a portfolio manager
- a brokerage product
- a generic finance news site
- a newsletter subscription
- an AI stock-picking assistant
- a replacement for broad financial-data platforms

Its category is narrower and more defensible:

> **Investor thinking and historical decision-making.**

A broad financial research platform answers questions such as:

> What is happening in markets and companies right now?

Investor/Pass should answer questions such as:

> What did Buffett say about inflation?
>
> How did Marks define risk during different market environments?
>
> What did Munger say about incentives?
>
> How did Bogle think about indexing?
>
> How did different investors respond to the 2008 crisis?
>
> What changed in an investor's thinking over time?

The differentiation is therefore not feature quantity. It is **structured retrieval + context + relationships + historical depth + research continuity**.

---

# 1. Product North Star

## 1.1 The user's mental model

The user's mental model should be:

> **"This is my place to study investor thinking."**

Not:

> "This is a site with profiles of famous investors."

The interface should continually reinforce that distinction.

### The product should feel like

- a beautifully organized private library
- a reference book with software-like navigation
- an information-dense research terminal without terminal complexity
- editorially curated but structurally searchable
- calm, precise, fast, and trustworthy

### The product should not feel like

- generic SaaS
- a dashboard full of decorative cards
- an AI chatbot wrapper
- a social network
- a news feed
- a marketing website pretending to be a research tool
- a collection of disconnected profile pages

---

# 2. Core Product Principles

These principles should be treated as engineering and design constraints, not just visual guidance.

## Principle 1 — Search is the front door

A user should be able to start with a question, concept, person, company, event, year, or phrase.

Do not force users to understand the information architecture before they can use the product.

## Principle 2 — Every result is a doorway

A result is never the end of the journey.

It should connect to:

- investor
- theme
- company
- concept
- event
- source
- year
- related passages
- related investors

## Principle 3 — Context beats raw volume

A result with the right source, date, investor, theme, and context is more useful than 50 poorly explained matches.

## Principle 4 — Provenance is part of the product

Source information is not metadata hidden in a database.

It is part of the visible experience.

## Principle 5 — Users should never lose their research state

Search query, filters, scroll position, open context, and saved state should persist whenever technically practical.

## Principle 6 — The graph is the navigation

The product should not require users to repeatedly return to a main menu.

They should naturally move:

```text
Investor → Theme → Company → Source → Event → Investor
```

## Principle 7 — Progressive disclosure

The default screen should be simple.

Depth should appear as the user asks for it.

## Principle 8 — Calm software

Motion should clarify state changes, not entertain.

## Principle 9 — No dead ends

A page that has no useful next action is an information architecture failure.

## Principle 10 — Evidence before interpretation

Investor/Pass should present the record and relationships clearly. It should avoid positioning itself as an authority on which investment view is "correct."

---

# 3. Core Interaction Model

## The four core verbs

### SEARCH

Find something.

### EXPLORE

Follow the connections around it.

### COMPARE

See how investors differ or overlap.

### SAVE

Create personal research continuity.

Everything else exists to improve one of those verbs.

---

# 4. Information Architecture

The product should be organized around entity types rather than around isolated pages.

## Primary entities

- Investor
- Theme / Idea
- Concept
- Company
- Event
- Decision
- Source
- Passage
- Year
- Research Trail
- Collection
- Search

## Relationship model

```text
                           INVESTOR
                              │
              ┌───────────────┼────────────────┐
              │               │                │
            THEMES         COMPANIES         EVENTS
              │               │                │
              └───────┬───────┴────────┬───────┘
                      │                │
                   SOURCES         DECISIONS
                      │                │
                   PASSAGES ───────────┘
                      │
                   CONCEPTS
                      │
                OTHER INVESTORS
```

Every object must function as:

1. content
2. metadata
3. navigation
4. a possible search target
5. a possible saved object
6. a possible SEO landing page when appropriate

---

# 5. Launch Investor Universe

The initial investor universe is:

1. Warren Buffett
2. Charlie Munger
3. Howard Marks
4. Peter Lynch
5. Benjamin Graham
6. John Bogle
7. Seth Klarman
8. Philip Fisher
9. John Templeton
10. George Soros
11. Stanley Druckenmiller
12. Ray Dalio
13. Jim Simons
14. Joel Greenblatt
15. Bill Ackman
16. Carl Icahn
17. David Swensen
18. Mohnish Pabrai
19. Terry Smith
20. Jesse Livermore

The count of 20 is a launch content boundary, not the product's identity.

The interface should work whether the library contains 20, 50, or 200 investors.

Do not build an interface that requires a fixed number of investors.

---

# 6. UNIVERSAL SEARCH

## 6.1 Product role

Universal Search is the most important feature in the entire application.

If Search feels mediocre, the product feels like a content archive.

If Search feels exceptional, the product begins to feel like software.

---

## 6.2 Homepage search

The homepage should lead with:

# The public record, properly indexed.

Then:

### Search the library

`What are you looking for?`

Examples:

- Buffett on inflation
- Munger on incentives
- Marks on market cycles
- Coca-Cola
- margin of safety
- 2008 crisis

The input should be immediately recognizable as the primary action.

The user should not have to hunt for search.

---

## 6.3 Search input behavior

When focused:

- expand visually without causing layout instability
- autofocus when opened from a command shortcut
- show recent searches for signed-in users
- show suggested queries when useful
- keep the input state intact while filters are applied

The search experience should support both:

> **keywords**

and

> **natural research phrases**

without requiring an AI layer.

Example:

`Buffett inflation`

should be parsed into likely structured matches such as:

- investor = Buffett
- topic/concept = inflation

The first version can do this deterministically through aliases, indexed entities, and ranking signals.

---

## 6.4 Search-as-exploration

Typing a broad term like:

`inflation`

should first present an exploration summary:

```text
INFLATION

1,382 indexed references

INVESTORS
Buffett · Marks · Dalio · Soros · Bogle

COMPANIES
...

EVENTS
1970s inflation · 1973–74 crisis · 2022 inflation
```

The point is to make Search itself a navigation system.

---

## 6.5 Search result layout

The primary desktop research layout should target:

```text
┌───────────────┬───────────────────────┬────────────────────┐
│ FILTERS       │ RESULTS               │ CONTEXT            │
│               │                       │                    │
│ Investor      │ Result 1              │ Selected result    │
│ Theme         │ Result 2              │                    │
│ Company       │ Result 3              │ Source metadata    │
│ Year          │ Result 4              │                    │
│ Source        │ Result 5              │ Related entities   │
│ Event         │                       │                    │
└───────────────┴───────────────────────┴────────────────────┘
```

This is not a rigid implementation requirement. It is the intended interaction geometry.

---

## 6.6 Search result anatomy

Each result should have a consistent visual contract.

Example:

```text
WARREN BUFFETT · 1987

CAPITAL ALLOCATION

1987 Berkshire Hathaway Shareholder Letter

Short contextual explanation of the passage and why it matters.

CAPITAL ALLOCATION · COCA-COLA · MOAT

SOURCE →
```

### Required hierarchy

1. investor
2. year/date
3. source title
4. theme/category
5. short contextual explanation
6. linked entities
7. source action

The user should understand whether a result is relevant in approximately 2–3 seconds.

---

## 6.7 Search ranking

V1 should use deterministic retrieval.

Recommended ranking concept:

| Signal | Relative Weight |
|---|---:|
| Exact phrase / exact entity match | Very high |
| Source title | High |
| Investor | High |
| Theme | High |
| Company | High |
| Concept | High |
| Event | Medium-high |
| Source metadata | Medium |
| Passage text | Lower |

A practical first implementation can use:

- PostgreSQL full-text search
- trigram/fuzzy matching
- weighted generated search vectors
- normalized aliases
- explicit entity boosting

Example weighting:

```text
title       5x
theme       4x
company     4x
concept     4x
investor    4x
source meta 3x
passage     1x
```

Exactness, recency, source quality, and entity match can become additional ranking signals later.

---

## 6.8 Search filtering

Primary filters:

- Investor
- Year / date range
- Theme
- Company
- Source
- Event

Advanced filters can later include:

- source type
- decision type
- verified provenance status
- entity combination
- exact phrase

Avoid presenting a giant filter form.

Use compact filter chips with progressive disclosure.

---

## 6.9 Search state

Always expose current state.

Example:

`BUFFETT × 1980–2000 × INFLATION`

The user should never wonder which filters are active.

---

## 6.10 Search URL state

Where practical, encode research state into the URL.

Example:

```text
/search?q=inflation&investor=buffett&yearFrom=1980&yearTo=2000
```

Benefits:

- browser back/forward works naturally
- bookmarks work
- sharing works
- research sessions can be restored
- analytics can understand research intent
- public query pages can become indexable selectively

Do not make every arbitrary query page indexable by default. SEO rules should be deliberate.

---

## 6.11 Search empty state

Never:

> No results.

Prefer:

> **Nothing matched “quantum moat”.**

Then suggest:

- moat
- pricing power
- competitive advantage
- economic goodwill

The user should always have a next step.

---

## 6.12 Search loading state

Use stable skeletons.

Never:

```text
blank
→ layout shift
→ content appears
```

The surrounding layout should remain stable while the query loads.

---

## 6.13 Search error state

The system should distinguish:

- no results
- failed request
- timeout
- unavailable data
- invalid query

Example technical failure:

> **Search is temporarily unavailable.**
>
> Try again in a moment.

Do not disguise system errors as content emptiness.

---

## 6.14 Keyboard UX

Desktop:

- `/` → focus search
- `Ctrl/Cmd + K` → global search
- `Esc` → close overlay
- `↑ ↓` → move through suggestions/results
- `Enter` → open selection

Later shortcuts can include:

- `S` → save current object
- `C` → compare
- `B` → bookmark

Only add shortcuts after the primary interactions are proven reliable.

---

## 6.15 The search conversion moment

A key Pro paywall pattern:

> **Showing 5 free results. 78 more references are available in Pro.**

Then:

> Search the complete library.
>
> Explore every connection.
>
> Save your research.
>
> **Start Pro — $19/month**

The value should be demonstrated before the paywall is shown.

---

# 7. THEME / IDEA EXPLORATION

Themes let users enter the product without knowing which investor to search for.

Example:

# ECONOMIC MOATS

Short definition.

**Referenced by 14 investors**

**326 indexed references**

---

## 7.1 Theme page anatomy

### Header

- theme name
- short definition
- number of investors
- number of references
- related aliases

### Timeline

```text
1970s ── 1980s ── 1990s ── 2000s ── 2010s ── 2020s
```

### Investors

- Buffett — 91 references
- Munger — 37
- Fisher — 23
- Lynch — 18
- Marks — 11

### Related concepts

- Pricing Power
- Return on Capital
- Brand
- Switching Costs
- Network Effects

### Related companies

- Coca-Cola
- See's Candies
- American Express
- Apple

The desired reaction is:

> **"I could spend an hour here."**

That is a stronger engagement signal than a simple pageview.

---

# 8. INVESTOR TIMELINE

Investor profiles should not behave like biographies.

The main question is:

> **What was this investor thinking, saying, and doing over time?**

---

## 8.1 Timeline structure

Example:

```text
1965  Berkshire control
1972  See's Candies
1985  Textile exit
1987  Market crash
1988  Coca-Cola
1991  Salomon crisis
2008  Financial crisis
2016  Apple investment
2025  CEO transition
```

Timeline nodes can represent:

- Statement
- Decision
- Company interaction
- Event
- Source
- Milestone

---

## 8.2 Timeline interaction

Desktop:

- hover → preview
- click → side context
- keyboard focus → preview

Mobile:

- tap → bottom sheet or dedicated detail view

The user should not have to leave the timeline to inspect basic metadata.

---

## 8.3 Timeline filters

- Statements
- Decisions
- Companies
- Events
- Sources

Optional later filters:

- Themes
- Market environment
- decade

---

## 8.4 Timeline comparison

A later feature can render synchronized timelines:

```text
BUFFETT
2000 ───── 2008 ───── 2020
   ●────────●──────────●

MARKS
2000 ───── 2008 ───── 2020
      ●────────●───────●

DALIO
2000 ───── 2008 ───── 2020
          ●──────●──────●
```

Selecting a node opens the source context.

The visual purpose is not decoration; it is historical comparison.

---

# 9. INVESTOR COMPARISON

With 20 investors, comparison is a core product capability rather than an optional feature.

The goal is not:

> "Which investor is best?"

The goal is:

> **"How did these investors think about the same problem?"**

---

## 9.1 Comparison flow

1. Click Compare
2. Select 2–4 investors
3. Select a topic or concept
4. Review source-backed differences
5. Drill into context
6. Save the comparison

Example:

```text
COMPARE

Buffett
Munger
Marks

TOPIC
Risk
```

---

## 9.2 Comparison structure

### Shared ideas

What overlaps?

### Distinct ideas

What differs?

### Language

How did they describe the issue?

### Historical context

Were they speaking in materially different environments?

### Sources

What primary materials support the comparison?

The product should not present itself as the final judge.

---

## 9.3 Comparison timeline

Show when each investor engaged with the topic.

The timeline provides historical context and helps users avoid treating all statements as if they came from the same environment.

---

# 10. COMPANY EXPLORATION

Company pages transform company names from search terms into canonical research entities.

Example:

# COCA-COLA

### Investors

- Buffett
- Munger

### First indexed

1988

### Last indexed

2025

### Themes

- Moat
- Pricing Power
- Brand
- Capital Allocation
- Management

### Timeline

1987 → 1988 → 1990 → 1995 → 2001 → 2017 → 2025

### Sources

All relevant sources.

### Decisions

- Purchase
- Ownership
- Sale
- Discussion
- Acquisition

---

## 10.1 Company relationship graph

```text
COCA-COLA
   │
   ├── Buffett
   ├── Munger
   ├── Moat
   ├── Pricing Power
   ├── Brand
   └── Capital Allocation
```

Every relationship should be clickable.

---

## 10.2 Company SEO

Company pages are high-value acquisition pages because the search intent is often explicit.

A user searching for:

> Buffett Coca-Cola

should have a natural path:

```text
Google
 ↓
Coca-Cola page
 ↓
Buffett references
 ↓
Munger references
 ↓
Moat theme
 ↓
Other investors
```

The graph becomes the cross-sell mechanism.

---

# 11. EVENT / DECISION EXPLORATION

A major differentiator is organizing around moments that mattered, not only people.

Examples:

- 1987 crash
- dot-com bubble
- 2008 financial crisis
- COVID crash
- inflation shocks
- major acquisitions
- activist campaigns

---

## 11.1 Event page anatomy

# THE 2008 FINANCIAL CRISIS

### Investors

Buffett
Marks
Dalio
Soros
Druckenmiller

### Events

- Lehman
- credit freeze
- bailouts

### Decisions

What investors actually did.

### Sources

Primary and supporting sources.

---

## 11.2 The critical distinction

The product should try to connect:

```text
what they said
      +
what they did
      +
what happened afterward
```

This is historically richer than a quote database.

---

## 11.3 Decision page

Example:

# BERKSHIRE INVESTMENT IN GOLDMAN SACHS

- Date
- Investor
- Company
- Context
- Decision
- Source
- Related themes
- Related events
- Outcome / later record

The interface must clearly distinguish sourced facts from editorial interpretation.

---

# 12. SOURCE → PASSAGE → CONTEXT

This is one of the highest-trust surfaces in the entire application.

Paid users need to understand where information came from.

---

## 12.1 Source page

Example:

# 1987 BERKSHIRE HATHAWAY LETTER

Metadata:

`1987 · Shareholder Letter`

`Berkshire Hathaway`

`Verified source`

`Original source →`

Then:

### What this source contains

- Capital allocation
- Insurance
- Valuation
- Markets

---

## 12.2 Passage context

A passage detail should show:

### Context

What was happening when the statement was made.

### Investor

Buffett

### Date

1987

### Theme

Capital Allocation

### Company

Coca-Cola

### Source

1987 shareholder letter

---

## 12.3 Why you're seeing this

This small explanatory module is critical for trust:

> **Matched because this passage is indexed under Capital Allocation, Coca-Cola, and Economic Moats.**

This tells the user that retrieval is not arbitrary.

---

## 12.4 Related thinking

Show:

**Earlier**

1985

**Later**

1989

**Related**

1995

**Same concept**

2008

The objective is to create a temporal and conceptual exploration loop.

---

## 12.5 Provenance model

Every important source should expose:

- source name
- publisher
- date
- source type
- canonical/original link
- provenance status
- ingestion status if relevant
- licensing/reproduction notes where necessary

Do not claim verification unless a source has actually been verified.

---

# 13. RESEARCH TRAILS / DEEP DIVE

Research Trails can become one of the most distinctive editorial features of Investor/Pass.

A Research Trail is a curated path through the graph that explains how one idea, decision, or philosophy developed.

Example:

# HOW BUFFETT LEARNED TO VALUE QUALITY

```text
Berkshire textile problem
        ↓
See's Candies
        ↓
Economic goodwill
        ↓
Coca-Cola
        ↓
Pricing power
        ↓
Moats
        ↓
Apple
```

---

## 13.1 Presentation model

Do not create a giant flowchart by default.

Use a vertical editorial sequence.

Each step contains:

- date
- entity
- short explanation
- source link
- related theme
- next step

Example:

### 1977

**See's Candies**

Short context.

`Open source →`

↓

### 1988

**Coca-Cola**

Short context.

↓

### 2016

**Apple**

Short context.

---

## 13.2 Official + user-created trails

Eventually:

### Official Research Trails

Created by Investor/Pass.

### My Research Trails

Created by users.

This combines editorial authority with personal research.

---

# 14. SAVE / PERSONAL LIBRARY

The personal library is the mechanism that turns browsing into a product relationship.

---

## 14.1 Save action

Every meaningful object should support:

**☆ Save**

Potential save targets:

- source
- passage
- company
- theme
- event
- investor
- comparison
- research trail
- search

The action should be immediate and reversible.

Example confirmation:

> Saved to My Library.
>
> Undo

Do not interrupt the user with a modal for every save.

---

## 14.2 My Library

Example:

```text
MY LIBRARY

12 sources
28 passages
7 themes
9 companies
3 saved searches
4 collections
```

The library should remain dense and utilitarian.

---

## 14.3 Saved Searches

Example:

> **Buffett — Inflation**

Metadata:

- query
- active filters
- result count at save time
- last opened
- last updated

Selecting the saved search should restore the research context.

---

## 14.4 Collections

Bookmark ≠ collection.

### Bookmark

> "I want to remember this."

### Collection

> "I am researching this topic."

Example:

# BUFFETT ON CAPITAL ALLOCATION

12 items.

- sources
- companies
- themes
- passages
- notes

No Kanban.

No project-management metaphor.

Keep it library-like.

---

# 15. SHAREABLE PUBLIC RESEARCH PAGES

Public pages are an acquisition engine.

They should be designed as standalone research resources, not as watered-down product screens.

Example URL:

```text
/investors/buffett/topics/inflation
```

---

## 15.1 Public topic page

# Buffett on Inflation

**1970–2025**

### 37 indexed references

Then:

- timeline
- themes
- companies
- representative sources
- related investors
- research links

Paywall language:

> **Explore all 37 references with Investor/Pass Pro.**

---

## 15.2 Social preview

A shared URL should communicate research value immediately.

Example:

```text
BUFFETT ON INFLATION
37 indexed references
1970 → 2025
Investor/Pass
```

The preview should feel like a useful research resource, not a generic SaaS advertisement.

---

# 16. CROSS-ENTITY NAVIGATION

This is the glue.

From Buffett:

- Themes
- Companies
- Events
- Sources
- Other investors

From Coca-Cola:

- Investors
- Themes
- Sources
- Years

From Inflation:

- Investors
- Events
- Sources
- Companies

---

## 16.1 Navigation rule

A user should rarely have to think:

> "How do I get back?"

Instead:

> "What is related to this?"

The information graph should provide that answer.

---

# 17. DISCOVERY / RETURN LOOP

The product should create reasons to return without becoming a news site.

Create a lightweight section:

# DISCOVER

Examples:

### This week in investor history

**August 22, 1987**

A historically meaningful source or event.

### A source worth reading

A selected primary source.

### Idea of the week

**Margin of Safety**

### Cross-investor connection

**Buffett × Fisher**

The key distinction is:

> Discovery, not news.

Discovery should lead back into the core loop.

---

# 18. THE IDEAL DESKTOP RESEARCH WORKSPACE

This should be considered a signature surface.

```text
┌──────────────────────────────────────────────────────────────┐
│ INVESTOR/PASS                         SEARCH        ACCOUNT   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ SEARCH THE LIBRARY                                           │
│ [ Buffett on inflation_______________________________ ]     │
│                                                              │
│ Investor      Year       Theme       Company                 │
│ [Buffett]     [1980–25]  [Inflation] [All]                   │
│                                                              │
├───────────────┬─────────────────────────┬────────────────────┤
│ FILTERS       │ RESULTS                 │ CONTEXT            │
│               │                         │                    │
│ Investor      │ 1987                    │ WARREN BUFFETT     │
│ ✓ Buffett     │ SHAREHOLDER LETTER      │ 1987               │
│               │                         │ CAPITAL ALLOCATION │
│ Theme         │ Capital Allocation      │                    │
│ ✓ Inflation   │                         │ Context...          │
│               │ Context...              │ Related themes     │
│ Company       │                         │ Moat               │
│ All           │ COCA-COLA               │ Pricing Power      │
│               │ MOAT                    │                    │
│               │                         │ Related sources    │
│               │ 1991                    │ 1985               │
│               │ ...                     │ 1992               │
└───────────────┴─────────────────────────┴────────────────────┘
```

This should feel like **software**, not a website.

---

# 19. MOBILE UX

Mobile should not be desktop squeezed into a smaller width.

## Desktop

Three-column research geometry:

```text
Filters | Results | Context
```

## Mobile

```text
HEADER
SEARCH
FILTERS
RESULTS
RESULT DETAIL
SOURCE / CONTEXT
```

---

## 19.1 Mobile result interaction

A result opens as a full detail experience or bottom sheet depending on the depth.

The user should be able to:

- save
- open source
- navigate entity links
- return to results

without losing the search state.

---

## 19.2 Mobile filters

Use a bottom sheet.

Primary filters should be quick to toggle.

Secondary filters can be hidden under Advanced.

---

## 19.3 Mobile persistent controls

At minimum:

- Search
- Filters
- Save
- Back

Avoid a fixed bottom navigation bar unless analytics later show users need it.

The product is a research tool, not a social/mobile feed product.

---

# 20. VISUAL LANGUAGE

Investor/Pass should communicate:

- editorial precision
- reference-book depth
- financial-terminal density
- modern interaction quality
- calm authority

The interface should use:

- strong typography hierarchy
- fine rules
- restrained color
- intentional whitespace
- aligned metadata
- compact but readable information blocks
- disciplined use of cards

The visual language should remain compatible with the existing SECOND / PASS direction: warm paper, ink-like typography, fine rules, restrained motion, and an engineered rather than decorative presentation.

Avoid:

- giant rounded cards everywhere
- unnecessary gradients
- glassmorphism
- excessive shadows
- dashboard clutter
- ornamental charts without information value
- excessive iconography
- animation for its own sake

---

# 21. DESIGN SYSTEM RULES

## Typography

Use typography to establish hierarchy before relying on containers.

Suggested levels:

- page title
- entity title
- section title
- metadata
- body/context
- auxiliary label

## Rules

Horizontal rules can separate information groups without forcing heavy card borders.

## Density

Information density should be high enough to support research but low enough to avoid visual fatigue.

## Color

Use accent color sparingly for:

- active states
- links
- selection
- save confirmations
- important actions

Do not use color as the only way to communicate state.

---

# 22. MICROINTERACTIONS

Motion should only communicate:

- opening/closing panels
- filtering
- state transitions
- timeline focus
- save confirmation
- navigation context

Avoid:

- perpetual animations
- decorative parallax
- excessive hover effects
- animated backgrounds
- delayed content reveals that make research slower

Target feeling:

> **calm and fast**

---

# 23. PAGE COMPOSITION STANDARD

Every meaningful screen should answer three questions immediately.

## 1. Where am I?

Breadcrumb or contextual path.

Example:

`BUFFETT / MOATS / COCA-COLA / 1987`

## 2. What am I looking at?

Strong title + metadata.

## 3. Where can I go next?

Related entities and actions.

The third question is the hidden differentiator.

A page without a good next action is a dead end.

---

# 24. PROGRESSIVE DISCLOSURE

Default surface:

**Search**

Then:

**Filters**

Then:

**Advanced**

Example:

### Level 1

Investor / Theme / Company

### Level 2

Year / Source / Event

### Level 3

Exact phrase / provenance / source type / advanced combinations

This preserves power without making the first screen feel intimidating.

---

# 25. AUTHENTICATION & ENTITLEMENTS

The subscription model is intentionally simple.

## Free

The acquisition and SEO layer.

Potential access:

- public investor pages
- public theme pages
- public company pages
- public event pages
- selected source information
- limited search
- selected passages/previews
- public timelines/previews
- selected public research pages

Free must be genuinely useful.

The user should think:

> **"This is unusually well organized."**

before seeing the Pro boundary.

---

## Pro

$19/month or $149/year.

Unlock:

- complete investor library
- complete search
- advanced search filters
- complete source navigation
- complete timelines
- theme exploration depth
- company exploration depth
- event/decision exploration
- comparison tools
- bookmarks
- saved searches
- collections
- personal research library
- future investor additions

---

# 26. PAYWALL DESIGN

The paywall should be contextual rather than aggressive.

Bad:

> This feature is premium. Subscribe now.

Good:

> **Showing 5 free references. 78 more are indexed.**
>
> Search the complete library, follow every connection, and save your research.
>
> **Pro — $19/month**
>
> **Pro — $149/year**

The paywall should appear precisely after the user has experienced enough utility to understand the gap.

---

## Paywall rules

Do:

- explain what is behind the boundary
- show counts when they are meaningful
- preserve query context
- keep the checkout path short

Do not:

- block the homepage before users understand the product
- hide basic product quality behind signup
- use fake urgency
- use countdown timers
- use manipulative pricing tricks

---

# 27. PRICING EXPERIENCE

At launch, only two offers exist.

| Plan | Price | Positioning |
|---|---:|---|
| Free | $0 | Explore the public library |
| Pro Monthly | $19/month | Full research access |
| Pro Annual | $149/year | Full research access at a lower effective monthly cost |

Do not add:

- Starter
- Business
- Analyst
- Enterprise
- Lifetime
- Founding
- AI tier

until real usage proves a need.

---

# 28. CONVERSION EXPERIENCE

A clean conversion path should be:

```text
Search
 ↓
Useful result
 ↓
Deeper result count
 ↓
Paywall
 ↓
Pricing
 ↓
Checkout
 ↓
Instant access
```

The transition into paid access should not destroy the user's research context.

After successful payment:

> Return to the exact search/research state.

That is critical.

---

# 29. SOURCE QUALITY & TRUST

Trust is one of the reasons a $19 price can be justified.

The interface should visibly communicate:

- where information came from
- when it was published
- what type of source it is
- how it is related to the result
- whether the original source can be opened

Source types can include:

- shareholder letter
- memo
- interview
- annual report
- speech
- transcript
- article
- book excerpt where legally permissible
- official archive
- secondary historical source

Do not imply primary-source status for secondary material.

---

# 30. CONTENT & PROVENANCE MODEL

The underlying system should distinguish between:

### Source

The original document or publication.

### Passage

An indexed excerpt or relevant segment.

### Interpretation

Editorial metadata or explanation added by Investor/Pass.

### Relationship

The structured connection between entities.

These must not be conflated.

Example:

```text
SOURCE
  ↓
PASSAGE
  ↓
INDEXED RELATIONSHIPS
  ↓
THEME / COMPANY / EVENT
  ↓
SEARCH RESULT
```

This separation becomes especially important if AI is introduced later.

---

# 31. SEARCH ARCHITECTURE V1

The first search implementation should be deterministic.

Recommended stack:

- PostgreSQL full-text search
- trigram/fuzzy matching
- weighted tsvector fields
- normalized entities
- alias tables
- indexed metadata
- explicit relationship tables

Example conceptual search vector:

```text
title       weight A
investor    weight B
theme       weight B
company     weight B
concept     weight B
source_meta weight C
passage     weight D
```

The exact implementation can use whatever weighting model produces the best validated ranking.

The critical constraint is:

> **Do not add semantic/vector search simply because it is fashionable.**

The initial objective is to create excellent deterministic retrieval and understand real behavior.

---

# 32. SUGGESTED DATA MODEL

The application can be implemented relationally in PostgreSQL with explicit relationships.

Conceptual entities:

```text
users
subscriptions
investors
themes
concepts
companies
events
decisions
sources
passages
investor_events
investor_themes
investor_companies
investor_decisions
source_passages
passage_themes
passage_companies
passage_events
research_trails
research_trail_nodes
collections
collection_items
bookmarks
saved_searches
search_events
```

Optional normalized metadata tables can support:

- aliases
- source types
- entity types
- provenance states
- countries
- industries

The model should prioritize queryability over clever abstraction.

---

# 33. ENTITY PAGE TEMPLATE

Every major entity page should follow a stable template.

```text
CONTEXT / BREADCRUMB

ENTITY TITLE
Metadata

SUMMARY / DEFINITION

PRIMARY TIMELINE OR RESULTS

RELATED INVESTORS
RELATED THEMES
RELATED COMPANIES
RELATED EVENTS
RELATED SOURCES

EXPLORE NEXT
```

The exact modules vary by entity type, but the interaction contract remains consistent.

---

# 34. INVESTOR PAGE TEMPLATE

```text
WARREN BUFFETT

Role / era / primary focus

[ Search Buffett ] [ Compare ] [ Save ]

TIMELINE

TOP THEMES

TOP COMPANIES

KEY EVENTS

SELECTED SOURCES

IDEA EVOLUTION

RELATED INVESTORS

EXPLORE NEXT
```

The page should not become a long biography.

The biography is supporting context, not the product.

---

# 35. COMPANY PAGE TEMPLATE

```text
COCA-COLA

First indexed
Last indexed

INVESTORS
THEMES
TIMELINE
DECISIONS
SOURCES
RELATED EVENTS
RELATED COMPANIES

EXPLORE NEXT
```

---

# 36. EVENT PAGE TEMPLATE

```text
2008 FINANCIAL CRISIS

DATE / ERA

CONTEXT

INVESTORS

WHAT THEY SAID

WHAT THEY DID

KEY COMPANIES

DECISIONS

SOURCE TIMELINE

RELATED THEMES

EXPLORE NEXT
```

---

# 37. SOURCE PAGE TEMPLATE

```text
SOURCE TITLE

Publisher
Date
Source Type
Provenance
Original Link

SOURCE SUMMARY

PASSAGES

THEMES
COMPANIES
INVESTORS
EVENTS

RELATED SOURCES
```

---

# 38. RESULT DETAIL TEMPLATE

```text
SOURCE / INVESTOR / DATE

PASSAGE

WHY YOU'RE SEEING THIS

CONTEXT

THEMES
COMPANIES
EVENTS

EARLIER THINKING
LATER THINKING
RELATED THINKING

OPEN SOURCE
SAVE
COMPARE
```

---

# 39. USER RESEARCH STATE

The application should treat research state as first-class data.

The system should preserve whenever practical:

- search query
- filters
- sort order
- selected result
- scroll location
- open context pane
- saved state
- comparison selection

This can be achieved through a combination of:

- URL state
- client state
- persisted preferences
- saved searches

The user should experience continuity rather than resets.

---

# 40. NAVIGATION RULES

## Back button

Back should return the user to the previous research state rather than a generic page.

## Breadcrumbs

Use context paths for disambiguation.

## Entity links

Prefer direct navigation over forcing another search.

## Tabs

Use tabs only when multiple views of the same entity are genuinely equivalent.

Do not turn every page into a 12-tab dashboard.

---

# 41. ACCESSIBILITY

Accessibility is part of product quality, especially for a research product users may spend significant time in.

Requirements:

- full keyboard navigation
- visible focus states
- semantic headings
- descriptive buttons and links
- accessible dialogs
- screen-reader-friendly filters
- sufficient text contrast
- no information communicated by color alone
- reduced-motion support
- focus restoration after closing overlays

Tables/timelines should have accessible non-visual reading order.

---

# 42. PERFORMANCE

The feeling should be:

> **fast enough that search disappears into thought.**

Priorities:

## First load

- optimize critical CSS
- minimal JavaScript on public pages
- image optimization
- server-render or statically render SEO-critical pages where practical

## Search

- indexed queries
- pagination or windowed result sets
- cached common queries
- efficient relation loading
- avoid N+1 database behavior

## Interaction

- preserve layout dimensions
- avoid large synchronous client work
- use optimistic save interactions

## Public pages

SEO pages should be fast enough to feel like documentation/reference pages rather than application dashboards.

---

# 43. SEO STRATEGY

Public pages should be designed for human usefulness first, search engines second.

Potential page classes:

- investor pages
- investor + theme pages
- company pages
- event pages
- year pages
- comparison pages
- source pages where legally and strategically appropriate
- curated question pages

Examples:

```text
/investors/buffett
/investors/buffett/topics/inflation
/companies/coca-cola
/events/2008-financial-crisis
/compare/buffett-vs-marks/risk
```

Do not create millions of thin, indexable combinations.

Index only pages with:

- meaningful content
- stable canonical URLs
- sufficient source/context depth
- useful internal relationships

---

# 44. SHAREABILITY

Every canonical research surface should answer:

> Why would someone send this link to another investor?

Potentially shareable surfaces:

- investor topics
- comparison pages
- timelines
- research trails
- event pages
- source summaries

Open Graph metadata should use the actual research subject, not generic brand copy.

---

# 45. ANALYTICS MODEL

The main metric should be:

# Weekly Active Researchers

A meaningful researcher does more than view a page.

A meaningful research session might include:

- search
- result open
- source open
- entity exploration
- save
- return

---

## 45.1 Acquisition metrics

- organic visitors
- search impressions
- search clicks
- direct traffic
- referral traffic
- share-generated sessions

## 45.2 Activation metrics

- account creation
- first search
- first result open
- first source open
- first save

## 45.3 Conversion metrics

- paywall impression
- paywall interaction
- checkout start
- checkout completion
- monthly conversion
- annual conversion

## 45.4 Retention metrics

- day-7 return
- day-30 return
- monthly active Pro users
- churn
- saved-search reopen rate
- collection reopen rate

## 45.5 Depth metrics

- searches/user
- sources opened/user
- entities explored/user
- bookmarks/user
- collections/user
- investors explored/user
- average research trail depth

## 45.6 Cross-investor behavior

Track:

> How often does a user move from one investor to another?

Example:

`Buffett → Munger`

`Buffett → Marks`

This is important because it measures whether the connected library is creating value beyond the individual investor archive.

---

# 46. EVENT TAXONOMY FOR ANALYTICS

Events should use stable names.

Suggested examples:

```text
search_started
search_submitted
search_result_opened
filter_applied
source_opened
entity_opened
investor_explored
theme_explored
company_explored
event_explored
comparison_started
comparison_completed
save_clicked
bookmark_created
saved_search_created
collection_created
paywall_viewed
checkout_started
subscription_started
share_clicked
public_page_viewed
```

Properties should include relevant identifiers without exposing unnecessary personal data.

---

# 47. PRODUCT FUNNEL

The simplest useful funnel is:

```text
LAND
 ↓
SEARCH
 ↓
OPEN RESULT
 ↓
OPEN SOURCE / ENTITY
 ↓
EXPLORE 2+ ENTITIES
 ↓
SAVE
 ↓
PAYWALL
 ↓
PAID
 ↓
RETURN
```

This lets the team see exactly where the product is failing.

---

# 48. WHAT TO BUILD OBSESSIVELY WELL

Five areas deserve disproportionate effort.

## 1. Search

Entry point.

## 2. Cross-investor exploration

Differentiation.

## 3. Source/context

Trust.

## 4. Timeline / idea evolution

Historical depth.

## 5. Save / Collections

Retention.

Everything else should reinforce these.

---

# 49. PRODUCT LOOP OPTIMIZATION

The team should repeatedly ask:

> **What part of SEARCH → EXPLORE → COMPARE → SAVE is currently frustrating?**

Fix that.

Do not ask:

> What feature should we add next?

This product should become better through reduced friction, not endless feature accumulation.

---

# 50. V1 SCOPE

## P0 — Core

- Universal Search
- source/context
- entity navigation
- authentication
- subscription/entitlement system
- responsive foundation
- public/pro boundaries

## P1 — Intelligence/navigation

- themes
- timeline
- companies
- events
- decisions

## P2 — Differentiation

- compare
- research trails
- idea evolution
- cross-investor graph

## P3 — Retention

- bookmarks
- saved searches
- collections
- persistent research state
- notes

## P4 — Growth

- public SEO pages
- social metadata
- shareable pages
- comparison landing pages
- discovery

## P5 — Optimization

- analytics
- conversion optimization
- performance
- accessibility
- UX refinement

## P6 — Post-100-customer layer

- AI retrieval/synthesis

---

# 51. WHAT NOT TO BUILD BEFORE 100 CUSTOMERS

Explicitly exclude:

- AI chatbot
- AI summaries
- semantic/vector search
- AI recommendations
- investment signals
- portfolio tracking
- stock screening
- real-time market data
- brokerage integration
- native mobile app
- team collaboration
- enterprise features

The rule is simple:

> **Do not become Koyfin.**

Own investor knowledge, historical thinking, decision records, and source-connected exploration.

---

# 52. WHY AI IS DELAYED

AI is not forbidden.

It is strategically sequenced.

The first 100 paying users should reveal:

- what people search for
- which questions repeat
- which investors get the most use
- which concepts are difficult to retrieve
- what users save
- what users compare
- where deterministic search fails

The product should learn from real behavior before introducing an interpretation layer.

---

# 53. V2 AI ARCHITECTURE

When AI is introduced, it should sit above verified retrieval.

```text
USER
 ↓
QUESTION
 ↓
DETERMINISTIC RETRIEVAL
 ↓
VERIFIED SOURCES
 ↓
STRUCTURED CONTEXT
 ↓
AI SYNTHESIS
 ↓
CLAIM-LEVEL CITATIONS
```

Never:

```text
USER
 ↓
LLM
 ↓
GUESS
```

---

## 53.1 Possible V2 capabilities

### Cross-investor question

> How do Buffett, Marks and Dalio think about inflation?

### Idea evolution

> How did Buffett's view of technology change?

### Research brief

> Build a source-backed brief on capital allocation.

### Contradiction detection

> Where did Buffett's later thinking differ from earlier thinking?

### Source discovery

> Find the strongest primary sources on margin of safety.

The underlying database remains the source of truth.

---

# 54. AI SAFETY / TRUST RULES

When AI exists, it should:

- cite source passages
- distinguish sourced claims from synthesis
- avoid pretending to have direct evidence when none exists
- provide source links where permitted
- expose uncertainty where retrieval is incomplete
- never silently substitute generated claims for source evidence

The UI should make it obvious when the user is looking at:

- a source
- an indexed passage
- an editorial interpretation
- an AI synthesis

---

# 55. CONTENT EXPERIENCE STANDARD

A source or passage page should never feel like a database dump.

The content experience should answer:

1. What is this?
2. Why does it matter?
3. Where did it come from?
4. What is it related to?
5. What can I explore next?

This five-question standard can be used in QA for every content page.

---

# 56. EMPTY / LOADING / ERROR / PERMISSION STANDARD

A feature is not complete when the happy path works.

It must also handle:

## Empty

There is no matching content.

## Loading

The system is fetching content.

## Error

Something failed.

## Permission

The user is not entitled to this content.

## Partial data

Some relationships are available but some are missing.

## Stale data

Data may be older than expected or awaiting ingestion updates.

Every state should have a useful user action.

---

# 57. FEATURE DEFINITION OF DONE

A feature is done only when:

### Functional

Real data works.

### Empty

Zero-result state is deliberate and useful.

### Loading

Latency state is stable.

### Error

Failure state is understandable.

### Permission

Free/Pro rules are correct.

### Mobile

Interaction remains natural.

### Keyboard

Core interaction can be completed without a mouse.

### URL

State is addressable where appropriate.

### Source

Underlying evidence can be inspected where permitted.

### Performance

The feature works at realistic corpus sizes.

### Analytics

Important actions are measurable.

### Accessibility

Semantic and keyboard behavior are correct.

---

# 58. QA CHECKLIST

## Search

- [ ] Exact matches rank sensibly
- [ ] Entity matches outrank incidental text matches
- [ ] Filters combine correctly
- [ ] URL state updates correctly
- [ ] Back button preserves research state
- [ ] Empty state is useful
- [ ] Loading state is stable
- [ ] Search errors are distinct from zero results
- [ ] Keyboard navigation works
- [ ] Save action works from results

## Entity navigation

- [ ] Investor links work
- [ ] Theme links work
- [ ] Company links work
- [ ] Event links work
- [ ] Source links work
- [ ] Related entities are relevant
- [ ] No dead-end pages

## Timeline

- [ ] Nodes are correctly dated
- [ ] Filters work
- [ ] Details open without losing position
- [ ] Mobile interaction works
- [ ] Related source links work

## Comparison

- [ ] 2–4 investors can be selected
- [ ] Topic can be selected
- [ ] Shared/distinct ideas render correctly
- [ ] Sources remain traceable
- [ ] The system does not present unsupported judgments

## Save

- [ ] Save is instant
- [ ] Undo works
- [ ] Saved state persists
- [ ] Collections work
- [ ] Saved searches reopen correctly

## Paywall

- [ ] Free content remains useful
- [ ] Locked content is explained clearly
- [ ] Pro entitlements work
- [ ] Checkout succeeds
- [ ] User returns to research context after purchase

## Mobile

- [ ] No horizontal overflow
- [ ] Filters are usable
- [ ] Result detail is readable
- [ ] Context is accessible
- [ ] Save actions are reachable

---

# 59. SECURITY / ENTITLEMENT RULES

Pro content must not be protected only by UI hiding.

The server must enforce entitlement at the data/API layer.

Requirements:

- secure session handling
- server-side authorization
- subscription state validation
- protected API routes
- rate limiting for expensive operations
- auditability for entitlement changes

The front-end can show previews, but it must not expose the complete Pro payload to an unauthorized client.

---

# 60. SUBSCRIPTION STATE UX

Support clear states:

- Free
- Pro monthly active
- Pro annual active
- Payment pending
- Payment failed
- Canceling at period end
- Canceled / expired

Do not make users guess whether they still have access.

The account area should show:

- current plan
- renewal date
- billing state
- upgrade/cancel actions

---

# 61. RESEARCH CONTINUITY AFTER LOGIN

A user who signs up from a search result should return to that search.

Example:

```text
Anonymous search
 ↓
User opens result
 ↓
Prompted to save
 ↓
Sign up
 ↓
Return to same result
 ↓
Saved
```

Do not throw the user back to the homepage after authentication.

---

# 62. RESEARCH CONTINUITY AFTER PAYMENT

This is even more important.

```text
Free user
 ↓
Search Buffett inflation
 ↓
Open result
 ↓
Hit Pro boundary
 ↓
Checkout
 ↓
Payment success
 ↓
Return to exact result / context
```

The purchase should feel like unlocking the next page of the same research session.

---

# 63. DISCOVERY CONTENT PRINCIPLES

Discovery should be:

- source-backed
- timeless or historically relevant
- connected to the library
- editorially useful
- short enough to scan

Avoid turning Discovery into:

- breaking news
- opinion publishing
- market forecasts
- generic blog content

Its role is:

> **Give people another interesting doorway into the library.**

---

# 64. RESEARCH SESSION DESIGN

A research session should feel like a continuous path.

Example:

```text
Query: Buffett inflation
 ↓
Result: 1987 letter
 ↓
Theme: Inflation
 ↓
Company: Coca-Cola
 ↓
Investor: Munger
 ↓
Compare: Buffett vs Munger
 ↓
Event: 1987 crash
 ↓
Save: collection
```

The system should make this chain easy and preserve it in user behavior analytics.

Future research-session features could expose:

> **Recently explored**

or:

> **Continue your research**

without becoming invasive.

---

# 65. CONTEXTUAL ACTION HIERARCHY

Every detail page should expose a limited set of actions.

Primary:

**Explore**

Secondary:

**Save**

Contextual:

**Compare**

Evidence:

**Open Source**

Avoid 10 competing primary buttons.

---

# 66. SEARCH RESULT COUNT AS VALUE SIGNAL

Counts can communicate the depth of the underlying corpus.

Example:

> 1,382 indexed references

or:

> 37 references across 12 sources

The count should be accurate and should not be inflated by duplicate indexing.

Counts should reflect meaningful records, not raw database rows.

---

# 67. CROSS-INVESTOR VALUE SIGNAL

A user should quickly see when an idea is broad.

Example:

```text
INFLATION

14 investors
326 references
42 sources
9 major events
```

This visually communicates why the database is more valuable as a network than as 20 separate archives.

---

# 68. IDEA EVOLUTION

Idea evolution should show how a concept changes over time.

Example:

```text
EARLY THINKING
      ↓
MARKET EXPERIENCE
      ↓
NEW DECISION
      ↓
LATER FORMULATION
```

This can be built first as a timeline/navigation feature and later become one of the strongest AI inputs.

---

# 69. RESEARCH TRAIL QUALITY STANDARD

Every official Research Trail should answer:

1. What is the central question?
2. Why is the starting point important?
3. What historical evidence changed the thinking?
4. Which decisions demonstrate the idea?
5. Which sources support each step?
6. What can the user explore next?

Do not publish a trail that is merely a sequence of links.

---

# 70. DATA QUALITY STANDARD

The product's perceived value is capped by data quality.

Every indexed record should ideally have:

- canonical identity
- normalized date
- source association
- investor association when known
- relevant entity links
- source type
- provenance state

Data ingestion should include deduplication and validation.

---

# 71. CONTENT EDITORIAL STANDARD

Investor/Pass should avoid overstating certainty.

Prefer:

> Indexed reference associated with Buffett's discussion of pricing power.

Over:

> Buffett believed pricing power was always the best investment strategy.

The first is source-linked.

The second makes a broad interpretive claim.

---

# 72. FINANCIAL ADVICE BOUNDARY

The product should primarily present historical information and source-linked research.

Avoid product language that implies:

- guaranteed returns
- stock recommendations
- investment signals
- certainty about future performance

Comparisons should be framed as:

> how investors approached the topic

rather than:

> which investor's strategy users should follow

---

# 73. HOME PAGE STRUCTURE

A possible launch homepage:

```text
NAVIGATION

THE PUBLIC RECORD, PROPERLY INDEXED.

Search the library
[................................................]

Try:
Buffett on inflation · Munger on incentives · 2008 crisis

────────────────────────────────────

WHY INVESTOR/PASS

Study what exceptional investors said, thought and did.

────────────────────────────────────

EXPLORE

Investors
Themes
Companies
Events

────────────────────────────────────

A FEW RESEARCH PATHS

Buffett on inflation
2008 through five investors
Margin of safety

────────────────────────────────────

PRO

Search everything.
Explore every connection.
Save your research.

$19/month
$149/year
```

The homepage should quickly move the user into the library.

---

# 74. PUBLIC VS PRIVATE UX

Public pages should feel complete enough to be useful.

Private pages should feel deeper, not simply more decorated.

Public:

- selected results
- strong source previews
- canonical relationships
- enough context to demonstrate value

Pro:

- full corpus
- advanced filters
- complete timelines
- comparison depth
- saving
- collections
- personal research state

The distinction is **depth and utility**, not artificial ugliness on Free pages.

---

# 75. SHAREABLE PAGE QUALITY STANDARD

A public research page is good enough to share when it:

- answers a real question
- has a stable URL
- has meaningful source coverage
- contains internal navigation
- has a clear headline
- includes date range/context
- has a strong social preview

---

# 76. PRODUCT GROWTH FLYWHEEL

```text
Excellent source coverage
        ↓
Excellent indexing
        ↓
Excellent public pages
        ↓
SEO traffic
        ↓
Beautiful exploration
        ↓
"I cannot easily do this elsewhere"
        ↓
$19 Pro
        ↓
Saved research
        ↓
Return visits
        ↓
Shareable research pages
        ↓
More SEO/social traffic
        ↓
More subscribers
```

The flywheel is stronger than any single feature.

---

# 77. SEO → PRODUCT → CONVERSION PATH

An ideal journey:

```text
Google search
 ↓
Public Buffett/Coca-Cola page
 ↓
Explore source
 ↓
Click theme
 ↓
Discover Munger
 ↓
Compare Buffett + Munger
 ↓
Want complete references
 ↓
Pro
```

This demonstrates that SEO traffic is not separate from the product experience.

It is the first step of the product experience.

---

# 78. RETENTION FLYWHEEL

```text
Search
 ↓
Find something useful
 ↓
Save
 ↓
Build collection
 ↓
Return
 ↓
Continue research
 ↓
Discover related investor
 ↓
Save more
```

The user relationship becomes:

> **My research library**

instead of:

> **A website I visited once.**

---

# 79. THE 20 INVESTORS ARE CONTENT, NOT THE UI

This is one of the most important strategic rules.

Do not make the homepage look like:

```text
Buffett
Munger
Marks
Lynch
Graham
Bogle
...
```

That immediately frames the product as an archive catalog.

Instead, organize the experience around:

- question
- theme
- company
- event
- source
- relationship

Then investors naturally appear as part of the research graph.

---

# 80. PRODUCT HIERARCHY

## Tier 1 — Core interaction

**SEARCH**

**EXPLORE**

**COMPARE**

**SAVE**

## Tier 2 — Intelligence/navigation

**TIMELINE**

**THEMES**

**COMPANIES**

**EVENTS**

**SOURCE CONTEXT**

## Tier 3 — Differentiation

**RESEARCH TRAILS**

**IDEA EVOLUTION**

**CROSS-INVESTOR GRAPH**

## Tier 4 — Growth

**SEO PAGES**

**SHAREABLE PAGES**

**DISCOVERY**

## Tier 5 — Retention

**BOOKMARKS**

**SAVED SEARCHES**

**COLLECTIONS**

## Tier 6 — V2

**AI RESEARCH LAYER**

---

# 81. FINAL CORE LOOP

```text
                  ┌───────────────┐
                  │   DISCOVER    │
                  └───────┬───────┘
                          ↓
                  ┌───────────────┐
                  │    SEARCH     │
                  └───────┬───────┘
                          ↓
                  ┌───────────────┐
                  │   EXPLORE     │
                  │ theme         │
                  │ source        │
                  │ company       │
                  │ event         │
                  └───────┬───────┘
                          ↓
                  ┌───────────────┐
                  │   COMPARE     │
                  └───────┬───────┘
                          ↓
                  ┌───────────────┐
                  │     SAVE      │
                  └───────┬───────┘
                          ↓
                  ┌───────────────┐
                  │    RETURN     │
                  └───────┬───────┘
                          │
                          └──────────→ DISCOVER
```

This is the product.

Everything else exists to make this loop better.

---

# 82. MASTER PRODUCT RULES

1. **Search before menus.**
2. **Context before decoration.**
3. **Source before opinion.**
4. **Relationships before isolated pages.**
5. **Progressive disclosure before complexity.**
6. **Fast interactions before animation.**
7. **Persistent state before convenience features.**
8. **Useful Free before aggressive paywalls.**
9. **Retention before endless acquisition features.**
10. **Verified retrieval before AI synthesis.**
11. **Real usage before new feature categories.**
12. **Every page needs a next step.**
13. **Every important result needs provenance.**
14. **Every Pro boundary should demonstrate value.**
15. **The graph should be the navigation.**

---

# 83. FINAL PRODUCT POSITIONING

Investor/Pass should not be described as:

> "A platform with information about 20 investors."

Prefer:

> **Investor/Pass turns decades of public investor thinking into a searchable, connected research library.**

Or:

> **Study what exceptional investors said, thought, and did — with the sources and relationships connected.**

Or the strongest north-star formulation:

> **The place to study investor thinking.**

---

# 84. FINAL PRODUCT STANDARD

The standard for every feature is not:

> Does it work?

The standard is:

> **Does this make serious research easier?**

The standard for every page is not:

> Does it look polished?

The standard is:

> **Can the user understand where they are, verify what they are seeing, and immediately continue exploring?**

The standard for every new feature is not:

> Can we build it?

The standard is:

> **Does it strengthen SEARCH → EXPLORE → COMPARE → SAVE?**

---

# 85. FINAL NORTH STAR

> **Investor/Pass turns information that is technically public but practically difficult to navigate into an exceptionally good product.**

The user should arrive with:

> **"What did Buffett say about inflation?"**

and 20 minutes later have:

- explored Buffett's timeline
- opened the relevant source
- discovered Howard Marks
- compared Marks and Buffett
- explored the 2008 crisis
- followed related companies and themes
- saved important sources
- created a personal collection
- shared a public research page

without feeling lost.

The final feeling should be:

> **"This is where I go to study investor thinking."**

That is the standard for the $19/month product.

---

# Appendix A — Launch Acceptance Summary

The launch candidate should not be considered complete unless a new user can:

```text
LAND ON PUBLIC PAGE
        ↓
SEARCH A REAL QUESTION
        ↓
OPEN A RELEVANT RESULT
        ↓
VERIFY THE SOURCE
        ↓
FOLLOW AT LEAST 2 RELATED ENTITIES
        ↓
COMPARE 2 INVESTORS
        ↓
SAVE A RESULT
        ↓
UNDERSTAND THE PRO VALUE
        ↓
SUBSCRIBE
        ↓
RETURN TO THE SAME RESEARCH CONTEXT
```

This is the end-to-end acceptance journey.

---

# Appendix B — Suggested First Research Journeys for QA

These journeys should be used as representative product tests.

## Journey 1 — Buffett / Inflation

```text
Buffett on inflation
 ↓
search results
 ↓
1987 source
 ↓
inflation theme
 ↓
related companies
 ↓
Marks
 ↓
compare Buffett vs Marks
 ↓
save
```

## Journey 2 — Munger / Incentives

```text
Munger incentives
 ↓
search
 ↓
source
 ↓
concept: incentives
 ↓
related investors
 ↓
research trail
 ↓
collection
```

## Journey 3 — 2008 Crisis

```text
2008 financial crisis
 ↓
event page
 ↓
Buffett
 ↓
Marks
 ↓
Dalio
 ↓
compare
 ↓
open sources
 ↓
save
```

## Journey 4 — Company Entry

```text
Coca-Cola
 ↓
company page
 ↓
Buffett
 ↓
Munger
 ↓
moat
 ↓
pricing power
 ↓
source
 ↓
save
```

## Journey 5 — SEO Entry

```text
Google
 ↓
public topic page
 ↓
source preview
 ↓
related investor
 ↓
full result count
 ↓
Pro
```

---

# Appendix C — What Success Looks Like

The first major product milestone is:

# 100 paying users

At $19/month, that represents:

# $1,900 MRR

This is a validation milestone, not a forecast.

The product should use those first users to learn:

- which searches matter
- which relationships matter
- which content is worth saving
- which comparisons are compelling
- which pages convert
- which retention mechanics work
- where users get confused

The goal is not to maximize the feature count before 100 customers.

The goal is to create a research experience strong enough that 100 people are willing to pay for it.

---

# Appendix D — Final Strategic Statement

The 20 investors are the **content universe**.

The structured data is the **information system**.

The search experience is the **entry point**.

The graph is the **differentiation**.

The source/context layer is the **trust mechanism**.

The public research pages are the **acquisition engine**.

The personal library is the **retention mechanism**.

The $19 subscription is the **monetization layer**.

The future AI layer is the **synthesis layer above verified retrieval**.

Together:

```text
CONTENT UNIVERSE
      ↓
STRUCTURED INDEX
      ↓
SEARCH
      ↓
EXPLORE
      ↓
COMPARE
      ↓
SAVE
      ↓
RETURN
      ↓
DISCOVER
      ↓
SEARCH AGAIN
```

That is Investor/Pass.

> **Do not build 50 unrelated features. Build one research loop so good that the product becomes the user's default place to study investor thinking.**
