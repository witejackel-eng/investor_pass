# Investor/Pass — Complete Source Universe Research Bundle

> This file consolidates the uploaded research bundle into a single Markdown document. All source file contents are preserved verbatim inside clearly labeled sections. CSV files are preserved as CSV text inside fenced code blocks.

## Bundle Manifest

| # | Original file | Size (bytes) |
|---:|---|---:|
| 1 | `investorpass_research/00_EXECUTIVE_SUMMARY.md` | 13325 |
| 2 | `investorpass_research/01_SOURCE_UNIVERSE_MAP.md` | 10865 |
| 3 | `investorpass_research/02_DATA_MODEL_AND_SCHEMA.md` | 15688 |
| 4 | `investorpass_research/03_RIGHTS_AND_LEGAL_FRAMEWORK.md` | 13209 |
| 5 | `investorpass_research/04_INGESTION_ARCHITECTURE.md` | 12905 |
| 6 | `investorpass_research/05_ENTITY_GRAPH.md` | 9181 |
| 7 | `investorpass_research/06_PHASED_BUILD_PLAN.md` | 14132 |
| 8 | `investorpass_research/README.md` | 3488 |
| 9 | `investorpass_research/investors/01_warren_buffett.md` | 8749 |
| 10 | `investorpass_research/investors/02_charlie_munger.md` | 4223 |
| 11 | `investorpass_research/investors/03_howard_marks.md` | 4027 |
| 12 | `investorpass_research/investors/04_john_bogle.md` | 4053 |
| 13 | `investorpass_research/investors/05_terry_smith.md` | 4229 |
| 14 | `investorpass_research/investors/06_george_soros.md` | 3684 |
| 15 | `investorpass_research/investors/07_bill_ackman.md` | 3767 |
| 16 | `investorpass_research/investors/08_carl_icahn.md` | 4194 |
| 17 | `investorpass_research/investors/09_ray_dalio.md` | 4362 |
| 18 | `investorpass_research/investors/10_mohnish_pabrai.md` | 3191 |
| 19 | `investorpass_research/investors/11_david_swensen.md` | 3979 |
| 20 | `investorpass_research/investors/12_peter_lynch.md` | 3970 |
| 21 | `investorpass_research/investors/13_benjamin_graham.md` | 4806 |
| 22 | `investorpass_research/investors/14_philip_fisher.md` | 3409 |
| 23 | `investorpass_research/investors/15_joel_greenblatt.md` | 3880 |
| 24 | `investorpass_research/investors/16_john_templeton.md` | 4359 |
| 25 | `investorpass_research/investors/17_jim_simons.md` | 4637 |
| 26 | `investorpass_research/investors/18_seth_klarman.md` | 4277 |
| 27 | `investorpass_research/investors/19_stanley_druckenmiller.md` | 5375 |
| 28 | `investorpass_research/investors/20_jesse_livermore.md` | 5459 |
| 29 | `investorpass_research/build_csvs.py` | 89753 |
| 30 | `investorpass_research/data/companies.csv` | 4710 |
| 31 | `investorpass_research/data/concepts.csv` | 13536 |
| 32 | `investorpass_research/data/events.csv` | 6745 |
| 33 | `investorpass_research/data/investors.csv` | 7473 |
| 34 | `investorpass_research/data/rights_matrix.csv` | 11790 |
| 35 | `investorpass_research/data/sources_catalog.csv` | 36291 |

---


# SOURCE FILE: `00_EXECUTIVE_SUMMARY.md`

# Executive Summary — Twelve findings that should change the build plan

Research date: 22 August 2026. Every URL below was checked live unless marked otherwise.

---

## 1. The Buffett corpus just changed authorship, and your schema has to know it

Buffett stepped down as Berkshire CEO at the end of 2025 and remains Chairman. The letter that opens the **2025 annual report, dated 28 February 2026, was written by Greg Abel, not Buffett** — Abel's first, published at [berkshirehathaway.com/letters/2025ltr.pdf](https://www.berkshirehathaway.com/letters/2025ltr.pdf) and reported by [Reuters](https://www.reuters.com/sustainability/boards-policy-regulation/berkshire-ceo-abel-seeks-reassure-shareholders-after-taking-baton-buffett-2026-02-28/) and [CNBC](https://www.cnbc.com/2026/02/28/berkshire-ceo-abel-vows-to-keep-buffetts-culture-of-disciplined-investing-in-first-annual-letter.html).

Buffett's own last shareholder communication as CEO was the **November 2025 Thanksgiving letter**, in which he said he was "going quiet. Sort of," and announced he would hand the annual report to Abel while continuing an annual Thanksgiving message ([CNN](https://www.cnn.com/2025/11/10/markets/warren-buffett-shareholder-letter), [WSJ](https://www.wsj.com/business/warren-buffett-letter-2025-takeaways-e7e0a578)).

**Schema implication:** `sources.author_id` cannot be inferred from `publisher`. A naïve "all Berkshire letters are Buffett" ingestion rule now silently mis-attributes. You also need a new source type for the Thanksgiving letter series, which is a different genre from the annual letter — personal, retrospective, not tied to the annual report.

## 2. Only six of twenty investors have archive infrastructure good enough to build on now

| Tier | Investors | Why |
|---|---|---|
| **Excellent** | Buffett, Munger, Marks, Bogle, Terry Smith, Soros | Complete or near-complete official primary archive, stable URLs, transcripts |
| **Good** | Ackman, Icahn, Dalio, Pabrai, Simons, Swensen | Substantial primary record, but fragmented or partly gated |
| **Thin** | Lynch, Graham, Fisher, Greenblatt, Templeton, Livermore | Historic figures; primary material is in copyrighted books or offline archives |
| **Nearly absent** | Klarman, Druckenmiller | No legitimate public letter archive at all |

Your instinct to start with Buffett → Munger → Marks → Lynch → Graham → Bogle is right on five of six. **Lynch is the weak link** in that first wave: his primary record is three copyrighted books plus a handful of interviews. Consider substituting **Terry Smith or Soros** into wave one, both of which have genuinely complete official archives, and moving Lynch to wave two where his profile can be built out of interviews and Magellan-era filings rather than book text.

## 3. Munger's archive has a hard, documented floor at 2015

The Munger Archive states that **2015 is the earliest Daily Journal meeting surviving on video; nothing survives for 2014 or earlier; 2016 exists only as audio plus transcript** because CNBC only began filming after 2016 ([Munger Archive Daily Journal page](https://mungerarchive.com/daily-journal/)). The archive holds **35 verified recordings** overall — "every Daily Journal meeting, the major speeches, his only podcast — most with transcripts" ([mungerarchive.com](https://mungerarchive.com/)).

**Product implication:** Munger's timeline is genuinely sparse before 2015 in *recorded* form, and your UI must not imply otherwise. This is exactly the case where the provenance surface earns its keep: show the gap as a gap. Secondary transcript sets fill 2013–2023 ([Worldly Partners](https://worldlypartners.com/charlie-munger-archive/)) but are third-party transcriptions of unclear provenance and should be labelled as such, not merged silently with the primary set.

## 4. Marks is the cleanest corpus in the whole universe, and it just got a canonical edition

Marks's first memo, "The Route To Performance," was **12 October 1990**. He now has roughly **160 public memos**. For the 35th anniversary in October 2025, Oaktree released "The Complete Collection" (1990–2025) plus a curated "Best of" set of about 45 ([CNBC](https://www.cnbc.com/2025/10/14/howard-marks-celebrates-35-years-of-writing-his-acclaimed-memos-he-wasnt-sure-anyone-read-them-at-first.html)). A bound set entered the permanent collection of the Museum of American Finance, a Smithsonian affiliate ([MoAF](https://www.moaf.org/news/press-releases/2025-10-14-howard-marks-iconic-memos-join-permanent-collection-at-the-museum-of-american-finance)).

One memo = one document, one date, one author, one PDF, 35 unbroken years. This is your reference implementation. Build the ingestion framework against Marks first even though Buffett is the marquee name, because Marks will expose fewer edge cases and get you to a working pipeline faster.

## 5. Bogle's archive was nearly lost and is now community-maintained — including a spreadsheet you can seed from

Vanguard **discontinued its Bogle web archive in 2019**. The material now lives with the John C. Bogle Center for Financial Literacy at [boglecenter.net/bogle-archive](https://boglecenter.net/bogle-archive/), organised into speeches, academic papers, op-eds, letters to media, internal memos to Vanguard employees, congressional testimony, and presentation slides, spanning roughly 1964 to 7 December 2017.

Critically, the Bogle Center publishes the whole index as a spreadsheet: [Bogle-Archive-Published.xlsx](https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx). **This is the single highest-leverage artifact in the entire research effort** — a machine-readable seed catalog for an entire investor, handed to you for free. Ingest it first.

## 6. Icahn's "writings" are SEC exhibits, not essays

Icahn does not maintain a letter archive. His open letters to shareholders are **filed on EDGAR as DFAN14A exhibits**, and his positions are visible through SC 13D/A filings going back to 1995 via [ielp.com/financial-information/sec-filings](https://www.ielp.com/financial-information/sec-filings). His CIK is **0000813762**.

This means Icahn's ingestion adapter is a *filings* adapter, not a *letters* adapter — and once you have built it, you get Ackman's 13D activism history and Buffett's 13F portfolio record from the same code path. Icahn is therefore worth building earlier than his fame-ranking would suggest, because he forces you to write the most reusable adapter in the system.

## 7. Bridgewater's founding-era archive opened to researchers in February 2026

Harvard Business School's Baker Library Special Collections announced on **27 February 2026** that it has opened the **Bridgewater Associates, LP Archives**, containing **Bridgewater Daily Observations from 1978 to 1996** plus early photographs, covering the Latin American debt crisis, the 1987 crash, Black Wednesday in 1992, and the 1994 bond collapse. Access is **by application**, contact `specialcollectionsref@hbs.edu` ([HBS](https://www.hbs.edu/news/releases/bridgewater-archives)).

This is a genuine, dateable, primary corpus that no consumer product currently surfaces. It is also **not** something you can crawl. The correct Investor/Pass move is a rich *finding-aid* entry: describe what exists, cite the collection, and link to the access procedure. That is real product value delivered without a single line of ingestion.

## 8. "Old" does not mean public domain — and Graham is the proof

Graham's *Security Analysis* (1934) copies on the Internet Archive are marked `Access-restricted-item: true` and are lending-only ([archive.org](https://archive.org/details/securityanalysis0000grah)). *Graham and Dodd's Security Analysis* returns "No suitable files to display" ([archive.org](https://archive.org/details/grahamdoddssecur0000grah)). These are not public-domain texts; the works were renewed and the modern editions are substantially new copyrighted material with new introductions and commentary.

Contrast **Lefèvre's *Reminiscences of a Stock Operator* (1923)**, which *is* public domain in the United States and available as full text from Project Gutenberg, eBook #60979, released 20 December 2019 ([Project Gutenberg](https://www.gutenberg.org/ebooks/60979)). Even here the Gutenberg text carries the original 1923 Doran copyright notice in its front matter, and later annotated editions — including ones bundling "the Livermore Market Key" — are separately copyrighted.

**Doctrine to encode:** rights are per *edition* and per *jurisdiction*, never per *work*. Your `rights` table must key on edition, not title.

## 9. Livermore has no primary corpus at all — his most famous "voice" is fiction

*Reminiscences of a Stock Operator* is a **1923 roman à clef by Edwin Lefèvre**, not a Livermore autobiography ([Wikipedia](https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator)). The narrator is "Larry Livingston." Livermore's own *How to Trade in Stocks* (1940) is a separate, thin, and rights-encumbered work.

If Investor/Pass presents Lefèvre quotes as Livermore's words, the provenance model is broken at the root. Livermore needs a distinct `attribution_confidence` treatment: `FICTIONALISED_ATTRIBUTION`. He is the strongest argument in the corpus for having that field at all.

## 10. Klarman's only clean modern primary source is a 2026 podcast

Baupost partner letters are not legitimately public. The PDFs circulating on value-investing blogs (covering roughly 1995 to mid-2001) are unauthorised distributions of confidential partner communications. They are `REVIEW_REQUIRED` at best and realistically should never be ingested.

What *is* clean: Klarman's **Masters in Business interview with Barry Ritholtz, Bloomberg, 18 June 2026** ([Bloomberg audio](https://www.bloomberg.com/news/audio/2026-06-18/masters-in-business-seth-klarman-podcast)) with a transcript at [ritholtz.com](https://ritholtz.com/2026/06/transcript-seth-klarman/). Build the Klarman profile on that plus 13F filings, and state plainly that the letters are private. Users respect that more than they respect a suspiciously complete archive.

## 11. Druckenmiller must be timestamped at the utterance level, because he reverses

Druckenmiller has no letters and no memos. His entire public record is dated interviews: the CNBC Delivering Alpha appearances (28 September 2022, [CNBC transcript](https://nbcuniversalnewsgroup.com/cnbc/2022/09/28/cnbc-transcript-duquesne-family-office-chairman-ceo-stanley-druckenmiller-speaks-with-cnbcs-joe-kernen-live-during-the-cnbc-delivering-alpha-conference-today/)), Squawk Box (7 May 2024, [CNBC](https://www.cnbc.com/2024/05/07/cnbc-exclusive-cnbc-transcript-billionaire-investor-stanley-druckenmiller-speaks-with-cnbcs-squawk-box-today.html)), a Bloomberg interview with Sonali Basak (16 October 2024, [Apple Podcasts](https://podcasts.apple.com/us/podcast/duquesne-family-office-chairman-and-chief-executive/id1690236827?i=1000673335724)), and a Morgan Stanley "Hard Lessons" conversation with Iliana Bouzali (12 March 2026, [Morgan Stanley](https://www.morganstanley.com/insights/videos/hard-lessons/duquesne-stan-druckenmiller-iliana-bouzali)).

His stated views change fast and by design. Any Druckenmiller passage displayed without an exact date is actively misleading. Enforce `passage.stated_on` as `NOT NULL` for interview-sourced passages.

## 12. Simons's best primary sources are oral histories, not investment writing

Simons published essentially nothing about investing. His deep primary record is academic and biographical: the Simons Foundation's 2012 interview with Jeff Cheeger, indexed into 35 video chapters ([Simons Foundation](https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/), re-published [May 2024](https://www.simonsfoundation.org/2024/05/14/jim-simons-reflects-on-his-career-in-mathematics/)), and an **American Institute of Physics Oral History interview conducted by David Zierler in December 2020**, indexed at [Celebratio Mathematica](https://celebratio.org/Simons_J/article/507/).

Celebratio Mathematica is the best single bibliographic hub for Simons and should be treated as a Tier 5 institutional index, not a secondary blog. Note one unresolved conflict to flag rather than resolve: sources variously date Renaissance's founding to **1978 and 1982**. Do not pick one silently.

---

## Cross-cutting recommendation

The framework you asked for is right, but the sequencing should be adjusted. Build in this order:

1. **Marks** — simplest possible corpus, proves the pipeline
2. **Bogle** — proves spreadsheet-seeded bulk ingestion, and the archive already ships as XLSX
3. **Buffett** — proves multi-format (HTML letters, PDF letters, PDF reports, video-with-transcript, 13F) and multi-author attribution
4. **Icahn** — proves the EDGAR filings adapter, which then unlocks Ackman, Buffett portfolio history, and Druckenmiller 13Fs
5. **Munger** — proves gap-honest timelines and third-party transcript labelling
6. **Terry Smith** — proves runtime link extraction from JS-rendered, hash-URL document libraries

Then Soros, Ackman, Dalio, Pabrai, Swensen, Simons. Then the historic and thin figures last, as deliberately honest link-only profiles.

---

# SOURCE FILE: `01_SOURCE_UNIVERSE_MAP.md`

# Source Universe Map

Investor/Pass is a source-universe problem, not a "find their books" problem. This document defines the classes of source that exist, the tier hierarchy that ranks them, and the honest coverage reality per tier.

---

## The six source classes

Every artifact in the corpus belongs to exactly one class. The class determines the ingestion adapter, the rights default, and the UI treatment.

### Class A — Primary writings under the investor's own name
Shareholder letters, partner letters, memos, published essays, op-eds, books they authored, congressional testimony they delivered.

Defining property: the investor chose the words and published them deliberately. Highest evidentiary weight.

Best examples in the corpus: Marks's memos (1990–present), Buffett's Berkshire letters (1977–2024) plus Thanksgiving letters (2025–), Bogle's speeches and op-eds (1964–2017), Terry Smith's Fundsmith annual letters (2010–2025), Soros's essays.

### Class B — Spoken record: interviews, speeches, meetings, podcasts
Annual meeting Q&A, conference appearances, television interviews, podcast episodes, lectures.

Defining property: unscripted or semi-scripted, so it carries reasoning the writings smooth over — but also requires exact timestamping because views change and because transcription introduces error.

Best examples: CNBC's Buffett annual-meeting video archive back to 1994, the Munger Archive's 35 recordings, Druckenmiller's dated interview series, Klarman's 2026 Masters in Business appearance, Pabrai's Chai with Pabrai.

### Class C — Regulatory and portfolio record
Form 13F holdings, Schedule 13D/13G activist stakes, DFAN14A proxy exhibits, 10-K/8-K, N-PORT, fund annual reports, endowment reports.

Defining property: filed under legal obligation, dated to the day, structured, and produced by the U.S. Government or a regulated filer — which makes it the cheapest high-quality data in the entire universe. This is the "WHAT THEY DID" dimension.

Best examples: Berkshire 13F history, Icahn's SC 13D/A series back to 1995, Pershing Square holdings, Duquesne 13Fs, Yale endowment annual reports.

### Class D — Books
Authored monographs and edited collections.

Defining property: the densest expression of an investor's framework and simultaneously the most rights-encumbered material in the universe. Almost always `LINK_ONLY` in practice.

### Class E — Institutional and academic archives
University special collections, oral history programmes, museum collections, foundation archives, scholarly bibliographies.

Defining property: curated, described by professional archivists, often not digitised and often access-controlled — but the descriptive metadata is itself publishable and enormously valuable.

Best examples: HBS Baker Library's Bridgewater Archives (Daily Observations 1978–1996, access by application), the AIP oral history of Simons, Celebratio Mathematica's Simons bibliography, the Museum of American Finance's Marks memo collection and Lynch materials, Yale's news archive.

### Class F — Reputable secondary sources
Journalism, biographies, academic papers about the investor, well-maintained community transcript projects.

Defining property: used for **discovery and cross-checking**, not as the source of quotations. A secondary source tells you a speech happened; you then find the speech.

---

## Tier hierarchy

Tiers rank *evidentiary authority*, which is not the same as usefulness. Tier 6 is often how you find Tier 1.

| Tier | Definition | Rights default | Quotable? |
|---|---|---|---|
| **1** | Primary / official — published by the investor or their firm on their own property | `REVIEW_REQUIRED`, usually resolves to `LINK_ONLY` with short contextual quoting | Short excerpt + link |
| **2** | Original interviews and recordings — first-party publisher of the recording | `LINK_ONLY` | Short excerpt + link + timestamp |
| **3** | Regulatory / institutional filings | `PUBLIC_DOMAIN` for U.S. Government works; filer-authored exhibit text needs its own check | Yes, and fully ingestible as data |
| **4** | Books | `LINK_ONLY` unless edition-specific public domain is proven | Bibliographic metadata only |
| **5** | Academic and institutional archives | Varies; finding-aid metadata generally publishable | Metadata and citation |
| **6** | Reputable secondary | `LINK_ONLY` | Attributed reference only |

### The one rule that matters
**Tier determines trust; rights determine storage.** A Tier 1 shareholder letter is maximally authoritative *and* fully copyrighted. Authority does not grant permission. Keep the two fields orthogonal — `source_tier` and `rights_status` must never be derived from one another.

---

## Coverage reality by tier

### Tier 1 — strong for the living fund managers, weak for the historic figures
Complete or near-complete official primary archives exist for Buffett, Marks, Bogle, Terry Smith, Soros, Ackman, Pabrai, Dalio (partially), and Swensen (via Yale). They effectively do not exist for Lynch, Graham, Fisher, Livermore, Templeton (as an investor), Klarman, or Druckenmiller.

Practical consequence: roughly nine of twenty investors can be built primarily from Tier 1. The other eleven have to be built from Tiers 2, 3, and 5.

### Tier 2 — the single biggest available asset, and it is video
The Buffett annual-meeting archive is the standout: Berkshire began compiling meeting video in 1994 for internal use, and CNBC organised 122 hours of that footage into a public archive ([CNBC](https://buffett.cnbc.com/about-buffett/)). The archive now covers **33 full annual meetings back to 1994, roughly 145 hours of searchable video synced to about 3,000 pages of transcripts, and 575+ curated clips**, alongside a Buffett timeline, a portfolio tracker, and a Buffett–Munger friendship collection.

Caveat you must design around: **`buffett.cnbc.com` is protected by Akamai and returns Access Denied to automated fetches.** Investor/Pass cannot crawl it. It can, however, link deeply into it and describe it accurately — and that is arguably the better product anyway.

### Tier 3 — the most underexploited tier in the entire universe
EDGAR full-text search covers filings **since 2001** ([SEC](https://www.sec.gov/edgar/search/)). The machine-readable endpoints are all free U.S. Government works:

- Company submissions history: `https://data.sec.gov/submissions/CIK##########.json`
- XBRL company facts: `https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json`
- XBRL single concept: `https://data.sec.gov/api/xbrl/companyconcept/CIK##########/{taxonomy}/{tag}.json`
- Cross-filer frames: `https://data.sec.gov/api/xbrl/frames/{taxonomy}/{tag}/{unit}/CY####Q#I.json`
- Full-text search cluster: `https://efts.sec.gov/LATEST/search-index?q=`
- Quarterly flattened 13F datasets: [sec.gov/data-research/sec-markets-data/form-13f-data-sets](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets)

The quarterly 13F ZIPs are the correct entry point for portfolio history: each archive contains a submission table, a cover-page table, and an information table with one row per holding carrying issuer name, CUSIP, market value, share or principal amount, investment discretion, and voting-authority split. Reconstructing a manager's portfolio means filtering the submission table by CIK, confirming the report is a holdings report and not a notice, joining the information table on accession number, aggregating by CUSIP because one issuer often spans several rows for different share classes, and diffing against the prior quarter.

Two operational notes: the SEC requires a descriptive `User-Agent` header under its fair-access policy, and **13F filings before Q3 2013 used fixed-width TXT rather than XML** ([edgartools](https://edgartools.readthedocs.io/en/stable/13f-filings/)), so historical parsing needs a second code path.

### Tier 4 — comprehensively encumbered, and that is fine
Not one canonical investing book in this corpus is safely reproducible in full. The exception that proves the rule is Lefèvre's *Reminiscences of a Stock Operator*, public domain in the U.S. via [Project Gutenberg #60979](https://www.gutenberg.org/ebooks/60979) — and that is a novel about a Livermore-analogue, not an investor's own writing.

Design accordingly: books enter Investor/Pass as **bibliographic entities with structural metadata** — title, edition, ISBN, publication date, publisher, chapter list, concept tags, and links to Open Library and worldcat — not as text. Chapter-level concept tagging gives users nearly all the navigational value of full text with none of the exposure.

### Tier 5 — the differentiator nobody else is using
This is where Investor/Pass can be genuinely unique, because institutional finding aids are invisible to normal search behaviour and completely absent from competing products. The HBS Bridgewater collection (opened 27 February 2026), the AIP Simons oral history, the Museum of American Finance holdings, and Yale's archives are all citable, describable, and currently unsurfaced.

Cost to ingest: near zero, because you are ingesting descriptions, not documents. Value to a serious user: very high.

### Tier 6 — necessary, and must be visibly demoted
Community transcript projects are genuinely useful for discovery — Worldly Partners for Munger's Daily Journal meetings 2013–2023, Steady Compounding for Fundsmith AGMs and Munger 2023, sungcap.com and tilsonfunds.com for older Munger transcripts, csinvesting and Focused Compounding for Greenblatt's Columbia class notes. Ritholtz's transcripts of his own Masters in Business interviews are a special case: first-party to the interviewer, so effectively Tier 2.

Rule: a Tier 6 transcript may be *cited* and *linked*, and may be used to locate the primary recording, but must never be presented in the same visual weight as a first-party transcript.

---

## Where the universe is genuinely empty

Be explicit about these in the product rather than hiding them:

| Gap | Reality |
|---|---|
| Baupost partner letters | Private. Circulating PDFs are unauthorised. |
| Duquesne / Druckenmiller writings | None exist. Interviews only. |
| Renaissance / Simons investment method | Deliberately undisclosed. Academic record only. |
| Templeton investment writings | Very little primary investment writing online; his best primary artifact is the 14 May 1985 Templeton Prize address. |
| Munger pre-2015 recordings | Do not survive. |
| Livermore's own voice | Almost nothing; his fame rests on a novel by someone else. |
| Fisher primary material | *Common Stocks and Uncommon Profits* (1958) and successors, all in copyright; almost no digitised speeches. |

A product that says "this does not exist, here is why" is more trustworthy than one that quietly returns fewer results.

---

# SOURCE FILE: `02_DATA_MODEL_AND_SCHEMA.md`

# Data Model and Schema

PostgreSQL DDL for the Investor/Pass source layer. Aligned to the V1 search decision in the product spec: deterministic Postgres full-text search plus trigram similarity over a weighted `tsvector`, with title weighted highest and passage body lowest.

Design principles carried through from the spec:

1. **Source, Passage, Interpretation, and Relationship are four different things.** Never collapse them.
2. **Provenance is a visible product surface**, so provenance fields are first-class columns, not JSON blobs.
3. **Never claim verification that has not happened.** `provenance_status` defaults to `UNVERIFIED`.
4. **Rights are per edition and per jurisdiction**, never per work.
5. **Tier and rights are orthogonal.** Neither is derived from the other.

---

## Enumerated types

```sql
CREATE TYPE rights_status AS ENUM (
  'PUBLIC_DOMAIN',
  'LICENSED',
  'PERMISSION_GRANTED',
  'LINK_ONLY',
  'REVIEW_REQUIRED'
);

CREATE TYPE usage_status AS ENUM (
  'FULL_TEXT_STORED',      -- we hold and may serve the whole text
  'EXCERPT_STORED',        -- short contextual excerpt only
  'METADATA_ONLY',         -- bibliographic record, no body text
  'INDEX_ONLY',            -- we index for retrieval but never display body
  'BLOCKED'                -- do not ingest, do not display
);

CREATE TYPE provenance_status AS ENUM (
  'UNVERIFIED',            -- default; discovered but not confirmed
  'URL_RESOLVED',          -- URL fetched successfully at retrieved_at
  'FIRST_PARTY_CONFIRMED', -- confirmed on the investor's or firm's own property
  'ARCHIVED',              -- durable copy exists in a public web archive
  'DISPUTED'               -- sources conflict; see provenance_note
);

CREATE TYPE source_class AS ENUM ('A_WRITING','B_SPOKEN','C_FILING','D_BOOK','E_ARCHIVE','F_SECONDARY');

CREATE TYPE source_type AS ENUM (
  'shareholder_letter','partner_letter','thanksgiving_letter','memo','essay','op_ed',
  'testimony','speech','presentation_slides','internal_memo','academic_paper',
  'annual_meeting','interview','podcast_episode','lecture','conference_appearance',
  'form_13f','schedule_13d','schedule_13g','proxy_exhibit','form_8k','form_10k',
  'fund_annual_report','endowment_report','book','book_chapter',
  'archival_collection','oral_history','finding_aid',
  'news_article','biography','third_party_transcript','class_notes'
);

CREATE TYPE attribution_confidence AS ENUM (
  'DIRECT',                  -- investor wrote or said it, first-party source
  'TRANSCRIBED',             -- spoken, transcribed by a third party
  'REPORTED',                -- quoted in journalism
  'PARAPHRASED',             -- summarised, not verbatim
  'FICTIONALISED_ATTRIBUTION'-- e.g. Lefevre's "Larry Livingston" for Livermore
);

CREATE TYPE archive_quality AS ENUM ('EXCELLENT','GOOD','THIN','NEARLY_ABSENT');
```

---

## Core entities

### investors

```sql
CREATE TABLE investors (
  id                  BIGSERIAL PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  full_name           TEXT NOT NULL,
  also_known_as       TEXT[],
  birth_year          INT,
  death_year          INT,
  nationality         TEXT,
  primary_firm        TEXT,
  firm_slugs          TEXT[],
  career_start_year   INT,
  career_end_year     INT,
  one_line            TEXT NOT NULL,
  archive_quality     archive_quality NOT NULL DEFAULT 'THIN',
  primary_archive_url TEXT,
  has_official_archive BOOLEAN NOT NULL DEFAULT FALSE,
  known_gaps          TEXT,
  build_wave          SMALLINT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`known_gaps` is a product-facing field, not an internal note. It is what the UI renders when a timeline is sparse — e.g. Munger's "no Daily Journal recordings survive before 2015."

### sources

The central table. One row per retrievable artifact at a specific URL.

```sql
CREATE TABLE sources (
  id                   BIGSERIAL PRIMARY KEY,
  uid                  TEXT NOT NULL UNIQUE,   -- stable human-readable key, e.g. 'marks-1990-10-12-route-to-performance'
  investor_id          BIGINT REFERENCES investors(id) ON DELETE RESTRICT,
  author_name          TEXT NOT NULL,          -- NOT derived from investor_id; see Abel/Berkshire 2025
  attributed_to_investor BOOLEAN NOT NULL DEFAULT TRUE,
  title                TEXT NOT NULL,
  subtitle             TEXT,
  source_class         source_class NOT NULL,
  source_type          source_type NOT NULL,
  source_tier          SMALLINT NOT NULL CHECK (source_tier BETWEEN 1 AND 6),
  publisher            TEXT,
  publication_venue    TEXT,

  -- temporal
  publication_date     DATE,
  publication_date_precision TEXT CHECK (publication_date_precision IN ('day','month','year','decade','unknown')),
  year                 INT,
  covers_period_start  DATE,
  covers_period_end    DATE,

  -- location
  original_url         TEXT,
  canonical_url        TEXT,
  archive_url          TEXT,                   -- Wayback / perma.cc
  doi                  TEXT,
  isbn                 TEXT,
  edition              TEXT,
  jurisdiction         TEXT DEFAULT 'US',

  -- format
  mime_type            TEXT,
  page_count           INT,
  duration_seconds     INT,
  language             TEXT DEFAULT 'en',
  transcript_available BOOLEAN NOT NULL DEFAULT FALSE,
  transcript_is_first_party BOOLEAN,
  audio_available      BOOLEAN NOT NULL DEFAULT FALSE,
  video_available      BOOLEAN NOT NULL DEFAULT FALSE,

  -- rights
  rights_status        rights_status NOT NULL DEFAULT 'REVIEW_REQUIRED',
  usage_status         usage_status  NOT NULL DEFAULT 'METADATA_ONLY',
  rights_note          TEXT,
  rights_checked_at    TIMESTAMPTZ,
  rights_checked_by    TEXT,

  -- provenance
  provenance_status    provenance_status NOT NULL DEFAULT 'UNVERIFIED',
  provenance_note      TEXT,
  retrieved_at         TIMESTAMPTZ,
  http_status          INT,
  content_sha256       TEXT,
  content_version      INT NOT NULL DEFAULT 1,
  fetch_blocked_reason TEXT,                   -- e.g. 'akamai_bot_protection'

  -- search
  search_vector        TSVECTOR,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT no_body_without_rights CHECK (
    usage_status <> 'FULL_TEXT_STORED' OR rights_status IN ('PUBLIC_DOMAIN','LICENSED','PERMISSION_GRANTED')
  )
);
```

`no_body_without_rights` is the single most important line in the schema. It makes it **structurally impossible** to store full text for material that has not cleared rights. A pirate Munger ebook repository cannot be created by accident; it would require someone to first lie in the `rights_status` column, which is auditable.

### passages

```sql
CREATE TABLE passages (
  id                 BIGSERIAL PRIMARY KEY,
  source_id          BIGINT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  ordinal            INT NOT NULL,
  body               TEXT NOT NULL,
  char_length        INT GENERATED ALWAYS AS (length(body)) STORED,

  -- locator: how to find this in the original
  page_from          INT,
  page_to            INT,
  timecode_start_ms  INT,
  timecode_end_ms    INT,
  section_heading    TEXT,

  -- the four dimensions
  stated_on          DATE,          -- WHEN THEY SAID IT
  speaking_context   TEXT,          -- WHAT THEY WERE TALKING ABOUT (situational)
  attribution        attribution_confidence NOT NULL DEFAULT 'DIRECT',

  is_excerpt         BOOLEAN NOT NULL DEFAULT TRUE,
  excerpt_rationale  TEXT,          -- why this excerpt length is defensible
  search_vector      TSVECTOR,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source_id, ordinal)
);

-- Druckenmiller rule: interview passages must carry an exact date.
ALTER TABLE passages ADD CONSTRAINT spoken_passages_need_date CHECK (
  stated_on IS NOT NULL OR attribution NOT IN ('TRANSCRIBED','REPORTED')
);
```

### interpretations

Editorial claims made *by Investor/Pass*, kept strictly separate from what the investor said.

```sql
CREATE TABLE interpretations (
  id            BIGSERIAL PRIMARY KEY,
  subject_type  TEXT NOT NULL CHECK (subject_type IN ('investor','concept','decision','event','source','passage')),
  subject_id    BIGINT NOT NULL,
  claim         TEXT NOT NULL,
  authored_by   TEXT NOT NULL DEFAULT 'investorpass_editorial',
  confidence    TEXT NOT NULL CHECK (confidence IN ('high','medium','low')),
  supporting_passage_ids BIGINT[],
  supporting_source_ids  BIGINT[],
  contested     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Any interpretation with no entries in `supporting_source_ids` must not be rendered. That is a product rule enforced at the query layer.

### concepts, companies, events, decisions

```sql
CREATE TABLE concepts (
  id                BIGSERIAL PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  label             TEXT NOT NULL,
  definition        TEXT NOT NULL,
  coined_by_investor_id BIGINT REFERENCES investors(id),
  coinage_source_id BIGINT REFERENCES sources(id),
  coinage_year      INT,
  attribution_note  TEXT,          -- e.g. 'popularised by Buffett, credited by him to Graham'
  aliases           TEXT[],
  parent_concept_id BIGINT REFERENCES concepts(id),
  search_vector     TSVECTOR
);

CREATE TABLE companies (
  id           BIGSERIAL PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  ticker       TEXT,
  cik          TEXT,
  cusip        TEXT,
  country      TEXT,
  sector       TEXT,
  founded_year INT,
  defunct_year INT,
  notes        TEXT
);

CREATE TABLE events (
  id            BIGSERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  label         TEXT NOT NULL,
  event_type    TEXT,   -- crash, bubble, crisis, regulatory, macro, firm_milestone
  start_date    DATE,
  end_date      DATE,
  date_precision TEXT,
  region        TEXT,
  description   TEXT
);

CREATE TABLE decisions (
  id             BIGSERIAL PRIMARY KEY,
  investor_id    BIGINT NOT NULL REFERENCES investors(id),
  company_id     BIGINT REFERENCES companies(id),
  action         TEXT NOT NULL CHECK (action IN ('initiate','add','trim','exit','short','hedge','activist_stake','tender','abstain')),
  decided_on     DATE,
  disclosed_on   DATE,
  disclosure_source_id BIGINT REFERENCES sources(id),  -- the filing that proves it
  size_usd       NUMERIC,
  shares         NUMERIC,
  portfolio_weight_pct NUMERIC,
  rationale_passage_ids BIGINT[],                       -- what they SAID about it
  outcome_note   TEXT,
  evidence_grade TEXT NOT NULL DEFAULT 'FILED' CHECK (evidence_grade IN ('FILED','STATED','REPORTED','INFERRED'))
);
```

`decisions` is the bridge between "what they said" and "what they did." `disclosure_source_id` pointing at a 13F or 13D is what makes a decision `FILED` rather than `REPORTED`. The product should visually distinguish these grades.

---

## Join tables

```sql
CREATE TABLE source_concepts (
  source_id  BIGINT REFERENCES sources(id) ON DELETE CASCADE,
  concept_id BIGINT REFERENCES concepts(id) ON DELETE CASCADE,
  weight     REAL NOT NULL DEFAULT 1.0,
  PRIMARY KEY (source_id, concept_id)
);

CREATE TABLE passage_concepts (
  passage_id BIGINT REFERENCES passages(id) ON DELETE CASCADE,
  concept_id BIGINT REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (passage_id, concept_id)
);

CREATE TABLE source_companies (
  source_id  BIGINT REFERENCES sources(id) ON DELETE CASCADE,
  company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
  mention_count INT,
  PRIMARY KEY (source_id, company_id)
);

CREATE TABLE source_events (
  source_id BIGINT REFERENCES sources(id) ON DELETE CASCADE,
  event_id  BIGINT REFERENCES events(id) ON DELETE CASCADE,
  relation  TEXT CHECK (relation IN ('written_during','written_about','retrospective')),
  PRIMARY KEY (source_id, event_id)
);

CREATE TABLE investor_relations (
  from_investor_id BIGINT REFERENCES investors(id),
  to_investor_id   BIGINT REFERENCES investors(id),
  relation         TEXT NOT NULL CHECK (relation IN ('mentor','student','partner','colleague','critic','influenced_by','cited')),
  evidence_source_id BIGINT REFERENCES sources(id),
  note             TEXT,
  PRIMARY KEY (from_investor_id, to_investor_id, relation)
);
```

`investor_relations` requires `evidence_source_id` in practice. "Buffett was influenced by Graham" is only worth showing if you can point at Buffett saying so.

---

## Rights ledger

Rights decisions are per edition, so they get their own table with history.

```sql
CREATE TABLE rights_decisions (
  id             BIGSERIAL PRIMARY KEY,
  material_class TEXT NOT NULL,      -- e.g. 'berkshire_shareholder_letters'
  work_title     TEXT,
  edition        TEXT,
  jurisdiction   TEXT NOT NULL DEFAULT 'US',
  rights_status  rights_status NOT NULL,
  usage_status   usage_status NOT NULL,
  reasoning      TEXT NOT NULL,
  evidence_url   TEXT,
  decided_on     DATE NOT NULL,
  decided_by     TEXT NOT NULL,
  review_due_on  DATE,
  superseded_by  BIGINT REFERENCES rights_decisions(id)
);
```

Never update a rights decision in place. Insert a new row and set `superseded_by` on the old one. When a publisher asks how you concluded something was usable, you need the decision trail with dates.

---

## Search configuration

The spec calls for deterministic Postgres FTS with weighted fields: title 5x, theme/company/concept/investor 4x, source metadata 3x, passage body 1x. In Postgres weight labels, `A` is highest:

```sql
CREATE OR REPLACE FUNCTION sources_search_vector(s sources) RETURNS tsvector AS $$
  SELECT
      setweight(to_tsvector('english', coalesce(s.title,'') || ' ' || coalesce(s.subtitle,'')), 'A')
   || setweight(to_tsvector('english', coalesce(s.author_name,'')), 'B')
   || setweight(to_tsvector('english',
        coalesce(s.publisher,'') || ' ' || coalesce(s.publication_venue,'') || ' ' ||
        coalesce(s.source_type::text,'') || ' ' || coalesce(s.edition,'')), 'C');
$$ LANGUAGE sql IMMUTABLE;

CREATE INDEX sources_fts_idx   ON sources USING GIN (search_vector);
CREATE INDEX passages_fts_idx  ON passages USING GIN (search_vector);
CREATE INDEX sources_title_trgm ON sources USING GIN (title gin_trgm_ops);
CREATE INDEX concepts_label_trgm ON concepts USING GIN (label gin_trgm_ops);

CREATE INDEX sources_investor_date_idx ON sources (investor_id, publication_date DESC);
CREATE INDEX sources_tier_rights_idx   ON sources (source_tier, rights_status);
CREATE INDEX sources_year_idx          ON sources (year);
CREATE INDEX passages_stated_on_idx    ON passages (stated_on);
CREATE INDEX decisions_investor_date_idx ON decisions (investor_id, disclosed_on DESC);
```

Passage vectors get weight `D` so a title match always outranks a body match, which is the behaviour users expect when they search a memo name.

Trigram indexes matter more than they look: users type "Poor Charlies Almanac", "route to performance", "margin of saftey". Trigram similarity catches all three; `to_tsquery` catches none reliably.

---

## Required source-catalog columns

For parity with the CSV deliverables in `data/`, every catalog row carries: `investor`, `title`, `source_type`, `publisher`, `publication_date`, `year`, `original_url`, `archive_url`, `rights_status`, `usage_status`, `provenance_status`, `retrieved_at`, `content_sha256`, `content_version`, `transcript_available`, `audio_available`, `video_available`.

`content_sha256` plus `content_version` is how you detect silent revision. Firms do quietly re-post corrected PDFs at the same URL. Without a checksum you will serve a quote that no longer exists at the cited location.

---

# SOURCE FILE: `03_RIGHTS_AND_LEGAL_FRAMEWORK.md`

# Rights and Legal Framework

The governing principle, stated once and then applied everywhere:

> **"Use as data" does not mean "rehost the entire text."**

For protected material, Investor/Pass stores metadata, provenance, indexing, short contextual excerpts where defensible, and a link to the original. That is a complete, valuable product. It is not a diminished version of a better product that rehosts everything — the rehosting version simply is not a product, it is a liability.

---

## The five rights states

| State | Meaning | What you may store | What you may show |
|---|---|---|---|
| `PUBLIC_DOMAIN` | Copyright has expired or never attached, in the relevant jurisdiction, for the specific edition | Full text | Full text |
| `LICENSED` | A licence has been obtained and its terms are recorded | As the licence permits | As the licence permits |
| `PERMISSION_GRANTED` | Written permission from the rightsholder, with scope recorded | As granted | As granted |
| `LINK_ONLY` | Protected, no licence — the default for almost everything good | Metadata, structural index, short excerpt | Metadata plus link out |
| `REVIEW_REQUIRED` | Not yet assessed, or assessment inconclusive | Metadata only | Metadata only, and only if provenance is at least `URL_RESOLVED` |

`REVIEW_REQUIRED` is the default for every newly discovered source. Nothing is presumed clear.

---

## Doctrine 1 — Rights attach to editions, not works

**Do not assume every edition of every Graham book is public domain merely because it is old.** Check edition by edition and jurisdiction by jurisdiction.

The evidence in this corpus is unambiguous. Internet Archive copies of *Security Analysis* (1934 first edition reprint) are marked `Access-restricted-item: true` and are lending-only, not downloadable ([archive.org](https://archive.org/details/securityanalysis0000grah), [second copy](https://archive.org/details/securityanalysis0000grah_k7k1)). *Graham and Dodd's Security Analysis* returns "No suitable files to display here" ([archive.org](https://archive.org/details/grahamdoddssecur0000grah)), as does the *Principles and Technique* edition ([archive.org](https://archive.org/details/securityanalysis0000benj)).

Meanwhile *Reminiscences of a Stock Operator* (1923) **is** public domain in the United States and available as full text from [Project Gutenberg eBook #60979](https://www.gutenberg.org/ebooks/60979), released 20 December 2019. Note carefully that the Gutenberg text itself still reproduces the original front matter reading "Copyright © 1923 by George H. Doran Company / All Rights Reserved" ([Gutenberg text](https://www.gutenberg.org/cache/epub/60979/pg60979.txt)) — a notice on the page is not evidence of current protection, and its absence is not evidence of the reverse. Meanwhile the 2020 "Annotated Edition… with the Livermore Market Key and Commentary Included" is a separate, in-copyright work ([Wikipedia](https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator)).

Same author-era, same shelf, opposite answers. This is why the `rights_decisions` table keys on `(work_title, edition, jurisdiction)`.

Jurisdiction matters independently. Gutenberg's own notice states the text is free "in the United States and most other parts of the world" and warns non-U.S. readers to check local law. Since Investor/Pass will have users in India, the EU, and the UK — where terms are life-plus-70 measured differently and where U.S. renewal formalities never applied — a `PUBLIC_DOMAIN` verdict must record which jurisdiction it applies to. The conservative operational rule: serve full text only where the work is public domain in *both* the U.S. and the user's jurisdiction, or gate by region.

## Doctrine 2 — Do not automatically ingest a "free PDF"

A PDF being reachable is not a licence. The corpus contains several instructive traps.

**Baupost partner letters.** Klarman's letters covering roughly 1995 to mid-2001 circulate on value-investing blogs. These are confidential communications to limited partners. Their presence online is an unauthorised distribution, not a publication. Correct classification: `REVIEW_REQUIRED`, realistic resolution: `BLOCKED`. Investor/Pass should state that the letters are private rather than link to laundered copies.

**The "Principles" PDF at cpcglobal.org.** A widely circulated PDF of Dalio's *Principles* is an unofficial conversion of the Kindle edition. It is not a Bridgewater publication. `REVIEW_REQUIRED` → `BLOCKED`. Dalio's actual freely-published material is on [bridgewater.com/research-and-insights](https://www.bridgewater.com/research-and-insights) and should be used instead.

**Third-party Munger transcripts.** Sets at [Worldly Partners](https://worldlypartners.com/charlie-munger-archive/) (Daily Journal 2013–2023), [sungcap.com](https://sungcap.com/transcripts/), [tilsonfunds.com](https://tilsonfunds.com/MungerDJ-2-16.pdf), and [Steady Compounding](https://steadycompounding.com/transcript/djco23/) are transcriptions of public meetings. The underlying spoken words and the transcription both raise questions, and the transcripts are of unverified accuracy. Treat as `LINK_ONLY`, cite as Tier 6, never merge into the first-party transcript set.

**Greenblatt's Columbia class notes.** The circulating PDF of audited class notes ([Focused Compounding mirror](https://focusedcompounding.com/wp-content/uploads/2018/03/Joel-Greenblatt-Class.pdf)) is student-taken notes from a private university course. `REVIEW_REQUIRED`, and a plausible outcome is `BLOCKED`. His podcast appearances — for instance the [Knowledge Project episode](https://fs.blog/knowledge-project-podcast/joel-greenblatt/) — are clean Tier 2 alternatives.

The operational rule: **the ingestion pipeline must refuse to store body text for any source whose `rights_status` is `REVIEW_REQUIRED`.** The `no_body_without_rights` CHECK constraint in the schema enforces this at the database level so a well-meaning backfill script cannot override it.

## Doctrine 3 — Do not become a pirate ebook repository

Stated bluntly because it is the failure mode that kills the company. Every book in this corpus — Graham, Fisher, Lynch, Bogle, Marks, Greenblatt, Dalio, Munger's *Poor Charlie's Almanack*, Swensen's *Pioneering Portfolio Management*, Templeton's *The Humble Approach* and *Worldwide Laws of Life* — is in copyright and commercially available.

The correct book model in Investor/Pass:

- Bibliographic entity: title, subtitle, edition, ISBN, publisher, publication date, page count
- Structural index: chapter titles and, where a public table of contents exists, section headings
- Concept mapping: which concepts this book is the canonical statement of
- Links out: publisher page, Open Library, library catalog, retailer
- **No body text, no chapter text, no "summaries" long enough to substitute for reading it**

That last clause matters. A chapter-by-chapter paraphrase dense enough to replace the book is a derivative work, not a citation.

Internet Archive lending records are useful as *catalog* references — for example Templeton's works and the Herrmann biography are all present but lending-restricted, and the Livermore/Lefèvre records at [archive.org](https://archive.org/details/reminiscencesofs0000lefe) are `Access-restricted-item: true`. Link to the record. Do not fetch the `_djvu.txt`.

## Doctrine 4 — Government works are the exception, and you should exploit them hard

U.S. Government works are not subject to copyright. That makes the entire SEC filing corpus the one place where "use as data" genuinely does mean "store it all."

The APIs.io description of the SEC EDGAR data APIs records the licence explicitly as `Public Domain (U.S. Government Work)` ([apis.io](https://apis.io/apis/sec-edgar/sec-edgar-full-text-search-api/)). The quarterly Form 13F datasets are published by the SEC for exactly this purpose ([SEC](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets)).

Two carve-outs to respect:

1. **Filer-authored exhibit text is not automatically a government work.** An Icahn open letter filed as a DFAN14A exhibit was written by Icahn, and the filing is a government record of it. The safe position is to treat the *structured facts* of the filing as public domain and the *prose of the exhibit* as `LINK_ONLY` with short excerpting. Flag for counsel; this is the one genuinely grey area in the corpus and it happens to sit right on top of one of the most interesting source classes.
2. **Fair-access compliance is a condition of use.** The SEC requires a descriptive `User-Agent` header identifying your application and contact address. Rate-limit conservatively. Losing EDGAR access over impolite crawling would be an unforced error.

## Doctrine 5 — Institutional archives are described, not copied

The HBS Baker Library Bridgewater Associates, LP Archives contains Daily Observations from 1978 to 1996 and is available **by application only**, via `specialcollectionsref@hbs.edu` ([HBS](https://www.hbs.edu/news/releases/bridgewater-archives)).

You cannot ingest this. You can and should build a finding-aid entry: what the collection contains, what period it covers, which events it documents (Latin American debt crisis, 1987 crash, Black Wednesday 1992, 1994 bond collapse), who holds it, and how a researcher applies. Archival finding aids and factual descriptions of holdings are not protected expression. This is high-value, zero-risk content and no competitor has it.

The same pattern applies to the AIP oral history of Simons ([Celebratio index](https://celebratio.org/Simons_J/article/507/)), Museum of American Finance holdings including the Marks memo collection ([MoAF](https://www.moaf.org/news/press-releases/2025-10-14-howard-marks-iconic-memos-join-permanent-collection-at-the-museum-of-american-finance)), and Yale's archives.

## Doctrine 6 — Respect technical access controls as legal signals

`buffett.cnbc.com` returns Akamai "Access Denied" to automated requests. That is an explicit technical statement that automated collection is not permitted. Do not attempt to route around it. Investor/Pass should link deeply into the CNBC archive and describe it from CNBC's own public statements ([CNBC about page](https://buffett.cnbc.com/about-buffett/)), which is both lawful and, for the user, arguably better — they get the real archive with its real search.

Record the refusal in the data: `fetch_blocked_reason = 'akamai_bot_protection'`, `usage_status = 'METADATA_ONLY'`. A blocked fetch is a fact about a source, not a bug.

---

## Excerpt policy

Where short excerpting is used under `LINK_ONLY`, apply these limits and record the rationale in `passages.excerpt_rationale`:

| Source length | Max excerpt |
|---|---|
| Memo or letter under 5,000 words | 150 words, no more than 2 excerpts per source |
| Long letter or report | 250 words total across the source |
| Book | 0 words of body text; title and chapter headings only |
| Transcript of spoken material | 200 words per passage, timecoded |
| SEC exhibit prose | 150 words |
| Structured filing data | unlimited (public domain facts) |

Every excerpt must (a) link to the original at the precise location, (b) carry the exact date, (c) be used to illustrate a point rather than to substitute for reading the source.

---

## Rights review workflow

1. **Discovery** — source enters as `REVIEW_REQUIRED` / `METADATA_ONLY` / `UNVERIFIED`.
2. **Provenance check** — fetch, record HTTP status, checksum, `retrieved_at`. Confirm whether the host is first-party. Promote provenance to `URL_RESOLVED` or `FIRST_PARTY_CONFIRMED`.
3. **Rights assessment** — identify the rightsholder, the edition, and the jurisdiction. Write the reasoning into `rights_decisions.reasoning` with an `evidence_url`. Never leave reasoning blank.
4. **Decision** — set `rights_status` and the corresponding `usage_status`. Set `review_due_on` for anything time-sensitive.
5. **Archive** — where permitted, capture a durable copy reference (Wayback) into `archive_url` and promote provenance to `ARCHIVED`.
6. **Re-review** — checksum drift or a `review_due_on` date triggers step 3 again. Insert a new decision row; never mutate the old one.

## Permission-seeking targets, ranked by value

Worth actually writing to, in this order:

1. **Oaktree Capital** — 160 memos, one author, one rightsholder, and they have just demonstrated an appetite for canonical curation and institutional preservation. Highest chance of a clean `PERMISSION_GRANTED` covering the largest coherent corpus in the universe.
2. **John C. Bogle Center for Financial Literacy** — a non-profit whose stated mission is dissemination, already publishing its index as a spreadsheet. Natural partner.
3. **The Munger Archive** — a purpose-built preservation project; interests are aligned.
4. **Fundsmith** — small, single-author, actively publishing.
5. **Pabrai Funds** — already publishes LP letters openly.

Note the pattern: the best permission targets are exactly the investors with the best archives, because both facts stem from the same cause — someone there decided the record mattered.

---

# SOURCE FILE: `04_INGESTION_ARCHITECTURE.md`

# Ingestion Architecture

The recommendation you made is correct: do not try to collect all twenty investors simultaneously. Build a **reusable ingestion framework**, prove it on a small first wave, then expand using the same source model.

This document specifies that framework.

---

## Shape of the system

```
                 ┌──────────────────┐
   seed lists →  │  DISCOVERY       │ emits SourceCandidate
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │  FETCH           │ HTTP, checksum, retrieved_at, block detection
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │  EXTRACT         │ per-format adapters → text + structure
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │  NORMALISE       │ dates, titles, authors, language
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │  RIGHTS GATE     │ ← the only path to storing body text
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │  ENRICH          │ concepts, companies, events, decisions
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │  INDEX           │ tsvector, trigram, embeddings (V2)
                 └──────────────────┘
```

The rights gate sits *before* enrichment and indexing, not after. A source that fails the gate still gets a full metadata record and still becomes searchable by title — it simply never acquires passages.

---

## Discovery: seed strategies, ranked by cost

**1. Published index spreadsheet (cheapest, best).**
The Bogle Center publishes its entire archive index as [Bogle-Archive-Published.xlsx](https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx). One download, one parse, an entire investor seeded with titles, dates, and categories. Always check for this before writing any other adapter.

**2. Structured government API.**
`https://data.sec.gov/submissions/CIK##########.json` returns a filer's complete filing history. For Icahn (`CIK 0000813762`), Berkshire, Pershing Square, and Duquesne this is a complete, dated, authoritative source list obtained in one request.

**3. Static index page with predictable URL patterns.**
Berkshire is the ideal case. The letters index at [berkshirehathaway.com/letters/letters.html](https://www.berkshirehathaway.com/letters/letters.html) links to `/letters/YYYY.html` for 1977–2001 and `/letters/YYYYltr.pdf` for 2002 onward. Annual reports at [berkshirehathaway.com/reports.html](https://www.berkshirehathaway.com/reports.html) follow `/reports/YYYYannualreport.pdf`. Newer material has moved to `/2025ar/2025ar.pdf` and `/letters/2025ltr.pdf`, so **verify the pattern per year rather than assuming it holds** — the 2025 cycle broke the older convention and changed author at the same time.

**4. JS-rendered index requiring headless extraction.**
Oaktree's [memo index](https://www.oaktreecapital.com/insights/howard-marks-memos) and Fundsmith's [documents library](https://www.fundsmith.co.uk/documents/) both render links client-side, and Fundsmith's PDF URLs contain opaque hash segments — `/media/4hcfd1pg/2025-fef-annual-letter-web.pdf`, `/media/pirmvyly/annual-letter-to-shareholders-2024.pdf`, `/media/31plodnq/2023-fef-annual-letter-to-shareholders.pdf`, `/media/bm0lyc22/annual-letter-to-shareholders-2022.pdf`. **These cannot be constructed.** They must be extracted from the rendered index at run time and stored. Any code that generates a Fundsmith URL from a year is broken by construction.

**5. Paginated archive walk.**
Soros's essays paginate at `https://www.georgesoros.com/essays/page/N/` across at least 22 pages, with items at `https://www.georgesoros.com/YYYY/MM/DD/<slug>/` and year archives at `https://www.georgesoros.com/2007/`. Walk to exhaustion, then cross-check against the year archives to catch items the essay index omits.

**6. Full-text search of a filings corpus.**
`https://efts.sec.gov/LATEST/search-index?q=` covers filings since 2001. This is how you find Icahn's open letters, which exist as DFAN14A exhibits rather than as anything indexed as a "letter" — for example the 2023 Illumina letter at [sec.gov Archives](https://www.sec.gov/Archives/edgar/data/1110803/000153949723000923/0001539497-23-000923-index.html), filed under Illumina's CIK, not Icahn's.

**7. Manual curation from institutional finding aids.**
For the HBS Bridgewater collection, the AIP Simons oral history, and Museum of American Finance holdings, there is no API. A researcher reads the finding aid and writes the record. Budget human hours; the output-to-effort ratio is still excellent because one finding aid can be one high-value product page.

---

## Fetch layer requirements

Non-negotiables:

- **Descriptive `User-Agent`** on every request, including application name and a contact email. Mandatory for SEC fair-access compliance; good manners everywhere else.
- **Conservative rate limiting** per host, with exponential backoff. Default 1 request per second per host, lower for SEC.
- **`content_sha256` on every fetch**, compared against the stored value. A changed checksum means the document was revised. Do not overwrite: increment `content_version`, keep the prior text, and mark the source for re-review. Firms silently re-post corrected PDFs; if you overwrite, you will one day render a quote that no longer exists at the cited page.
- **Record blocks as data, not errors.** `fetch_blocked_reason = 'akamai_bot_protection'` for `buffett.cnbc.com`. The pipeline must not retry a deliberate block.
- **`retrieved_at` on every row.** With Druckenmiller in the corpus, "as of when" is a substantive claim, not bookkeeping.
- **Wayback capture** where terms permit, stored in `archive_url`.

---

## Extract adapters

One adapter per format. Each returns a normalised `ExtractedDocument { title, author, date, sections[], text, media_metadata }`.

### `html_letter`
For Berkshire 1977–2001. Sparse legacy markup, `<pre>`-style tables, inconsistent headings. Extract by structural heuristics, not CSS selectors — the markup varies year to year.

### `pdf_letter`
Berkshire 2002+, Oaktree memos, Fundsmith letters, Pershing Square reports. Text-layer extraction first; OCR fallback only when the text layer is absent. Preserve page numbers — they are the citation locator for `passages.page_from`.

### `edgar_filing`
Two code paths, and you need both:
- **XML path** for 13F filings from Q3 2013 onward.
- **Fixed-width TXT path** for 13F filings before Q3 2013 ([edgartools](https://edgartools.readthedocs.io/en/stable/13f-filings/)).

Prefer the SEC's quarterly flattened datasets over per-filing parsing where possible. Each quarterly archive holds a submission table, a cover-page table, and an information table with one row per holding: issuer name, CUSIP, market value, shares or principal, investment discretion, voting authority split ([SEC](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets)). Reconstruct a portfolio by filtering submissions to the CIK, confirming the report is a holdings report rather than a notice, joining the information table on accession number, aggregating by CUSIP because one issuer often spans several rows, computing weights from market value, and diffing against the prior quarter to derive additions, exits, and sizing changes.

### `edgar_exhibit`
For DFAN14A and 13D exhibit prose — Icahn's letters. Structured metadata is public domain; the exhibit prose is `LINK_ONLY` pending counsel review. Extract the metadata, excerpt the prose.

### `transcript_synced_video`
For CNBC's Buffett archive shape: video plus synced transcript with timecodes. Since the source is fetch-blocked, this adapter is written for *future licensed access*, not present use. Build it anyway when the day comes; do not build it now.

### `podcast_episode`
For Marks's [The Memo](https://art19.com/shows/the-memo-by-howard-marks), Chai with Pabrai, Masters in Business, the Knowledge Project. RSS feeds give title, date, duration, and description reliably. Transcripts, where first-party, are Tier 2; where third-party, Tier 6.

### `spreadsheet_index`
For the Bogle XLSX. Column mapping is manual and one-time; the payoff is an entire investor.

### `archival_finding_aid`
Human-authored. Fields: repository, collection title, date range, extent, access conditions, contact, events documented, citation form.

---

## Normalisation rules

**Dates.** Store precision explicitly. Bogle's archive contains items dated to the day (6 May 1984, "Statistics and Suicide") and items dated only to a year (a 1964 Morgan piece). Never fabricate a day to satisfy a `DATE` column — that is what `publication_date_precision` is for.

**Authors.** Never derive author from publisher. The Berkshire 2025 letter is authored by Greg Abel ([berkshirehathaway.com](https://www.berkshirehathaway.com/letters/2025ltr.pdf)) and would be silently mis-attributed by any rule keyed on the domain. Set `attributed_to_investor = FALSE` and keep it in the Buffett context as a related source, because it is genuinely relevant to a Buffett timeline as a succession event.

**Titles.** Preserve the investor's own title exactly, including quirks. "The Route To Performance" keeps its capitalisation. Do not title-case or clean.

**Conflicts.** Where sources disagree, record the conflict; do not resolve it silently. Renaissance Technologies' founding is variously given as 1978 and 1982. Set `provenance_status = 'DISPUTED'` with both claims in `provenance_note`. Surfacing the disagreement is more valuable than picking a side.

---

## Enrichment

Runs only on sources that passed the rights gate with stored text, plus on metadata for everything else.

1. **Concept tagging.** Start with a curated vocabulary (see `data/concepts.csv`), not with unsupervised extraction. A hand-built list of ~70 concepts with aliases gives better precision than any clustering you will get from this corpus size.
2. **Company linking.** Match against `companies` by name, ticker, and CUSIP. CUSIP from 13F filings is the reliable key; prose mentions are fuzzy and need review.
3. **Event linking.** Date-range overlap against the `events` table gives `written_during` for free. `written_about` and `retrospective` need textual evidence.
4. **Decision derivation.** From 13F quarter-over-quarter diffs, emit `decisions` rows with `evidence_grade = 'FILED'`. Then attempt to link `rationale_passage_ids` where the investor discussed that position near that date. **This join is the product.** It is the mechanism by which "what they said" meets "what they did," and it is only possible because Tier 3 is free and precisely dated.

---

## Idempotency and re-runs

Every stage must be safely re-runnable.

- `sources.uid` is the natural key. Construct as `{investor-slug}-{YYYY-MM-DD}-{title-slug}`, e.g. `marks-1990-10-12-route-to-performance`. Upsert on it.
- Passages are deleted and rebuilt as a unit per source version. Never partially update.
- Enrichment is derived and fully rebuildable from stored text plus vocabulary.
- Rights decisions are append-only.

A full rebuild from cached fetches must produce a byte-identical database. If it does not, something in the pipeline is non-deterministic, and non-determinism in a provenance system is a correctness bug.

---

## What to instrument from day one

Because provenance is a user-visible surface, these metrics are product metrics, not ops metrics:

- Sources by `provenance_status`, per investor — this is literally what the UI badge renders
- Sources by `rights_status` and `usage_status`, per investor
- Checksum drift events per week
- Blocked-fetch counts per host
- Coverage density: sources per year per investor, which is how you find gaps like Munger pre-2015
- Passages lacking `stated_on` where attribution is `TRANSCRIBED` — should always be zero, enforced by CHECK constraint
- Interpretations with zero supporting sources — should always be zero, enforced at the query layer

---

# SOURCE FILE: `05_ENTITY_GRAPH.md`

# Entity Graph — The Four Dimensions

The instruction was explicit: don't just store "Buffett said X." Build four dimensions.

1. **WHAT THEY SAID**
2. **WHEN THEY SAID IT**
3. **WHAT THEY WERE TALKING ABOUT**
4. **WHAT THEY DID**

This document turns those into concrete relations.

---

## Dimension 1 — WHAT THEY SAID

The `passages` table, anchored to `sources`, with `attribution_confidence` recording *how* we know.

The attribution ladder exists because the corpus contains genuinely different epistemic situations:

| Level | Example in this corpus |
|---|---|
| `DIRECT` | Marks, "The Route To Performance," 12 October 1990 — he wrote it, Oaktree published it |
| `TRANSCRIBED` | Munger's 2016 Daily Journal meeting, which survives only as audio plus transcript |
| `REPORTED` | Buffett's Thanksgiving-letter remarks as characterised in [WSJ coverage](https://www.wsj.com/business/warren-buffett-letter-2025-takeaways-e7e0a578) |
| `PARAPHRASED` | Greenblatt's teaching as captured in student class notes |
| `FICTIONALISED_ATTRIBUTION` | Anything from *Reminiscences of a Stock Operator*, where the speaker is "Larry Livingston," a character written by Edwin Lefèvre in 1923 ([Wikipedia](https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator)) |

That last row is not a technicality. Livermore's entire popular voice is a novelist's. A product that renders Lefèvre's prose as a Livermore quotation has a provenance model that fails at the most-quoted item in its own corpus.

## Dimension 2 — WHEN THEY SAID IT

Three distinct dates, and conflating them is the most common modelling error:

- `sources.publication_date` — when the artifact was published
- `passages.stated_on` — when the words were actually said
- `sources.covers_period_start` / `covers_period_end` — the period the content is *about*

They diverge constantly. Buffett's 2024 shareholder letter was published in February 2025 and discusses 2024. An annual meeting recording is published years after the meeting. Abel's letter dated 28 February 2026 covers fiscal 2025. Marks writes memos that explicitly revisit positions he took years earlier.

`publication_date_precision` handles the historic material honestly: Bogle's archive spans a piece dated only to 1964 through one dated exactly 7 December 2017. Do not invent a January 1st.

**The Druckenmiller constraint.** His public record is nothing but dated interviews and his views change deliberately and fast: CNBC Delivering Alpha on 28 September 2022 ([transcript](https://nbcuniversalnewsgroup.com/cnbc/2022/09/28/cnbc-transcript-duquesne-family-office-chairman-ceo-stanley-druckenmiller-speaks-with-cnbcs-joe-kernen-live-during-the-cnbc-delivering-alpha-conference-today/)), Squawk Box on 7 May 2024 ([CNBC](https://www.cnbc.com/2024/05/07/cnbc-exclusive-cnbc-transcript-billionaire-investor-stanley-druckenmiller-speaks-with-cnbcs-squawk-box-today.html)), Bloomberg with Sonali Basak on 16 October 2024 ([Apple Podcasts](https://podcasts.apple.com/us/podcast/duquesne-family-office-chairman-and-chief-executive/id1690236827?i=1000673335724)), Morgan Stanley's "Hard Lessons" with Iliana Bouzali on 12 March 2026 ([Morgan Stanley](https://www.morganstanley.com/insights/videos/hard-lessons/duquesne-stan-druckenmiller-iliana-bouzali)).

Because his current public statements can change, mark each source with an exact date, and never render a Druckenmiller passage without it. The schema enforces this via the `spoken_passages_need_date` constraint.

## Dimension 3 — WHAT THEY WERE TALKING ABOUT

Three orthogonal axes, each a separate join, because a single tag field collapses distinctions the user cares about:

**Concept** — the idea. `margin_of_safety`, `mr_market`, `circle_of_competence`, `second_level_thinking`, `market_cycles`, `cost_matters_hypothesis`, `mental_models`, `moat`, `reflexivity`, `risk_parity`, `dhandho`, `magic_formula`, `endowment_model`, `tenbagger`, `scuttlebutt`.

Concepts carry `coined_by_investor_id` *and* `attribution_note`, because attribution is genuinely contested. "Margin of safety" is Graham's, popularised by Buffett and used as a book title by Klarman. Store the lineage, do not flatten it.

**Company** — the object of discussion. Linked by CUSIP where a filing provides one, by name and ticker otherwise.

**Event** — the market context. `great_depression`, `nifty_fifty`, `black_monday_1987`, `latin_american_debt_crisis`, `black_wednesday_1992`, `bond_collapse_1994`, `dotcom_bubble`, `gfc_2008`, `covid_crash_2020`, `inflation_shock_2022`.

Events give you the strongest free inference in the whole system: `written_during` falls straight out of a date-range overlap. It is also what makes the HBS Bridgewater collection so valuable — Daily Observations from 1978 to 1996 sit directly on top of the Latin American debt crisis, the 1987 crash, Black Wednesday, and the 1994 bond collapse ([HBS](https://www.hbs.edu/news/releases/bridgewater-archives)), which is a documented primary record of a practitioner reasoning through four major dislocations in real time.

**Situational context** — `passages.speaking_context`, free text. "Answering a shareholder question about airline holdings," "opening remarks," "responding to a critic." Cheap to capture at excerpt time, and it prevents the classic failure of a quote that reads completely differently without its setup.

## Dimension 4 — WHAT THEY DID

The `decisions` table, and the reason Tier 3 deserves more of your engineering time than it will initially seem to.

A decision is `initiate | add | trim | exit | short | hedge | activist_stake | tender | abstain` against a company at a date, with an `evidence_grade`:

| Grade | Source |
|---|---|
| `FILED` | A 13F, 13D, 13G, or proxy filing proves it |
| `STATED` | The investor said so in a primary source |
| `REPORTED` | Journalism asserts it |
| `INFERRED` | Investor/Pass derived it; must carry an interpretation row |

Only `FILED` and `STATED` should be presented without qualification.

### The join that is the product

```sql
-- Positions where we can pair the filed action with what they said about it
SELECT i.full_name, c.name, d.action, d.disclosed_on,
       p.body, p.stated_on, s.title, s.original_url
FROM decisions d
JOIN investors i  ON i.id = d.investor_id
JOIN companies c  ON c.id = d.company_id
JOIN passages p   ON p.id = ANY(d.rationale_passage_ids)
JOIN sources s    ON s.id = p.source_id
WHERE d.evidence_grade = 'FILED'
  AND abs(p.stated_on - d.disclosed_on) <= 120
ORDER BY d.disclosed_on DESC;
```

That query is Investor/Pass's actual differentiator. Anyone can show you a 13F. Anyone can show you a quote. Almost nobody shows you the filed action next to the contemporaneous reasoning, dated, cited, and with the gap between them visible when the reasoning came later.

And when there is no matching passage, that is itself informative — it means they acted without publicly explaining, which for an activist like Icahn is the norm and for Buffett is unusual.

---

## Cross-investor relations

`investor_relations` with a required evidence source. The corpus supports these well:

| From | To | Relation | Evidence path |
|---|---|---|---|
| Buffett | Graham | `student`, `influenced_by` | Buffett's repeated first-party acknowledgement in Berkshire letters |
| Buffett | Munger | `partner` | Decades of joint annual meetings; CNBC maintains a dedicated Buffett–Munger collection |
| Buffett | Fisher | `influenced_by` | Buffett's stated synthesis of Graham and Fisher |
| Marks | Graham | `influenced_by` | Memo text |
| Pabrai | Buffett | `influenced_by` | Explicit and repeated in Pabrai's own writing |
| Klarman | Graham | `influenced_by` | *Margin of Safety* title and content |
| Bogle | — | `critic` of active management | Speeches and op-eds throughout the Bogle archive |
| Greenblatt | Graham | `influenced_by` | Books and teaching |
| Swensen | — | `mentor` to a generation of endowment CIOs | Yale record |
| Dalio | — | — | Largely self-referential lineage |

Rule already in the schema: do not assert a relation you cannot evidence. "Everyone was influenced by Graham" is folklore; "Buffett said he was influenced by Graham, here, on this date" is data.

---

## Timeline as the primary navigation surface

The `Year` entity in the product spec earns its place because every dimension resolves to a date. A year page can honestly assemble:

- Sources published that year, per investor
- Passages stated that year
- Events that occurred that year
- Filed decisions disclosed that year
- **Explicit gaps** — investors with no sources that year, and why

That last item is the one competitors will not build, because it requires admitting absence. It is also the thing that makes the whole product feel trustworthy. Munger's timeline should visibly say that no Daily Journal recordings survive before 2015 ([Munger Archive](https://mungerarchive.com/daily-journal/)). Klarman's should say the partner letters are private. Simons's should say the method was never disclosed.

A research tool that shows you the shape of the hole is more useful than one that pretends the hole is not there.

---

# SOURCE FILE: `06_PHASED_BUILD_PLAN.md`

# Phased Build Plan

Your instruction: build a reusable ingestion framework and make Buffett → Munger → Marks → Lynch → Graham → Bogle the first six, then expand using the same source model.

I agree with the principle and would change the order for one reason: **wave one should be chosen to exercise the framework, not to impress**. Each of the first six should force you to build exactly one new adapter that the remaining fourteen will reuse.

---

## Wave 1 — Framework proving (6 investors)

Ordered so each investor adds one reusable capability.

### 1. Howard Marks — proves `pdf_letter` and JS index extraction
**Why first:** the cleanest corpus that exists. One author, one document type, one date each, 35 unbroken years, roughly 160 memos from 12 October 1990 onward ([CNBC](https://www.cnbc.com/2025/10/14/howard-marks-celebrates-35-years-of-writing-his-acclaimed-memos-he-wasnt-sure-anyone-read-them-at-first.html)).
**New capability:** PDF text extraction with page-accurate citation; headless extraction of a JS-rendered index.
**Watch for:** the memo index at [oaktreecapital.com](https://www.oaktreecapital.com/insights/howard-marks-memos) is client-rendered. Memo pages follow `/insights/memo/<slug>` and PDFs `/docs/default-source/memos/<slug>.pdf`, but extract the slugs, do not guess them.
**Also:** the anniversary "Complete Collection" and the ~45-memo curated "Best of" set give you a ready-made editorial layer, and the Museum of American Finance accession gives you a Tier 5 record for free.

### 2. John Bogle — proves `spreadsheet_index` bulk seeding
**Why second:** the archive ships as a spreadsheet. [Bogle-Archive-Published.xlsx](https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx) is the single highest-leverage artifact in this research.
**New capability:** seed an entire investor from a published index; handle mixed date precision (1964 to 7 December 2017) and heterogeneous types in one corpus — speeches, academic papers, op-eds, letters to media, internal Vanguard memos, congressional testimony, slide decks.
**Watch for:** Vanguard discontinued its own Bogle archive in 2019, so [boglecenter.net/bogle-archive](https://boglecenter.net/bogle-archive/) is now the canonical host. Mirrors at [Bogleheads](https://www.bogleheads.org/wiki/List_of_John_C._Bogle_speeches) and [johncbogle.com](https://johncbogle.com/wordpress/bogle-speeches/) are useful for cross-checking titles.
**Bonus:** best permission-seeking target after Oaktree, because the Bogle Center's mission is dissemination.

### 3. Warren Buffett — proves multi-format and multi-author
**Why third:** he is the hardest interesting case and the marquee profile, but attempting him first would have you writing five adapters at once.
**New capability:** legacy `html_letter` extraction; mixed HTML/PDF eras in one series; author-change handling; fetch-block recording.
**The corpus:** letters 1977–2024 at [berkshirehathaway.com/letters/letters.html](https://www.berkshirehathaway.com/letters/letters.html) as `/letters/YYYY.html` (1977–2001) then `/letters/YYYYltr.pdf` (2002–2024); annual reports at [berkshirehathaway.com/reports.html](https://www.berkshirehathaway.com/reports.html) as `/reports/YYYYannualreport.pdf`; the 2025 cycle at `/letters/2025ltr.pdf` and `/2025ar/2025ar.pdf` — **authored by Greg Abel, dated 28 February 2026**.
**Watch for:** `buffett.cnbc.com` is Akamai-blocked. Record it as `METADATA_ONLY` with `fetch_blocked_reason`, describe it accurately (33 annual meetings back to 1994, ~145 hours of video synced to ~3,000 transcript pages, 575+ clips), and link deeply. Do not attempt to route around the block.

### 4. Carl Icahn — proves the `edgar_filing` and `edgar_exhibit` adapters
**Why fourth:** because this adapter is the highest-reuse code in the system. Once built it serves Ackman's activism, Buffett's portfolio history, Druckenmiller's 13Fs, Klarman's holdings, and Pabrai's positions.
**New capability:** SEC submissions API, quarterly 13F datasets, pre-Q3-2013 fixed-width parsing, DFAN14A exhibit extraction, full-text search across filings.
**The insight:** Icahn's "writings" are proxy exhibits. The 2023 Illumina letter sits under Illumina's CIK ([SEC](https://www.sec.gov/Archives/edgar/data/1110803/000153949723000923/0001539497-23-000923-index.html)), not his. His own CIK is `0000813762` ([EDGAR](https://www.sec.gov/edgar/browse/?CIK=CIK0000813762)) and his firm indexes filings back to 1995 at [ielp.com](https://www.ielp.com/financial-information/sec-filings).
**Deliverable milestone:** first `decisions` rows with `evidence_grade = 'FILED'`.

### 5. Charlie Munger — proves gap-honest timelines and Tier 6 demotion
**Why fifth:** because he forces the provenance UI to handle absence.
**New capability:** `podcast_episode` and transcript handling; rendering documented gaps; visually demoting third-party transcripts.
**The corpus:** [mungerarchive.com](https://mungerarchive.com/) holds 35 verified recordings — every Daily Journal meeting, the major speeches, his only podcast, most with transcripts.
**The hard constraint:** 2015 is the earliest Daily Journal meeting surviving on video; nothing survives for 2014 or earlier; 2016 exists only as audio plus transcript; 2023 was his last before his death in November 2023 at 99 ([Munger Archive](https://mungerarchive.com/daily-journal/)). Your timeline must show that as a gap, not as an empty result.

### 6. Terry Smith — proves hash-URL runtime extraction at scale
**Why sixth, replacing Lynch:** Lynch's primary record is three copyrighted books and a handful of interviews. He cannot exercise the framework. Terry Smith can: [fundsmith.co.uk/documents](https://www.fundsmith.co.uk/documents/) holds annual letters 2010 through 2025 plus semi-annual letters, with a separate sustainable-fund series and multilingual SICAV letters at [fundsmith.eu](https://www.fundsmith.eu/documents/).
**New capability:** multi-series disambiguation within one firm; multilingual variants of the same document; opaque hashed URLs that must be extracted rather than constructed.
**Anchor facts:** the 2025 annual letter is his 16th ([PDF](https://www.fundsmith.co.uk/media/4hcfd1pg/2025-fef-annual-letter-web.pdf)), 2024 the 15th, 2023 the 14th, 2022 the 13th — a clean ordinal series you can validate completeness against.

**Move Lynch to Wave 2** and build him from interviews, Magellan-era records, and institutional holdings rather than book text.

### Wave 1 exit criteria
- All six investors ingested end to end with provenance and rights populated
- Zero sources with stored body text and `rights_status = 'REVIEW_REQUIRED'`
- Search returns title matches above body matches
- At least one `FILED` decision joined to a contemporaneous `STATED` passage
- Munger's pre-2015 gap renders as an explicit gap in the UI
- Full rebuild from cache is byte-identical

---

## Wave 2 — Breadth on strong archives (6 investors)

No new adapters required; these reuse Wave 1 capabilities.

**George Soros** — paginated archive walk at [georgesoros.com/essays](https://www.georgesoros.com/essays/), items at `/YYYY/MM/DD/<slug>/`, cross-checked against year archives. Wide venue spread: Project Syndicate, FT, WSJ, Davos, Munich Security Conference, Hoover. Reuses `html_letter` plus pagination.

**Bill Ackman** — letters at [pershingsquareholdings.com](https://pershingsquareholdings.com/company-reports/letters-to-shareholders/), PDFs on `assets.pershingsquareholdings.com/YYYY/MM/<id>/<name>.pdf`, annual investor presentations each February ([pscmevents.com](https://pscmevents.com/annual-investor-presentation/)). Reuses `pdf_letter` and `edgar_filing`.

**Mohnish Pabrai** — LP letters at [pabraifunds.com/letter-to-partner](https://pabraifunds.com/letter-to-partner/), annual meeting materials back to 2002 at [pabraifunds.com/annual-reports-and-meetings](https://pabraifunds.com/annual-reports-and-meetings/), plus [Chai with Pabrai](https://www.chaiwithpabrai.com/) with its own transcripts page. Reuses everything; excellent permission target.

**Ray Dalio** — official research at [bridgewater.com/research-and-insights](https://www.bridgewater.com/research-and-insights) with document URLs of the form `/_document/<slug>?id=<guid>`; the Yale Journal of Financial Crises "Lessons Learned" interview ([elischolar](https://elischolar.library.yale.edu/journal-of-financial-crises/vol1/iss4/10/)); HBS case 413-702. First use of `archival_finding_aid` for the HBS Bridgewater collection (Daily Observations 1978–1996, access by application). Block the unofficial *Principles* PDF.

**David Swensen** — Yale endowment annual reports and Yale financial reports via [investments.yale.edu](https://investments.yale.edu/), plus the historical [Yale news archive](http://archives.news.yale.edu/). CIO 1985–2021. Reuses `pdf_letter`.

**Peter Lynch** — moved here from your Wave 1. Built from the [PBS Frontline interview](https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html), the [Museum of American Finance profile](https://www.moaf.org/about/people/peter-lynch), Magellan-era institutional records, and bibliographic entries for his three books. Honest, thin, and useful — not padded.

---

## Wave 3 — Historic and thin figures (5 investors)

Deliberately built as honest link-only and metadata profiles. The engineering here is nearly zero; the editorial care required is high.

**Benjamin Graham** — bibliographic entities for *Security Analysis* (1934) and *The Intelligent Investor* across editions, with per-edition rights rows demonstrating that none are cleared. [Columbia's C250 profile](https://c250.columbia.edu/c250_celebrates/your_columbians/benjamin_graham.html) and [Open Library](https://openlibrary.org/books/OL52875825M/Security_analysis) as catalog anchors. Concept-lineage hub: this is where `margin_of_safety` and `mr_market` originate and propagate outward to Buffett, Klarman, Marks, and Greenblatt.

**Philip Fisher** — *Common Stocks and Uncommon Profits* (1958) as a bibliographic entity; `scuttlebutt` as a concept; influence edge to Buffett. Very little digitised primary material; say so.

**Joel Greenblatt** — four books, Gotham Capital from 1985, 20+ years teaching at Columbia. Clean Tier 2 sources are the podcasts: Masters in Business (2018, 2020), the [Knowledge Project](https://fs.blog/knowledge-project-podcast/joel-greenblatt/), Money Maze (2024). The circulating class notes are `REVIEW_REQUIRED`.

**John Templeton** — his strongest primary artifact is his own [Templeton Prize address of 14 May 1985](https://www.templetonprize.org/laureate-sub/hardy-templeton-speech/). The [John Templeton Foundation](https://www.templeton.org/) carries news, guest essays, and the Templeton Ideas podcast, but almost none of it is Templeton's own investment writing. An [Oxford thesis](https://ora.ox.ac.uk/objects/uuid:d4738b73-0a52-4f0c-96a1-89e134d3ae98/files/rnv935423w) is a strong Tier 5 anchor. Present him as a historical collection and state the gap plainly.

**Jesse Livermore** — the `FICTIONALISED_ATTRIBUTION` showcase. *Reminiscences of a Stock Operator* is a 1923 novel by Edwin Lefèvre, public domain in the U.S. via [Project Gutenberg #60979](https://www.gutenberg.org/ebooks/60979), narrated by "Larry Livingston." His own *How to Trade in Stocks* (1940) is separate and encumbered. Full text is legitimately available here — and the honest UI treatment is to label every passage as a novelist's rendering, not Livermore's words.

---

## Wave 4 — Hard cases (3 investors)

**Jim Simons** — Tier 5 heavy. The Simons Foundation's 2012 Cheeger interview in 35 indexed chapters ([2012](https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/), [2024 repost](https://www.simonsfoundation.org/2024/05/14/jim-simons-reflects-on-his-career-in-mathematics/)); the AIP oral history by David Zierler, December 2020, indexed at [Celebratio Mathematica](https://celebratio.org/Simons_J/article/507/); MIT Sloan talks ([MIT Sloan](https://mitsloan.mit.edu/ideas-made-to-matter/quant-pioneer-james-simons-math-money-and-philanthropy)); the [IAS tribute](https://www.ias.edu/news/remembering-life-and-careers-jim-simons). Flag the 1978-vs-1982 Renaissance founding conflict as `DISPUTED` rather than resolving it. State clearly that the method was never disclosed.

**Seth Klarman** — build on the [Masters in Business interview of 18 June 2026](https://www.bloomberg.com/news/audio/2026-06-18/masters-in-business-seth-klarman-podcast) with its [transcript](https://ritholtz.com/2026/06/transcript-seth-klarman/), plus Baupost 13F filings and *Margin of Safety* as a bibliographic entity. State that the partner letters are private. Do not link the circulating PDFs.

**Stanley Druckenmiller** — a pure dated-interview profile plus Duquesne 13Fs. Every passage carries an exact date, enforced by constraint. The four anchor interviews are listed in `05_ENTITY_GRAPH.md`. This profile is the best possible demonstration of the timeline UI, because his reversals are the content.

---

## Sequencing summary

| Wave | Investors | New engineering | Product value |
|---|---|---|---|
| 1 | Marks, Bogle, Buffett, Icahn, Munger, T. Smith | All adapters | Framework proven; marquee profiles live |
| 2 | Soros, Ackman, Pabrai, Dalio, Swensen, Lynch | Finding aids only | Breadth; first archival differentiator |
| 3 | Graham, Fisher, Greenblatt, Templeton, Livermore | None | Concept lineage; public-domain showcase |
| 4 | Simons, Klarman, Druckenmiller | None | Honesty showcase; timeline UI proof |

## The discipline that makes it work

Ship each wave with its gaps visible. The temptation at every step will be to fill a thin profile with secondary material until it looks as full as Buffett's. Resist it. The spec already says it better than I can: **do not claim verification unless a source has actually been verified.** A product whose sparse profiles are visibly, explicably sparse is one users will trust with the dense ones.

---

# SOURCE FILE: `README.md`

# Investor/Pass — Source Universe Research Bundle

**Prepared for:** Aditya (Investor/Pass, brand SECOND/PASS)
**Date of research:** 22 August 2026
**Scope:** Deep verification of the public-record source universe for 20 investors, plus the data model, rights framework, ingestion architecture, entity graph, and phased build plan needed to turn that universe into a product.

---

## What this bundle is

This is **not** a list of books. It is a source-universe survey: for each of 20 investors, what primary record actually exists on the open internet right now, where it lives, what shape it is in (HTML / PDF / video / audio / transcript / structured filing), how it can legally be used, and what is genuinely missing.

Every claim about a source in this bundle was checked against the live web on 22 August 2026 unless explicitly marked `UNVERIFIED` or `REVIEW_REQUIRED`. Where a page could not be fetched (bot blocking, JS-only rendering), that is stated rather than papered over.

## Read in this order

| File | What it gives you |
|---|---|
| `00_EXECUTIVE_SUMMARY.md` | The 12 findings that should change your build plan |
| `01_SOURCE_UNIVERSE_MAP.md` | Tier model + the six source classes + per-tier coverage reality |
| `02_DATA_MODEL_AND_SCHEMA.md` | Full PostgreSQL DDL: sources, passages, investors, concepts, companies, events, decisions, rights |
| `03_RIGHTS_AND_LEGAL_FRAMEWORK.md` | The five rights states, edition-by-edition doctrine, and the specific traps |
| `04_INGESTION_ARCHITECTURE.md` | The reusable connector framework, per-source-type adapters, provenance and checksum discipline |
| `05_ENTITY_GRAPH.md` | The four-dimension model (said / when / about / did) as concrete relations |
| `06_PHASED_BUILD_PLAN.md` | Buffett → Munger → Marks → Lynch → Graham → Bogle first, then the expansion waves |
| `investors/*.md` | 20 dossiers, one per investor |
| `data/*.csv` | Machine-readable catalogs you can load directly |

## Data files

| File | Rows | Purpose |
|---|---|---|
| `data/investors.csv` | 20 | Investor registry with archive-quality scoring |
| `data/sources_catalog.csv` | 140+ | The verified source inventory, with rights status per row |
| `data/rights_matrix.csv` | ~40 | Rights decisions by material class |
| `data/concepts.csv` | ~70 | Concept vocabulary with canonical attribution |
| `data/companies.csv` | ~45 | Companies that anchor decisions |
| `data/events.csv` | ~35 | Market events used as the time spine |

## The one-line summary

Six of the twenty investors have archive infrastructure good enough to build a real product on this quarter. Four have almost nothing legitimately public and should ship as honest, thin, link-only profiles rather than being padded with laundered PDFs. The rest sit in between. Build the framework for the six, and let the schema absorb the rest.

## Honesty notes

- CNBC's Warren Buffett Archive (`buffett.cnbc.com`) is behind Akamai bot protection and could not be fetched directly. Its contents are described here via secondary confirmation and CNBC's own about page.
- Oaktree's memo index and Fundsmith's document library are JavaScript-rendered with opaque hashed URLs. Their link patterns must be extracted at runtime, not constructed. Do not hardcode.
- Baupost (Klarman) and Duquesne (Druckenmiller) have no legitimate public letter archive. Circulating PDFs of Baupost letters are unauthorised. This bundle marks them `REVIEW_REQUIRED` and does not treat them as ingestible.

---

# SOURCE FILE: `investors/01_warren_buffett.md`

# 01 — Warren Buffett

| Field | Value |
|---|---|
| Slug | `warren-buffett` |
| Born | 1930 |
| Firm | Berkshire Hathaway (CEO 1970–2025; Chairman ongoing) |
| Archive quality | **EXCELLENT** |
| Build wave | 1 (third) |
| Primary archive | [berkshirehathaway.com/letters/letters.html](https://www.berkshirehathaway.com/letters/letters.html) |
| Verified | 22 August 2026 |

---

## The 2025–2026 discontinuity — read this first

Buffett stepped down as Berkshire CEO at the end of 2025 and remains Chairman, going to the office five days a week.

- His **last shareholder communication as CEO** was the **Thanksgiving letter of November 2025**, roughly 6,000 words, in which he wrote that he was "going quiet. Sort of," announced he would hand the annual report and the long annual-meeting Q&A to Greg Abel, and committed to continuing an annual Thanksgiving message ([CNN](https://www.cnn.com/2025/11/10/markets/warren-buffett-shareholder-letter), [WSJ](https://www.wsj.com/business/warren-buffett-letter-2025-takeaways-e7e0a578), [Yahoo Finance](https://finance.yahoo.com/news/warren-buffetts-2025-thanksgiving-letter-194330654.html)).
- The letter opening the **2025 annual report, dated 28 February 2026, was written by Greg Abel** — his first — at [berkshirehathaway.com/letters/2025ltr.pdf](https://www.berkshirehathaway.com/letters/2025ltr.pdf), 18 pages single-spaced, alongside the full report at `berkshirehathaway.com/2025ar/2025ar.pdf` ([Reuters](https://www.reuters.com/sustainability/boards-policy-regulation/berkshire-ceo-abel-seeks-reassure-shareholders-after-taking-baton-buffett-2026-02-28/), [CNBC](https://www.cnbc.com/2026/02/28/berkshire-ceo-abel-vows-to-keep-buffetts-culture-of-disciplined-investing-in-first-annual-letter.html)).

**Ingestion consequence:** the Berkshire letter series must be split by author. Do not attribute the 2025 letter to Buffett. Set `author_name = 'Gregory E. Abel'`, `attributed_to_investor = FALSE`, and keep it linked to the Buffett context as a succession event. A rule of the form "letters on berkshirehathaway.com are Buffett's" is now wrong, and would be wrong silently.

Anchor facts from Abel's letter, useful as `events` and for validating extraction: 2025 operating earnings $44.5bn versus $47.4bn in 2024, against a five-year average of $37.5bn; cash of $373.3bn at 31 December 2025, down 2.2% in Q4; no buybacks since spring 2024; no dividend; Ted Weschler continuing to manage about 6% of investments after Todd Combs left in December for JPMorgan; next annual meeting 2 May ([CNBC highlights](https://www.cnbc.com/2026/03/01/all-the-highlights-from-berkshire-ceo-abels-first-shareholder-letter.html)).

---

## Class A — Primary writings

### Berkshire shareholder letters, 1977–2024
Index: [berkshirehathaway.com/letters/letters.html](https://www.berkshirehathaway.com/letters/letters.html)

| Era | URL pattern | Format |
|---|---|---|
| 1977–2001 | `https://www.berkshirehathaway.com/letters/YYYY.html` | HTML, sparse legacy markup |
| 2002–2024 | `https://www.berkshirehathaway.com/letters/YYYYltr.pdf` | PDF |
| 2025 | `https://www.berkshirehathaway.com/letters/2025ltr.pdf` | PDF — **Abel, not Buffett** |

Rights: `LINK_ONLY`. Berkshire publishes these freely for shareholders and the public but retains copyright. Metadata, index, and short excerpts; link out for the body.

### Berkshire annual reports, 1977–present
Index: [berkshirehathaway.com/reports.html](https://www.berkshirehathaway.com/reports.html), pattern `/reports/YYYYannualreport.pdf`, with the 2025 cycle at `/2025ar/2025ar.pdf`. Verify the pattern per year — the 2025 cycle broke the older convention.

Value beyond the letter: the reports contain the equity-holdings tables (percentage owned, cost basis, market value, dividends received) which cross-validate 13F data and cover positions 13F does not.

### Thanksgiving letters, 2025–
A new and distinct genre: personal, retrospective, addressed jointly to family and shareholders. The 2025 edition covers a 1938 appendectomy, Omaha, his philanthropic plans including conversion of 1,800 Class A shares into 2.7 million Class B shares for four family foundations, and closes on choosing heroes carefully. Give it its own `source_type = 'thanksgiving_letter'`; treating it as an annual letter would corrupt the series.

---

## Class B — Spoken record

### CNBC Warren Buffett Archive — `https://buffett.cnbc.com/`

**This source is Akamai bot-protected and returns Access Denied to automated fetches.** Record as `usage_status = 'METADATA_ONLY'`, `fetch_blocked_reason = 'akamai_bot_protection'`, and link deeply rather than attempting collection.

Contents, confirmed via CNBC's own about page and cross-referenced through the Munger Archive:

- **33 full annual meetings back to 1994**
- **~145 hours of searchable video synced to roughly 3,000 pages of transcripts**
- **575+ curated clips**
- A Buffett timeline, a portfolio tracker, and a dedicated Buffett–Munger friendship collection

Origin: Berkshire began compiling annual-meeting video in 1994 for internal use; CNBC organised 122 hours of that footage into the public archive ([CNBC](https://buffett.cnbc.com/about-buffett/)).

This is the largest single body of unscripted Buffett reasoning in existence and the highest-value licensing conversation available to Investor/Pass. Until licensed, deep-link into it — CNBC's own search is good, and sending users there is a better experience than a degraded copy.

### Annual meeting, ongoing
The 2 May 2025 meeting is Buffett's last as CEO; Abel confirmed he will take the stage for Q&A at the following meeting ([CNBC](https://www.cnbc.com/2026/03/01/all-the-highlights-from-berkshire-ceo-abels-first-shareholder-letter.html)).

---

## Class C — Regulatory and portfolio record

Berkshire's 13F history is the backbone of Buffett's "WHAT THEY DID" dimension. Use the SEC's quarterly flattened datasets at [sec.gov/data-research/sec-markets-data/form-13f-data-sets](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets) rather than parsing individual filings, remembering that filings before Q3 2013 are fixed-width TXT rather than XML ([edgartools](https://edgartools.readthedocs.io/en/stable/13f-filings/)).

Also available and public domain: submissions history via `https://data.sec.gov/submissions/CIK##########.json`, XBRL company facts via `https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json`, and full-text search of filings since 2001 via [EDGAR full-text search](https://www.sec.gov/edgar/search/).

The Buffett-specific opportunity: pair each quarterly 13F diff with the nearest shareholder-letter passage discussing that holding. Buffett is unusual among the twenty in that he *usually* explains, which makes his `FILED`-to-`STATED` join rate the benchmark against which every other investor's opacity can be measured.

---

## Class D — Books
Buffett has authored no book. The canonical compilations — *The Essays of Warren Buffett* (Cunningham, ed.) and the Lowenstein and Schroeder biographies — are third-party works. Bibliographic entities only, `LINK_ONLY`.

## Class E — Institutional archives
No dedicated Buffett special collection identified. The CNBC archive functions as the de facto institutional archive, privately held.

## Class F — Secondary
Extensive and high quality. Reuters, CNBC, WSJ, and CNN coverage of the succession is well-sourced and useful for establishing dates, as cited throughout this dossier.

---

## Concepts anchored here
`margin_of_safety` (credited by Buffett to Graham), `circle_of_competence`, `moat`, `owner_earnings`, `mr_market` (Graham's, popularised by Buffett), `intrinsic_value`, `float`, `fortress_balance_sheet` (now Abel's phrasing, [2025 letter](https://www.berkshirehathaway.com/letters/2025ltr.pdf)).

## Relations
`student`/`influenced_by` → Graham. `influenced_by` → Fisher. `partner` → Munger. Downstream `influenced_by` from Pabrai, and cited by Marks, Klarman, Greenblatt.

## Known gaps
- Pre-1977 letters (Buffett Partnership era) are not on the Berkshire site.
- Annual meeting video does not exist before 1994; Berkshire only began recording that year.
- The CNBC archive cannot be ingested without a licence.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Shareholder letters 1977–2024 | `LINK_ONLY` | Metadata, index, short excerpt |
| Thanksgiving letters 2025– | `LINK_ONLY` | Metadata, index, short excerpt |
| Annual reports | `LINK_ONLY` | Metadata; holdings tables as facts |
| 13F / EDGAR filings | `PUBLIC_DOMAIN` | Full data |
| CNBC video archive | `LINK_ONLY` | Metadata only; fetch blocked |
| Third-party books | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/02_charlie_munger.md`

# 02 — Charlie Munger

| Field | Value |
|---|---|
| Slug | `charlie-munger` |
| Lived | 1924 – November 2023 (died aged 99) |
| Firm | Berkshire Hathaway (Vice Chairman), Daily Journal Corporation (Chairman) |
| Archive quality | **EXCELLENT** (post-2015), **NEARLY ABSENT** (pre-2015 recordings) |
| Build wave | 1 (fifth) |
| Primary archive | [mungerarchive.com](https://mungerarchive.com/) |
| Verified | 22 August 2026 |

---

## Why Munger is the provenance test case

Munger has a purpose-built archive of high quality *and* a hard, documented floor below which the record does not exist. He is therefore the investor who forces your UI to render absence honestly.

## Class A/B — The Munger Archive

[mungerarchive.com](https://mungerarchive.com/) holds **35 verified recordings** and describes its scope as "every Daily Journal meeting, the major speeches, his only podcast — most with transcripts," alongside sections on mental models and books.

### The 2015 floor — the single most important fact in this dossier

From the archive's own [Daily Journal page](https://mungerarchive.com/daily-journal/):

- **2015 is the earliest Daily Journal meeting surviving on video.**
- **No recording survives for 2014 or any earlier year.**
- **2016 survives as audio plus transcript only** — CNBC only began filming after 2016.
- **2023 was his last meeting**; he died in November 2023.

Product rule: Munger's timeline must render 1962–2014 as a documented gap with that explanation attached, not as an empty result set. Populate `investors.known_gaps` with it and surface it.

### Major speeches
The archive collects the well-known set — the Harvard-Westlake "Psychology of Human Misjudgment" address, USC commencement and business-school talks, the "Academic Economics" lecture. Treat each as a distinct Tier 1/2 source with its own date; do not bundle them as "Munger speeches."

## Class F — Third-party transcript sets

Useful for discovery and for filling 2013–2014 in *text* form, but must be visibly demoted to Tier 6 and never merged into the first-party set:

- [Worldly Partners](https://worldlypartners.com/charlie-munger-archive/) — Daily Journal meetings 2013–2023
- [sungcap.com/transcripts](https://sungcap.com/transcripts/)
- [tilsonfunds.com/MungerDJ-2-16.pdf](https://tilsonfunds.com/MungerDJ-2-16.pdf) — 16 February 2013 meeting
- [Steady Compounding](https://steadycompounding.com/transcript/djco23/) — 2023 meeting

Note the tension worth surfacing in the product: Worldly Partners claims transcripts back to 2013, while the primary archive states no recording survives before 2015. Both can be true — a transcript can outlive its recording — but the distinction between "we have the words" and "we have the meeting" is exactly the kind of thing Investor/Pass should be explicit about. Mark these `provenance_status = 'UNVERIFIED'` unless you can establish who transcribed them and from what.

## Class D — Books
*Poor Charlie's Almanack* (Kaufman, ed.), in copyright, multiple editions including a 2023 Stripe Press edition. Bibliographic entity only. The instruction stands: **do not make Investor/Pass a pirate Munger ebook repository.**

## Class C — Filings
Daily Journal Corporation filings on EDGAR give the corporate spine for the meetings. Berkshire filings are covered under Buffett.

## Concepts anchored here
`mental_models`, `latticework`, `psychology_of_human_misjudgment`, `inversion`, `lollapalooza_effect`, `circle_of_competence` (shared with Buffett), `sit_on_your_ass_investing`, `incentive_caused_bias`.

## Relations
`partner` → Buffett (evidence: decades of joint annual meetings; CNBC maintains a dedicated Buffett–Munger collection). `influenced_by` → Graham, indirectly and with stated reservations.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Munger Archive recordings and transcripts | `LINK_ONLY` → strong `PERMISSION_GRANTED` candidate | Metadata, index, short timecoded excerpts |
| Third-party transcripts | `LINK_ONLY` | Cite and link only; never display as primary |
| *Poor Charlie's Almanack* | `LINK_ONLY` | Bibliographic only |
| Daily Journal / Berkshire filings | `PUBLIC_DOMAIN` | Full data |

---

# SOURCE FILE: `investors/03_howard_marks.md`

# 03 — Howard Marks

| Field | Value |
|---|---|
| Slug | `howard-marks` |
| Firm | Oaktree Capital Management (co-founder, co-chairman) |
| Archive quality | **EXCELLENT** — the cleanest corpus in the universe |
| Build wave | 1 (**first — build the pipeline here**) |
| Primary archive | [oaktreecapital.com/insights/howard-marks-memos](https://www.oaktreecapital.com/insights/howard-marks-memos) |
| Verified | 22 August 2026 |

---

## Why Marks goes first

One author. One document type. One date each. One PDF each. Thirty-five unbroken years. There is no better corpus in this research on which to prove an ingestion framework.

## Class A — The memos

- **First memo: "The Route To Performance," 12 October 1990.** Preserve the capitalisation exactly as he wrote it.
- **Roughly 160 public memos** as of the 35th anniversary.
- For that anniversary in October 2025, Oaktree released **"The Complete Collection" (1990–2025)** plus a curated **"The Best of…"** set of about 45 favourites. Marks has said he was not sure anyone read the memos at first ([CNBC, 14 October 2025](https://www.cnbc.com/2025/10/14/howard-marks-celebrates-35-years-of-writing-his-acclaimed-memos-he-wasnt-sure-anyone-read-them-at-first.html)).

### URL patterns
- Memo page: `https://www.oaktreecapital.com/insights/memo/<slug>`
- Memo PDF: `https://www.oaktreecapital.com/docs/default-source/memos/<slug>.pdf`

**The index page is JavaScript-rendered and cannot be fetched as static HTML.** Extract slugs from the rendered index at run time; do not construct them from titles. A third-party graph of the corpus exists at [chian.io](https://chian.io/projects/howard-marks/memos), claiming 159 memos across 1990–2026 — useful as a completeness cross-check, not as a source.

### Why the curated sets matter for the product
Oaktree has already done editorial curation for you. "The Best of…" gives Investor/Pass a defensible starting Collection without inventing its own canon, and the 35-year arc gives the Year entity a continuous spine no other investor provides.

## Class B — Spoken
Podcast: **"The Memo by Howard Marks"** at [art19.com/shows/the-memo-by-howard-marks](https://art19.com/shows/the-memo-by-howard-marks). RSS gives reliable titles, dates, and durations. Marks also appears frequently on Bloomberg and CNBC; each appearance is a separately dated Tier 2 source.

## Class E — Institutional
A bound set of the memos entered the **permanent collection of the Museum of American Finance**, a Smithsonian affiliate, announced 14 October 2025 ([MoAF press release](https://www.moaf.org/news/press-releases/2025-10-14-howard-marks-iconic-memos-join-permanent-collection-at-the-museum-of-american-finance)). A free, citable Tier 5 record.

## Class D — Books
*The Most Important Thing* (2011), *Mastering the Market Cycle* (2018), *Something of Value* (2021, with Bhansali). In copyright; bibliographic entities only.

## Concepts anchored here
`second_level_thinking`, `market_cycles`, `pendulum_of_investor_psychology`, `risk_is_not_volatility`, `you_cant_predict_you_can_prepare`, `sea_change`, `calibrating_aggressiveness`.

## Relations
`influenced_by` → Graham. Frequently cited by contemporary managers. Cites Buffett and Munger regularly, which makes his memos a good harvesting ground for `investor_relations` evidence.

## Permission target ranking: **#1**
Single rightsholder, single author, a coherent corpus, and a firm that has just demonstrated an appetite for canonical curation and institutional preservation. If one permission conversation succeeds, this is the one to have first, and it unlocks the largest coherent body of primary text in the entire universe.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Memos 1990–present | `LINK_ONLY` → best `PERMISSION_GRANTED` candidate | Metadata, index, short excerpt |
| Podcast | `LINK_ONLY` | Metadata, link |
| Books | `LINK_ONLY` | Bibliographic only |
| MoAF collection record | Descriptive facts | Finding-aid entry |

---

# SOURCE FILE: `investors/04_john_bogle.md`

# 04 — John C. Bogle

| Field | Value |
|---|---|
| Slug | `john-bogle` |
| Lived | 1929 – 2019 |
| Firm | The Vanguard Group (founder) |
| Archive quality | **EXCELLENT**, community-maintained |
| Build wave | 1 (second) |
| Primary archive | [boglecenter.net/bogle-archive](https://boglecenter.net/bogle-archive/) |
| Verified | 22 August 2026 |

---

## The highest-leverage artifact in this entire research effort

The John C. Bogle Center for Financial Literacy publishes its complete archive index as a downloadable spreadsheet:

**[https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx](https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx)**

One download seeds an entire investor with titles, dates, and categories. Nothing else in this corpus offers that. Ingest it before writing any other adapter for Bogle.

## The near-loss

**Vanguard discontinued its Bogle web archive in 2019.** The material survives because the Bogle Center picked it up. This is worth stating in the product: a foundational body of investment writing was one corporate decision away from disappearing, and the version users now reach is a community rescue.

It is also a warning for your own architecture. Capture durable `archive_url` values (Wayback) for everything, because first-party hosting is not permanent.

## Class A — Archive contents

Organised at [boglecenter.net/bogle-archive](https://boglecenter.net/bogle-archive/) into tables by material type:

- Speeches
- Academic papers
- Op-eds
- Letters to media
- Memos to Vanguard employees (internal, now public — unusual and valuable)
- Congressional testimony
- Presentation slides

Date span: earliest items around a **1964 Morgan piece** and a **1972 Wellington Fund memo**, through **7 December 2017**. An early dated highlight is **"Statistics and Suicide," 6 May 1984**.

Mixed date precision is the norm here — some items are day-precise, others year-only. Use `publication_date_precision`; do not fabricate days.

### Mirrors for cross-checking titles
- [Bogleheads blog](https://www.bogleheads.org/blog/who-are-the-bogleheads/john-bogle-speeches/)
- [Bogleheads wiki list of speeches](https://www.bogleheads.org/wiki/List_of_John_C._Bogle_speeches)
- [johncbogle.com](https://johncbogle.com/wordpress/bogle-speeches/)
- [boglecenter.net/resources](https://boglecenter.net/resources/)

## Class C — Institutional record
Vanguard's own corporate history is useful for the index-fund timeline: [50 years, 50 facts: indexing since 1976](https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/50-years-50-facts-indexing-since-1976.html). Fund filings on EDGAR give the First Index Investment Trust lineage.

## Class D — Books
*Common Sense on Mutual Funds*, *The Little Book of Common Sense Investing*, *Enough.*, *The Clash of the Cultures*, *Bogle on Mutual Funds*. All in copyright; bibliographic entities only.

## Concepts anchored here
`cost_matters_hypothesis`, `index_fund`, `costs_matter`, `reversion_to_the_mean`, `the_tyranny_of_compounding_costs`, `fiduciary_duty`, `stay_the_course`.

## Relations
Structural `critic` of active management, evidenced across the speeches and op-eds. Opposed in framing to most other investors in this corpus, which makes him valuable for the Compare surface — he is the one profile whose thesis is that the other nineteen are the problem.

## Permission target ranking: **#2**
A non-profit whose stated mission is dissemination, already publishing a machine-readable index. The most likely `PERMISSION_GRANTED` outcome in the corpus.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Archive index XLSX | Published for reuse | Seed catalog |
| Speeches, op-eds, testimony | `REVIEW_REQUIRED` → likely `PERMISSION_GRANTED` | Metadata now, more after permission |
| Congressional testimony | Likely `PUBLIC_DOMAIN` where a government record | Verify per item |
| Vanguard internal memos | `REVIEW_REQUIRED` | Metadata only |
| Books | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/05_terry_smith.md`

# 05 — Terry Smith

| Field | Value |
|---|---|
| Slug | `terry-smith` |
| Firm | Fundsmith LLP (founder, CIO) |
| Archive quality | **EXCELLENT** |
| Build wave | 1 (sixth) |
| Primary archive | [fundsmith.co.uk/documents](https://www.fundsmith.co.uk/documents/) |
| Verified | 22 August 2026 |

---

## Why Smith is in wave one

He replaces Lynch as the sixth first-wave investor because he exercises a capability the others do not: **multi-series, multilingual document libraries with opaque hashed URLs that must be extracted at run time**.

## Class A — Annual and semi-annual letters

The Fundsmith documents library holds **annual letters to shareholders from 2010 through 2025 plus semi-annual letters**. The series is ordinal, which gives you a free completeness check.

| Letter | Ordinal | Verified URL |
|---|---|---|
| 2025 annual | 16th | [2025-fef-annual-letter-web.pdf](https://www.fundsmith.co.uk/media/4hcfd1pg/2025-fef-annual-letter-web.pdf) |
| 2024 annual | 15th | [annual-letter-to-shareholders-2024.pdf](https://www.fundsmith.co.uk/media/pirmvyly/annual-letter-to-shareholders-2024.pdf) |
| 2023 annual | 14th | [2023-fef-annual-letter-to-shareholders.pdf](https://www.fundsmith.co.uk/media/31plodnq/2023-fef-annual-letter-to-shareholders.pdf) |
| 2022 annual | 13th | [annual-letter-to-shareholders-2022.pdf](https://www.fundsmith.co.uk/media/bm0lyc22/annual-letter-to-shareholders-2022.pdf) |
| 2026 semi-annual | — | [fundsmith-equity-fund-semi-annual-letter-to-shareholders-2026.pdf](https://www.fundsmith.co.uk/media/lfhpxi1x/fundsmith-equity-fund-semi-annual-letter-to-shareholders-2026.pdf) |

### The hard engineering constraint
Note the URL segments: `4hcfd1pg`, `pirmvyly`, `31plodnq`, `bm0lyc22`, `lfhpxi1x`. These are **opaque content-management hashes**. They cannot be derived from the year, the title, or anything else. Any code that builds a Fundsmith URL from a year is broken by construction. Extract from the rendered index, store the resolved URL, and re-verify on each crawl.

### Multiple series to disambiguate
- Fundsmith Equity Fund (FEF) annual and semi-annual letters
- Fundsmith Sustainable Equity Fund (FSEF) letters — a **separate series**, easily conflated
- SICAV letters in multiple languages at [fundsmith.eu/documents](https://www.fundsmith.eu/documents/)

The multilingual SICAV letters are the same content in different languages. Model them as language variants of one source, not as separate sources, or Smith's timeline will show phantom duplicates.

## Class B — Spoken
Annual shareholder meetings are held and discussed publicly, though Fundsmith does not host official transcripts. A secondary transcript of the 2025 AGM exists at [Steady Compounding](https://steadycompounding.com/transcript/fundsmith25/) — Tier 6, `LINK_ONLY`. Smith also appears on UK financial media regularly; each appearance is separately dated.

## Class C — Filings
UK-domiciled funds, so no 13F. Fund factsheets and the annual reports in the documents library carry holdings disclosure. Note for the schema: Smith is the clearest case that the `decisions` table cannot depend on SEC filings — non-US managers need a `fund_annual_report` evidence path with `evidence_grade = 'FILED'` derived from fund disclosure rather than EDGAR.

## Class D — Books
*Accounting for Growth* (1992) — notable as the book that got him fired from UBS, which is itself a good `events` row. *Investing for Growth* (2020) collects his letters and articles. In copyright.

## Concepts anchored here
`buy_good_companies`, `dont_overpay`, `do_nothing`, `return_on_capital_employed`, `owner_earnings` (his own formulation), `accounting_scepticism`.

## Permission target ranking: **#4**
Small firm, single author, actively publishing, and *Investing for Growth* shows he is comfortable with his letters being republished in collected form.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Fundsmith letters | `LINK_ONLY` → good permission candidate | Metadata, index, short excerpt |
| SICAV multilingual letters | `LINK_ONLY` | Language variants of one source |
| Third-party AGM transcripts | `LINK_ONLY` | Cite and link only |
| Books | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/06_george_soros.md`

# 06 — George Soros

| Field | Value |
|---|---|
| Slug | `george-soros` |
| Born | 1930 |
| Firm | Soros Fund Management, Quantum Fund |
| Archive quality | **EXCELLENT** |
| Build wave | 2 |
| Primary archive | [georgesoros.com/essays](https://www.georgesoros.com/essays/) |
| Verified | 22 August 2026 |

---

## Why Soros is stronger than expected

He maintains a genuinely complete personal essay archive under his own name, which almost no other investor in this corpus does. The volume is large and the venues are unusually diverse.

## Class A — Essays and remarks

- Index: [georgesoros.com/essays](https://www.georgesoros.com/essays/), paginated at `https://www.georgesoros.com/essays/page/N/` across **at least 22 pages**
- Individual items: `https://www.georgesoros.com/YYYY/MM/DD/<slug>/` — day-precise dates in the URL itself, which is a gift for the temporal model
- Year archives: `https://www.georgesoros.com/2007/` and equivalents, useful as a cross-check because the essay index does not always list everything a year archive contains
- Press resources: [georgesoros.com/press-resources](https://www.georgesoros.com/press-resources/)

### Venues, which matter for tier assignment
Project Syndicate, the Financial Times, the Wall Street Journal, Davos and World Economic Forum remarks, the Munich Security Conference, and the Hoover Institution. A Soros essay is frequently Tier 1 on his own site *and* Tier 1 at the original publisher, with different rights positions at each. Store the original publisher in `publication_venue` and prefer his own site as `canonical_url`, since that is where he holds the rights and where the copy is durable.

### Ingestion approach
Walk the paginated index to exhaustion, then walk every year archive, then diff. Day-precise URLs mean `publication_date_precision = 'day'` for nearly the whole corpus — rare and valuable.

## Class B — Spoken
Davos and Munich Security Conference addresses are the notable annual set, frequently published as prepared remarks on his own site, which makes them unusually clean: a speech with a first-party text.

## Class C — Filings
Soros Fund Management files 13F. Note that the fund converted to a family office in 2011, which changes the filing profile — a good `events` row and a caution against assuming a continuous holdings series.

## Class D — Books
*The Alchemy of Finance* (1987), *The Crisis of Global Capitalism*, *The New Paradigm for Financial Markets*, and others. In copyright; bibliographic entities only.

## Concepts anchored here
`reflexivity`, `fallibility`, `boom_bust_sequence`, `far_from_equilibrium`, `open_society`, `market_participants_bias`.

Reflexivity is the most theoretically developed single concept in the corpus and the best test of the `concepts` table's ability to hold a genuine framework rather than an aphorism. It also has an unusual property: Soros advances it as philosophy, not technique, so the `concepts.definition` field needs to accommodate that without flattening it into a trading rule.

## Events strongly anchored here
`black_wednesday_1992` — the sterling trade. `asian_financial_crisis_1997`. `gfc_2008`. His essays written *during* these events are directly datable, which makes him one of the best demonstrations of the `written_during` relation.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Essays on georgesoros.com | `LINK_ONLY` | Metadata, index, short excerpt |
| Essays at original publisher | `LINK_ONLY` | Cite the publisher, link to both |
| Prepared remarks | `LINK_ONLY` | Metadata, short excerpt |
| 13F filings | `PUBLIC_DOMAIN` | Full data |
| Books | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/07_bill_ackman.md`

# 07 — Bill Ackman

| Field | Value |
|---|---|
| Slug | `bill-ackman` |
| Born | 1966 |
| Firm | Pershing Square Capital Management; Pershing Square Holdings (PSH) |
| Archive quality | **GOOD** |
| Build wave | 2 |
| Primary archive | [pershingsquareholdings.com](https://pershingsquareholdings.com/) |
| Verified | 22 August 2026 |

---

## Class A — Letters and presentations

Pershing Square Holdings, being a London-listed closed-end vehicle, publishes far more than a typical US hedge fund:

- Letters to shareholders: [pershingsquareholdings.com/company-reports/letters-to-shareholders/](https://pershingsquareholdings.com/company-reports/letters-to-shareholders/)
- Materials: [/materials/](https://pershingsquareholdings.com/materials/)
- Events and presentations: [/events-presentations/](https://pershingsquareholdings.com/events-presentations/)
- Also [pershingsquareinc.com/investor-relations/](https://pershingsquareinc.com/investor-relations/)

### URL patterns
PDFs are served from `https://assets.pershingsquareholdings.com/YYYY/MM/<numeric-id>/<name>.pdf`. Verified examples:

- 2024 Annual Report: `https://assets.pershingsquareholdings.com/2025/03/14183709/Pershing-Square-Holdings-Ltd.-2024-Annual-Report-1.pdf`
- 2022 Annual Report: `https://assets.pershingsquareholdings.com/2023/03/29160536/...`
- 2021 Annual Investor Presentation: `https://pershingsquareholdings.com/wp-content/uploads/2021/02/PSH-2021-Annual-Investor-Presentation-1.pdf`

Note the pattern: the path date is the **publication** date, not the reporting period. The 2024 annual report lives under `/2025/03/`. Extract the reporting period from the document, never from the URL. This is a general trap worth encoding as a rule.

### The activist presentation as a source type
Ackman's investment-case decks are a distinctive and underappreciated source class: long, argued, dated, and unusually explicit about the reasoning behind a specific position. For the `decisions` table they are the richest possible `rationale_passage_ids` material, because they state the thesis at the moment of the position rather than in retrospect.

## Class B — Spoken
**Annual investor meetings each February**, e.g. 11 February 2025 and 11 February 2026, via [pscmevents.com/annual-investor-presentation](https://pscmevents.com/annual-investor-presentation/). He is also extremely active on X and in television interviews. Social posts are a genuine modelling question: they are primary, dated, and voluminous. Recommendation for V1: exclude social posts from the corpus, add `source_type = 'social_post'` later behind a separate surface, because their signal-to-noise ratio is unlike anything else in the schema.

## Class C — Filings — the strongest dimension here
Pershing Square files 13F, and its activist campaigns generate SC 13D filings with detailed intent disclosures. Ackman is the best test of the `activist_stake` action type and, along with Icahn, the reason to build the EDGAR adapter early.

## Class D — Books
None authored. Extensive third-party coverage exists.

## Concepts anchored here
`activist_investing`, `concentrated_portfolio`, `asymmetric_risk_reward`, `public_advocacy_as_catalyst`, `platform_value`.

## Relations
Frequently compared and contrasted with Icahn; the 2013 Herbalife dispute is a well-documented `events` row involving both, and a good demonstration of an adversarial `investor_relations` edge with `relation = 'critic'`.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| PSH letters and reports | `LINK_ONLY` | Metadata, index, short excerpt |
| Investment presentations | `LINK_ONLY` | Metadata, slide titles, short excerpt |
| 13F / 13D filings | `PUBLIC_DOMAIN` | Full data |
| Social posts | Excluded from V1 | — |

---

# SOURCE FILE: `investors/08_carl_icahn.md`

# 08 — Carl Icahn

| Field | Value |
|---|---|
| Slug | `carl-icahn` |
| Born | 1936 |
| Firm | Icahn Enterprises L.P. (IEP), Icahn Capital |
| Archive quality | **GOOD**, but in an unexpected place |
| Build wave | 1 (fourth) |
| SEC CIK | **0000813762** |
| Verified | 22 August 2026 |

---

## The key insight: Icahn's writings are SEC exhibits

Icahn maintains no essay archive, no memo series, and no letter page. **His open letters to shareholders are filed on EDGAR as DFAN14A proxy exhibits.**

Verified example: his 2023 open letter regarding Illumina is filed under **Illumina's** CIK, not his own — [sec.gov/Archives/edgar/data/1110803/000153949723000923/0001539497-23-000923-index.html](https://www.sec.gov/Archives/edgar/data/1110803/000153949723000923/0001539497-23-000923-index.html).

This has two consequences:

1. You cannot find Icahn's writings by crawling his filer history alone. You need **EDGAR full-text search** across all filers, at `https://efts.sec.gov/LATEST/search-index?q=`, covering filings since 2001 ([EDGAR full-text search](https://www.sec.gov/edgar/search/)).
2. Icahn is therefore the investor who forces you to build the highest-reuse adapter in the whole system. Build him fourth, in wave one, ahead of investors with better-looking archives.

## Class C — The filing record

- Firm index, paginated and filterable by form group: [ielp.com/financial-information/sec-filings](https://www.ielp.com/financial-information/sec-filings) — reaches back to **SC 13D/A filings in 1995** and **SC 14D1/A in 1998**
- EDGAR browse: [sec.gov/edgar/browse/?CIK=CIK0000813762](https://www.sec.gov/edgar/browse/?CIK=CIK0000813762)
- Submissions API: `https://data.sec.gov/submissions/CIK0000813762.json`
- A recent 8-K example: [tm2620847d1_8k.htm](https://www.sec.gov/Archives/edgar/data/813762/000110465926085237/tm2620847d1_8k.htm)

The 13D/A series is the single best `decisions` dataset in the corpus for the `activist_stake` and `tender` action types, because 13D filings state *intent*, not just position — which means the filing itself often carries the rationale, collapsing the "said" and "did" dimensions into one document.

## Rights nuance — the one genuinely grey area
Structured filing data is a U.S. Government work and public domain. **The prose of an exhibit was written by Icahn.** The defensible position is: treat structured facts as `PUBLIC_DOMAIN` and fully ingestible; treat exhibit prose as `LINK_ONLY` with short excerpting and flag for counsel. This is the only material class in the corpus where the government-works exemption and private authorship genuinely collide, and it happens to sit on top of one of the most interesting source classes. Get a real legal answer here rather than guessing.

## Class B — Spoken
Frequent CNBC appearances, often confrontational and highly quotable. Each is a separately dated Tier 2 source.

## Class A/D — Writings and books
No books authored. Occasional op-eds. The `theicahnreport` blog existed historically and should be checked in the Wayback Machine — a good use of `archive_url` where no live original survives.

## Concepts anchored here
`shareholder_activism`, `proxy_fight`, `greenmail` (historically attributed, contested — use `attribution_note`), `undervalued_conglomerate`, `board_accountability`, `poison_pill_opposition`.

## Relations
`critic` → Ackman (the 2013 Herbalife dispute). Adversarial relations with numerous boards, each evidenced by a specific filing, which makes Icahn the best demonstration that `investor_relations` needs a required `evidence_source_id`.

## Known gaps
- Pre-1995 activity predates his firm's online filing index and pre-2001 activity predates EDGAR full-text search. The 1980s campaigns — his most famous era — are largely reachable only through secondary sources and paper records.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Structured filing data | `PUBLIC_DOMAIN` | Full data |
| DFAN14A exhibit prose | `REVIEW_REQUIRED` → likely `LINK_ONLY` | Metadata, short excerpt, counsel review |
| CNBC interviews | `LINK_ONLY` | Metadata, link |
| Historical blog | Check Wayback | Metadata, `archive_url` |

---

# SOURCE FILE: `investors/09_ray_dalio.md`

# 09 — Ray Dalio

| Field | Value |
|---|---|
| Slug | `ray-dalio` |
| Born | 1949 |
| Firm | Bridgewater Associates (founder) |
| Archive quality | **GOOD**, and materially improved in February 2026 |
| Build wave | 2 |
| Primary archive | [bridgewater.com/research-and-insights](https://www.bridgewater.com/research-and-insights) |
| Verified | 22 August 2026 |

---

## The February 2026 development that changes this profile

Harvard Business School's Baker Library Special Collections announced on **27 February 2026** the opening of the **Bridgewater Associates, LP Archives** ([HBS press release](https://www.hbs.edu/news/releases/bridgewater-archives)).

Contents:
- **Bridgewater Daily Observations, 1978–1996**
- Early photographs and firm records
- Documenting the Latin American debt crisis, the 1987 crash, Black Wednesday in 1992, and the 1994 bond collapse

Access is **by application**, contact `specialcollectionsref@hbs.edu`.

This is a genuine primary corpus — a practitioner reasoning through four major dislocations in near-real time — and **no consumer product currently surfaces it**. It also cannot be ingested. The correct Investor/Pass move is a rich `archival_finding_aid` entry: what exists, what period, which events, who holds it, how to apply. Zero rights risk, high value, and a real differentiator. This is the flagship example of why Tier 5 belongs in the model.

## Class A — Official research
Bridgewater publishes research at [bridgewater.com/research-and-insights](https://www.bridgewater.com/research-and-insights). Document URLs follow `https://www.bridgewater.com/_document/<slug>?id=<guid>` — for example "Why and How Capitalism Needs to Be Reformed," 8 April 2019. The GUID is opaque and must be extracted, not constructed. Same rule as Fundsmith.

Dalio also publishes extensively on LinkedIn and via his own channels. Treat those as Tier 1 where under his own name, and date them precisely.

## Class B — Spoken and oral history
The **Yale Journal of Financial Crises "Lessons Learned: Ray Dalio"** interview is a strong, citable, academically hosted primary source: [elischolar.library.yale.edu/journal-of-financial-crises/vol1/iss4/10](https://elischolar.library.yale.edu/journal-of-financial-crises/vol1/iss4/10/). Being an open-access academic journal, this is one of the few items in the whole corpus where rights are likely permissive — check the specific licence.

## Class E — Academic cases
HBS case **413-702** on Bridgewater. Cases are in copyright and paywalled; bibliographic entity only.

## The rights trap
A widely circulated PDF of *Principles* hosted at cpcglobal.org is an **unofficial conversion of the Kindle edition**, not a Bridgewater publication. Classify `REVIEW_REQUIRED` → `BLOCKED`. This is the canonical example for the "do not automatically ingest a free PDF" doctrine. Dalio's freely-published material on bridgewater.com is the legitimate alternative and is genuinely substantial.

## Class D — Books
*Principles: Life and Work* (2017), *Principles for Dealing with the Changing World Order* (2021), *Big Debt Crises* — the last of which Dalio has made available at no cost through official channels, so **check for an official free edition before assuming `LINK_ONLY`**. An author-authorised free distribution is a `PERMISSION_GRANTED` candidate, not a piracy risk.

## Concepts anchored here
`risk_parity`, `all_weather_portfolio`, `radical_transparency`, `idea_meritocracy`, `believability_weighted_decision_making`, `the_economic_machine`, `long_term_debt_cycle`, `changing_world_order`, `beautiful_deleveraging`.

## Known gaps
- Daily Observations from 1997 onward remain proprietary; only 1978–1996 went to HBS.
- The lineage is largely self-referential; Dalio cites few predecessors, so his `investor_relations` edges are sparse. Do not invent them.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| bridgewater.com research | `LINK_ONLY` | Metadata, index, short excerpt |
| HBS Bridgewater Archives | Not ingestible | Finding-aid entry, access instructions |
| Yale JFC interview | Check open-access licence | Possibly fuller use |
| *Principles* (cpcglobal PDF) | `BLOCKED` | Do not ingest |
| Books | `LINK_ONLY` unless official free edition confirmed | Bibliographic only |
| HBS case 413-702 | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/10_mohnish_pabrai.md`

# 10 — Mohnish Pabrai

| Field | Value |
|---|---|
| Slug | `mohnish-pabrai` |
| Born | 1964 |
| Firm | Pabrai Investment Funds; Dhandho Funds |
| Archive quality | **GOOD** |
| Build wave | 2 |
| Primary archive | [pabraifunds.com/letter-to-partner](https://pabraifunds.com/letter-to-partner/) |
| Verified | 22 August 2026 |

---

## Why Pabrai is unusually easy

He is one of very few private-fund managers who publishes LP letters openly on his own site. Most peers treat these as confidential — see Klarman. Pabrai's openness makes him a rare clean case and an excellent permission target.

## Class A — Partner letters
[pabraifunds.com/letter-to-partner](https://pabraifunds.com/letter-to-partner/) lists annual letters to partners with full contents linked. Because he publishes them himself, the `provenance_status` reaches `FIRST_PARTY_CONFIRMED` immediately — no laundered-PDF problem.

## Class A/B — Annual meetings
[pabraifunds.com/annual-reports-and-meetings](https://pabraifunds.com/annual-reports-and-meetings/) reaches back to the **2002 annual meeting presentation**, giving a genuinely long series of dated, primary, first-party material.

## Class B — Chai with Pabrai
[chaiwithpabrai.com](https://www.chaiwithpabrai.com/) with a dedicated [transcripts page](https://www.chaiwithpabrai.com/transcripts.html) and a blog. First-party transcripts are Tier 2 with `transcript_is_first_party = TRUE` — meaningfully better than the third-party transcripts that fill gaps elsewhere in the corpus.

He also lectures frequently at business schools; those talks are widely posted to YouTube and are dated Tier 2 sources.

## Class C — Filings
Pabrai Investment Funds files 13F where thresholds apply. Portfolio changes are unusually well explained in the letters, which makes his `FILED`-to-`STATED` join rate high — second only to Buffett among the twenty.

## Class D — Books
*The Dhandho Investor* (2007), *Mosaic: Perspectives on Investing*. In copyright; bibliographic entities only.

## Concepts anchored here
`dhandho`, `heads_i_win_tails_i_dont_lose_much`, `cloning`, `spawners`, `low_risk_high_uncertainty`, `few_bets_big_bets_infrequent_bets`, `checklist_investing`.

`cloning` is conceptually interesting for the entity graph: Pabrai explicitly advocates copying other investors, which means his `investor_relations` edges are not inferred but *stated by him*, repeatedly and specifically. He is the single best source of high-confidence `influenced_by` evidence in the corpus.

## Relations
`influenced_by` → Buffett, Munger, Graham — all explicitly and repeatedly stated in his own writing, which satisfies the `evidence_source_id` requirement easily.

## Permission target ranking: **#5**
Already publishes openly; the ask is small.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Partner letters | `LINK_ONLY` → good permission candidate | Metadata, index, short excerpt |
| Annual meeting materials | `LINK_ONLY` | Metadata, short excerpt |
| Chai with Pabrai transcripts | `LINK_ONLY`, first-party | Metadata, timecoded excerpt |
| 13F filings | `PUBLIC_DOMAIN` | Full data |
| Books | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/11_david_swensen.md`

# 11 — David Swensen

| Field | Value |
|---|---|
| Slug | `david-swensen` |
| Lived | 1954 – 2021 |
| Role | Chief Investment Officer, Yale University endowment, **1985–2021** |
| Archive quality | **GOOD** |
| Build wave | 2 |
| Primary archive | [investments.yale.edu](https://investments.yale.edu/) |
| Verified | 22 August 2026 |

---

## Why Swensen is structurally different

He is the only investor in this corpus whose primary record is **institutional rather than personal**. He wrote almost no letters under his own name. Instead his thinking is embedded in 36 years of Yale endowment annual reports — documents authored by an office, describing decisions made by a committee, in which his voice is present but not signed.

This is a genuine modelling challenge and worth handling deliberately: set `author_name = 'Yale Investments Office'`, `attributed_to_investor = TRUE` with an `attribution_note` explaining the institutional authorship, and `attribution_confidence = 'DIRECT'` only for material he signed personally.

## Class A/C — Yale endowment reports
- Investments Office: [investments.yale.edu](https://investments.yale.edu/)
- Yale endowment annual reports, e.g. the 2021 report mirrored at [swensenmemorial.com](https://swensenmemorial.com/img/2021-Endowment-Report.pdf)
- Yale annual financial reports, e.g. the FY24 report on `your.yale.edu`
- Historical Yale news archive: [archives.news.yale.edu](http://archives.news.yale.edu/)

The endowment reports are the substance: asset-allocation history, manager-selection philosophy, and performance across 36 years. As a `decisions` dataset they are excellent at the *asset class* level and useless at the *security* level, which is the inverse of the 13F profile of everyone else. Worth noting in the schema: `decisions.company_id` will be NULL for most Swensen rows, and that is correct, not missing data.

## Class D — Books
*Pioneering Portfolio Management* (1st ed. 2000, revised 2009) — the foundational text of the endowment model, and effectively his signed statement of method. *Unconventional Success* (2005) is its retail counterpart, and notably argues that individuals should do roughly the opposite of what Yale does, which is a useful and genuinely counterintuitive `concepts` relationship to capture.

Both in copyright; bibliographic entities only.

## Class E — Institutional
Yale's archives and the memorial materials created after his death in 2021. A dedicated Swensen special collection was not identified in this research; worth checking with Yale's Manuscripts and Archives directly, and recording as `UNVERIFIED` until confirmed.

## Class B — Spoken
Yale lectures, including appearances in Yale's open-course materials, plus conference and institutional-investor panel appearances. Sparse relative to the fund managers; he was not a media presence.

## Concepts anchored here
`endowment_model`, `equity_bias`, `illiquidity_premium`, `manager_selection`, `rebalancing_discipline`, `diversification_across_uncorrelated_assets`, `active_management_paradox`.

## Relations
`mentor` → a generation of endowment CIOs (the "Yale mafia"), well documented but requiring named individuals and evidence per edge; do not assert it as a vague collective claim. Intellectually adjacent to Bogle on costs while diametrically opposed on active management — a productive Compare pairing.

## Known gaps
- Very little material in his own voice outside the two books.
- No personal archive.
- Endowment reports are institutional documents, so attributing specific sentences to Swensen personally is often unsupportable. Say so rather than implying otherwise.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Yale endowment reports | `LINK_ONLY` | Metadata, asset-allocation facts, short excerpt |
| Yale financial reports | `LINK_ONLY` | Metadata, facts |
| Books | `LINK_ONLY` | Bibliographic only |
| Yale news archive | `LINK_ONLY` | Discovery and citation |

---

# SOURCE FILE: `investors/12_peter_lynch.md`

# 12 — Peter Lynch

| Field | Value |
|---|---|
| Slug | `peter-lynch` |
| Born | 1944 |
| Firm | Fidelity Magellan Fund (manager 1977–1990) |
| Archive quality | **THIN** |
| Build wave | **2** (moved out of wave 1 — see below) |
| Primary archive | None |
| Verified | 22 August 2026 |

---

## Recommendation: move Lynch out of wave one

Your proposed first six were Buffett → Munger → Marks → Lynch → Graham → Bogle. Lynch is the weak link. He has:

- **No personal website or archive**
- **No letter series** — his Magellan shareholder communications are Fidelity documents, not a published personal corpus
- **Three copyrighted books**, which is where nearly all his thinking lives
- **A handful of interviews**

He cannot exercise the ingestion framework, and building him first would produce a thin profile at the moment when the product most needs to look credible. Build him in wave two from interviews and institutional records, and substitute **Terry Smith or Soros** into wave one.

This is not a judgement about his importance. It is a judgement about what the open record contains.

## Class B — Interviews, the primary usable material
- **PBS Frontline "Betting on the Market" interview**: [pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html](https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html) — a substantial, freely accessible, dated primary interview. This is the single best free Lynch source on the open web.
- Fidelity has published retrospective video and written interviews with him over the years; each is separately dated Tier 2.
- Various conference and university appearances exist on YouTube with inconsistent provenance; verify each individually.

## Class E — Institutional
- **Museum of American Finance profile**: [moaf.org/about/people/peter-lynch](https://www.moaf.org/about/people/peter-lynch) — Tier 5, and a possible route to further materials.
- Boston College and Fidelity institutional history are secondary anchors for the Magellan record.

## Class C — Filings
Magellan-era Fidelity fund filings give the holdings record. Note the constraint: **EDGAR full-text search only covers filings since 2001** ([EDGAR](https://www.sec.gov/edgar/search/)), and Lynch left Magellan in 1990. His entire active career predates the searchable electronic record. Holdings reconstruction for 1977–1990 requires paper or microfiche fund reports, which is a genuine archival project rather than an ingestion task.

This makes Lynch the clearest case in the corpus of an investor whose "WHAT THEY DID" dimension is effectively unavailable, and the product should say that rather than showing an empty portfolio tab.

## Class D — Books
*One Up on Wall Street* (1989), *Beating the Street* (1993), *Learn to Earn* (1995). All in copyright. Bibliographic entities with chapter-level concept tagging — which for Lynch delivers most of the navigational value, because his frameworks are chapter-shaped and his chapter titles are unusually descriptive.

## Concepts anchored here
`tenbagger`, `invest_in_what_you_know`, `buy_what_you_understand`, `stalwarts`, `fast_growers`, `slow_growers`, `cyclicals`, `turnarounds`, `asset_plays` (his six-category taxonomy), `peg_ratio`, `local_knowledge_edge`.

The six-category stock taxonomy is a good test of `concepts.parent_concept_id`: it is one framework composed of six named children.

## Known gaps
- No primary writings archive at all.
- Career predates electronic filings.
- Fidelity holds the institutional record and does not publish it as an archive.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| PBS Frontline interview | `LINK_ONLY` | Metadata, short excerpt, link |
| Fidelity interviews | `LINK_ONLY` | Metadata, link |
| Books | `LINK_ONLY` | Bibliographic + chapter index only |
| MoAF profile | Descriptive facts | Finding-aid entry |
| Magellan-era filings | Not electronically available | Record the gap |

---

# SOURCE FILE: `investors/13_benjamin_graham.md`

# 13 — Benjamin Graham

| Field | Value |
|---|---|
| Slug | `benjamin-graham` |
| Lived | 1894 – 1976 |
| Firm | Graham-Newman Corporation; Columbia Business School faculty |
| Archive quality | **THIN** (digitally), foundational (intellectually) |
| Build wave | 3 |
| Primary archive | None |
| Verified | 22 August 2026 |

---

## Graham's role in the product is as a concept hub, not a source corpus

He is the origin point for `margin_of_safety`, `mr_market`, `intrinsic_value`, `defensive_vs_enterprising_investor`, and `net_current_asset_value` — concepts that propagate to Buffett, Klarman, Marks, Greenblatt, Pabrai, and Templeton. His value in the entity graph is enormous. His value as an ingestible corpus is close to zero.

Build him as a concept-lineage hub with rigorous bibliographic records and per-edition rights rows. Do not attempt to build him as a text archive.

## The rights lesson — this is the doctrine's proof case

**Do not assume every edition of every Graham book is public domain merely because it is old.**

Verified evidence, all checked 22 August 2026:

| Item | Internet Archive status |
|---|---|
| *Security Analysis*, 1934 first-edition reprint | `Access-restricted-item: true`, lending only — [record](https://archive.org/details/securityanalysis0000grah) |
| *Security Analysis*, second copy | `Access-restricted-item: true` — [record](https://archive.org/details/securityanalysis0000grah_k7k1) |
| *Graham and Dodd's Security Analysis* | "No suitable files to display here" — [record](https://archive.org/details/grahamdoddssecur0000grah) |
| *Security Analysis: Principles and Technique* | "No suitable files to display here" — [record](https://archive.org/details/securityanalysis0000benj) |

Every one of these is restricted. None is a public-domain text. The 1934 work was renewed, and the modern editions — the 6th and 7th, with new commentary from contemporary investors — are substantially new copyrighted works.

Compare with the corpus's genuine public-domain case: Lefèvre's *Reminiscences of a Stock Operator* (1923), full text at [Project Gutenberg #60979](https://www.gutenberg.org/ebooks/60979). Same era. Opposite answer. **Rights are per edition and per jurisdiction, always.**

Required practice: one `rights_decisions` row per edition per jurisdiction, each with written reasoning and an `evidence_url`. For Graham that means separate rows for the 1934, 1940, 1951, 1962, 1988, 2008, and 2023 editions of *Security Analysis*, and separate rows for each *Intelligent Investor* edition including the Zweig-annotated versions, which are unambiguously in copyright.

## Class D — Books
*Security Analysis* (1934, with David Dodd), *The Intelligent Investor* (1949), *The Interpretation of Financial Statements* (1937), *Storage and Stability* (1937), *The Memoirs of the Dean of Wall Street* (posthumous, 1996).

## Class E/F — Institutional and catalog anchors
- Columbia C250 profile: [c250.columbia.edu](https://c250.columbia.edu/c250_celebrates/your_columbians/benjamin_graham.html)
- Open Library record for *Security Analysis*: [openlibrary.org](https://openlibrary.org/books/OL52875825M/Security_analysis)
- Columbia Business School holds the institutional legacy of his teaching; a dedicated digitised Graham collection was not identified — mark `UNVERIFIED` and enquire directly.

## Class A — Articles
Graham published articles in *The Financial Analysts Journal*, *Forbes*, and elsewhere, including his well-known late-career remarks on efficient markets. These are individually citable, individually rights-encumbered, and mostly behind academic paywalls. Catalog them; do not expect to serve them.

## Concepts anchored here
`margin_of_safety`, `mr_market`, `intrinsic_value`, `defensive_investor`, `enterprising_investor`, `net_current_asset_value`, `cigar_butt_investing` (Buffett's term for Graham's method — a good `attribution_note` case), `security_analysis`.

## Relations
`mentor` → Buffett (evidenced by Buffett's own repeated statements). `influenced_by` ← claimed by Klarman, Marks, Greenblatt, Pabrai, Templeton. Graham is the highest-degree node in the graph and the best argument for building `investor_relations` at all.

## Known gaps
- No digitised personal archive.
- No public-domain edition of any major work verified in this research.
- Recordings of his teaching, if any survive, were not located.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| All *Security Analysis* editions | `REVIEW_REQUIRED` → `LINK_ONLY` per edition | Bibliographic only |
| All *Intelligent Investor* editions | `LINK_ONLY` | Bibliographic only |
| Journal articles | `LINK_ONLY` | Citation and link |
| Internet Archive records | Catalog reference only | Never fetch the text layer |

---

# SOURCE FILE: `investors/14_philip_fisher.md`

# 14 — Philip Fisher

| Field | Value |
|---|---|
| Slug | `philip-fisher` |
| Lived | 1907 – 2004 |
| Firm | Fisher & Company (founded 1931) |
| Archive quality | **THIN** |
| Build wave | 3 |
| Primary archive | None |
| Verified | 22 August 2026 |

---

## An honest assessment

Fisher's importance is disproportionate to his digital footprint. He is one half of the intellectual synthesis Buffett describes in himself — Graham's quantitative discipline plus Fisher's qualitative business assessment — and he essentially invented the practice of investigating a company through its competitors, customers, suppliers, and former employees.

He also left almost nothing online. No archive, no letters, no substantial digitised speeches, and he died in 2004 before the era in which investors maintained public writing. His son Ken Fisher is a prolific public figure, which creates a real disambiguation risk in search: a naive query for "Fisher" returns overwhelmingly Ken. Handle it with an explicit `also_known_as` and a disambiguation note.

## Class D — Books, which are effectively the whole corpus
- *Common Stocks and Uncommon Profits* (1958) — the canonical text
- *Paths to Wealth Through Common Stocks* (1960)
- *Conservative Investors Sleep Well* (1975)
- *Developing an Investment Philosophy* (1980)

Modern editions are typically bundled — the widely available *Common Stocks and Uncommon Profits and Other Writings* combines several — with a foreword by Ken Fisher. All in copyright. Note that bundled editions complicate the per-edition rights model: one physical book, several originally separate works, one composite copyright. Model the bundle as a distinct edition with a `notes` field listing its constituent works.

## Concepts anchored here
`scuttlebutt` — his single most durable contribution and a genuinely original method, worth a full concept entry with `coined_by_investor_id` pointing at Fisher and `coinage_source_id` at the 1958 book. Also `fifteen_points` (his checklist for evaluating a company), `qualitative_analysis`, `growth_at_reasonable_price`, `long_term_holding`, `management_integrity`.

## Relations
`influenced_by` → Buffett, in the direction Fisher → Buffett. Buffett has publicly credited Fisher, which satisfies the evidence requirement. This is one of the few Fisher edges that can be properly sourced, and it should be, because it is the main reason a user would land on his profile at all.

## Class B/E — Spoken and institutional
No significant recordings located. No institutional collection identified. Both worth recording as `UNVERIFIED` gaps rather than silently omitting — a user who wonders "why is this profile so thin?" deserves the answer.

## What the profile should honestly be
A concept page and a bibliography, with a clearly stated explanation that Fisher's record is book-bound and pre-digital. Roughly 400 words of editorial framing, four bibliographic entities, six concepts, one well-evidenced relation to Buffett. That is a legitimate and useful product page. Padding it with third-party summaries of *Common Stocks and Uncommon Profits* would not be.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| All books | `LINK_ONLY` | Bibliographic + chapter index only |
| Bundled modern editions | `LINK_ONLY`, separate edition rows | Bibliographic only |
| Recordings | None located | Record as gap |

---

# SOURCE FILE: `investors/15_joel_greenblatt.md`

# 15 — Joel Greenblatt

| Field | Value |
|---|---|
| Slug | `joel-greenblatt` |
| Born | 1957 |
| Firm | Gotham Capital (founded **1985**); Gotham Asset Management |
| Also | Adjunct professor, Columbia Business School, 20+ years, teaching "Value and Special Situation Investing" |
| Archive quality | **THIN** |
| Build wave | 3 |
| Verified | 22 August 2026 |

---

## Class D — Books
- *You Can Be a Stock Market Genius* (1997)
- *The Little Book That Beats the Market* (2005), reissued as *The Little Book That Still Beats the Market* (2010)
- *The Big Secret for the Small Investor* (2011)
- *Common Sense: The Investor's Guide to Equality, Opportunity, and Growth* (2020)

All in copyright. Bibliographic entities only. Note the reissue: *Beats* and *Still Beats* are separate editions with overlapping content and must be separate rows with a relation between them, or your concept attribution will double-count.

## The rights trap — class notes
A PDF of audited notes from his Columbia course, covering roughly 2002–2006, circulates widely, including at [Focused Compounding](https://focusedcompounding.com/wp-content/uploads/2018/03/Joel-Greenblatt-Class.pdf). Related material sits in the csinvesting archive assembled by John Chew.

These are **student-taken notes from a private university course**, not a Greenblatt publication. Classification: `REVIEW_REQUIRED`, with `BLOCKED` a plausible outcome. Attribution would in any case be `PARAPHRASED` at best — they are a third party's rendering of extemporaneous teaching, which is two degrees removed from his own words.

Do not build the Greenblatt profile on these. There are clean alternatives.

## Class B — Podcasts, the clean primary route
- **Masters in Business** (Bloomberg) appearances in 2018 and 2020
- **The Knowledge Project**: [fs.blog/knowledge-project-podcast/joel-greenblatt](https://fs.blog/knowledge-project-podcast/joel-greenblatt/)
- **Money Maze Podcast**, 2024

All are dated, first-party to their publishers, and often transcribed by the publisher — which makes them Tier 2 with `transcript_is_first_party = TRUE`. This is the right foundation for his profile.

## Class C — Filings
Gotham Asset Management files 13F. Gotham's early years — the period covered by *You Can Be a Stock Market Genius*, with the extraordinary returns and the spinoff and special-situation strategies — predate EDGAR's electronic record. Another instance of the pattern: the most interesting era is the least documented.

## Class A — Writings
No memo or letter series. Occasional op-eds and the Value Investors Club platform he co-founded, which is a community rather than a personal corpus.

## Concepts anchored here
`magic_formula`, `special_situations`, `spinoffs`, `earnings_yield_plus_return_on_capital`, `merger_securities`, `stub_stocks`, `rights_offerings`, `look_where_others_dont`.

The special-situations taxonomy — spinoffs, mergers, restructurings, rights offerings, bankruptcies, recapitalisations — is a clean hierarchy for `parent_concept_id`.

## Relations
`influenced_by` → Graham, stated in his own books. Taught a generation of value investors at Columbia; individual edges need individual evidence and mostly cannot be sourced properly, so leave the collective claim as editorial prose in an `interpretations` row rather than as graph edges.

## Known gaps
- No personal archive.
- Early Gotham record predates electronic filings.
- The most detailed account of his method is in a 1997 book that cannot be reproduced.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Books | `LINK_ONLY` | Bibliographic + chapter index only |
| Columbia class notes | `REVIEW_REQUIRED` → likely `BLOCKED` | Do not ingest |
| Podcast appearances | `LINK_ONLY`, first-party transcripts | Metadata, timecoded excerpt |
| 13F filings | `PUBLIC_DOMAIN` | Full data |

---

# SOURCE FILE: `investors/16_john_templeton.md`

# 16 — Sir John Templeton

| Field | Value |
|---|---|
| Slug | `john-templeton` |
| Lived | 1912 – 2008 |
| Firm | Templeton Growth Fund (founded 1954); Templeton, Dobbrow & Vance |
| Archive quality | **THIN** as an investor; **GOOD** as a philanthropist |
| Build wave | 3 |
| Verified | 22 August 2026 |

---

## The honest finding

This research located **very little verified primary *investment* writing by Templeton online.** What exists in volume is his philanthropic and spiritual output, curated by the John Templeton Foundation. His investment method — global contrarian value, buying at the point of maximum pessimism, pioneering international diversification for American investors in the 1950s and 1960s — is documented almost entirely through secondary accounts.

Recommendation: build him as a **historical collection with an explicit statement of the gap**, and resist the temptation to reconstruct his investment views from biographies and attribute them to him.

## Class A — The one strong primary artifact
**Templeton's own Templeton Prize address, 14 May 1985**: [templetonprize.org/laureate-sub/hardy-templeton-speech/](https://www.templetonprize.org/laureate-sub/hardy-templeton-speech/)

This is genuine Tier 1: his words, his platform, a precise date. It is about humility and the limits of knowledge rather than about investing, but it is the closest thing to a signed statement of worldview in the accessible record, and his investment philosophy is downstream of exactly that worldview.

## Class E/F — Foundation material
[templeton.org](https://www.templeton.org/) carries news, guest essays, and the Templeton Ideas podcast. Important caveat: **most of this content is by others, not by Templeton.** The foundation continues his mission; it does not archive his voice. Do not let foundation-hosted essays inherit `attributed_to_investor = TRUE` by virtue of the domain. This is the same trap as the Berkshire/Abel case, in a different form.

## Class E — Academic
An Oxford thesis on Templeton is a strong Tier 5 anchor: [ora.ox.ac.uk](https://ora.ox.ac.uk/objects/uuid:d4738b73-0a52-4f0c-96a1-89e134d3ae98/files/rnv935423w). Open-access institutional repository, so licence terms are likely permissive — check the specific licence, as this may be one of the few items usable beyond `LINK_ONLY`.

## Class D — Books
Internet Archive holds *The Humble Approach*, *Worldwide Laws of Life*, and the Robert Herrmann biography — **all lending-restricted**, so `LINK_ONLY`. Note the pattern: his books are about spirituality and character, not securities. *Templeton's Way with Money* and similar investment-focused titles are by other authors about him, which makes them Class F secondary, not Class D primary.

## Class C — Filings
Templeton Growth Fund records exist but his active career largely predates EDGAR. Franklin Templeton holds the institutional history following the 1992 acquisition.

## Concepts anchored here
`point_of_maximum_pessimism`, `global_diversification`, `contrarian_value`, `bargain_hunting_across_borders`, `spiritual_dimension_of_wealth`, `humility_in_investing`.

Note the attribution care required: these are well-attested as Templeton's ideas but mostly documented through secondary sources. Set `attribution_note` accordingly and keep `coinage_source_id` NULL where you cannot point at a primary statement. An honest NULL is better than a fabricated citation.

## Relations
Adjacent to Graham in method, without a documented direct relationship — so **no edge**. This is a good discipline test: the temptation to draw a Graham → Templeton line is strong and the evidence is absent.

## Known gaps
- Almost no primary investment writing online.
- No annual letter series located.
- Career largely predates electronic records.
- His most quoted investment aphorisms circulate without traceable primary citations, which is exactly the situation the `provenance_status = 'UNVERIFIED'` default exists to handle.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| 1985 Templeton Prize address | `LINK_ONLY` | Metadata, short excerpt, link |
| Foundation content by others | Not attributed to Templeton | Separate author records |
| Oxford thesis | Check open-access licence | Possibly fuller use |
| Books (lending-restricted) | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/17_jim_simons.md`

# 17 — Jim Simons

| Field | Value |
|---|---|
| Slug | `jim-simons` |
| Lived | 1938 – May 2024 |
| Firm | Renaissance Technologies (founded **1978 or 1982 — sources conflict**) |
| Also | Chern–Simons theory; Simons Foundation (founded 1994 with Marilyn Simons) |
| Archive quality | **GOOD**, but academic rather than investment |
| Build wave | 4 |
| Verified | 22 August 2026 |

---

## The central fact
Simons published essentially nothing about investing, by design. Renaissance's method was and remains deliberately undisclosed. His deep primary record is **mathematical and biographical**, and that is what Investor/Pass should surface — honestly labelled as such.

## Class B/E — Oral histories, the strongest sources

### Simons Foundation interview with Jeff Cheeger, 2012
Indexed into **35 video chapters**, which is unusually good structure for a long interview and maps naturally onto `passages` with timecodes.
- [Original, 28 September 2012](https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/)
- [Republished 14 May 2024, after his death](https://www.simonsfoundation.org/2024/05/14/jim-simons-reflects-on-his-career-in-mathematics/)

Two URLs, one interview. Model as one source with two locations; do not create duplicate rows.

### AIP Oral History interview, December 2020
Conducted by **David Zierler** for the American Institute of Physics Oral History Program, indexed at [Celebratio Mathematica](https://celebratio.org/Simons_J/article/507/).

Formal oral-history programmes produce transcripts with defined access terms, which makes this a rare case where rights may be genuinely favourable. Check AIP's terms.

### Celebratio Mathematica
[celebratio.org/Simons_J](https://celebratio.org/Simons_J/) is the **best single bibliographic hub for Simons** and should be treated as a Tier 5 institutional index, not a secondary blog. It is a curated scholarly bibliography.

## Class B — Talks
- MIT 2010 talk setting out five guiding principles
- 2019 MIT Sloan talks on mathematics, money, and philanthropy ([MIT Sloan](https://mitsloan.mit.edu/ideas-made-to-matter/quant-pioneer-james-simons-math-money-and-philanthropy))
- An AMS Einstein Public Lecture video of roughly 1 hour 20 minutes exists
- [IAS tribute](https://www.ias.edu/news/remembering-life-and-careers-jim-simons)

## Biographical spine
Left academia **1978**. Renaissance founded **1978 or 1982 — sources genuinely conflict**. Simons Foundation founded **1994** with Marilyn Simons. Retired from Renaissance **2009**. Died **May 2024**.

**Do not silently resolve the founding-date conflict.** Set `provenance_status = 'DISPUTED'` with both claims and their sources in `provenance_note`. A product that shows the disagreement is more useful than one that picks a year and looks confident. This is also a good demonstration case for the `DISPUTED` state, which will otherwise go unused and untested.

## Class A — Academic publications
His mathematical papers, including the Chern–Simons work, are real primary sources under his name. They are not investment sources, and the profile must not blur the two. Model them with `source_type = 'academic_paper'` and make clear in the UI that this is the mathematician's corpus.

## Class C — Filings
Renaissance files 13F, and the filings are famously uninformative about method — thousands of small positions with no discernible thesis. Worth including precisely because the *absence* of an interpretable pattern is the finding. This is one place where showing the data without an interpretation is the honest answer.

## Class D — Books
None authored. Gregory Zuckerman's *The Man Who Solved the Market* (2019) is the standard secondary account — Class F, `LINK_ONLY`.

## Concepts anchored here
`quantitative_investing`, `statistical_arbitrage`, `signal_over_narrative`, `machine_learning_in_markets`, `hire_scientists_not_financiers`, `chern_simons_theory` (mathematics, tagged distinctly).

## Relations
Essentially disconnected from the value-investing lineage. That disconnection is informative and should be visible in the graph rather than papered over with weak edges.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Simons Foundation interview | `LINK_ONLY` | Metadata, chapter index, timecoded excerpt |
| AIP oral history | Check programme terms | Possibly fuller use |
| Celebratio index | Descriptive facts | Finding-aid entry |
| Academic papers | Per publisher | Bibliographic + DOI |
| 13F filings | `PUBLIC_DOMAIN` | Full data |
| Zuckerman book | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/18_seth_klarman.md`

# 18 — Seth Klarman

| Field | Value |
|---|---|
| Slug | `seth-klarman` |
| Born | 1957 |
| Firm | The Baupost Group (founded 1982) |
| Archive quality | **NEARLY ABSENT** |
| Build wave | 4 |
| Verified | 22 August 2026 |

---

## The finding, stated plainly

**Baupost partner letters are not legitimately public.** They are confidential communications to limited partners. PDFs covering roughly **1995 to mid-2001** circulate on value-investing sites — safalniveshak, acquirersmultiple, valueinvestingworld among them — and their presence online is an unauthorised distribution, not a publication.

Classification: `REVIEW_REQUIRED`, realistic resolution `BLOCKED`. **Do not link them, do not excerpt them, do not index them.**

This is the corpus's clearest test of the "do not automatically ingest a free PDF" doctrine. The material is genuinely excellent and genuinely off-limits, and there is no clever framing that makes rehosting confidential LP letters acceptable. The right product behaviour is to state that the letters are private. Sophisticated users will recognise that as a signal of trustworthiness; a suspiciously complete Klarman archive would signal the opposite.

## Class B — The clean modern primary source

**Masters in Business, Bloomberg, 18 June 2026** — an interview with Barry Ritholtz:
- Audio: [bloomberg.com](https://www.bloomberg.com/news/audio/2026-06-18/masters-in-business-seth-klarman-podcast)
- Transcript: [ritholtz.com](https://ritholtz.com/2026/06/transcript-seth-klarman/)

Klarman gives very few interviews, which makes this unusually valuable. The Ritholtz transcript is first-party to the interviewer, which effectively makes it Tier 2 rather than Tier 6 — a useful distinction to encode.

**Build the Klarman profile on this.** It is recent, dated, authorised, and substantial.

## Other spoken material, all secondary-hosted
- An HBS interview
- Remarks at MIT, October 2007
- A 1991 interview
- A Columbia Business School talk

All of these are currently reachable only through secondary hosts with unclear provenance. Catalog them with `provenance_status = 'UNVERIFIED'` and pursue first-party versions from HBS, MIT, and Columbia directly — institutional media offices often hold authorised copies of exactly this material.

## Class C — Filings
Baupost files 13F. This is the reliable, public-domain backbone of Klarman's "WHAT THEY DID" dimension and it is genuinely informative, since Baupost's positions in distressed debt and special situations are visible in ways his reasoning is not. Build the portfolio view; leave the reasoning view honestly empty.

## Class D — Books
*Margin of Safety* (1991), long out of print and famously trading at extreme prices on the secondary market. In copyright. Bibliographic entity only. He also served as lead editor of the **6th edition of Graham and Dodd's *Security Analysis*** (2008) — a documented, citable role, and a strong `investor_relations` edge to Graham with real evidence behind it.

## Concepts anchored here
`margin_of_safety` (Graham's, and the title of Klarman's book — a good `attribution_note` case), `absolute_return`, `risk_aversion_over_return_maximisation`, `holding_cash_as_a_position`, `distressed_debt`, `bottom_up_value`, `patience_as_strategy`.

## Relations
`influenced_by` → Graham, evidenced both by the book title and by his editorship of the 6th edition of *Security Analysis*. That editorship is unusually strong evidence: not an assertion of influence but a documented act of stewardship.

## Known gaps — state all of these in the product
- Partner letters: private, and the circulating copies are unauthorised.
- *Margin of Safety*: out of print and not legitimately available.
- Public appearances: rare.
- Almost nothing between 2001 and the 2026 podcast is authorised and dated.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| Baupost partner letters | `REVIEW_REQUIRED` → `BLOCKED` | Do not ingest, do not link |
| Masters in Business 2026 | `LINK_ONLY`, first-party transcript | Metadata, timecoded excerpt |
| Secondary-hosted talks | `REVIEW_REQUIRED` | Metadata only; pursue first-party |
| 13F filings | `PUBLIC_DOMAIN` | Full data |
| *Margin of Safety* | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `investors/19_stanley_druckenmiller.md`

# 19 — Stanley Druckenmiller

| Field | Value |
|---|---|
| Slug | `stanley-druckenmiller` |
| Born | 1953 |
| Firm | Duquesne Capital (1981–2010); Duquesne Family Office |
| Archive quality | **NEARLY ABSENT** for writings; **GOOD** for dated interviews |
| Build wave | 4 |
| Verified | 22 August 2026 |

---

## The defining constraint

Druckenmiller has **no letters, no memos, and no essay archive.** His entire public record is dated interviews. And because he is a macro investor who changes position deliberately and quickly, **his stated views have a short half-life.**

Your instruction on this is exactly right and worth restating: because his current public statements can change, mark each source with an exact date.

**Schema enforcement:** `passages.stated_on` is `NOT NULL` for any passage with `attribution IN ('TRANSCRIBED','REPORTED')`, via the `spoken_passages_need_date` CHECK constraint. A Druckenmiller quotation rendered without a date is not a quotation, it is a misrepresentation.

## Class B — The verified interview set

| Date | Venue | Source |
|---|---|---|
| 28 September 2022 | CNBC Delivering Alpha, with Joe Kernen | [CNBC transcript](https://nbcuniversalnewsgroup.com/cnbc/2022/09/28/cnbc-transcript-duquesne-family-office-chairman-ceo-stanley-druckenmiller-speaks-with-cnbcs-joe-kernen-live-during-the-cnbc-delivering-alpha-conference-today/), video [YouTube](https://www.youtube.com/watch?v=IMeuzvzToPQ) |
| 7 May 2024 | CNBC Squawk Box | [CNBC transcript](https://www.cnbc.com/2024/05/07/cnbc-exclusive-cnbc-transcript-billionaire-investor-stanley-druckenmiller-speaks-with-cnbcs-squawk-box-today.html) |
| 16 October 2024 | Bloomberg, with Sonali Basak | [Apple Podcasts](https://podcasts.apple.com/us/podcast/duquesne-family-office-chairman-and-chief-executive/id1690236827?i=1000673335724) |
| 12 March 2026 | Morgan Stanley "Hard Lessons", with Iliana Bouzali | [Morgan Stanley](https://www.morganstanley.com/insights/videos/hard-lessons/duquesne-stan-druckenmiller-iliana-bouzali) |

The Morgan Stanley conversation is notable for being retrospective — he reflects on his early career and on learning to change course quickly when the facts shift. That is unusually useful content for the entity graph, because it is a primary source *about his own decision process* rather than about a current position.

Note that CNBC publishes transcripts of its own interviews, which makes them first-party and Tier 2 rather than Tier 6. An extended version of the Morgan Stanley interview with bonus clips exists on Morgan Stanley's own site beyond the YouTube cut — a reminder to check for a first-party long version before settling for a syndicated one.

## Class C — Filings, and their real limits
Duquesne Family Office files 13F. Third-party trackers report the portfolio quarterly — for instance a Q1 2026 fall from roughly $4.49bn to $3.38bn across 22 significant positions ([Seeking Alpha](https://seekingalpha.com/article/4923288-tracking-stanley-druckenmillers-duquesne-family-office-portfolio-q1-2026-update)) — but **derive these figures from the SEC filings yourself rather than citing a tracker**, since the filings are public domain and the trackers are not.

The important caveat for the product: **13F does not capture what Druckenmiller actually does.** It covers long US equity positions only. It omits currencies, sovereign bonds, commodities, shorts, and derivatives — which is where a macro investor of his type expresses most of his conviction. A Druckenmiller portfolio page built purely on 13F is not merely incomplete, it is systematically unrepresentative, and the UI must say so on the page rather than in a footnote.

This is the strongest argument in the corpus for a per-investor `filing_coverage_note` displayed alongside any holdings view.

## Class A/D — Writings and books
None. No letters, no books, no op-ed series.

## Concepts anchored here
`macro_investing`, `concentrated_conviction`, `liquidity_drives_markets`, `top_down_plus_bottom_up`, `change_your_mind_fast`, `bet_the_ranch`, `capital_preservation_then_aggression`, `dont_fight_the_fed`.

## Relations
`student`/`influenced_by` → Soros, from the Quantum Fund years including the 1992 sterling trade. Well documented in both men's public statements, so the edge is properly evidenceable — and it is the single most interesting cross-investor relation in the corpus, because it connects two investors whose profiles are otherwise built from completely different source classes.

## Why this profile is worth building despite the thin record
Druckenmiller is the best possible demonstration of the timeline UI. His reversals *are* the content. A view that shows what he said in September 2022, then May 2024, then March 2026, each precisely dated and cited, is genuinely useful and impossible to get from any other product. The thinness of the archive is not a weakness of the profile; it is the profile's subject.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| CNBC transcripts | `LINK_ONLY`, first-party | Metadata, dated excerpt |
| Bloomberg interview | `LINK_ONLY` | Metadata, link |
| Morgan Stanley interview | `LINK_ONLY` | Metadata, dated excerpt |
| 13F filings | `PUBLIC_DOMAIN` | Full data, with coverage caveat displayed |
| Third-party trackers | Not a source | Derive from filings instead |

---

# SOURCE FILE: `investors/20_jesse_livermore.md`

# 20 — Jesse Livermore

| Field | Value |
|---|---|
| Slug | `jesse-livermore` |
| Lived | 1877 – 1940 |
| Archive quality | **NEARLY ABSENT** for his own voice |
| Build wave | 3 |
| Verified | 22 August 2026 |

---

## The most important provenance case in the entire corpus

Livermore's famous "voice" is not his.

***Reminiscences of a Stock Operator* is a 1923 roman à clef by American author Edwin Lefèvre** ([Wikipedia](https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator)). Its narrator is a character named **"Larry Livingston."** The book is universally understood to be based on Livermore, and it is the source of nearly every quotation attributed to him — but the words were written by a novelist, in a work of fiction, about a fictionalised analogue.

If Investor/Pass renders Lefèvre's prose as a Livermore quotation, its provenance model has failed at the single most-quoted item in its own corpus.

**This is why `attribution_confidence` needs the value `FICTIONALISED_ATTRIBUTION`.** Livermore is the reason that field exists. Every passage drawn from *Reminiscences* must carry it, and the UI must render it visibly — not as a subtle badge but as an explicit statement that these are a novelist's words about a character based on Livermore.

Handled well, this is a feature. It is the kind of distinction that makes a serious user trust everything else on the site.

## The public-domain opportunity

*Reminiscences of a Stock Operator* **is public domain in the United States** and available as full text:

- [Project Gutenberg eBook #60979](https://www.gutenberg.org/ebooks/60979) — released 20 December 2019, most recently updated 17 October 2024, marked "Public domain in the USA"
- Plain text: [pg60979.txt](https://www.gutenberg.org/cache/epub/60979/pg60979.txt)
- HTML: [60979-h.htm](https://www.gutenberg.org/files/60979/60979-h/60979-h.htm)

This is the **only full text in the entire twenty-investor corpus that can be legitimately stored and served in full.** It is therefore your reference implementation for `PUBLIC_DOMAIN` / `FULL_TEXT_STORED` — the one place where every capability of the passage layer can actually be exercised end to end.

### Rights caveats that must still be recorded

1. **The Gutenberg text reproduces the original front matter**: "Copyright © 1923 by George H. Doran Company / All Rights Reserved / Reprinted by arrangement with Doubleday & Company, Inc." A copyright notice printed on a page is not evidence of current protection — but its presence in your stored text will look alarming to anyone reviewing the corpus, so annotate it in `rights_note`.
2. **Jurisdiction.** Gutenberg's own header states the text is free in the United States "and most other parts of the world," and instructs readers outside the US to check local law. Record `jurisdiction = 'US'` on the `PUBLIC_DOMAIN` decision. Do not assume it holds in India, the UK, or the EU without a separate determination.
3. **Later editions are separate works.** The 2020 "Annotated Edition… with the Livermore Market Key and Commentary Included" is in copyright. Separate edition row, `LINK_ONLY`.
4. **Internet Archive copies are restricted** — [record](https://archive.org/details/reminiscencesofs0000lefe) is marked `Access-restricted-item: true`, as are [others](https://archive.org/details/reminiscencesofs0000edwi). Use Gutenberg for text; use IA records as catalog references only, and do not fetch the `_djvu.txt` derivative.

## Livermore's own writing
*How to Trade in Stocks* (1940), published shortly before his death, is thin and rights-encumbered. It is genuinely his, which makes it the correct source for any passage attributed to Livermore himself with `attribution = 'DIRECT'`. Bibliographic entity; `LINK_ONLY`.

## Class C — Filings
None. His career ran from the 1890s through the 1930s, entirely predating the SEC, which was created in 1934, and predating any electronic record by six decades. His "WHAT THEY DID" dimension is unavailable and always will be. Record it as a structural gap.

## Concepts anchored here — with careful attribution
`trend_following`, `pivotal_points`, `cut_losses_quickly`, `sit_tight`, `the_market_is_never_wrong_opinions_often_are`, `pyramiding`, `tape_reading`, `livermore_market_key`.

**Critical:** almost all of these are formulated in Lefèvre's prose. Set `coinage_source_id` to the Lefèvre novel and use `attribution_note` to state that the formulation is the novelist's. Where a concept comes from *How to Trade in Stocks* — `pivotal_points` and `livermore_market_key` in particular — attribute it to Livermore directly.

## Relations
Largely disconnected from the value lineage. Adjacent to modern trend-following and technical traders, none of whom are in this twenty. The disconnection is real and should be visible.

## Known gaps
- No letters, no interviews of substance, no recordings.
- No verifiable trading records.
- Died in 1940; the pre-SEC era leaves almost nothing auditable.
- His most quoted lines are a novelist's.

## Rights summary
| Material | Status | Usage |
|---|---|---|
| *Reminiscences* (1923, Gutenberg) | `PUBLIC_DOMAIN`, `jurisdiction='US'` | **`FULL_TEXT_STORED`** — the one full-text case |
| *Reminiscences* annotated editions | `LINK_ONLY` | Bibliographic only |
| Internet Archive copies | Restricted | Catalog reference only |
| *How to Trade in Stocks* (1940) | `LINK_ONLY` | Bibliographic only |

---

# SOURCE FILE: `build_csvs.py`

```text
#!/usr/bin/env python3
"""Emit the machine-readable catalogs for the Investor/Pass source-universe bundle.
All rows were verified against the live web on 2026-08-22 unless provenance_status
is UNVERIFIED or DISPUTED."""

import csv, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(OUT, exist_ok=True)
R = "2026-08-22"


def write(name, header, rows):
    p = os.path.join(OUT, name)
    with open(p, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        w.writerow(header)
        w.writerows(rows)
    print(f"{name}: {len(rows)} rows")


# ---------------------------------------------------------------- investors
investors = [
    # slug, full_name, birth, death, firm, career_start, career_end, archive_quality, wave, primary_archive_url, has_official_archive, one_line, known_gaps
    ("warren-buffett", "Warren Buffett", 1930, "", "Berkshire Hathaway", 1956, "", "EXCELLENT", 1,
     "https://www.berkshirehathaway.com/letters/letters.html", "TRUE",
     "Complete shareholder-letter series 1977-2024 plus a new Thanksgiving-letter genre from 2025; CEO handover to Greg Abel at end-2025.",
     "Pre-1977 partnership letters absent; no annual-meeting video before 1994; CNBC video archive is bot-blocked and unlicensed."),
    ("charlie-munger", "Charlie Munger", 1924, 2023, "Berkshire Hathaway / Daily Journal", 1962, 2023, "EXCELLENT", 1,
     "https://mungerarchive.com/", "TRUE",
     "35 verified recordings covering every surviving Daily Journal meeting, the major speeches and his only podcast.",
     "2015 is the earliest Daily Journal meeting surviving on video; nothing survives for 2014 or earlier; 2016 is audio plus transcript only."),
    ("howard-marks", "Howard Marks", 1946, "", "Oaktree Capital Management", 1990, "", "EXCELLENT", 1,
     "https://www.oaktreecapital.com/insights/howard-marks-memos", "TRUE",
     "~160 memos in an unbroken series from 12 October 1990; the cleanest corpus in the universe.",
     "Index is JS-rendered so slugs must be extracted at runtime; pre-Oaktree TCW-era writing not published."),
    ("john-bogle", "John C. Bogle", 1929, 2019, "The Vanguard Group", 1951, 2019, "EXCELLENT", 1,
     "https://boglecenter.net/bogle-archive/", "TRUE",
     "Community-rescued archive of speeches, papers, op-eds, testimony and internal memos c.1964-2017, published with an XLSX index.",
     "Vanguard discontinued its own Bogle archive in 2019; mixed date precision across the corpus."),
    ("terry-smith", "Terry Smith", 1953, "", "Fundsmith LLP", 2010, "", "EXCELLENT", 1,
     "https://www.fundsmith.co.uk/documents/", "TRUE",
     "Annual letters 2010-2025 (2025 is the 16th) plus semi-annual letters, a separate sustainable-fund series and multilingual SICAV variants.",
     "PDF URLs use opaque CMS hashes that cannot be constructed; no official AGM transcripts."),
    ("george-soros", "George Soros", 1930, "", "Soros Fund Management / Quantum Fund", 1969, "", "EXCELLENT", 2,
     "https://www.georgesoros.com/essays/", "TRUE",
     "Large personal essay archive with day-precise URLs, spanning Project Syndicate, FT, WSJ, Davos and Munich Security Conference.",
     "Fund became a family office in 2011, breaking the continuity of the 13F series."),
    ("bill-ackman", "Bill Ackman", 1966, "", "Pershing Square Capital Management", 2004, "", "GOOD", 2,
     "https://pershingsquareholdings.com/company-reports/letters-to-shareholders/", "TRUE",
     "PSH shareholder letters, annual reports and long-form activist investment presentations, plus February investor meetings.",
     "Heavy use of social media as a primary channel is excluded from V1; asset URL date paths reflect publication, not reporting period."),
    ("carl-icahn", "Carl Icahn", 1936, "", "Icahn Enterprises L.P.", 1968, "", "GOOD", 1,
     "https://www.ielp.com/financial-information/sec-filings", "TRUE",
     "No essay archive; his open letters are filed as EDGAR DFAN14A exhibits and his positions run through SC 13D/A filings back to 1995.",
     "Pre-1995 activity absent from the firm index; pre-2001 activity predates EDGAR full-text search, so the 1980s campaigns are secondary-only."),
    ("ray-dalio", "Ray Dalio", 1949, "", "Bridgewater Associates", 1975, "", "GOOD", 2,
     "https://www.bridgewater.com/research-and-insights", "TRUE",
     "Official Bridgewater research plus a newly opened HBS archive of Daily Observations 1978-1996, available by application only.",
     "Daily Observations from 1997 onward remain proprietary; the widely circulated Principles PDF is an unauthorised Kindle conversion."),
    ("mohnish-pabrai", "Mohnish Pabrai", 1964, "", "Pabrai Investment Funds", 1999, "", "GOOD", 2,
     "https://pabraifunds.com/letter-to-partner/", "TRUE",
     "One of very few private-fund managers who publishes LP letters openly, with annual meeting materials back to 2002 and first-party podcast transcripts.",
     "Early pre-1999 record thin; some annual meeting media only partially archived."),
    ("david-swensen", "David Swensen", 1954, 2021, "Yale University Investments Office", 1985, 2021, "GOOD", 2,
     "https://investments.yale.edu/", "TRUE",
     "36 years of Yale endowment annual reports; the only investor here whose primary record is institutional rather than personal.",
     "Almost nothing in his own voice outside two books; endowment reports are institutionally authored so sentence-level attribution is unsupportable."),
    ("peter-lynch", "Peter Lynch", 1944, "", "Fidelity Magellan Fund", 1977, 1990, "THIN", 2,
     "https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html", "FALSE",
     "No personal archive; the usable record is the PBS Frontline interview, Fidelity retrospectives and three copyrighted books.",
     "Entire active career predates EDGAR full-text search (2001), so the Magellan holdings record is not electronically available."),
    ("benjamin-graham", "Benjamin Graham", 1894, 1976, "Graham-Newman Corporation", 1926, 1956, "THIN", 3,
     "", "FALSE",
     "Foundational concept hub for the corpus; digitally almost absent, with no verified public-domain edition of any major work.",
     "No digitised personal archive; all Security Analysis and Intelligent Investor editions on Internet Archive are access-restricted."),
    ("philip-fisher", "Philip Fisher", 1907, 2004, "Fisher & Company", 1931, 1999, "THIN", 3,
     "", "FALSE",
     "Originator of scuttlebutt research and the qualitative half of Buffett's stated synthesis; record is entirely book-bound and pre-digital.",
     "No archive, no letters, no located recordings; search disambiguation risk against his son Ken Fisher."),
    ("joel-greenblatt", "Joel Greenblatt", 1957, "", "Gotham Capital / Gotham Asset Management", 1985, "", "THIN", 3,
     "", "FALSE",
     "Four books plus 20+ years teaching special-situation investing at Columbia; clean primary sources are podcast appearances.",
     "Circulating Columbia class notes are unauthorised student notes; the extraordinary early Gotham record predates EDGAR."),
    ("john-templeton", "Sir John Templeton", 1912, 2008, "Templeton Growth Fund", 1937, 1992, "THIN", 3,
     "https://www.templeton.org/", "FALSE",
     "Very little primary investment writing exists online; his strongest primary artifact is his own 1985 Templeton Prize address.",
     "Foundation content is mostly by others, not him; his best-known investment aphorisms circulate without traceable primary citations."),
    ("jim-simons", "Jim Simons", 1938, 2024, "Renaissance Technologies", 1978, 2009, "GOOD", 4,
     "https://celebratio.org/Simons_J/", "TRUE",
     "Deep primary record, but mathematical and biographical rather than about investing; two major indexed oral histories.",
     "Renaissance method never disclosed; sources conflict on whether the firm was founded in 1978 or 1982 - flag as DISPUTED."),
    ("seth-klarman", "Seth Klarman", 1957, "", "The Baupost Group", 1982, "", "NEARLY_ABSENT", 4,
     "", "FALSE",
     "Partner letters are private; the only clean modern primary source is a June 2026 Masters in Business interview.",
     "Circulating 1995-2001 Baupost letters are unauthorised; Margin of Safety is out of print; almost nothing authorised between 2001 and 2026."),
    ("stanley-druckenmiller", "Stanley Druckenmiller", 1953, "", "Duquesne Capital / Duquesne Family Office", 1981, "", "NEARLY_ABSENT", 4,
     "", "FALSE",
     "No writings at all; the entire record is dated interviews, and his views change deliberately and fast.",
     "13F covers only long US equities and so systematically misrepresents a macro book of currencies, rates, commodities and shorts."),
    ("jesse-livermore", "Jesse Livermore", 1877, 1940, "independent speculator", 1892, 1940, "NEARLY_ABSENT", 3,
     "https://www.gutenberg.org/ebooks/60979", "FALSE",
     "His famous voice is a novelist's: Reminiscences of a Stock Operator is a 1923 roman a clef by Edwin Lefevre narrated by 'Larry Livingston'.",
     "No letters, interviews, recordings or verifiable trading records; career entirely predates the SEC (created 1934)."),
]
write("investors.csv",
      ["slug", "full_name", "birth_year", "death_year", "primary_firm", "career_start_year", "career_end_year",
       "archive_quality", "build_wave", "primary_archive_url", "has_official_archive", "one_line", "known_gaps"],
      investors)


# ------------------------------------------------------------ sources catalog
H = ["investor", "record_type", "title", "source_class", "source_type", "source_tier", "publisher",
     "publication_date", "date_precision", "year", "original_url", "archive_url", "rights_status",
     "usage_status", "provenance_status", "retrieved_at", "transcript_available", "audio_available",
     "video_available", "notes"]

def s(inv, rt, title, cls, st, tier, pub, date, prec, year, url, rights, usage, prov,
      tr="FALSE", au="FALSE", vi="FALSE", notes="", arch=""):
    return [inv, rt, title, cls, st, tier, pub, date, prec, year, url, arch, rights, usage, prov, R, tr, au, vi, notes]

sources = [
    # ---- Buffett
    s("warren-buffett","series","Berkshire Hathaway shareholder letters index","A_WRITING","shareholder_letter",1,"Berkshire Hathaway","","year","1977-2024","https://www.berkshirehathaway.com/letters/letters.html","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="HTML /letters/YYYY.html 1977-2001; PDF /letters/YYYYltr.pdf 2002-2024"),
    s("warren-buffett","series","Berkshire Hathaway annual reports index","A_WRITING","form_10k",1,"Berkshire Hathaway","","year","1977-2025","https://www.berkshirehathaway.com/reports.html","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="Pattern /reports/YYYYannualreport.pdf; 2025 cycle moved to /2025ar/2025ar.pdf"),
    s("warren-buffett","item","2025 letter to shareholders (authored by Gregory E. Abel)","A_WRITING","shareholder_letter",1,"Berkshire Hathaway","2026-02-28","day","2025","https://www.berkshirehathaway.com/letters/2025ltr.pdf","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="NOT Buffett. attributed_to_investor=FALSE. 18pp. First Abel letter."),
    s("warren-buffett","item","Berkshire Hathaway 2025 Annual Report","A_WRITING","form_10k",1,"Berkshire Hathaway","2026-02-28","day","2025","https://www.berkshirehathaway.com/2025ar/2025ar.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Operating earnings $44.5bn; cash $373.3bn at 2025-12-31"),
    s("warren-buffett","item","Thanksgiving letter to shareholders","A_WRITING","thanksgiving_letter",1,"Berkshire Hathaway","2025-11-10","day","2025","https://www.cnn.com/2025/11/10/markets/warren-buffett-shareholder-letter","LINK_ONLY","METADATA_ONLY","REPORTED",notes="~6,000 words. 'I am going quiet. Sort of.' New annual genre; cited here via CNN coverage"),
    s("warren-buffett","item","CNBC Warren Buffett Archive","B_SPOKEN","annual_meeting",2,"CNBC","","year","1994-present","https://buffett.cnbc.com/","LINK_ONLY","METADATA_ONLY","UNVERIFIED","TRUE","TRUE","TRUE","FETCH BLOCKED: Akamai bot protection. 33 meetings from 1994; ~145h video synced to ~3,000 transcript pages; 575+ clips"),
    s("warren-buffett","item","About the Warren Buffett Archive","F_SECONDARY","news_article",6,"CNBC","","unknown","","https://buffett.cnbc.com/about-buffett/","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="States Berkshire began compiling video 1994 for internal use; CNBC organised 122 hours"),
    s("warren-buffett","series","Berkshire Hathaway 13F holdings history","C_FILING","form_13f",3,"U.S. SEC","","year","1993-present","https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets","PUBLIC_DOMAIN","FULL_TEXT_STORED","FIRST_PARTY_CONFIRMED",notes="Use quarterly flattened datasets; pre-Q3-2013 filings are fixed-width TXT"),
    s("warren-buffett","item","Abel first-letter coverage","F_SECONDARY","news_article",6,"Reuters","2026-02-28","day","2026","https://www.reuters.com/sustainability/boards-policy-regulation/berkshire-ceo-abel-seeks-reassure-shareholders-after-taking-baton-buffett-2026-02-28/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Confirms authorship, page count and financials"),
    s("warren-buffett","item","Highlights from Abel's first shareholder letter","F_SECONDARY","news_article",6,"CNBC","2026-03-01","day","2026","https://www.cnbc.com/2026/03/01/all-the-highlights-from-berkshire-ceo-abels-first-shareholder-letter.html","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Weschler ~6% of investments; Combs departed December for JPMorgan"),
    s("warren-buffett","item","Nine takeaways from Buffett's last letter as CEO","F_SECONDARY","news_article",6,"The Wall Street Journal","2025-11-10","day","2025","https://www.wsj.com/business/warren-buffett-letter-2025-takeaways-e7e0a578","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("warren-buffett","item","Takeaways from the 2025 Thanksgiving letter","F_SECONDARY","news_article",6,"Yahoo Finance","2025-11-11","day","2025","https://finance.yahoo.com/news/warren-buffetts-2025-thanksgiving-letter-194330654.html","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="1,800 Class A shares converted to 2.7m Class B for four family foundations"),

    # ---- Munger
    s("charlie-munger","item","The Munger Archive","B_SPOKEN","archival_collection",1,"Munger Archive","","year","2015-2023","https://mungerarchive.com/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED","TRUE","TRUE","TRUE","35 verified recordings: every surviving Daily Journal meeting, major speeches, his only podcast"),
    s("charlie-munger","item","Daily Journal meetings collection","B_SPOKEN","annual_meeting",1,"Munger Archive","","year","2015-2023","https://mungerarchive.com/daily-journal/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED","TRUE","TRUE","TRUE","2015 earliest on video; none 2014 or earlier; 2016 audio+transcript only; 2023 his last"),
    s("charlie-munger","series","Daily Journal meeting transcripts 2013-2023","F_SECONDARY","third_party_transcript",6,"Worldly Partners","","year","2013-2023","https://worldlypartners.com/charlie-munger-archive/","LINK_ONLY","METADATA_ONLY","UNVERIFIED","TRUE",notes="Third-party transcription; conflicts with primary archive on pre-2015 survival"),
    s("charlie-munger","series","Munger transcripts collection","F_SECONDARY","third_party_transcript",6,"Sung Capital","","unknown","","https://sungcap.com/transcripts/","LINK_ONLY","METADATA_ONLY","UNVERIFIED","TRUE"),
    s("charlie-munger","item","Daily Journal meeting transcript, 16 February 2013","F_SECONDARY","third_party_transcript",6,"Tilson Funds","2013-02-16","day","2013","https://tilsonfunds.com/MungerDJ-2-16.pdf","LINK_ONLY","METADATA_ONLY","UNVERIFIED","TRUE"),
    s("charlie-munger","item","Daily Journal 2023 meeting transcript","F_SECONDARY","third_party_transcript",6,"Steady Compounding","","year","2023","https://steadycompounding.com/transcript/djco23/","LINK_ONLY","METADATA_ONLY","UNVERIFIED","TRUE"),
    s("charlie-munger","item","Poor Charlie's Almanack","D_BOOK","book",4,"various / Stripe Press","","year","2005","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Kaufman ed.; multiple editions incl. 2023 Stripe Press. Bibliographic entity only"),

    # ---- Marks
    s("howard-marks","series","Howard Marks memos index","A_WRITING","memo",1,"Oaktree Capital Management","","year","1990-present","https://www.oaktreecapital.com/insights/howard-marks-memos","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="JS-rendered; ~160 memos; page /insights/memo/<slug>, PDF /docs/default-source/memos/<slug>.pdf"),
    s("howard-marks","item","The Route To Performance","A_WRITING","memo",1,"Oaktree Capital Management","1990-10-12","day","1990","https://www.oaktreecapital.com/insights/howard-marks-memos","LINK_ONLY","METADATA_ONLY","REPORTED",notes="First memo. Date confirmed via CNBC 35th-anniversary coverage"),
    s("howard-marks","item","35 years of memos; Complete Collection and Best of releases","F_SECONDARY","news_article",6,"CNBC","2025-10-14","day","2025","https://www.cnbc.com/2025/10/14/howard-marks-celebrates-35-years-of-writing-his-acclaimed-memos-he-wasnt-sure-anyone-read-them-at-first.html","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Complete Collection 1990-2025 plus curated Best of (~45 memos)"),
    s("howard-marks","item","Memos join permanent collection at the Museum of American Finance","E_ARCHIVE","finding_aid",5,"Museum of American Finance","2025-10-14","day","2025","https://www.moaf.org/news/press-releases/2025-10-14-howard-marks-iconic-memos-join-permanent-collection-at-the-museum-of-american-finance","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Smithsonian affiliate; bound memo set"),
    s("howard-marks","series","The Memo by Howard Marks (podcast)","B_SPOKEN","podcast_episode",2,"Oaktree / Art19","","year","","https://art19.com/shows/the-memo-by-howard-marks","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","FALSE","TRUE",notes="RSS gives reliable titles, dates, durations"),
    s("howard-marks","item","Third-party memo graph and index","F_SECONDARY","news_article",6,"chian.io","","year","1990-2026","https://chian.io/projects/howard-marks/memos","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Claims 159 memos; use only as completeness cross-check"),
    s("howard-marks","item","The Most Important Thing","D_BOOK","book",4,"Columbia Business School Publishing","","year","2011","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),
    s("howard-marks","item","Mastering the Market Cycle","D_BOOK","book",4,"Houghton Mifflin Harcourt","","year","2018","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),

    # ---- Bogle
    s("john-bogle","item","Bogle Archive index (XLSX)","A_WRITING","finding_aid",1,"John C. Bogle Center for Financial Literacy","","year","1964-2017","https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx","REVIEW_REQUIRED","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="MACHINE-READABLE SEED CATALOG. Highest-leverage artifact in the research"),
    s("john-bogle","series","The Bogle Archive","A_WRITING","archival_collection",1,"John C. Bogle Center for Financial Literacy","","year","1964-2017","https://boglecenter.net/bogle-archive/","REVIEW_REQUIRED","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="Speeches, academic papers, op-eds, letters to media, Vanguard internal memos, congressional testimony, slides"),
    s("john-bogle","item","Statistics and Suicide","A_WRITING","speech",1,"John C. Bogle","1984-05-06","day","1984","https://boglecenter.net/bogle-archive/","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED",notes="Early dated highlight in the archive"),
    s("john-bogle","item","Wellington Fund memo","A_WRITING","internal_memo",1,"Wellington Management","","year","1972","https://boglecenter.net/bogle-archive/","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED",notes="Among the earliest items in the archive"),
    s("john-bogle","series","John Bogle speeches list","F_SECONDARY","finding_aid",6,"Bogleheads","","year","","https://www.bogleheads.org/wiki/List_of_John_C._Bogle_speeches","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Mirror for title cross-checking"),
    s("john-bogle","series","Bogle speeches (Bogleheads blog)","F_SECONDARY","finding_aid",6,"Bogleheads","","year","","https://www.bogleheads.org/blog/who-are-the-bogleheads/john-bogle-speeches/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("john-bogle","series","Bogle speeches mirror","F_SECONDARY","finding_aid",6,"johncbogle.com","","year","","https://johncbogle.com/wordpress/bogle-speeches/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("john-bogle","series","Bogle Center resources","F_SECONDARY","finding_aid",6,"Bogle Center","","year","","https://boglecenter.net/resources/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("john-bogle","item","50 years, 50 facts: indexing since 1976","F_SECONDARY","news_article",6,"Vanguard","","year","","https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/50-years-50-facts-indexing-since-1976.html","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Index-fund timeline anchor"),

    # ---- Terry Smith
    s("terry-smith","series","Fundsmith documents library","A_WRITING","shareholder_letter",1,"Fundsmith LLP","","year","2010-2026","https://www.fundsmith.co.uk/documents/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="JS-rendered; PDF URLs use opaque hashes and must be extracted at runtime"),
    s("terry-smith","item","2025 FEF annual letter to shareholders (16th)","A_WRITING","shareholder_letter",1,"Fundsmith LLP","","year","2025","https://www.fundsmith.co.uk/media/4hcfd1pg/2025-fef-annual-letter-web.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("terry-smith","item","2024 annual letter to shareholders (15th)","A_WRITING","shareholder_letter",1,"Fundsmith LLP","","year","2024","https://www.fundsmith.co.uk/media/pirmvyly/annual-letter-to-shareholders-2024.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("terry-smith","item","2023 FEF annual letter to shareholders (14th)","A_WRITING","shareholder_letter",1,"Fundsmith LLP","","year","2023","https://www.fundsmith.co.uk/media/31plodnq/2023-fef-annual-letter-to-shareholders.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("terry-smith","item","2022 annual letter to shareholders (13th)","A_WRITING","shareholder_letter",1,"Fundsmith LLP","","year","2022","https://www.fundsmith.co.uk/media/bm0lyc22/annual-letter-to-shareholders-2022.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("terry-smith","item","FEF semi-annual letter to shareholders 2026","A_WRITING","shareholder_letter",1,"Fundsmith LLP","","year","2026","https://www.fundsmith.co.uk/media/lfhpxi1x/fundsmith-equity-fund-semi-annual-letter-to-shareholders-2026.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("terry-smith","series","Fundsmith SICAV documents (multilingual)","A_WRITING","shareholder_letter",1,"Fundsmith SICAV","","year","","https://www.fundsmith.eu/documents/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Model as language variants of one source, not separate sources"),
    s("terry-smith","item","Fundsmith 2025 AGM transcript","F_SECONDARY","third_party_transcript",6,"Steady Compounding","","year","2025","https://steadycompounding.com/transcript/fundsmith25/","LINK_ONLY","METADATA_ONLY","UNVERIFIED","TRUE"),

    # ---- Soros
    s("george-soros","series","George Soros essays archive","A_WRITING","essay",1,"georgesoros.com","","year","","https://www.georgesoros.com/essays/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="Paginated /essays/page/N/ across >=22 pages; items at /YYYY/MM/DD/<slug>/"),
    s("george-soros","series","Year archives","A_WRITING","essay",1,"georgesoros.com","","year","","https://www.georgesoros.com/2007/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Cross-check against the essay index; year archives sometimes list more"),
    s("george-soros","series","Press resources","A_WRITING","essay",1,"georgesoros.com","","year","","https://www.georgesoros.com/press-resources/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("george-soros","item","The Alchemy of Finance","D_BOOK","book",4,"Simon & Schuster","","year","1987","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Primary statement of reflexivity"),

    # ---- Ackman
    s("bill-ackman","series","PSH letters to shareholders","A_WRITING","shareholder_letter",1,"Pershing Square Holdings","","year","","https://pershingsquareholdings.com/company-reports/letters-to-shareholders/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED"),
    s("bill-ackman","series","PSH materials","A_WRITING","presentation_slides",1,"Pershing Square Holdings","","year","","https://pershingsquareholdings.com/materials/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("bill-ackman","series","PSH events and presentations","A_WRITING","presentation_slides",1,"Pershing Square Holdings","","year","","https://pershingsquareholdings.com/events-presentations/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("bill-ackman","item","Pershing Square Holdings Ltd. 2024 Annual Report","A_WRITING","fund_annual_report",1,"Pershing Square Holdings","2025-03-14","day","2024","https://assets.pershingsquareholdings.com/2025/03/14183709/Pershing-Square-Holdings-Ltd.-2024-Annual-Report-1.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="URL date path is publication date, not reporting period"),
    s("bill-ackman","item","PSH 2021 Annual Investor Presentation","A_WRITING","presentation_slides",1,"Pershing Square Holdings","","year","2021","https://pershingsquareholdings.com/wp-content/uploads/2021/02/PSH-2021-Annual-Investor-Presentation-1.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("bill-ackman","series","Annual investor presentation events","B_SPOKEN","conference_appearance",2,"Pershing Square Capital Management","","year","","https://pscmevents.com/annual-investor-presentation/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","FALSE","FALSE","TRUE","Held each February, e.g. 2025-02-11 and 2026-02-11"),
    s("bill-ackman","series","Pershing Square Inc investor relations","A_WRITING","shareholder_letter",1,"Pershing Square Inc","","year","","https://pershingsquareinc.com/investor-relations/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),

    # ---- Icahn
    s("carl-icahn","series","Icahn Enterprises SEC filings index","C_FILING","schedule_13d",3,"Icahn Enterprises L.P.","","year","1995-present","https://www.ielp.com/financial-information/sec-filings","PUBLIC_DOMAIN","FULL_TEXT_STORED","FIRST_PARTY_CONFIRMED",notes="Paginated, filterable by form group; back to 1995 SC 13D/A and 1998 SC 14D1/A"),
    s("carl-icahn","series","EDGAR filer browse, CIK 0000813762","C_FILING","schedule_13d",3,"U.S. SEC","","year","","https://www.sec.gov/edgar/browse/?CIK=CIK0000813762","PUBLIC_DOMAIN","FULL_TEXT_STORED","FIRST_PARTY_CONFIRMED"),
    s("carl-icahn","item","Icahn open letter to Illumina shareholders (DFAN14A exhibit)","C_FILING","proxy_exhibit",3,"U.S. SEC","","year","2023","https://www.sec.gov/Archives/edgar/data/1110803/000153949723000923/0001539497-23-000923-index.html","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED",notes="KEY PATTERN: filed under Illumina's CIK 1110803, not Icahn's. Exhibit prose authored by Icahn"),
    s("carl-icahn","item","Icahn Enterprises 8-K","C_FILING","form_8k",3,"U.S. SEC","","year","2026","https://www.sec.gov/Archives/edgar/data/813762/000110465926085237/tm2620847d1_8k.htm","PUBLIC_DOMAIN","FULL_TEXT_STORED","URL_RESOLVED"),

    # ---- Dalio
    s("ray-dalio","item","Bridgewater Associates, LP Archives at HBS Baker Library","E_ARCHIVE","archival_collection",5,"Harvard Business School Baker Library","2026-02-27","day","1978-1996","https://www.hbs.edu/news/releases/bridgewater-archives","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Daily Observations 1978-1996 + photographs. ACCESS BY APPLICATION: specialcollectionsref@hbs.edu"),
    s("ray-dalio","series","Bridgewater research and insights","A_WRITING","academic_paper",1,"Bridgewater Associates","","year","","https://www.bridgewater.com/research-and-insights","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="Document URLs /_document/<slug>?id=<guid>; GUID opaque, must be extracted"),
    s("ray-dalio","item","Why and How Capitalism Needs to Be Reformed","A_WRITING","essay",1,"Bridgewater Associates","2019-04-08","day","2019","https://www.bridgewater.com/research-and-insights","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("ray-dalio","item","Lessons Learned: Ray Dalio","B_SPOKEN","oral_history",5,"Yale Journal of Financial Crises","","year","","https://elischolar.library.yale.edu/journal-of-financial-crises/vol1/iss4/10/","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED","TRUE",notes="Open-access academic journal; check licence, may permit fuller use"),
    s("ray-dalio","item","Unofficial Principles PDF (Kindle conversion)","D_BOOK","book",4,"unauthorised","","unknown","","","REVIEW_REQUIRED","BLOCKED","DISPUTED",notes="cpcglobal.org copy is an unofficial Kindle conversion. DO NOT INGEST"),
    s("ray-dalio","item","HBS case 413-702 (Bridgewater Associates)","E_ARCHIVE","academic_paper",5,"Harvard Business School","","year","","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),

    # ---- Pabrai
    s("mohnish-pabrai","series","Letters to partners","A_WRITING","partner_letter",1,"Pabrai Investment Funds","","year","","https://pabraifunds.com/letter-to-partner/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="Published openly by the manager - rare in this corpus"),
    s("mohnish-pabrai","series","Annual reports and meetings","A_WRITING","annual_meeting",1,"Pabrai Investment Funds","","year","2002-present","https://pabraifunds.com/annual-reports-and-meetings/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="Back to the 2002 annual meeting presentation"),
    s("mohnish-pabrai","series","Chai with Pabrai","B_SPOKEN","podcast_episode",2,"Mohnish Pabrai","","year","","https://www.chaiwithpabrai.com/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED","TRUE","TRUE","TRUE"),
    s("mohnish-pabrai","series","Chai with Pabrai transcripts","B_SPOKEN","podcast_episode",2,"Mohnish Pabrai","","year","","https://www.chaiwithpabrai.com/transcripts.html","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED","TRUE",notes="transcript_is_first_party=TRUE"),
    s("mohnish-pabrai","item","The Dhandho Investor","D_BOOK","book",4,"Wiley","","year","2007","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),

    # ---- Swensen
    s("david-swensen","series","Yale Investments Office","A_WRITING","endowment_report",1,"Yale University","","year","1985-present","https://investments.yale.edu/","LINK_ONLY","METADATA_ONLY","FIRST_PARTY_CONFIRMED",notes="Institutional authorship; set attribution_note accordingly"),
    s("david-swensen","item","Yale Endowment 2021 report","A_WRITING","endowment_report",1,"Yale University","","year","2021","https://swensenmemorial.com/img/2021-Endowment-Report.pdf","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Mirrored copy; prefer a Yale-hosted original where available"),
    s("david-swensen","series","Yale historical news archive","F_SECONDARY","news_article",6,"Yale University","","year","","http://archives.news.yale.edu/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("david-swensen","item","Pioneering Portfolio Management","D_BOOK","book",4,"Free Press","","year","2000","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Revised 2009; foundational endowment-model text"),
    s("david-swensen","item","Unconventional Success","D_BOOK","book",4,"Free Press","","year","2005","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Argues individuals should do roughly the opposite of Yale"),

    # ---- Lynch
    s("peter-lynch","item","Frontline: Betting on the Market - Peter Lynch interview","B_SPOKEN","interview",2,"PBS Frontline / WGBH","","year","","https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","TRUE",notes="Best free primary Lynch source on the open web"),
    s("peter-lynch","item","Peter Lynch profile","E_ARCHIVE","finding_aid",5,"Museum of American Finance","","year","","https://www.moaf.org/about/people/peter-lynch","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("peter-lynch","item","One Up on Wall Street","D_BOOK","book",4,"Simon & Schuster","","year","1989","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),
    s("peter-lynch","item","Beating the Street","D_BOOK","book",4,"Simon & Schuster","","year","1993","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),
    s("peter-lynch","item","Learn to Earn","D_BOOK","book",4,"Simon & Schuster","","year","1995","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),

    # ---- Graham
    s("benjamin-graham","item","Security Analysis (1934 first-edition reprint)","D_BOOK","book",4,"Whittlesey House / McGraw-Hill","","year","1934","https://archive.org/details/securityanalysis0000grah","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED",notes="Internet Archive record marked Access-restricted-item: true, lending only. NOT public domain"),
    s("benjamin-graham","item","Security Analysis (second IA copy)","D_BOOK","book",4,"McGraw-Hill","","year","1934","https://archive.org/details/securityanalysis0000grah_k7k1","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED",notes="Access-restricted-item: true"),
    s("benjamin-graham","item","Graham and Dodd's Security Analysis","D_BOOK","book",4,"McGraw-Hill","","year","","https://archive.org/details/grahamdoddssecur0000grah","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED",notes="IA returns 'No suitable files to display here'"),
    s("benjamin-graham","item","Security Analysis: Principles and Technique","D_BOOK","book",4,"McGraw-Hill","","year","","https://archive.org/details/securityanalysis0000benj","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED",notes="IA returns 'No suitable files to display here'"),
    s("benjamin-graham","item","Security Analysis (Open Library record)","D_BOOK","book",4,"Open Library","","year","","https://openlibrary.org/books/OL52875825M/Security_analysis","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Catalog anchor"),
    s("benjamin-graham","item","Benjamin Graham, Columbia C250 profile","E_ARCHIVE","finding_aid",5,"Columbia University","","year","","https://c250.columbia.edu/c250_celebrates/your_columbians/benjamin_graham.html","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("benjamin-graham","item","The Intelligent Investor","D_BOOK","book",4,"Harper","","year","1949","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Multiple editions incl. Zweig-annotated, all in copyright"),

    # ---- Fisher
    s("philip-fisher","item","Common Stocks and Uncommon Profits","D_BOOK","book",4,"Harper & Brothers","","year","1958","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Canonical text; source of scuttlebutt and the fifteen points"),
    s("philip-fisher","item","Paths to Wealth Through Common Stocks","D_BOOK","book",4,"Prentice-Hall","","year","1960","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),
    s("philip-fisher","item","Conservative Investors Sleep Well","D_BOOK","book",4,"Harper & Row","","year","1975","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),
    s("philip-fisher","item","Developing an Investment Philosophy","D_BOOK","book",4,"Financial Analysts Research Foundation","","year","1980","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),

    # ---- Greenblatt
    s("joel-greenblatt","item","You Can Be a Stock Market Genius","D_BOOK","book",4,"Simon & Schuster","","year","1997","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),
    s("joel-greenblatt","item","The Little Book That Beats the Market","D_BOOK","book",4,"Wiley","","year","2005","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Reissued 2010 as The Little Book That Still Beats the Market - separate edition row"),
    s("joel-greenblatt","item","Common Sense","D_BOOK","book",4,"Columbia Business School Publishing","","year","2020","","LINK_ONLY","METADATA_ONLY","UNVERIFIED"),
    s("joel-greenblatt","item","Columbia class notes (audited 2002-2006)","F_SECONDARY","class_notes",6,"Focused Compounding (mirror)","","year","2002-2006","https://focusedcompounding.com/wp-content/uploads/2018/03/Joel-Greenblatt-Class.pdf","REVIEW_REQUIRED","BLOCKED","UNVERIFIED",notes="Student notes from a private course. Attribution would be PARAPHRASED at best. Likely BLOCKED"),
    s("joel-greenblatt","item","The Knowledge Project: Joel Greenblatt","B_SPOKEN","podcast_episode",2,"Farnam Street","","year","","https://fs.blog/knowledge-project-podcast/joel-greenblatt/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","TRUE","TRUE",notes="Clean first-party alternative to the class notes"),

    # ---- Templeton
    s("john-templeton","item","Templeton Prize address","A_WRITING","speech",1,"Templeton Prize","1985-05-14","day","1985","https://www.templetonprize.org/laureate-sub/hardy-templeton-speech/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Strongest verified Tier 1 primary artifact in his own voice"),
    s("john-templeton","series","John Templeton Foundation","F_SECONDARY","news_article",6,"John Templeton Foundation","","year","","https://www.templeton.org/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="News, guest essays, Templeton Ideas podcast - MOSTLY BY OTHERS, not by Templeton"),
    s("john-templeton","item","Oxford doctoral thesis on Templeton","E_ARCHIVE","academic_paper",5,"University of Oxford (ORA)","","year","","https://ora.ox.ac.uk/objects/uuid:d4738b73-0a52-4f0c-96a1-89e134d3ae98/files/rnv935423w","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED",notes="Open-access repository; check licence, may permit fuller use"),
    s("john-templeton","item","The Humble Approach","D_BOOK","book",4,"Seabury Press","","year","1981","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Internet Archive copy is lending-restricted"),
    s("john-templeton","item","Worldwide Laws of Life","D_BOOK","book",4,"Templeton Foundation Press","","year","1997","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Internet Archive copy is lending-restricted"),

    # ---- Simons
    s("jim-simons","item","Jim Simons on his career in mathematics (interview with Jeff Cheeger)","B_SPOKEN","oral_history",2,"Simons Foundation","2012-09-28","day","2012","https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","FALSE","TRUE","TRUE","Indexed into 35 video chapters"),
    s("jim-simons","item","Jim Simons reflects on his career in mathematics (republished)","B_SPOKEN","oral_history",2,"Simons Foundation","2024-05-14","day","2024","https://www.simonsfoundation.org/2024/05/14/jim-simons-reflects-on-his-career-in-mathematics/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","FALSE","TRUE","TRUE","Same interview, second location - model as one source, two URLs"),
    s("jim-simons","item","AIP Oral History interview by David Zierler","B_SPOKEN","oral_history",5,"American Institute of Physics","","month","2020-12","https://celebratio.org/Simons_J/article/507/","REVIEW_REQUIRED","METADATA_ONLY","URL_RESOLVED","TRUE",notes="Formal oral-history programme; check AIP access terms"),
    s("jim-simons","series","Celebratio Mathematica: James Simons","E_ARCHIVE","finding_aid",5,"Celebratio Mathematica","","year","","https://celebratio.org/Simons_J/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Best single bibliographic hub for Simons"),
    s("jim-simons","item","Quant pioneer James Simons on math, money and philanthropy","B_SPOKEN","lecture",2,"MIT Sloan","","year","2019","https://mitsloan.mit.edu/ideas-made-to-matter/quant-pioneer-james-simons-math-money-and-philanthropy","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","FALSE","FALSE","TRUE"),
    s("jim-simons","item","Remembering the life and careers of Jim Simons","F_SECONDARY","news_article",6,"Institute for Advanced Study","","year","2024","https://www.ias.edu/news/remembering-life-and-careers-jim-simons","LINK_ONLY","METADATA_ONLY","URL_RESOLVED"),
    s("jim-simons","item","Renaissance Technologies founding date","F_SECONDARY","news_article",6,"multiple","","year","1978 or 1982","","REVIEW_REQUIRED","METADATA_ONLY","DISPUTED",notes="Sources conflict between 1978 and 1982. Do not resolve silently"),

    # ---- Klarman
    s("seth-klarman","item","Masters in Business: Seth Klarman (audio)","B_SPOKEN","podcast_episode",2,"Bloomberg","2026-06-18","day","2026","https://www.bloomberg.com/news/audio/2026-06-18/masters-in-business-seth-klarman-podcast","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","TRUE","TRUE","FALSE","The clean modern primary source - build the profile on this"),
    s("seth-klarman","item","Transcript: Seth Klarman","B_SPOKEN","podcast_episode",2,"ritholtz.com","2026-06-18","day","2026","https://ritholtz.com/2026/06/transcript-seth-klarman/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","TRUE",notes="First-party to the interviewer, so effectively Tier 2 not Tier 6"),
    s("seth-klarman","series","Baupost partner letters (circulating copies, c.1995-2001)","A_WRITING","partner_letter",1,"unauthorised distributions","","year","1995-2001","","REVIEW_REQUIRED","BLOCKED","DISPUTED",notes="Confidential LP communications. DO NOT INGEST, DO NOT LINK"),
    s("seth-klarman","item","Margin of Safety","D_BOOK","book",4,"HarperBusiness","","year","1991","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Out of print; extreme secondary-market prices"),
    s("seth-klarman","item","Security Analysis 6th edition (lead editor)","D_BOOK","book",4,"McGraw-Hill","","year","2008","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Documented Graham stewardship - strong investor_relations evidence"),
    s("seth-klarman","series","Baupost Group 13F filings","C_FILING","form_13f",3,"U.S. SEC","","year","","https://www.sec.gov/edgar/search/","PUBLIC_DOMAIN","FULL_TEXT_STORED","FIRST_PARTY_CONFIRMED"),

    # ---- Druckenmiller
    s("stanley-druckenmiller","item","CNBC Delivering Alpha interview with Joe Kernen","B_SPOKEN","interview",2,"CNBC","2022-09-28","day","2022","https://nbcuniversalnewsgroup.com/cnbc/2022/09/28/cnbc-transcript-duquesne-family-office-chairman-ceo-stanley-druckenmiller-speaks-with-cnbcs-joe-kernen-live-during-the-cnbc-delivering-alpha-conference-today/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","TRUE","FALSE","TRUE","Video also at https://www.youtube.com/watch?v=IMeuzvzToPQ"),
    s("stanley-druckenmiller","item","CNBC Squawk Box exclusive interview","B_SPOKEN","interview",2,"CNBC","2024-05-07","day","2024","https://www.cnbc.com/2024/05/07/cnbc-exclusive-cnbc-transcript-billionaire-investor-stanley-druckenmiller-speaks-with-cnbcs-squawk-box-today.html","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","TRUE","FALSE","TRUE"),
    s("stanley-druckenmiller","item","Bloomberg interview with Sonali Basak","B_SPOKEN","interview",2,"Bloomberg","2024-10-16","day","2024","https://podcasts.apple.com/us/podcast/duquesne-family-office-chairman-and-chief-executive/id1690236827?i=1000673335724","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","FALSE","TRUE","FALSE"),
    s("stanley-druckenmiller","item","Hard Lessons: Stan Druckenmiller with Iliana Bouzali","B_SPOKEN","interview",2,"Morgan Stanley","2026-03-12","day","2026","https://www.morganstanley.com/insights/videos/hard-lessons/duquesne-stan-druckenmiller-iliana-bouzali","LINK_ONLY","METADATA_ONLY","URL_RESOLVED","FALSE","FALSE","TRUE","Extended version with bonus clips on Morgan Stanley's own site"),
    s("stanley-druckenmiller","series","Duquesne Family Office 13F filings","C_FILING","form_13f",3,"U.S. SEC","","year","","https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets","PUBLIC_DOMAIN","FULL_TEXT_STORED","FIRST_PARTY_CONFIRMED",notes="COVERAGE CAVEAT: long US equities only; omits FX, rates, commodities, shorts, derivatives"),

    # ---- Livermore
    s("jesse-livermore","item","Reminiscences of a Stock Operator (Project Gutenberg #60979)","D_BOOK","book",4,"Project Gutenberg","2019-12-20","day","1923","https://www.gutenberg.org/ebooks/60979","PUBLIC_DOMAIN","FULL_TEXT_STORED","FIRST_PARTY_CONFIRMED",notes="Public domain in the USA. jurisdiction=US. By Edwin Lefevre; narrator 'Larry Livingston'. FICTIONALISED_ATTRIBUTION"),
    s("jesse-livermore","item","Reminiscences of a Stock Operator (plain text)","D_BOOK","book_chapter",4,"Project Gutenberg","","year","1923","https://www.gutenberg.org/cache/epub/60979/pg60979.txt","PUBLIC_DOMAIN","FULL_TEXT_STORED","URL_RESOLVED",notes="Retains 1923 Doran copyright notice in front matter - annotate in rights_note"),
    s("jesse-livermore","item","Reminiscences of a Stock Operator (HTML)","D_BOOK","book",4,"Project Gutenberg","","year","1923","https://www.gutenberg.org/files/60979/60979-h/60979-h.htm","PUBLIC_DOMAIN","FULL_TEXT_STORED","URL_RESOLVED"),
    s("jesse-livermore","item","Reminiscences of a Stock Operator (Internet Archive record)","D_BOOK","book",4,"Internet Archive","","year","1923","https://archive.org/details/reminiscencesofs0000lefe","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Access-restricted-item: true. Catalog reference only; do not fetch _djvu.txt"),
    s("jesse-livermore","item","Reminiscences of a Stock Operator (Wikipedia)","F_SECONDARY","news_article",6,"Wikipedia","","year","","https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Confirms 1923 roman a clef by Edwin Lefevre; 2020 annotated edition separately in copyright"),
    s("jesse-livermore","item","How to Trade in Stocks","D_BOOK","book",4,"Duell, Sloan and Pearce","","year","1940","","LINK_ONLY","METADATA_ONLY","UNVERIFIED",notes="Livermore's own work - the correct source for attribution=DIRECT passages"),

    # ---- Cross-cutting infrastructure
    s("_infrastructure","item","EDGAR full-text search","C_FILING","finding_aid",3,"U.S. SEC","","year","2001-present","https://www.sec.gov/edgar/search/","PUBLIC_DOMAIN","FULL_TEXT_STORED","FIRST_PARTY_CONFIRMED",notes="Covers filings since 2001 only"),
    s("_infrastructure","item","SEC search filings landing","C_FILING","finding_aid",3,"U.S. SEC","","year","","https://www.sec.gov/search-filings","PUBLIC_DOMAIN","FULL_TEXT_STORED","URL_RESOLVED"),
    s("_infrastructure","item","Form 13F Data Sets (quarterly ZIPs)","C_FILING","form_13f",3,"U.S. SEC","2026-05-31","day","","https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets","PUBLIC_DOMAIN","FULL_TEXT_STORED","URL_RESOLVED",notes="Submission + cover-page + information tables. Latest listed: 2026 Mar-May (94.81MB)"),
    s("_infrastructure","item","EDGAR full-text search cluster endpoint","C_FILING","finding_aid",3,"U.S. SEC","","year","","https://efts.sec.gov/LATEST/search-index?q=","PUBLIC_DOMAIN","FULL_TEXT_STORED","UNVERIFIED",notes="Undocumented but public; requires descriptive User-Agent"),
    s("_infrastructure","item","SEC EDGAR data API description (licence statement)","C_FILING","finding_aid",3,"apis.io","","year","","https://apis.io/apis/sec-edgar/sec-edgar-full-text-search-api/","PUBLIC_DOMAIN","METADATA_ONLY","URL_RESOLVED",notes="Records licence as Public Domain (U.S. Government Work); notes User-Agent requirement"),
    s("_infrastructure","item","13F parsing guidance (fixed-width pre-Q3-2013)","F_SECONDARY","news_article",6,"edgartools docs","","year","","https://edgartools.readthedocs.io/en/stable/13f-filings/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Confirms pre-Q3-2013 13F filings use fixed-width TXT not XML"),
    s("_infrastructure","item","EDGAR API endpoint reference","F_SECONDARY","news_article",6,"EDGARScout","2026-07-31","day","2026","https://edgarscout.com/edgar-api/","LINK_ONLY","METADATA_ONLY","URL_RESOLVED",notes="Documents data.sec.gov submissions, companyfacts, companyconcept, frames endpoints"),
]
write("sources_catalog.csv", H, sources)


# ------------------------------------------------------------- rights matrix
rights = [
    ("berkshire_shareholder_letters","Berkshire Hathaway shareholder letters","1977-2024","US","LINK_ONLY","METADATA_ONLY","Published freely by Berkshire for shareholders and the public, but copyright retained. No licence obtained.","https://www.berkshirehathaway.com/letters/letters.html","2026-08-22"),
    ("berkshire_2025_letter","2025 letter to shareholders","2026 (Abel)","US","LINK_ONLY","METADATA_ONLY","Authored by Gregory E. Abel, not Buffett. Must not be attributed to Buffett.","https://www.berkshirehathaway.com/letters/2025ltr.pdf","2026-08-22"),
    ("cnbc_buffett_archive","CNBC Warren Buffett Archive","n/a","US","LINK_ONLY","METADATA_ONLY","Akamai bot protection is an explicit technical refusal of automated collection. Link deeply; do not route around.","https://buffett.cnbc.com/about-buffett/","2026-08-22"),
    ("munger_archive","Munger Archive recordings and transcripts","n/a","US","LINK_ONLY","METADATA_ONLY","Purpose-built preservation project; strong PERMISSION_GRANTED candidate. Until then, metadata plus timecoded excerpts.","https://mungerarchive.com/","2026-08-22"),
    ("munger_third_party_transcripts","Third-party Daily Journal transcripts","2013-2023","US","LINK_ONLY","METADATA_ONLY","Third-party transcription of public meetings, accuracy unverified, transcriber often unidentified. Cite and link only.","https://worldlypartners.com/charlie-munger-archive/","2026-08-22"),
    ("poor_charlies_almanack","Poor Charlie's Almanack","all editions","US","LINK_ONLY","METADATA_ONLY","In copyright, commercially available, multiple editions. Bibliographic entity only.","","2026-08-22"),
    ("oaktree_memos","Howard Marks memos","1990-present","US","LINK_ONLY","METADATA_ONLY","Freely published by Oaktree but copyright retained. Highest-value permission target: single author, single rightsholder, 160 documents.","https://www.oaktreecapital.com/insights/howard-marks-memos","2026-08-22"),
    ("bogle_archive","Bogle Archive materials","1964-2017","US","REVIEW_REQUIRED","METADATA_ONLY","Hosted by a non-profit with a dissemination mission after Vanguard discontinued its own archive in 2019. Likely PERMISSION_GRANTED.","https://boglecenter.net/bogle-archive/","2026-08-22"),
    ("bogle_congressional_testimony","Bogle congressional testimony","various","US","REVIEW_REQUIRED","METADATA_ONLY","Congressional records may be US Government works. Verify per item rather than assuming for the class.","https://boglecenter.net/bogle-archive/","2026-08-22"),
    ("bogle_index_xlsx","Bogle Archive index spreadsheet","published","US","REVIEW_REQUIRED","METADATA_ONLY","Published by the Bogle Center as a public index. Usable as a seed catalog; the underlying documents remain separately assessed.","https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx","2026-08-22"),
    ("fundsmith_letters","Fundsmith shareholder letters","2010-2026","UK","LINK_ONLY","METADATA_ONLY","Freely published, copyright retained. Good permission candidate; Investing for Growth shows comfort with collected republication.","https://www.fundsmith.co.uk/documents/","2026-08-22"),
    ("soros_essays","Soros essays on georgesoros.com","various","US","LINK_ONLY","METADATA_ONLY","Self-hosted, copyright retained. Original publisher may hold separate rights - record publication_venue.","https://www.georgesoros.com/essays/","2026-08-22"),
    ("psh_letters_reports","PSH letters, reports and presentations","various","UK","LINK_ONLY","METADATA_ONLY","Regulatory and investor disclosure published freely, copyright retained.","https://pershingsquareholdings.com/","2026-08-22"),
    ("sec_structured_data","SEC structured filing data (13F, 13D, XBRL, submissions)","all","US","PUBLIC_DOMAIN","FULL_TEXT_STORED","US Government works are not subject to copyright. Fair-access policy requires a descriptive User-Agent and conservative rate limiting.","https://apis.io/apis/sec-edgar/sec-edgar-full-text-search-api/","2026-08-22"),
    ("sec_exhibit_prose","Filer-authored EDGAR exhibit prose (e.g. Icahn DFAN14A letters)","all","US","REVIEW_REQUIRED","METADATA_ONLY","GREY AREA: the filing is a government record but the prose was written by the filer. Treat facts as public domain, prose as LINK_ONLY. Obtain counsel opinion.","https://www.sec.gov/Archives/edgar/data/1110803/000153949723000923/0001539497-23-000923-index.html","2026-08-22"),
    ("hbs_bridgewater_archives","HBS Baker Library Bridgewater Associates, LP Archives","1978-1996","US","LINK_ONLY","METADATA_ONLY","Access by application only. Not ingestible. Finding-aid description and factual holdings statements are publishable.","https://www.hbs.edu/news/releases/bridgewater-archives","2026-08-22"),
    ("bridgewater_research","Bridgewater research and insights","various","US","LINK_ONLY","METADATA_ONLY","Freely published by the firm, copyright retained.","https://www.bridgewater.com/research-and-insights","2026-08-22"),
    ("dalio_principles_pdf","Unofficial Principles PDF (cpcglobal.org)","Kindle conversion","US","REVIEW_REQUIRED","BLOCKED","Unauthorised conversion of a commercial ebook. Canonical example of 'do not automatically ingest a free PDF'.","","2026-08-22"),
    ("dalio_big_debt_crises","Big Debt Crises","official free edition","US","REVIEW_REQUIRED","METADATA_ONLY","Author has made this available at no cost through official channels. Verify the official edition before assuming LINK_ONLY - may be PERMISSION_GRANTED.","","2026-08-22"),
    ("pabrai_letters","Pabrai partner letters and meeting materials","2002-present","US","LINK_ONLY","METADATA_ONLY","Published openly by the manager himself. Provenance is FIRST_PARTY_CONFIRMED. Good permission candidate.","https://pabraifunds.com/letter-to-partner/","2026-08-22"),
    ("yale_endowment_reports","Yale endowment and financial reports","1985-present","US","LINK_ONLY","METADATA_ONLY","Institutional publications, copyright retained. Asset-allocation facts usable as data; prose is LINK_ONLY.","https://investments.yale.edu/","2026-08-22"),
    ("pbs_frontline_lynch","PBS Frontline Peter Lynch interview","1996","US","LINK_ONLY","METADATA_ONLY","Freely accessible broadcaster material, copyright retained. Short excerpt plus link.","https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html","2026-08-22"),
    ("graham_security_analysis_1934","Security Analysis","1st ed. 1934","US","REVIEW_REQUIRED","METADATA_ONLY","NOT public domain. Internet Archive copies are Access-restricted-item: true, lending only. Copyright renewed.","https://archive.org/details/securityanalysis0000grah","2026-08-22"),
    ("graham_security_analysis_modern","Security Analysis","6th/7th eds","US","LINK_ONLY","METADATA_ONLY","Substantially new copyrighted works with new commentary from contemporary investors. Separate edition rows required.","https://archive.org/details/grahamdoddssecur0000grah","2026-08-22"),
    ("graham_intelligent_investor","The Intelligent Investor","all editions","US","LINK_ONLY","METADATA_ONLY","In copyright. Zweig-annotated editions are unambiguously new works.","","2026-08-22"),
    ("graham_all_editions_nonus","Graham works","all editions","EU/UK/IN","REVIEW_REQUIRED","METADATA_ONLY","Non-US terms are calculated differently and US renewal formalities never applied. Requires separate per-jurisdiction determination.","","2026-08-22"),
    ("fisher_books","Philip Fisher books","all editions","US","LINK_ONLY","METADATA_ONLY","All in copyright. Bundled modern editions combine originally separate works - model as a distinct edition listing constituents.","","2026-08-22"),
    ("greenblatt_books","Joel Greenblatt books","all editions","US","LINK_ONLY","METADATA_ONLY","In copyright. Beats / Still Beats are separate editions with overlapping content - avoid double-counting concept attribution.","","2026-08-22"),
    ("greenblatt_class_notes","Columbia class notes","2002-2006","US","REVIEW_REQUIRED","BLOCKED","Student-taken notes from a private university course, not a Greenblatt publication. Attribution would be PARAPHRASED at best.","https://focusedcompounding.com/wp-content/uploads/2018/03/Joel-Greenblatt-Class.pdf","2026-08-22"),
    ("templeton_prize_address","Templeton Prize address","1985","US","LINK_ONLY","METADATA_ONLY","Published by the Templeton Prize organisation. His own words, precisely dated. Short excerpt plus link.","https://www.templetonprize.org/laureate-sub/hardy-templeton-speech/","2026-08-22"),
    ("templeton_foundation_content","John Templeton Foundation essays and podcast","current","US","LINK_ONLY","METADATA_ONLY","Mostly authored by others. Must NOT inherit attribution to Templeton by virtue of the domain.","https://www.templeton.org/","2026-08-22"),
    ("templeton_books","Templeton books on Internet Archive","various","US","LINK_ONLY","METADATA_ONLY","Lending-restricted. Catalog reference only.","","2026-08-22"),
    ("oxford_templeton_thesis","Oxford thesis on Templeton","n/a","UK","REVIEW_REQUIRED","METADATA_ONLY","Open-access institutional repository; specific licence must be checked but may permit fuller use.","https://ora.ox.ac.uk/objects/uuid:d4738b73-0a52-4f0c-96a1-89e134d3ae98/files/rnv935423w","2026-08-22"),
    ("aip_simons_oral_history","AIP Oral History interview with Jim Simons","2020","US","REVIEW_REQUIRED","METADATA_ONLY","Formal oral-history programme with defined access terms. One of few items where rights may be genuinely favourable.","https://celebratio.org/Simons_J/article/507/","2026-08-22"),
    ("simons_foundation_interview","Simons Foundation Cheeger interview","2012/2024","US","LINK_ONLY","METADATA_ONLY","Foundation-published, copyright retained. 35 indexed chapters map to timecoded passages.","https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/","2026-08-22"),
    ("baupost_letters","Baupost Group partner letters","c.1995-2001","US","REVIEW_REQUIRED","BLOCKED","Confidential communications to limited partners. Online copies are unauthorised distributions, not publications. Do not ingest or link.","","2026-08-22"),
    ("klarman_mib_2026","Masters in Business Klarman interview and transcript","2026","US","LINK_ONLY","METADATA_ONLY","Publisher-hosted with a first-party transcript. Metadata plus timecoded excerpt.","https://ritholtz.com/2026/06/transcript-seth-klarman/","2026-08-22"),
    ("klarman_margin_of_safety","Margin of Safety","1991","US","LINK_ONLY","METADATA_ONLY","In copyright, out of print. Bibliographic entity only. Scarcity is not a licence.","","2026-08-22"),
    ("cnbc_transcripts","CNBC interview transcripts","various","US","LINK_ONLY","METADATA_ONLY","Broadcaster-published first-party transcripts. Tier 2. Short dated excerpts plus link.","https://www.cnbc.com/2024/05/07/cnbc-exclusive-cnbc-transcript-billionaire-investor-stanley-druckenmiller-speaks-with-cnbcs-squawk-box-today.html","2026-08-22"),
    ("morgan_stanley_hard_lessons","Morgan Stanley Hard Lessons interview","2026","US","LINK_ONLY","METADATA_ONLY","Firm-published video with an extended first-party cut. Short dated excerpt plus link.","https://www.morganstanley.com/insights/videos/hard-lessons/duquesne-stan-druckenmiller-iliana-bouzali","2026-08-22"),
    ("reminiscences_gutenberg","Reminiscences of a Stock Operator","1923 (Gutenberg #60979)","US","PUBLIC_DOMAIN","FULL_TEXT_STORED","Public domain in the USA per Project Gutenberg. THE ONLY full-text case in the corpus. Note the 1923 Doran notice reproduced in front matter is not evidence of current protection.","https://www.gutenberg.org/ebooks/60979","2026-08-22"),
    ("reminiscences_nonus","Reminiscences of a Stock Operator","1923","EU/UK/IN","REVIEW_REQUIRED","METADATA_ONLY","Gutenberg instructs non-US readers to check local law. Separate per-jurisdiction determination required before serving full text outside the US.","https://www.gutenberg.org/cache/epub/60979/pg60979.txt","2026-08-22"),
    ("reminiscences_annotated","Reminiscences of a Stock Operator (Annotated Edition)","2020","US","LINK_ONLY","METADATA_ONLY","New annotations and the bundled Livermore Market Key are separately copyrighted. Distinct edition row.","https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator","2026-08-22"),
    ("reminiscences_ia","Reminiscences of a Stock Operator (Internet Archive)","various","US","LINK_ONLY","METADATA_ONLY","Access-restricted-item: true. Catalog reference only; never fetch the _djvu.txt derivative.","https://archive.org/details/reminiscencesofs0000lefe","2026-08-22"),
    ("livermore_how_to_trade","How to Trade in Stocks","1940","US","LINK_ONLY","METADATA_ONLY","Livermore's own work, in copyright. The correct source for attribution=DIRECT passages.","","2026-08-22"),
]
write("rights_matrix.csv",
      ["material_class","work_title","edition","jurisdiction","rights_status","usage_status","reasoning","evidence_url","decided_on"],
      rights)


# ----------------------------------------------------------------- concepts
concepts = [
    ("margin_of_safety","Margin of safety","Buy at a sufficient discount to conservatively estimated intrinsic value that error and bad luck are survivable.","benjamin-graham",1934,"Graham's formulation; popularised by Buffett; used as a book title by Klarman. Do not flatten the lineage."),
    ("mr_market","Mr. Market","Personification of the market as a manic-depressive counterparty who offers prices you may accept or ignore.","benjamin-graham",1949,"Graham's allegory; most widely quoted through Buffett."),
    ("intrinsic_value","Intrinsic value","The discounted value of the cash that can be taken out of a business over its life.","benjamin-graham",1934,"Refined substantially by Buffett."),
    ("defensive_investor","Defensive investor","The investor optimising for freedom from effort and error rather than for maximum return.","benjamin-graham",1949,""),
    ("enterprising_investor","Enterprising investor","The investor willing to devote effort and analysis in pursuit of above-average results.","benjamin-graham",1949,""),
    ("net_current_asset_value","Net current asset value","Current assets less all liabilities, used as a conservative floor valuation.","benjamin-graham",1934,"Basis of what Buffett later called cigar-butt investing."),
    ("cigar_butt_investing","Cigar-butt investing","Buying poor businesses cheap enough for one last free puff of value.","warren-buffett",0,"Buffett's retrospective term for Graham's deep-value method; he has described growing out of it."),
    ("circle_of_competence","Circle of competence","Restricting decisions to domains where you have a genuine analytical edge.","warren-buffett",0,"Jointly developed with Munger."),
    ("moat","Economic moat","Durable structural advantage protecting returns on capital from competition.","warren-buffett",0,""),
    ("owner_earnings","Owner earnings","Reported earnings plus non-cash charges less true maintenance capital expenditure.","warren-buffett",0,"Terry Smith has an independent formulation."),
    ("float","Insurance float","Premiums held before claims are paid, usable as low- or negative-cost investable capital.","warren-buffett",0,""),
    ("fortress_balance_sheet","Fortress balance sheet","Maintaining liquidity and minimal debt so obligations are met under the most adverse conditions.","warren-buffett",0,"Phrasing now carried forward by Greg Abel in the 2025 Berkshire letter."),
    ("mental_models","Latticework of mental models","A cross-disciplinary set of models used together to assess a situation.","charlie-munger",0,""),
    ("psychology_of_human_misjudgment","Psychology of human misjudgment","A catalogue of systematic cognitive and incentive-driven errors affecting decisions.","charlie-munger",0,"From the Harvard-Westlake address."),
    ("inversion","Inversion","Solving a problem by asking what would guarantee failure and avoiding that.","charlie-munger",0,""),
    ("lollapalooza_effect","Lollapalooza effect","Several biases or forces acting in the same direction to produce extreme outcomes.","charlie-munger",0,""),
    ("incentive_caused_bias","Incentive-caused bias","Systematic distortion of judgement by the incentives acting on the judge.","charlie-munger",0,""),
    ("sit_on_your_ass_investing","Sit-on-your-ass investing","Holding a small number of excellent businesses for very long periods and doing very little.","charlie-munger",0,""),
    ("second_level_thinking","Second-level thinking","Reasoning about what other participants believe and have already priced, not just about the facts.","howard-marks",0,""),
    ("market_cycles","Market cycles","Recurring but non-periodic oscillations in fundamentals, psychology and credit availability.","howard-marks",2018,""),
    ("pendulum_of_investor_psychology","Pendulum of investor psychology","Sentiment swinging between greed and fear, rarely resting at the midpoint.","howard-marks",0,""),
    ("risk_is_not_volatility","Risk is not volatility","Risk is the probability of permanent loss, not the standard deviation of returns.","howard-marks",2011,""),
    ("calibrating_aggressiveness","Calibrating aggressiveness","Adjusting exposure to where the cycle stands rather than forecasting the cycle.","howard-marks",0,""),
    ("cost_matters_hypothesis","Cost matters hypothesis","Gross returns less costs equals net returns, so costs are the most reliable determinant of relative outcomes.","john-bogle",0,""),
    ("index_fund","Index fund","A fund holding the market portfolio at minimal cost rather than attempting selection.","john-bogle",1976,"Vanguard's First Index Investment Trust launched 1976."),
    ("tyranny_of_compounding_costs","Tyranny of compounding costs","Small recurring fees compounding into very large lifetime wealth reductions.","john-bogle",0,""),
    ("stay_the_course","Stay the course","Maintaining allocation through drawdowns rather than reacting to markets.","john-bogle",0,""),
    ("reflexivity","Reflexivity","Participants' biased perceptions alter the fundamentals they perceive, creating self-reinforcing then self-defeating processes.","george-soros",1987,"Advanced as philosophy, not technique. Do not flatten into a trading rule."),
    ("fallibility","Fallibility","All participants' understanding of their situation is inherently incomplete and distorted.","george-soros",1987,""),
    ("boom_bust_sequence","Boom-bust sequence","The characteristic asymmetric path of a reflexive process.","george-soros",1987,""),
    ("far_from_equilibrium","Far-from-equilibrium conditions","States in which reflexive feedback dominates and equilibrium assumptions fail.","george-soros",1987,""),
    ("scuttlebutt","Scuttlebutt","Investigating a company through its competitors, customers, suppliers and former employees.","philip-fisher",1958,"Fisher's most durable and genuinely original contribution."),
    ("fifteen_points","Fifteen points","Fisher's checklist for assessing whether a company merits long-term ownership.","philip-fisher",1958,""),
    ("tenbagger","Tenbagger","A holding that appreciates tenfold.","peter-lynch",1989,""),
    ("invest_in_what_you_know","Invest in what you know","Using everyday observation of products and businesses as a source of investable insight.","peter-lynch",1989,"Frequently over-simplified in secondary retellings."),
    ("lynch_six_categories","Lynch's six stock categories","Slow growers, stalwarts, fast growers, cyclicals, turnarounds and asset plays.","peter-lynch",1989,"One framework with six named children - use parent_concept_id."),
    ("peg_ratio","PEG ratio","Price/earnings relative to growth rate, used as a rough valuation screen.","peter-lynch",1989,"Popularised rather than strictly invented by Lynch."),
    ("magic_formula","Magic formula","Ranking companies jointly on earnings yield and return on capital.","joel-greenblatt",2005,""),
    ("special_situations","Special situations","Corporate events creating mispricing: spinoffs, mergers, restructurings, rights offerings, bankruptcies, recapitalisations.","joel-greenblatt",1997,"Parent of a clean six-child hierarchy."),
    ("spinoffs","Spinoffs","Newly separated subsidiaries subject to forced selling and analytical neglect.","joel-greenblatt",1997,""),
    ("stub_stocks","Stub stocks","Highly leveraged residual equity after a recapitalisation.","joel-greenblatt",1997,""),
    ("dhandho","Dhandho","Low-risk, high-uncertainty business endeavours; endeavours that create wealth while minimising risk.","mohnish-pabrai",2007,""),
    ("heads_i_win","Heads I win, tails I don't lose much","Structuring positions so downside is limited and upside is open.","mohnish-pabrai",2007,""),
    ("cloning","Cloning","Deliberately copying the demonstrated methods and positions of superior investors.","mohnish-pabrai",0,"Makes Pabrai's influenced_by edges self-stated and high-confidence."),
    ("spawners","Spawners","Businesses that repeatedly generate new large businesses from within.","mohnish-pabrai",0,""),
    ("risk_parity","Risk parity","Allocating by risk contribution rather than by capital, to balance exposure across environments.","ray-dalio",0,""),
    ("all_weather_portfolio","All Weather portfolio","A portfolio constructed to perform acceptably across growth and inflation regimes.","ray-dalio",0,""),
    ("radical_transparency","Radical transparency","Recording and exposing disagreement and error to improve institutional decision quality.","ray-dalio",2017,""),
    ("idea_meritocracy","Idea meritocracy","Weighting opinions by demonstrated credibility rather than by hierarchy.","ray-dalio",2017,""),
    ("believability_weighted_decision_making","Believability-weighted decision making","Aggregating views in proportion to each participant's track record in the relevant domain.","ray-dalio",2017,""),
    ("long_term_debt_cycle","Long-term debt cycle","Multi-decade accumulation and deleveraging of debt driving major economic regime shifts.","ray-dalio",0,""),
    ("beautiful_deleveraging","Beautiful deleveraging","A deleveraging balanced enough that debt falls relative to income without severe contraction.","ray-dalio",0,""),
    ("changing_world_order","Changing world order","Cyclical rise and decline of reserve-currency empires.","ray-dalio",2021,""),
    ("endowment_model","Endowment model","Equity-biased, heavily diversified, illiquidity-tolerant institutional portfolio construction.","david-swensen",2000,""),
    ("illiquidity_premium","Illiquidity premium","Excess return available for accepting reduced liquidity, exploitable by perpetual capital.","david-swensen",2000,""),
    ("manager_selection","Manager selection","Treating the choice of external managers as the primary active decision.","david-swensen",2000,""),
    ("active_management_paradox","Active management paradox","Yale should be active while individuals should not - Swensen argued both.","david-swensen",2005,"Deliberate asymmetry between Pioneering Portfolio Management and Unconventional Success."),
    ("point_of_maximum_pessimism","Point of maximum pessimism","Buying when sentiment is worst, because that is when prices embed the least optimism.","john-templeton",0,"Well-attested but largely documented through secondary sources - coinage_source_id NULL."),
    ("global_diversification","Global diversification","Searching for value across countries rather than within one market.","john-templeton",0,"Templeton pioneered international diversification for American investors."),
    ("humility_in_investing","Humility in investing","Treating the limits of one's own knowledge as the central discipline.","john-templeton",1985,"Grounded in the 1985 Templeton Prize address."),
    ("quantitative_investing","Quantitative investing","Systematic, statistically derived trading rules applied without narrative discretion.","jim-simons",0,""),
    ("statistical_arbitrage","Statistical arbitrage","Exploiting short-horizon statistical relationships across large numbers of instruments.","jim-simons",0,""),
    ("hire_scientists_not_financiers","Hire scientists, not financiers","Staffing an investment firm with mathematicians and physicists rather than market practitioners.","jim-simons",0,""),
    ("absolute_return","Absolute return","Measuring success against capital preservation and positive return, not against an index.","seth-klarman",1991,""),
    ("holding_cash_as_a_position","Holding cash as a position","Treating large cash balances as an active choice rather than a failure to invest.","seth-klarman",0,""),
    ("distressed_debt","Distressed debt","Buying obligations of troubled issuers where recovery analysis dominates.","seth-klarman",0,""),
    ("macro_investing","Macro investing","Expressing views on economies, currencies, rates and commodities rather than on individual businesses.","stanley-druckenmiller",0,""),
    ("concentrated_conviction","Concentrated conviction","Sizing very large when conviction is high and doing little otherwise.","stanley-druckenmiller",0,""),
    ("change_your_mind_fast","Change your mind fast","Reversing a position immediately when the facts change, without regard to prior commitment.","stanley-druckenmiller",0,"Central theme of the March 2026 Morgan Stanley interview."),
    ("liquidity_drives_markets","Liquidity drives markets","Central-bank and system liquidity as the dominant driver of asset prices.","stanley-druckenmiller",0,""),
    ("shareholder_activism","Shareholder activism","Taking a stake and campaigning publicly to force governance or capital-allocation change.","carl-icahn",0,""),
    ("proxy_fight","Proxy fight","Contesting board control through solicitation of shareholder votes.","carl-icahn",0,""),
    ("board_accountability","Board accountability","Treating entrenched boards as the primary source of persistent undervaluation.","carl-icahn",0,""),
    ("activist_investing","Activist investing","Concentrated positions combined with public advocacy as a catalyst.","bill-ackman",0,"Shared lineage with Icahn; different style."),
    ("asymmetric_risk_reward","Asymmetric risk/reward","Seeking structures where potential gain greatly exceeds defined loss.","bill-ackman",0,""),
    ("buy_good_companies","Buy good companies, don't overpay, do nothing","Fundsmith's three-clause investment policy.","terry-smith",2010,"Stated as a unified policy; model as one concept with three children if needed."),
    ("return_on_capital_employed","Return on capital employed","Central quality metric for identifying businesses worth owning indefinitely.","terry-smith",0,""),
    ("accounting_scepticism","Accounting scepticism","Systematic distrust of reported figures and of the incentives behind them.","terry-smith",1992,"Rooted in Accounting for Growth."),
    ("trend_following","Trend following","Trading in the direction of established price movement rather than against it.","jesse-livermore",1923,"Formulated in Lefevre's prose, not Livermore's. FICTIONALISED_ATTRIBUTION."),
    ("pivotal_points","Pivotal points","Price levels at which a move is confirmed and a position should be established.","jesse-livermore",1940,"From How to Trade in Stocks - genuinely Livermore's own."),
    ("livermore_market_key","Livermore Market Key","Livermore's own record-keeping and timing system.","jesse-livermore",1940,"Attribute to Livermore directly; modern annotated bundles are separately copyrighted."),
    ("sit_tight","Be right and sit tight","Once correctly positioned, the difficulty is holding rather than choosing.","jesse-livermore",1923,"Lefevre's phrasing. FICTIONALISED_ATTRIBUTION."),
    ("tape_reading","Tape reading","Inferring supply and demand from the sequence of prices and volumes.","jesse-livermore",1923,"Lefevre's rendering of a pre-SEC-era practice."),
]
write("concepts.csv",
      ["slug","label","definition","coined_by_investor_slug","coinage_year","attribution_note"],
      concepts)


# ---------------------------------------------------------------- companies
companies = [
    ("berkshire-hathaway","Berkshire Hathaway Inc.","BRK.A","US","Conglomerate",1839,"Buffett's vehicle from 1965; Abel CEO from 2026"),
    ("apple","Apple Inc.","AAPL","US","Technology",1976,"Largest Berkshire equity holding; named in the 2025 letter"),
    ("american-express","American Express Company","AXP","US","Financials",1850,"Long-held Berkshire position; ~22.1% owned per the 2025 letter"),
    ("coca-cola","The Coca-Cola Company","KO","US","Consumer staples",1892,"Canonical Buffett long-term holding"),
    ("kraft-heinz","The Kraft Heinz Company","KHC","US","Consumer staples",2015,"Berkshire ~27% stake; written down in 2025"),
    ("occidental-petroleum","Occidental Petroleum Corporation","OXY","US","Energy",1920,"Berkshire ~27% stake; $4.5bn writedown in Q4 2025"),
    ("geico","GEICO","","US","Insurance",1936,"Berkshire insurance subsidiary; underwriting cited in the 2025 letter"),
    ("bnsf","BNSF Railway","","US","Transportation",1849,"Berkshire subsidiary; +5.3% in Q4 2025"),
    ("daily-journal","Daily Journal Corporation","DJCO","US","Publishing",1888,"Munger chaired; venue for the Daily Journal meetings"),
    ("oaktree-capital","Oaktree Capital Management","","US","Asset management",1995,"Publisher of the Marks memos"),
    ("vanguard","The Vanguard Group","","US","Asset management",1975,"Bogle founded; discontinued its Bogle archive in 2019"),
    ("wellington-management","Wellington Management","","US","Asset management",1928,"Bogle's early career; source of the 1972 Wellington Fund memo"),
    ("fundsmith","Fundsmith LLP","","UK","Asset management",2010,"Terry Smith's firm"),
    ("pershing-square-holdings","Pershing Square Holdings Ltd.","PSH","UK/Guernsey","Investment trust",2012,"Ackman's listed vehicle"),
    ("pershing-square-capital","Pershing Square Capital Management","","US","Asset management",2004,""),
    ("icahn-enterprises","Icahn Enterprises L.P.","IEP","US","Holding company",1987,"CIK 0000813762"),
    ("illumina","Illumina, Inc.","ILMN","US","Healthcare",1998,"Target of Icahn's 2023 DFAN14A open letter; CIK 1110803"),
    ("herbalife","Herbalife Ltd.","HLF","US","Consumer",1980,"Centre of the 2013 Ackman-Icahn dispute"),
    ("bridgewater","Bridgewater Associates, LP","","US","Asset management",1975,"Daily Observations 1978-1996 now at HBS Baker Library"),
    ("baupost","The Baupost Group","","US","Asset management",1982,"Klarman's firm; partner letters are private"),
    ("duquesne-capital","Duquesne Capital Management","","US","Asset management",1981,"Closed 2010"),
    ("duquesne-family-office","Duquesne Family Office","","US","Family office",2010,"Files 13F; long US equity only"),
    ("quantum-fund","Quantum Fund","","US","Hedge fund",1973,"Soros and Druckenmiller; the 1992 sterling trade"),
    ("soros-fund-management","Soros Fund Management","","US","Family office",1970,"Converted to family office 2011"),
    ("renaissance-technologies","Renaissance Technologies","","US","Asset management",0,"Founding year DISPUTED: sources give 1978 and 1982"),
    ("simons-foundation","Simons Foundation","","US","Philanthropy",1994,"Founded with Marilyn Simons"),
    ("fidelity-magellan","Fidelity Magellan Fund","FMAGX","US","Mutual fund",1963,"Lynch managed 1977-1990"),
    ("fidelity-investments","Fidelity Investments","","US","Asset management",1946,"Holds the unpublished Magellan-era institutional record"),
    ("graham-newman","Graham-Newman Corporation","","US","Investment partnership",1926,"Graham's firm; Buffett worked there"),
    ("gotham-capital","Gotham Capital","","US","Asset management",1985,"Greenblatt; early record predates EDGAR"),
    ("gotham-asset-management","Gotham Asset Management","","US","Asset management",2008,"Files 13F"),
    ("pabrai-funds","Pabrai Investment Funds","","US","Asset management",1999,"Publishes LP letters openly"),
    ("templeton-growth-fund","Templeton Growth Fund","","Canada/US","Mutual fund",1954,"Acquired by Franklin Resources 1992"),
    ("franklin-templeton","Franklin Templeton","BEN","US","Asset management",1947,"Holds the Templeton institutional history"),
    ("yale-endowment","Yale University Endowment","","US","Endowment",1718,"Swensen CIO 1985-2021"),
    ("fisher-and-company","Fisher & Company","","US","Investment management",1931,"Philip Fisher's firm"),
    ("jpmorgan","JPMorgan Chase & Co.","JPM","US","Financials",1799,"Todd Combs joined December 2025"),
    ("morgan-stanley","Morgan Stanley","MS","US","Financials",1935,"Publisher of the 2026 Druckenmiller Hard Lessons interview"),
    ("cnbc","CNBC","","US","Media",1989,"Holds the Buffett video archive; publishes first-party transcripts"),
    ("bloomberg","Bloomberg L.P.","","US","Media",1981,"Masters in Business; the 2026 Klarman interview"),
    ("natera","Natera, Inc.","NTRA","US","Healthcare",2004,"Reported largest Duquesne Family Office position, Q1 2026"),
    ("museum-of-american-finance","Museum of American Finance","","US","Museum",1988,"Smithsonian affiliate; holds the Marks memo collection"),
    ("hbs-baker-library","HBS Baker Library Special Collections","","US","Archive",1908,"Opened the Bridgewater Archives on 2026-02-27"),
    ("project-gutenberg","Project Gutenberg","","US","Digital library",1971,"Source of the only full-text public-domain work in the corpus"),
    ("internet-archive","Internet Archive","","US","Digital library",1996,"Catalog reference; most relevant books are lending-restricted"),
]
write("companies.csv",
      ["slug","name","ticker","country","sector","founded_year","notes"],
      companies)


# ------------------------------------------------------------------- events
events = [
    ("great-depression","Great Depression","crisis","1929-10-24","1939-12-31","day","Global","Context for Graham's Security Analysis (1934) and the end of Livermore's career"),
    ("securities-act-1933","Securities Act of 1933","regulatory","1933-05-27","","day","US","Beginning of the modern disclosure regime"),
    ("sec-created-1934","SEC created","regulatory","1934-06-06","","day","US","Everything before this is unauditable - relevant to Livermore"),
    ("security-analysis-published","Security Analysis published","firm_milestone","1934-01-01","","year","US","Graham and Dodd; foundational text of the corpus"),
    ("templeton-growth-founded","Templeton Growth Fund founded","firm_milestone","1954-01-01","","year","Canada","Pioneering international diversification for US investors"),
    ("common-stocks-published","Common Stocks and Uncommon Profits published","firm_milestone","1958-01-01","","year","US","Fisher; origin of scuttlebutt"),
    ("buffett-berkshire-control","Buffett takes control of Berkshire Hathaway","firm_milestone","1965-01-01","","year","US",""),
    ("nifty-fifty","Nifty Fifty bubble","bubble","1969-01-01","1973-12-31","year","US",""),
    ("vanguard-founded","Vanguard founded","firm_milestone","1975-01-01","","year","US","Bogle"),
    ("first-index-trust","First Index Investment Trust launched","firm_milestone","1976-01-01","","year","US","The first retail index fund"),
    ("buffett-first-letter","Buffett's first published Berkshire letter","firm_milestone","1977-01-01","","year","US","Start of the letters series on berkshirehathaway.com"),
    ("bridgewater-observations-start","Bridgewater Daily Observations begin","firm_milestone","1978-01-01","","year","US","Earliest material in the HBS collection"),
    ("latin-american-debt-crisis","Latin American debt crisis","crisis","1982-01-01","1989-12-31","year","Latin America","Documented in the HBS Bridgewater collection"),
    ("baupost-founded","Baupost Group founded","firm_milestone","1982-01-01","","year","US","Klarman"),
    ("gotham-founded","Gotham Capital founded","firm_milestone","1985-01-01","","year","US","Greenblatt"),
    ("swensen-yale-start","Swensen becomes Yale CIO","firm_milestone","1985-01-01","","year","US","Tenure ran to 2021"),
    ("templeton-prize-address","Templeton's Templeton Prize address","firm_milestone","1985-05-14","","day","UK","His strongest verified primary artifact"),
    ("black-monday-1987","Black Monday","crash","1987-10-19","","day","Global","Documented in the HBS Bridgewater collection"),
    ("one-up-published","One Up on Wall Street published","firm_milestone","1989-01-01","","year","US","Lynch"),
    ("lynch-leaves-magellan","Lynch leaves Magellan","firm_milestone","1990-01-01","","year","US","Ends the era for which no electronic holdings record exists"),
    ("marks-first-memo","Marks writes 'The Route To Performance'","firm_milestone","1990-10-12","","day","US","First memo; start of a 35-year unbroken series"),
    ("margin-of-safety-published","Margin of Safety published","firm_milestone","1991-01-01","","year","US","Klarman; long out of print"),
    ("black-wednesday-1992","Black Wednesday","crisis","1992-09-16","","day","UK","Soros and Druckenmiller; in the HBS Bridgewater collection"),
    ("franklin-acquires-templeton","Franklin acquires Templeton","firm_milestone","1992-01-01","","year","US",""),
    ("berkshire-video-begins","Berkshire begins recording annual meetings","firm_milestone","1994-01-01","","year","US","Initially for internal use; the floor of the CNBC archive"),
    ("bond-collapse-1994","1994 bond market collapse","crisis","1994-01-01","1994-12-31","year","Global","Documented in the HBS Bridgewater collection"),
    ("simons-foundation-founded","Simons Foundation founded","firm_milestone","1994-01-01","","year","US","With Marilyn Simons"),
    ("asian-financial-crisis","Asian financial crisis","crisis","1997-07-02","1998-12-31","day","Asia",""),
    ("stock-market-genius-published","You Can Be a Stock Market Genius published","firm_milestone","1997-01-01","","year","US","Greenblatt"),
    ("pabrai-funds-founded","Pabrai Investment Funds founded","firm_milestone","1999-01-01","","year","US",""),
    ("pioneering-portfolio-published","Pioneering Portfolio Management published","firm_milestone","2000-01-01","","year","US","Swensen; the endowment model"),
    ("dotcom-bubble","Dot-com bubble and bust","bubble","1995-01-01","2002-10-09","day","Global",""),
    ("edgar-fulltext-coverage-begins","EDGAR full-text search coverage begins","regulatory","2001-01-01","","year","US","Hard floor for filing-text discovery"),
    ("gfc-2008","Global financial crisis","crisis","2007-08-01","2009-03-09","day","Global",""),
    ("security-analysis-6th","Security Analysis 6th edition published","firm_milestone","2008-01-01","","year","US","Klarman lead editor - documented Graham stewardship"),
    ("simons-retires","Simons retires from Renaissance","firm_milestone","2009-01-01","","year","US",""),
    ("duquesne-capital-closes","Duquesne Capital closes","firm_milestone","2010-01-01","","year","US","Becomes a family office"),
    ("fundsmith-launched","Fundsmith Equity Fund launched","firm_milestone","2010-01-01","","year","UK","First annual letter 2010"),
    ("soros-family-office","Soros Fund Management becomes a family office","firm_milestone","2011-01-01","","year","US","Breaks 13F continuity"),
    ("13f-xml-transition","13F filings move to XML","regulatory","2013-07-01","","month","US","Pre-Q3-2013 filings are fixed-width TXT"),
    ("herbalife-dispute","Ackman-Icahn Herbalife dispute","firm_milestone","2013-01-01","","year","US","Adversarial investor_relations edge"),
    ("munger-video-floor","Earliest surviving Daily Journal meeting video","firm_milestone","2015-01-01","","year","US","Nothing survives for 2014 or earlier"),
    ("covid-crash-2020","COVID-19 market crash","crash","2020-02-20","2020-03-23","day","Global",""),
    ("swensen-dies","David Swensen dies","firm_milestone","2021-05-05","","day","US",""),
    ("abel-named-successor","Greg Abel named Buffett's successor","firm_milestone","2021-01-01","","year","US",""),
    ("inflation-shock-2022","2022 inflation shock and rate cycle","macro","2022-01-01","2023-12-31","year","Global","Context for Druckenmiller's September 2022 remarks"),
    ("munger-dies","Charlie Munger dies","firm_milestone","2023-11-28","","day","US","Aged 99; 2023 was his last Daily Journal meeting"),
    ("simons-dies","Jim Simons dies","firm_milestone","2024-05-10","","day","US",""),
    ("bogle-archive-discontinued","Vanguard discontinues its Bogle archive","firm_milestone","2019-01-01","","year","US","Material rescued by the Bogle Center"),
    ("marks-35th-anniversary","Marks memos 35th anniversary; Complete Collection released","firm_milestone","2025-10-14","","day","US","Memos also accessioned by the Museum of American Finance"),
    ("buffett-thanksgiving-letter","Buffett's 'going quiet' Thanksgiving letter","firm_milestone","2025-11-10","","day","US","Announces handover of the annual report to Abel"),
    ("buffett-steps-down","Buffett steps down as Berkshire CEO","firm_milestone","2025-12-31","","day","US","Remains Chairman"),
    ("hbs-bridgewater-archive-opens","HBS opens the Bridgewater Associates, LP Archives","firm_milestone","2026-02-27","","day","US","Daily Observations 1978-1996; access by application"),
    ("abel-first-letter","Abel's first annual shareholder letter","firm_milestone","2026-02-28","","day","US","Authorship change in the Berkshire letter series"),
    ("druckenmiller-hard-lessons","Druckenmiller Morgan Stanley 'Hard Lessons' interview","firm_milestone","2026-03-12","","day","US","Retrospective on his own decision process"),
    ("klarman-mib","Klarman's Masters in Business interview","firm_milestone","2026-06-18","","day","US","His cleanest modern primary source"),
]
write("events.csv",
      ["slug","label","event_type","start_date","end_date","date_precision","region","description"],
      events)

print("done")
```

---

# SOURCE FILE: `data/companies.csv`

```csv
slug,name,ticker,country,sector,founded_year,notes
berkshire-hathaway,Berkshire Hathaway Inc.,BRK.A,US,Conglomerate,1839,Buffett's vehicle from 1965; Abel CEO from 2026
apple,Apple Inc.,AAPL,US,Technology,1976,Largest Berkshire equity holding; named in the 2025 letter
american-express,American Express Company,AXP,US,Financials,1850,Long-held Berkshire position; ~22.1% owned per the 2025 letter
coca-cola,The Coca-Cola Company,KO,US,Consumer staples,1892,Canonical Buffett long-term holding
kraft-heinz,The Kraft Heinz Company,KHC,US,Consumer staples,2015,Berkshire ~27% stake; written down in 2025
occidental-petroleum,Occidental Petroleum Corporation,OXY,US,Energy,1920,Berkshire ~27% stake; $4.5bn writedown in Q4 2025
geico,GEICO,,US,Insurance,1936,Berkshire insurance subsidiary; underwriting cited in the 2025 letter
bnsf,BNSF Railway,,US,Transportation,1849,Berkshire subsidiary; +5.3% in Q4 2025
daily-journal,Daily Journal Corporation,DJCO,US,Publishing,1888,Munger chaired; venue for the Daily Journal meetings
oaktree-capital,Oaktree Capital Management,,US,Asset management,1995,Publisher of the Marks memos
vanguard,The Vanguard Group,,US,Asset management,1975,Bogle founded; discontinued its Bogle archive in 2019
wellington-management,Wellington Management,,US,Asset management,1928,Bogle's early career; source of the 1972 Wellington Fund memo
fundsmith,Fundsmith LLP,,UK,Asset management,2010,Terry Smith's firm
pershing-square-holdings,Pershing Square Holdings Ltd.,PSH,UK/Guernsey,Investment trust,2012,Ackman's listed vehicle
pershing-square-capital,Pershing Square Capital Management,,US,Asset management,2004,
icahn-enterprises,Icahn Enterprises L.P.,IEP,US,Holding company,1987,CIK 0000813762
illumina,"Illumina, Inc.",ILMN,US,Healthcare,1998,Target of Icahn's 2023 DFAN14A open letter; CIK 1110803
herbalife,Herbalife Ltd.,HLF,US,Consumer,1980,Centre of the 2013 Ackman-Icahn dispute
bridgewater,"Bridgewater Associates, LP",,US,Asset management,1975,Daily Observations 1978-1996 now at HBS Baker Library
baupost,The Baupost Group,,US,Asset management,1982,Klarman's firm; partner letters are private
duquesne-capital,Duquesne Capital Management,,US,Asset management,1981,Closed 2010
duquesne-family-office,Duquesne Family Office,,US,Family office,2010,Files 13F; long US equity only
quantum-fund,Quantum Fund,,US,Hedge fund,1973,Soros and Druckenmiller; the 1992 sterling trade
soros-fund-management,Soros Fund Management,,US,Family office,1970,Converted to family office 2011
renaissance-technologies,Renaissance Technologies,,US,Asset management,0,Founding year DISPUTED: sources give 1978 and 1982
simons-foundation,Simons Foundation,,US,Philanthropy,1994,Founded with Marilyn Simons
fidelity-magellan,Fidelity Magellan Fund,FMAGX,US,Mutual fund,1963,Lynch managed 1977-1990
fidelity-investments,Fidelity Investments,,US,Asset management,1946,Holds the unpublished Magellan-era institutional record
graham-newman,Graham-Newman Corporation,,US,Investment partnership,1926,Graham's firm; Buffett worked there
gotham-capital,Gotham Capital,,US,Asset management,1985,Greenblatt; early record predates EDGAR
gotham-asset-management,Gotham Asset Management,,US,Asset management,2008,Files 13F
pabrai-funds,Pabrai Investment Funds,,US,Asset management,1999,Publishes LP letters openly
templeton-growth-fund,Templeton Growth Fund,,Canada/US,Mutual fund,1954,Acquired by Franklin Resources 1992
franklin-templeton,Franklin Templeton,BEN,US,Asset management,1947,Holds the Templeton institutional history
yale-endowment,Yale University Endowment,,US,Endowment,1718,Swensen CIO 1985-2021
fisher-and-company,Fisher & Company,,US,Investment management,1931,Philip Fisher's firm
jpmorgan,JPMorgan Chase & Co.,JPM,US,Financials,1799,Todd Combs joined December 2025
morgan-stanley,Morgan Stanley,MS,US,Financials,1935,Publisher of the 2026 Druckenmiller Hard Lessons interview
cnbc,CNBC,,US,Media,1989,Holds the Buffett video archive; publishes first-party transcripts
bloomberg,Bloomberg L.P.,,US,Media,1981,Masters in Business; the 2026 Klarman interview
natera,"Natera, Inc.",NTRA,US,Healthcare,2004,"Reported largest Duquesne Family Office position, Q1 2026"
museum-of-american-finance,Museum of American Finance,,US,Museum,1988,Smithsonian affiliate; holds the Marks memo collection
hbs-baker-library,HBS Baker Library Special Collections,,US,Archive,1908,Opened the Bridgewater Archives on 2026-02-27
project-gutenberg,Project Gutenberg,,US,Digital library,1971,Source of the only full-text public-domain work in the corpus
internet-archive,Internet Archive,,US,Digital library,1996,Catalog reference; most relevant books are lending-restricted
```

---

# SOURCE FILE: `data/concepts.csv`

```csv
slug,label,definition,coined_by_investor_slug,coinage_year,attribution_note
margin_of_safety,Margin of safety,Buy at a sufficient discount to conservatively estimated intrinsic value that error and bad luck are survivable.,benjamin-graham,1934,Graham's formulation; popularised by Buffett; used as a book title by Klarman. Do not flatten the lineage.
mr_market,Mr. Market,Personification of the market as a manic-depressive counterparty who offers prices you may accept or ignore.,benjamin-graham,1949,Graham's allegory; most widely quoted through Buffett.
intrinsic_value,Intrinsic value,The discounted value of the cash that can be taken out of a business over its life.,benjamin-graham,1934,Refined substantially by Buffett.
defensive_investor,Defensive investor,The investor optimising for freedom from effort and error rather than for maximum return.,benjamin-graham,1949,
enterprising_investor,Enterprising investor,The investor willing to devote effort and analysis in pursuit of above-average results.,benjamin-graham,1949,
net_current_asset_value,Net current asset value,"Current assets less all liabilities, used as a conservative floor valuation.",benjamin-graham,1934,Basis of what Buffett later called cigar-butt investing.
cigar_butt_investing,Cigar-butt investing,Buying poor businesses cheap enough for one last free puff of value.,warren-buffett,0,Buffett's retrospective term for Graham's deep-value method; he has described growing out of it.
circle_of_competence,Circle of competence,Restricting decisions to domains where you have a genuine analytical edge.,warren-buffett,0,Jointly developed with Munger.
moat,Economic moat,Durable structural advantage protecting returns on capital from competition.,warren-buffett,0,
owner_earnings,Owner earnings,Reported earnings plus non-cash charges less true maintenance capital expenditure.,warren-buffett,0,Terry Smith has an independent formulation.
float,Insurance float,"Premiums held before claims are paid, usable as low- or negative-cost investable capital.",warren-buffett,0,
fortress_balance_sheet,Fortress balance sheet,Maintaining liquidity and minimal debt so obligations are met under the most adverse conditions.,warren-buffett,0,Phrasing now carried forward by Greg Abel in the 2025 Berkshire letter.
mental_models,Latticework of mental models,A cross-disciplinary set of models used together to assess a situation.,charlie-munger,0,
psychology_of_human_misjudgment,Psychology of human misjudgment,A catalogue of systematic cognitive and incentive-driven errors affecting decisions.,charlie-munger,0,From the Harvard-Westlake address.
inversion,Inversion,Solving a problem by asking what would guarantee failure and avoiding that.,charlie-munger,0,
lollapalooza_effect,Lollapalooza effect,Several biases or forces acting in the same direction to produce extreme outcomes.,charlie-munger,0,
incentive_caused_bias,Incentive-caused bias,Systematic distortion of judgement by the incentives acting on the judge.,charlie-munger,0,
sit_on_your_ass_investing,Sit-on-your-ass investing,Holding a small number of excellent businesses for very long periods and doing very little.,charlie-munger,0,
second_level_thinking,Second-level thinking,"Reasoning about what other participants believe and have already priced, not just about the facts.",howard-marks,0,
market_cycles,Market cycles,"Recurring but non-periodic oscillations in fundamentals, psychology and credit availability.",howard-marks,2018,
pendulum_of_investor_psychology,Pendulum of investor psychology,"Sentiment swinging between greed and fear, rarely resting at the midpoint.",howard-marks,0,
risk_is_not_volatility,Risk is not volatility,"Risk is the probability of permanent loss, not the standard deviation of returns.",howard-marks,2011,
calibrating_aggressiveness,Calibrating aggressiveness,Adjusting exposure to where the cycle stands rather than forecasting the cycle.,howard-marks,0,
cost_matters_hypothesis,Cost matters hypothesis,"Gross returns less costs equals net returns, so costs are the most reliable determinant of relative outcomes.",john-bogle,0,
index_fund,Index fund,A fund holding the market portfolio at minimal cost rather than attempting selection.,john-bogle,1976,Vanguard's First Index Investment Trust launched 1976.
tyranny_of_compounding_costs,Tyranny of compounding costs,Small recurring fees compounding into very large lifetime wealth reductions.,john-bogle,0,
stay_the_course,Stay the course,Maintaining allocation through drawdowns rather than reacting to markets.,john-bogle,0,
reflexivity,Reflexivity,"Participants' biased perceptions alter the fundamentals they perceive, creating self-reinforcing then self-defeating processes.",george-soros,1987,"Advanced as philosophy, not technique. Do not flatten into a trading rule."
fallibility,Fallibility,All participants' understanding of their situation is inherently incomplete and distorted.,george-soros,1987,
boom_bust_sequence,Boom-bust sequence,The characteristic asymmetric path of a reflexive process.,george-soros,1987,
far_from_equilibrium,Far-from-equilibrium conditions,States in which reflexive feedback dominates and equilibrium assumptions fail.,george-soros,1987,
scuttlebutt,Scuttlebutt,"Investigating a company through its competitors, customers, suppliers and former employees.",philip-fisher,1958,Fisher's most durable and genuinely original contribution.
fifteen_points,Fifteen points,Fisher's checklist for assessing whether a company merits long-term ownership.,philip-fisher,1958,
tenbagger,Tenbagger,A holding that appreciates tenfold.,peter-lynch,1989,
invest_in_what_you_know,Invest in what you know,Using everyday observation of products and businesses as a source of investable insight.,peter-lynch,1989,Frequently over-simplified in secondary retellings.
lynch_six_categories,Lynch's six stock categories,"Slow growers, stalwarts, fast growers, cyclicals, turnarounds and asset plays.",peter-lynch,1989,One framework with six named children - use parent_concept_id.
peg_ratio,PEG ratio,"Price/earnings relative to growth rate, used as a rough valuation screen.",peter-lynch,1989,Popularised rather than strictly invented by Lynch.
magic_formula,Magic formula,Ranking companies jointly on earnings yield and return on capital.,joel-greenblatt,2005,
special_situations,Special situations,"Corporate events creating mispricing: spinoffs, mergers, restructurings, rights offerings, bankruptcies, recapitalisations.",joel-greenblatt,1997,Parent of a clean six-child hierarchy.
spinoffs,Spinoffs,Newly separated subsidiaries subject to forced selling and analytical neglect.,joel-greenblatt,1997,
stub_stocks,Stub stocks,Highly leveraged residual equity after a recapitalisation.,joel-greenblatt,1997,
dhandho,Dhandho,"Low-risk, high-uncertainty business endeavours; endeavours that create wealth while minimising risk.",mohnish-pabrai,2007,
heads_i_win,"Heads I win, tails I don't lose much",Structuring positions so downside is limited and upside is open.,mohnish-pabrai,2007,
cloning,Cloning,Deliberately copying the demonstrated methods and positions of superior investors.,mohnish-pabrai,0,Makes Pabrai's influenced_by edges self-stated and high-confidence.
spawners,Spawners,Businesses that repeatedly generate new large businesses from within.,mohnish-pabrai,0,
risk_parity,Risk parity,"Allocating by risk contribution rather than by capital, to balance exposure across environments.",ray-dalio,0,
all_weather_portfolio,All Weather portfolio,A portfolio constructed to perform acceptably across growth and inflation regimes.,ray-dalio,0,
radical_transparency,Radical transparency,Recording and exposing disagreement and error to improve institutional decision quality.,ray-dalio,2017,
idea_meritocracy,Idea meritocracy,Weighting opinions by demonstrated credibility rather than by hierarchy.,ray-dalio,2017,
believability_weighted_decision_making,Believability-weighted decision making,Aggregating views in proportion to each participant's track record in the relevant domain.,ray-dalio,2017,
long_term_debt_cycle,Long-term debt cycle,Multi-decade accumulation and deleveraging of debt driving major economic regime shifts.,ray-dalio,0,
beautiful_deleveraging,Beautiful deleveraging,A deleveraging balanced enough that debt falls relative to income without severe contraction.,ray-dalio,0,
changing_world_order,Changing world order,Cyclical rise and decline of reserve-currency empires.,ray-dalio,2021,
endowment_model,Endowment model,"Equity-biased, heavily diversified, illiquidity-tolerant institutional portfolio construction.",david-swensen,2000,
illiquidity_premium,Illiquidity premium,"Excess return available for accepting reduced liquidity, exploitable by perpetual capital.",david-swensen,2000,
manager_selection,Manager selection,Treating the choice of external managers as the primary active decision.,david-swensen,2000,
active_management_paradox,Active management paradox,Yale should be active while individuals should not - Swensen argued both.,david-swensen,2005,Deliberate asymmetry between Pioneering Portfolio Management and Unconventional Success.
point_of_maximum_pessimism,Point of maximum pessimism,"Buying when sentiment is worst, because that is when prices embed the least optimism.",john-templeton,0,Well-attested but largely documented through secondary sources - coinage_source_id NULL.
global_diversification,Global diversification,Searching for value across countries rather than within one market.,john-templeton,0,Templeton pioneered international diversification for American investors.
humility_in_investing,Humility in investing,Treating the limits of one's own knowledge as the central discipline.,john-templeton,1985,Grounded in the 1985 Templeton Prize address.
quantitative_investing,Quantitative investing,"Systematic, statistically derived trading rules applied without narrative discretion.",jim-simons,0,
statistical_arbitrage,Statistical arbitrage,Exploiting short-horizon statistical relationships across large numbers of instruments.,jim-simons,0,
hire_scientists_not_financiers,"Hire scientists, not financiers",Staffing an investment firm with mathematicians and physicists rather than market practitioners.,jim-simons,0,
absolute_return,Absolute return,"Measuring success against capital preservation and positive return, not against an index.",seth-klarman,1991,
holding_cash_as_a_position,Holding cash as a position,Treating large cash balances as an active choice rather than a failure to invest.,seth-klarman,0,
distressed_debt,Distressed debt,Buying obligations of troubled issuers where recovery analysis dominates.,seth-klarman,0,
macro_investing,Macro investing,"Expressing views on economies, currencies, rates and commodities rather than on individual businesses.",stanley-druckenmiller,0,
concentrated_conviction,Concentrated conviction,Sizing very large when conviction is high and doing little otherwise.,stanley-druckenmiller,0,
change_your_mind_fast,Change your mind fast,"Reversing a position immediately when the facts change, without regard to prior commitment.",stanley-druckenmiller,0,Central theme of the March 2026 Morgan Stanley interview.
liquidity_drives_markets,Liquidity drives markets,Central-bank and system liquidity as the dominant driver of asset prices.,stanley-druckenmiller,0,
shareholder_activism,Shareholder activism,Taking a stake and campaigning publicly to force governance or capital-allocation change.,carl-icahn,0,
proxy_fight,Proxy fight,Contesting board control through solicitation of shareholder votes.,carl-icahn,0,
board_accountability,Board accountability,Treating entrenched boards as the primary source of persistent undervaluation.,carl-icahn,0,
activist_investing,Activist investing,Concentrated positions combined with public advocacy as a catalyst.,bill-ackman,0,Shared lineage with Icahn; different style.
asymmetric_risk_reward,Asymmetric risk/reward,Seeking structures where potential gain greatly exceeds defined loss.,bill-ackman,0,
buy_good_companies,"Buy good companies, don't overpay, do nothing",Fundsmith's three-clause investment policy.,terry-smith,2010,Stated as a unified policy; model as one concept with three children if needed.
return_on_capital_employed,Return on capital employed,Central quality metric for identifying businesses worth owning indefinitely.,terry-smith,0,
accounting_scepticism,Accounting scepticism,Systematic distrust of reported figures and of the incentives behind them.,terry-smith,1992,Rooted in Accounting for Growth.
trend_following,Trend following,Trading in the direction of established price movement rather than against it.,jesse-livermore,1923,"Formulated in Lefevre's prose, not Livermore's. FICTIONALISED_ATTRIBUTION."
pivotal_points,Pivotal points,Price levels at which a move is confirmed and a position should be established.,jesse-livermore,1940,From How to Trade in Stocks - genuinely Livermore's own.
livermore_market_key,Livermore Market Key,Livermore's own record-keeping and timing system.,jesse-livermore,1940,Attribute to Livermore directly; modern annotated bundles are separately copyrighted.
sit_tight,Be right and sit tight,"Once correctly positioned, the difficulty is holding rather than choosing.",jesse-livermore,1923,Lefevre's phrasing. FICTIONALISED_ATTRIBUTION.
tape_reading,Tape reading,Inferring supply and demand from the sequence of prices and volumes.,jesse-livermore,1923,Lefevre's rendering of a pre-SEC-era practice.
```

---

# SOURCE FILE: `data/events.csv`

```csv
slug,label,event_type,start_date,end_date,date_precision,region,description
great-depression,Great Depression,crisis,1929-10-24,1939-12-31,day,Global,Context for Graham's Security Analysis (1934) and the end of Livermore's career
securities-act-1933,Securities Act of 1933,regulatory,1933-05-27,,day,US,Beginning of the modern disclosure regime
sec-created-1934,SEC created,regulatory,1934-06-06,,day,US,Everything before this is unauditable - relevant to Livermore
security-analysis-published,Security Analysis published,firm_milestone,1934-01-01,,year,US,Graham and Dodd; foundational text of the corpus
templeton-growth-founded,Templeton Growth Fund founded,firm_milestone,1954-01-01,,year,Canada,Pioneering international diversification for US investors
common-stocks-published,Common Stocks and Uncommon Profits published,firm_milestone,1958-01-01,,year,US,Fisher; origin of scuttlebutt
buffett-berkshire-control,Buffett takes control of Berkshire Hathaway,firm_milestone,1965-01-01,,year,US,
nifty-fifty,Nifty Fifty bubble,bubble,1969-01-01,1973-12-31,year,US,
vanguard-founded,Vanguard founded,firm_milestone,1975-01-01,,year,US,Bogle
first-index-trust,First Index Investment Trust launched,firm_milestone,1976-01-01,,year,US,The first retail index fund
buffett-first-letter,Buffett's first published Berkshire letter,firm_milestone,1977-01-01,,year,US,Start of the letters series on berkshirehathaway.com
bridgewater-observations-start,Bridgewater Daily Observations begin,firm_milestone,1978-01-01,,year,US,Earliest material in the HBS collection
latin-american-debt-crisis,Latin American debt crisis,crisis,1982-01-01,1989-12-31,year,Latin America,Documented in the HBS Bridgewater collection
baupost-founded,Baupost Group founded,firm_milestone,1982-01-01,,year,US,Klarman
gotham-founded,Gotham Capital founded,firm_milestone,1985-01-01,,year,US,Greenblatt
swensen-yale-start,Swensen becomes Yale CIO,firm_milestone,1985-01-01,,year,US,Tenure ran to 2021
templeton-prize-address,Templeton's Templeton Prize address,firm_milestone,1985-05-14,,day,UK,His strongest verified primary artifact
black-monday-1987,Black Monday,crash,1987-10-19,,day,Global,Documented in the HBS Bridgewater collection
one-up-published,One Up on Wall Street published,firm_milestone,1989-01-01,,year,US,Lynch
lynch-leaves-magellan,Lynch leaves Magellan,firm_milestone,1990-01-01,,year,US,Ends the era for which no electronic holdings record exists
marks-first-memo,Marks writes 'The Route To Performance',firm_milestone,1990-10-12,,day,US,First memo; start of a 35-year unbroken series
margin-of-safety-published,Margin of Safety published,firm_milestone,1991-01-01,,year,US,Klarman; long out of print
black-wednesday-1992,Black Wednesday,crisis,1992-09-16,,day,UK,Soros and Druckenmiller; in the HBS Bridgewater collection
franklin-acquires-templeton,Franklin acquires Templeton,firm_milestone,1992-01-01,,year,US,
berkshire-video-begins,Berkshire begins recording annual meetings,firm_milestone,1994-01-01,,year,US,Initially for internal use; the floor of the CNBC archive
bond-collapse-1994,1994 bond market collapse,crisis,1994-01-01,1994-12-31,year,Global,Documented in the HBS Bridgewater collection
simons-foundation-founded,Simons Foundation founded,firm_milestone,1994-01-01,,year,US,With Marilyn Simons
asian-financial-crisis,Asian financial crisis,crisis,1997-07-02,1998-12-31,day,Asia,
stock-market-genius-published,You Can Be a Stock Market Genius published,firm_milestone,1997-01-01,,year,US,Greenblatt
pabrai-funds-founded,Pabrai Investment Funds founded,firm_milestone,1999-01-01,,year,US,
pioneering-portfolio-published,Pioneering Portfolio Management published,firm_milestone,2000-01-01,,year,US,Swensen; the endowment model
dotcom-bubble,Dot-com bubble and bust,bubble,1995-01-01,2002-10-09,day,Global,
edgar-fulltext-coverage-begins,EDGAR full-text search coverage begins,regulatory,2001-01-01,,year,US,Hard floor for filing-text discovery
gfc-2008,Global financial crisis,crisis,2007-08-01,2009-03-09,day,Global,
security-analysis-6th,Security Analysis 6th edition published,firm_milestone,2008-01-01,,year,US,Klarman lead editor - documented Graham stewardship
simons-retires,Simons retires from Renaissance,firm_milestone,2009-01-01,,year,US,
duquesne-capital-closes,Duquesne Capital closes,firm_milestone,2010-01-01,,year,US,Becomes a family office
fundsmith-launched,Fundsmith Equity Fund launched,firm_milestone,2010-01-01,,year,UK,First annual letter 2010
soros-family-office,Soros Fund Management becomes a family office,firm_milestone,2011-01-01,,year,US,Breaks 13F continuity
13f-xml-transition,13F filings move to XML,regulatory,2013-07-01,,month,US,Pre-Q3-2013 filings are fixed-width TXT
herbalife-dispute,Ackman-Icahn Herbalife dispute,firm_milestone,2013-01-01,,year,US,Adversarial investor_relations edge
munger-video-floor,Earliest surviving Daily Journal meeting video,firm_milestone,2015-01-01,,year,US,Nothing survives for 2014 or earlier
covid-crash-2020,COVID-19 market crash,crash,2020-02-20,2020-03-23,day,Global,
swensen-dies,David Swensen dies,firm_milestone,2021-05-05,,day,US,
abel-named-successor,Greg Abel named Buffett's successor,firm_milestone,2021-01-01,,year,US,
inflation-shock-2022,2022 inflation shock and rate cycle,macro,2022-01-01,2023-12-31,year,Global,Context for Druckenmiller's September 2022 remarks
munger-dies,Charlie Munger dies,firm_milestone,2023-11-28,,day,US,Aged 99; 2023 was his last Daily Journal meeting
simons-dies,Jim Simons dies,firm_milestone,2024-05-10,,day,US,
bogle-archive-discontinued,Vanguard discontinues its Bogle archive,firm_milestone,2019-01-01,,year,US,Material rescued by the Bogle Center
marks-35th-anniversary,Marks memos 35th anniversary; Complete Collection released,firm_milestone,2025-10-14,,day,US,Memos also accessioned by the Museum of American Finance
buffett-thanksgiving-letter,Buffett's 'going quiet' Thanksgiving letter,firm_milestone,2025-11-10,,day,US,Announces handover of the annual report to Abel
buffett-steps-down,Buffett steps down as Berkshire CEO,firm_milestone,2025-12-31,,day,US,Remains Chairman
hbs-bridgewater-archive-opens,"HBS opens the Bridgewater Associates, LP Archives",firm_milestone,2026-02-27,,day,US,Daily Observations 1978-1996; access by application
abel-first-letter,Abel's first annual shareholder letter,firm_milestone,2026-02-28,,day,US,Authorship change in the Berkshire letter series
druckenmiller-hard-lessons,Druckenmiller Morgan Stanley 'Hard Lessons' interview,firm_milestone,2026-03-12,,day,US,Retrospective on his own decision process
klarman-mib,Klarman's Masters in Business interview,firm_milestone,2026-06-18,,day,US,His cleanest modern primary source
```

---

# SOURCE FILE: `data/investors.csv`

```csv
slug,full_name,birth_year,death_year,primary_firm,career_start_year,career_end_year,archive_quality,build_wave,primary_archive_url,has_official_archive,one_line,known_gaps
warren-buffett,Warren Buffett,1930,,Berkshire Hathaway,1956,,EXCELLENT,1,https://www.berkshirehathaway.com/letters/letters.html,TRUE,Complete shareholder-letter series 1977-2024 plus a new Thanksgiving-letter genre from 2025; CEO handover to Greg Abel at end-2025.,Pre-1977 partnership letters absent; no annual-meeting video before 1994; CNBC video archive is bot-blocked and unlicensed.
charlie-munger,Charlie Munger,1924,2023,Berkshire Hathaway / Daily Journal,1962,2023,EXCELLENT,1,https://mungerarchive.com/,TRUE,"35 verified recordings covering every surviving Daily Journal meeting, the major speeches and his only podcast.",2015 is the earliest Daily Journal meeting surviving on video; nothing survives for 2014 or earlier; 2016 is audio plus transcript only.
howard-marks,Howard Marks,1946,,Oaktree Capital Management,1990,,EXCELLENT,1,https://www.oaktreecapital.com/insights/howard-marks-memos,TRUE,~160 memos in an unbroken series from 12 October 1990; the cleanest corpus in the universe.,Index is JS-rendered so slugs must be extracted at runtime; pre-Oaktree TCW-era writing not published.
john-bogle,John C. Bogle,1929,2019,The Vanguard Group,1951,2019,EXCELLENT,1,https://boglecenter.net/bogle-archive/,TRUE,"Community-rescued archive of speeches, papers, op-eds, testimony and internal memos c.1964-2017, published with an XLSX index.",Vanguard discontinued its own Bogle archive in 2019; mixed date precision across the corpus.
terry-smith,Terry Smith,1953,,Fundsmith LLP,2010,,EXCELLENT,1,https://www.fundsmith.co.uk/documents/,TRUE,"Annual letters 2010-2025 (2025 is the 16th) plus semi-annual letters, a separate sustainable-fund series and multilingual SICAV variants.",PDF URLs use opaque CMS hashes that cannot be constructed; no official AGM transcripts.
george-soros,George Soros,1930,,Soros Fund Management / Quantum Fund,1969,,EXCELLENT,2,https://www.georgesoros.com/essays/,TRUE,"Large personal essay archive with day-precise URLs, spanning Project Syndicate, FT, WSJ, Davos and Munich Security Conference.","Fund became a family office in 2011, breaking the continuity of the 13F series."
bill-ackman,Bill Ackman,1966,,Pershing Square Capital Management,2004,,GOOD,2,https://pershingsquareholdings.com/company-reports/letters-to-shareholders/,TRUE,"PSH shareholder letters, annual reports and long-form activist investment presentations, plus February investor meetings.","Heavy use of social media as a primary channel is excluded from V1; asset URL date paths reflect publication, not reporting period."
carl-icahn,Carl Icahn,1936,,Icahn Enterprises L.P.,1968,,GOOD,1,https://www.ielp.com/financial-information/sec-filings,TRUE,No essay archive; his open letters are filed as EDGAR DFAN14A exhibits and his positions run through SC 13D/A filings back to 1995.,"Pre-1995 activity absent from the firm index; pre-2001 activity predates EDGAR full-text search, so the 1980s campaigns are secondary-only."
ray-dalio,Ray Dalio,1949,,Bridgewater Associates,1975,,GOOD,2,https://www.bridgewater.com/research-and-insights,TRUE,"Official Bridgewater research plus a newly opened HBS archive of Daily Observations 1978-1996, available by application only.",Daily Observations from 1997 onward remain proprietary; the widely circulated Principles PDF is an unauthorised Kindle conversion.
mohnish-pabrai,Mohnish Pabrai,1964,,Pabrai Investment Funds,1999,,GOOD,2,https://pabraifunds.com/letter-to-partner/,TRUE,"One of very few private-fund managers who publishes LP letters openly, with annual meeting materials back to 2002 and first-party podcast transcripts.",Early pre-1999 record thin; some annual meeting media only partially archived.
david-swensen,David Swensen,1954,2021,Yale University Investments Office,1985,2021,GOOD,2,https://investments.yale.edu/,TRUE,36 years of Yale endowment annual reports; the only investor here whose primary record is institutional rather than personal.,Almost nothing in his own voice outside two books; endowment reports are institutionally authored so sentence-level attribution is unsupportable.
peter-lynch,Peter Lynch,1944,,Fidelity Magellan Fund,1977,1990,THIN,2,https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html,FALSE,"No personal archive; the usable record is the PBS Frontline interview, Fidelity retrospectives and three copyrighted books.","Entire active career predates EDGAR full-text search (2001), so the Magellan holdings record is not electronically available."
benjamin-graham,Benjamin Graham,1894,1976,Graham-Newman Corporation,1926,1956,THIN,3,,FALSE,"Foundational concept hub for the corpus; digitally almost absent, with no verified public-domain edition of any major work.",No digitised personal archive; all Security Analysis and Intelligent Investor editions on Internet Archive are access-restricted.
philip-fisher,Philip Fisher,1907,2004,Fisher & Company,1931,1999,THIN,3,,FALSE,Originator of scuttlebutt research and the qualitative half of Buffett's stated synthesis; record is entirely book-bound and pre-digital.,"No archive, no letters, no located recordings; search disambiguation risk against his son Ken Fisher."
joel-greenblatt,Joel Greenblatt,1957,,Gotham Capital / Gotham Asset Management,1985,,THIN,3,,FALSE,Four books plus 20+ years teaching special-situation investing at Columbia; clean primary sources are podcast appearances.,Circulating Columbia class notes are unauthorised student notes; the extraordinary early Gotham record predates EDGAR.
john-templeton,Sir John Templeton,1912,2008,Templeton Growth Fund,1937,1992,THIN,3,https://www.templeton.org/,FALSE,Very little primary investment writing exists online; his strongest primary artifact is his own 1985 Templeton Prize address.,"Foundation content is mostly by others, not him; his best-known investment aphorisms circulate without traceable primary citations."
jim-simons,Jim Simons,1938,2024,Renaissance Technologies,1978,2009,GOOD,4,https://celebratio.org/Simons_J/,TRUE,"Deep primary record, but mathematical and biographical rather than about investing; two major indexed oral histories.",Renaissance method never disclosed; sources conflict on whether the firm was founded in 1978 or 1982 - flag as DISPUTED.
seth-klarman,Seth Klarman,1957,,The Baupost Group,1982,,NEARLY_ABSENT,4,,FALSE,Partner letters are private; the only clean modern primary source is a June 2026 Masters in Business interview.,Circulating 1995-2001 Baupost letters are unauthorised; Margin of Safety is out of print; almost nothing authorised between 2001 and 2026.
stanley-druckenmiller,Stanley Druckenmiller,1953,,Duquesne Capital / Duquesne Family Office,1981,,NEARLY_ABSENT,4,,FALSE,"No writings at all; the entire record is dated interviews, and his views change deliberately and fast.","13F covers only long US equities and so systematically misrepresents a macro book of currencies, rates, commodities and shorts."
jesse-livermore,Jesse Livermore,1877,1940,independent speculator,1892,1940,NEARLY_ABSENT,3,https://www.gutenberg.org/ebooks/60979,FALSE,His famous voice is a novelist's: Reminiscences of a Stock Operator is a 1923 roman a clef by Edwin Lefevre narrated by 'Larry Livingston'.,"No letters, interviews, recordings or verifiable trading records; career entirely predates the SEC (created 1934)."
```

---

# SOURCE FILE: `data/rights_matrix.csv`

```csv
material_class,work_title,edition,jurisdiction,rights_status,usage_status,reasoning,evidence_url,decided_on
berkshire_shareholder_letters,Berkshire Hathaway shareholder letters,1977-2024,US,LINK_ONLY,METADATA_ONLY,"Published freely by Berkshire for shareholders and the public, but copyright retained. No licence obtained.",https://www.berkshirehathaway.com/letters/letters.html,2026-08-22
berkshire_2025_letter,2025 letter to shareholders,2026 (Abel),US,LINK_ONLY,METADATA_ONLY,"Authored by Gregory E. Abel, not Buffett. Must not be attributed to Buffett.",https://www.berkshirehathaway.com/letters/2025ltr.pdf,2026-08-22
cnbc_buffett_archive,CNBC Warren Buffett Archive,n/a,US,LINK_ONLY,METADATA_ONLY,Akamai bot protection is an explicit technical refusal of automated collection. Link deeply; do not route around.,https://buffett.cnbc.com/about-buffett/,2026-08-22
munger_archive,Munger Archive recordings and transcripts,n/a,US,LINK_ONLY,METADATA_ONLY,"Purpose-built preservation project; strong PERMISSION_GRANTED candidate. Until then, metadata plus timecoded excerpts.",https://mungerarchive.com/,2026-08-22
munger_third_party_transcripts,Third-party Daily Journal transcripts,2013-2023,US,LINK_ONLY,METADATA_ONLY,"Third-party transcription of public meetings, accuracy unverified, transcriber often unidentified. Cite and link only.",https://worldlypartners.com/charlie-munger-archive/,2026-08-22
poor_charlies_almanack,Poor Charlie's Almanack,all editions,US,LINK_ONLY,METADATA_ONLY,"In copyright, commercially available, multiple editions. Bibliographic entity only.",,2026-08-22
oaktree_memos,Howard Marks memos,1990-present,US,LINK_ONLY,METADATA_ONLY,"Freely published by Oaktree but copyright retained. Highest-value permission target: single author, single rightsholder, 160 documents.",https://www.oaktreecapital.com/insights/howard-marks-memos,2026-08-22
bogle_archive,Bogle Archive materials,1964-2017,US,REVIEW_REQUIRED,METADATA_ONLY,Hosted by a non-profit with a dissemination mission after Vanguard discontinued its own archive in 2019. Likely PERMISSION_GRANTED.,https://boglecenter.net/bogle-archive/,2026-08-22
bogle_congressional_testimony,Bogle congressional testimony,various,US,REVIEW_REQUIRED,METADATA_ONLY,Congressional records may be US Government works. Verify per item rather than assuming for the class.,https://boglecenter.net/bogle-archive/,2026-08-22
bogle_index_xlsx,Bogle Archive index spreadsheet,published,US,REVIEW_REQUIRED,METADATA_ONLY,Published by the Bogle Center as a public index. Usable as a seed catalog; the underlying documents remain separately assessed.,https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx,2026-08-22
fundsmith_letters,Fundsmith shareholder letters,2010-2026,UK,LINK_ONLY,METADATA_ONLY,"Freely published, copyright retained. Good permission candidate; Investing for Growth shows comfort with collected republication.",https://www.fundsmith.co.uk/documents/,2026-08-22
soros_essays,Soros essays on georgesoros.com,various,US,LINK_ONLY,METADATA_ONLY,"Self-hosted, copyright retained. Original publisher may hold separate rights - record publication_venue.",https://www.georgesoros.com/essays/,2026-08-22
psh_letters_reports,"PSH letters, reports and presentations",various,UK,LINK_ONLY,METADATA_ONLY,"Regulatory and investor disclosure published freely, copyright retained.",https://pershingsquareholdings.com/,2026-08-22
sec_structured_data,"SEC structured filing data (13F, 13D, XBRL, submissions)",all,US,PUBLIC_DOMAIN,FULL_TEXT_STORED,US Government works are not subject to copyright. Fair-access policy requires a descriptive User-Agent and conservative rate limiting.,https://apis.io/apis/sec-edgar/sec-edgar-full-text-search-api/,2026-08-22
sec_exhibit_prose,Filer-authored EDGAR exhibit prose (e.g. Icahn DFAN14A letters),all,US,REVIEW_REQUIRED,METADATA_ONLY,"GREY AREA: the filing is a government record but the prose was written by the filer. Treat facts as public domain, prose as LINK_ONLY. Obtain counsel opinion.",https://www.sec.gov/Archives/edgar/data/1110803/000153949723000923/0001539497-23-000923-index.html,2026-08-22
hbs_bridgewater_archives,"HBS Baker Library Bridgewater Associates, LP Archives",1978-1996,US,LINK_ONLY,METADATA_ONLY,Access by application only. Not ingestible. Finding-aid description and factual holdings statements are publishable.,https://www.hbs.edu/news/releases/bridgewater-archives,2026-08-22
bridgewater_research,Bridgewater research and insights,various,US,LINK_ONLY,METADATA_ONLY,"Freely published by the firm, copyright retained.",https://www.bridgewater.com/research-and-insights,2026-08-22
dalio_principles_pdf,Unofficial Principles PDF (cpcglobal.org),Kindle conversion,US,REVIEW_REQUIRED,BLOCKED,Unauthorised conversion of a commercial ebook. Canonical example of 'do not automatically ingest a free PDF'.,,2026-08-22
dalio_big_debt_crises,Big Debt Crises,official free edition,US,REVIEW_REQUIRED,METADATA_ONLY,Author has made this available at no cost through official channels. Verify the official edition before assuming LINK_ONLY - may be PERMISSION_GRANTED.,,2026-08-22
pabrai_letters,Pabrai partner letters and meeting materials,2002-present,US,LINK_ONLY,METADATA_ONLY,Published openly by the manager himself. Provenance is FIRST_PARTY_CONFIRMED. Good permission candidate.,https://pabraifunds.com/letter-to-partner/,2026-08-22
yale_endowment_reports,Yale endowment and financial reports,1985-present,US,LINK_ONLY,METADATA_ONLY,"Institutional publications, copyright retained. Asset-allocation facts usable as data; prose is LINK_ONLY.",https://investments.yale.edu/,2026-08-22
pbs_frontline_lynch,PBS Frontline Peter Lynch interview,1996,US,LINK_ONLY,METADATA_ONLY,"Freely accessible broadcaster material, copyright retained. Short excerpt plus link.",https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html,2026-08-22
graham_security_analysis_1934,Security Analysis,1st ed. 1934,US,REVIEW_REQUIRED,METADATA_ONLY,"NOT public domain. Internet Archive copies are Access-restricted-item: true, lending only. Copyright renewed.",https://archive.org/details/securityanalysis0000grah,2026-08-22
graham_security_analysis_modern,Security Analysis,6th/7th eds,US,LINK_ONLY,METADATA_ONLY,Substantially new copyrighted works with new commentary from contemporary investors. Separate edition rows required.,https://archive.org/details/grahamdoddssecur0000grah,2026-08-22
graham_intelligent_investor,The Intelligent Investor,all editions,US,LINK_ONLY,METADATA_ONLY,In copyright. Zweig-annotated editions are unambiguously new works.,,2026-08-22
graham_all_editions_nonus,Graham works,all editions,EU/UK/IN,REVIEW_REQUIRED,METADATA_ONLY,Non-US terms are calculated differently and US renewal formalities never applied. Requires separate per-jurisdiction determination.,,2026-08-22
fisher_books,Philip Fisher books,all editions,US,LINK_ONLY,METADATA_ONLY,All in copyright. Bundled modern editions combine originally separate works - model as a distinct edition listing constituents.,,2026-08-22
greenblatt_books,Joel Greenblatt books,all editions,US,LINK_ONLY,METADATA_ONLY,In copyright. Beats / Still Beats are separate editions with overlapping content - avoid double-counting concept attribution.,,2026-08-22
greenblatt_class_notes,Columbia class notes,2002-2006,US,REVIEW_REQUIRED,BLOCKED,"Student-taken notes from a private university course, not a Greenblatt publication. Attribution would be PARAPHRASED at best.",https://focusedcompounding.com/wp-content/uploads/2018/03/Joel-Greenblatt-Class.pdf,2026-08-22
templeton_prize_address,Templeton Prize address,1985,US,LINK_ONLY,METADATA_ONLY,"Published by the Templeton Prize organisation. His own words, precisely dated. Short excerpt plus link.",https://www.templetonprize.org/laureate-sub/hardy-templeton-speech/,2026-08-22
templeton_foundation_content,John Templeton Foundation essays and podcast,current,US,LINK_ONLY,METADATA_ONLY,Mostly authored by others. Must NOT inherit attribution to Templeton by virtue of the domain.,https://www.templeton.org/,2026-08-22
templeton_books,Templeton books on Internet Archive,various,US,LINK_ONLY,METADATA_ONLY,Lending-restricted. Catalog reference only.,,2026-08-22
oxford_templeton_thesis,Oxford thesis on Templeton,n/a,UK,REVIEW_REQUIRED,METADATA_ONLY,Open-access institutional repository; specific licence must be checked but may permit fuller use.,https://ora.ox.ac.uk/objects/uuid:d4738b73-0a52-4f0c-96a1-89e134d3ae98/files/rnv935423w,2026-08-22
aip_simons_oral_history,AIP Oral History interview with Jim Simons,2020,US,REVIEW_REQUIRED,METADATA_ONLY,Formal oral-history programme with defined access terms. One of few items where rights may be genuinely favourable.,https://celebratio.org/Simons_J/article/507/,2026-08-22
simons_foundation_interview,Simons Foundation Cheeger interview,2012/2024,US,LINK_ONLY,METADATA_ONLY,"Foundation-published, copyright retained. 35 indexed chapters map to timecoded passages.",https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/,2026-08-22
baupost_letters,Baupost Group partner letters,c.1995-2001,US,REVIEW_REQUIRED,BLOCKED,"Confidential communications to limited partners. Online copies are unauthorised distributions, not publications. Do not ingest or link.",,2026-08-22
klarman_mib_2026,Masters in Business Klarman interview and transcript,2026,US,LINK_ONLY,METADATA_ONLY,Publisher-hosted with a first-party transcript. Metadata plus timecoded excerpt.,https://ritholtz.com/2026/06/transcript-seth-klarman/,2026-08-22
klarman_margin_of_safety,Margin of Safety,1991,US,LINK_ONLY,METADATA_ONLY,"In copyright, out of print. Bibliographic entity only. Scarcity is not a licence.",,2026-08-22
cnbc_transcripts,CNBC interview transcripts,various,US,LINK_ONLY,METADATA_ONLY,Broadcaster-published first-party transcripts. Tier 2. Short dated excerpts plus link.,https://www.cnbc.com/2024/05/07/cnbc-exclusive-cnbc-transcript-billionaire-investor-stanley-druckenmiller-speaks-with-cnbcs-squawk-box-today.html,2026-08-22
morgan_stanley_hard_lessons,Morgan Stanley Hard Lessons interview,2026,US,LINK_ONLY,METADATA_ONLY,Firm-published video with an extended first-party cut. Short dated excerpt plus link.,https://www.morganstanley.com/insights/videos/hard-lessons/duquesne-stan-druckenmiller-iliana-bouzali,2026-08-22
reminiscences_gutenberg,Reminiscences of a Stock Operator,1923 (Gutenberg #60979),US,PUBLIC_DOMAIN,FULL_TEXT_STORED,Public domain in the USA per Project Gutenberg. THE ONLY full-text case in the corpus. Note the 1923 Doran notice reproduced in front matter is not evidence of current protection.,https://www.gutenberg.org/ebooks/60979,2026-08-22
reminiscences_nonus,Reminiscences of a Stock Operator,1923,EU/UK/IN,REVIEW_REQUIRED,METADATA_ONLY,Gutenberg instructs non-US readers to check local law. Separate per-jurisdiction determination required before serving full text outside the US.,https://www.gutenberg.org/cache/epub/60979/pg60979.txt,2026-08-22
reminiscences_annotated,Reminiscences of a Stock Operator (Annotated Edition),2020,US,LINK_ONLY,METADATA_ONLY,New annotations and the bundled Livermore Market Key are separately copyrighted. Distinct edition row.,https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator,2026-08-22
reminiscences_ia,Reminiscences of a Stock Operator (Internet Archive),various,US,LINK_ONLY,METADATA_ONLY,Access-restricted-item: true. Catalog reference only; never fetch the _djvu.txt derivative.,https://archive.org/details/reminiscencesofs0000lefe,2026-08-22
livermore_how_to_trade,How to Trade in Stocks,1940,US,LINK_ONLY,METADATA_ONLY,"Livermore's own work, in copyright. The correct source for attribution=DIRECT passages.",,2026-08-22
```

---

# SOURCE FILE: `data/sources_catalog.csv`

```csv
investor,record_type,title,source_class,source_type,source_tier,publisher,publication_date,date_precision,year,original_url,archive_url,rights_status,usage_status,provenance_status,retrieved_at,transcript_available,audio_available,video_available,notes
warren-buffett,series,Berkshire Hathaway shareholder letters index,A_WRITING,shareholder_letter,1,Berkshire Hathaway,,year,1977-2024,https://www.berkshirehathaway.com/letters/letters.html,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,HTML /letters/YYYY.html 1977-2001; PDF /letters/YYYYltr.pdf 2002-2024
warren-buffett,series,Berkshire Hathaway annual reports index,A_WRITING,form_10k,1,Berkshire Hathaway,,year,1977-2025,https://www.berkshirehathaway.com/reports.html,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,Pattern /reports/YYYYannualreport.pdf; 2025 cycle moved to /2025ar/2025ar.pdf
warren-buffett,item,2025 letter to shareholders (authored by Gregory E. Abel),A_WRITING,shareholder_letter,1,Berkshire Hathaway,2026-02-28,day,2025,https://www.berkshirehathaway.com/letters/2025ltr.pdf,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,NOT Buffett. attributed_to_investor=FALSE. 18pp. First Abel letter.
warren-buffett,item,Berkshire Hathaway 2025 Annual Report,A_WRITING,form_10k,1,Berkshire Hathaway,2026-02-28,day,2025,https://www.berkshirehathaway.com/2025ar/2025ar.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Operating earnings $44.5bn; cash $373.3bn at 2025-12-31
warren-buffett,item,Thanksgiving letter to shareholders,A_WRITING,thanksgiving_letter,1,Berkshire Hathaway,2025-11-10,day,2025,https://www.cnn.com/2025/11/10/markets/warren-buffett-shareholder-letter,,LINK_ONLY,METADATA_ONLY,REPORTED,2026-08-22,FALSE,FALSE,FALSE,"~6,000 words. 'I am going quiet. Sort of.' New annual genre; cited here via CNN coverage"
warren-buffett,item,CNBC Warren Buffett Archive,B_SPOKEN,annual_meeting,2,CNBC,,year,1994-present,https://buffett.cnbc.com/,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,TRUE,TRUE,TRUE,"FETCH BLOCKED: Akamai bot protection. 33 meetings from 1994; ~145h video synced to ~3,000 transcript pages; 575+ clips"
warren-buffett,item,About the Warren Buffett Archive,F_SECONDARY,news_article,6,CNBC,,unknown,,https://buffett.cnbc.com/about-buffett/,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,States Berkshire began compiling video 1994 for internal use; CNBC organised 122 hours
warren-buffett,series,Berkshire Hathaway 13F holdings history,C_FILING,form_13f,3,U.S. SEC,,year,1993-present,https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets,,PUBLIC_DOMAIN,FULL_TEXT_STORED,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,Use quarterly flattened datasets; pre-Q3-2013 filings are fixed-width TXT
warren-buffett,item,Abel first-letter coverage,F_SECONDARY,news_article,6,Reuters,2026-02-28,day,2026,https://www.reuters.com/sustainability/boards-policy-regulation/berkshire-ceo-abel-seeks-reassure-shareholders-after-taking-baton-buffett-2026-02-28/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"Confirms authorship, page count and financials"
warren-buffett,item,Highlights from Abel's first shareholder letter,F_SECONDARY,news_article,6,CNBC,2026-03-01,day,2026,https://www.cnbc.com/2026/03/01/all-the-highlights-from-berkshire-ceo-abels-first-shareholder-letter.html,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Weschler ~6% of investments; Combs departed December for JPMorgan
warren-buffett,item,Nine takeaways from Buffett's last letter as CEO,F_SECONDARY,news_article,6,The Wall Street Journal,2025-11-10,day,2025,https://www.wsj.com/business/warren-buffett-letter-2025-takeaways-e7e0a578,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
warren-buffett,item,Takeaways from the 2025 Thanksgiving letter,F_SECONDARY,news_article,6,Yahoo Finance,2025-11-11,day,2025,https://finance.yahoo.com/news/warren-buffetts-2025-thanksgiving-letter-194330654.html,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"1,800 Class A shares converted to 2.7m Class B for four family foundations"
charlie-munger,item,The Munger Archive,B_SPOKEN,archival_collection,1,Munger Archive,,year,2015-2023,https://mungerarchive.com/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,TRUE,TRUE,TRUE,"35 verified recordings: every surviving Daily Journal meeting, major speeches, his only podcast"
charlie-munger,item,Daily Journal meetings collection,B_SPOKEN,annual_meeting,1,Munger Archive,,year,2015-2023,https://mungerarchive.com/daily-journal/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,TRUE,TRUE,TRUE,2015 earliest on video; none 2014 or earlier; 2016 audio+transcript only; 2023 his last
charlie-munger,series,Daily Journal meeting transcripts 2013-2023,F_SECONDARY,third_party_transcript,6,Worldly Partners,,year,2013-2023,https://worldlypartners.com/charlie-munger-archive/,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,TRUE,FALSE,FALSE,Third-party transcription; conflicts with primary archive on pre-2015 survival
charlie-munger,series,Munger transcripts collection,F_SECONDARY,third_party_transcript,6,Sung Capital,,unknown,,https://sungcap.com/transcripts/,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,TRUE,FALSE,FALSE,
charlie-munger,item,"Daily Journal meeting transcript, 16 February 2013",F_SECONDARY,third_party_transcript,6,Tilson Funds,2013-02-16,day,2013,https://tilsonfunds.com/MungerDJ-2-16.pdf,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,TRUE,FALSE,FALSE,
charlie-munger,item,Daily Journal 2023 meeting transcript,F_SECONDARY,third_party_transcript,6,Steady Compounding,,year,2023,https://steadycompounding.com/transcript/djco23/,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,TRUE,FALSE,FALSE,
charlie-munger,item,Poor Charlie's Almanack,D_BOOK,book,4,various / Stripe Press,,year,2005,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Kaufman ed.; multiple editions incl. 2023 Stripe Press. Bibliographic entity only
howard-marks,series,Howard Marks memos index,A_WRITING,memo,1,Oaktree Capital Management,,year,1990-present,https://www.oaktreecapital.com/insights/howard-marks-memos,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,"JS-rendered; ~160 memos; page /insights/memo/<slug>, PDF /docs/default-source/memos/<slug>.pdf"
howard-marks,item,The Route To Performance,A_WRITING,memo,1,Oaktree Capital Management,1990-10-12,day,1990,https://www.oaktreecapital.com/insights/howard-marks-memos,,LINK_ONLY,METADATA_ONLY,REPORTED,2026-08-22,FALSE,FALSE,FALSE,First memo. Date confirmed via CNBC 35th-anniversary coverage
howard-marks,item,35 years of memos; Complete Collection and Best of releases,F_SECONDARY,news_article,6,CNBC,2025-10-14,day,2025,https://www.cnbc.com/2025/10/14/howard-marks-celebrates-35-years-of-writing-his-acclaimed-memos-he-wasnt-sure-anyone-read-them-at-first.html,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Complete Collection 1990-2025 plus curated Best of (~45 memos)
howard-marks,item,Memos join permanent collection at the Museum of American Finance,E_ARCHIVE,finding_aid,5,Museum of American Finance,2025-10-14,day,2025,https://www.moaf.org/news/press-releases/2025-10-14-howard-marks-iconic-memos-join-permanent-collection-at-the-museum-of-american-finance,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Smithsonian affiliate; bound memo set
howard-marks,series,The Memo by Howard Marks (podcast),B_SPOKEN,podcast_episode,2,Oaktree / Art19,,year,,https://art19.com/shows/the-memo-by-howard-marks,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,TRUE,FALSE,"RSS gives reliable titles, dates, durations"
howard-marks,item,Third-party memo graph and index,F_SECONDARY,news_article,6,chian.io,,year,1990-2026,https://chian.io/projects/howard-marks/memos,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Claims 159 memos; use only as completeness cross-check
howard-marks,item,The Most Important Thing,D_BOOK,book,4,Columbia Business School Publishing,,year,2011,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
howard-marks,item,Mastering the Market Cycle,D_BOOK,book,4,Houghton Mifflin Harcourt,,year,2018,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
john-bogle,item,Bogle Archive index (XLSX),A_WRITING,finding_aid,1,John C. Bogle Center for Financial Literacy,,year,1964-2017,https://boglecenter.net/wp-content/uploads/Bogle-Archive-Published.xlsx,,REVIEW_REQUIRED,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,MACHINE-READABLE SEED CATALOG. Highest-leverage artifact in the research
john-bogle,series,The Bogle Archive,A_WRITING,archival_collection,1,John C. Bogle Center for Financial Literacy,,year,1964-2017,https://boglecenter.net/bogle-archive/,,REVIEW_REQUIRED,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,"Speeches, academic papers, op-eds, letters to media, Vanguard internal memos, congressional testimony, slides"
john-bogle,item,Statistics and Suicide,A_WRITING,speech,1,John C. Bogle,1984-05-06,day,1984,https://boglecenter.net/bogle-archive/,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Early dated highlight in the archive
john-bogle,item,Wellington Fund memo,A_WRITING,internal_memo,1,Wellington Management,,year,1972,https://boglecenter.net/bogle-archive/,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Among the earliest items in the archive
john-bogle,series,John Bogle speeches list,F_SECONDARY,finding_aid,6,Bogleheads,,year,,https://www.bogleheads.org/wiki/List_of_John_C._Bogle_speeches,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Mirror for title cross-checking
john-bogle,series,Bogle speeches (Bogleheads blog),F_SECONDARY,finding_aid,6,Bogleheads,,year,,https://www.bogleheads.org/blog/who-are-the-bogleheads/john-bogle-speeches/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
john-bogle,series,Bogle speeches mirror,F_SECONDARY,finding_aid,6,johncbogle.com,,year,,https://johncbogle.com/wordpress/bogle-speeches/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
john-bogle,series,Bogle Center resources,F_SECONDARY,finding_aid,6,Bogle Center,,year,,https://boglecenter.net/resources/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
john-bogle,item,"50 years, 50 facts: indexing since 1976",F_SECONDARY,news_article,6,Vanguard,,year,,https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/50-years-50-facts-indexing-since-1976.html,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Index-fund timeline anchor
terry-smith,series,Fundsmith documents library,A_WRITING,shareholder_letter,1,Fundsmith LLP,,year,2010-2026,https://www.fundsmith.co.uk/documents/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,JS-rendered; PDF URLs use opaque hashes and must be extracted at runtime
terry-smith,item,2025 FEF annual letter to shareholders (16th),A_WRITING,shareholder_letter,1,Fundsmith LLP,,year,2025,https://www.fundsmith.co.uk/media/4hcfd1pg/2025-fef-annual-letter-web.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
terry-smith,item,2024 annual letter to shareholders (15th),A_WRITING,shareholder_letter,1,Fundsmith LLP,,year,2024,https://www.fundsmith.co.uk/media/pirmvyly/annual-letter-to-shareholders-2024.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
terry-smith,item,2023 FEF annual letter to shareholders (14th),A_WRITING,shareholder_letter,1,Fundsmith LLP,,year,2023,https://www.fundsmith.co.uk/media/31plodnq/2023-fef-annual-letter-to-shareholders.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
terry-smith,item,2022 annual letter to shareholders (13th),A_WRITING,shareholder_letter,1,Fundsmith LLP,,year,2022,https://www.fundsmith.co.uk/media/bm0lyc22/annual-letter-to-shareholders-2022.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
terry-smith,item,FEF semi-annual letter to shareholders 2026,A_WRITING,shareholder_letter,1,Fundsmith LLP,,year,2026,https://www.fundsmith.co.uk/media/lfhpxi1x/fundsmith-equity-fund-semi-annual-letter-to-shareholders-2026.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
terry-smith,series,Fundsmith SICAV documents (multilingual),A_WRITING,shareholder_letter,1,Fundsmith SICAV,,year,,https://www.fundsmith.eu/documents/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"Model as language variants of one source, not separate sources"
terry-smith,item,Fundsmith 2025 AGM transcript,F_SECONDARY,third_party_transcript,6,Steady Compounding,,year,2025,https://steadycompounding.com/transcript/fundsmith25/,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,TRUE,FALSE,FALSE,
george-soros,series,George Soros essays archive,A_WRITING,essay,1,georgesoros.com,,year,,https://www.georgesoros.com/essays/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,Paginated /essays/page/N/ across >=22 pages; items at /YYYY/MM/DD/<slug>/
george-soros,series,Year archives,A_WRITING,essay,1,georgesoros.com,,year,,https://www.georgesoros.com/2007/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Cross-check against the essay index; year archives sometimes list more
george-soros,series,Press resources,A_WRITING,essay,1,georgesoros.com,,year,,https://www.georgesoros.com/press-resources/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
george-soros,item,The Alchemy of Finance,D_BOOK,book,4,Simon & Schuster,,year,1987,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Primary statement of reflexivity
bill-ackman,series,PSH letters to shareholders,A_WRITING,shareholder_letter,1,Pershing Square Holdings,,year,,https://pershingsquareholdings.com/company-reports/letters-to-shareholders/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,
bill-ackman,series,PSH materials,A_WRITING,presentation_slides,1,Pershing Square Holdings,,year,,https://pershingsquareholdings.com/materials/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
bill-ackman,series,PSH events and presentations,A_WRITING,presentation_slides,1,Pershing Square Holdings,,year,,https://pershingsquareholdings.com/events-presentations/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
bill-ackman,item,Pershing Square Holdings Ltd. 2024 Annual Report,A_WRITING,fund_annual_report,1,Pershing Square Holdings,2025-03-14,day,2024,https://assets.pershingsquareholdings.com/2025/03/14183709/Pershing-Square-Holdings-Ltd.-2024-Annual-Report-1.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"URL date path is publication date, not reporting period"
bill-ackman,item,PSH 2021 Annual Investor Presentation,A_WRITING,presentation_slides,1,Pershing Square Holdings,,year,2021,https://pershingsquareholdings.com/wp-content/uploads/2021/02/PSH-2021-Annual-Investor-Presentation-1.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
bill-ackman,series,Annual investor presentation events,B_SPOKEN,conference_appearance,2,Pershing Square Capital Management,,year,,https://pscmevents.com/annual-investor-presentation/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,TRUE,"Held each February, e.g. 2025-02-11 and 2026-02-11"
bill-ackman,series,Pershing Square Inc investor relations,A_WRITING,shareholder_letter,1,Pershing Square Inc,,year,,https://pershingsquareinc.com/investor-relations/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
carl-icahn,series,Icahn Enterprises SEC filings index,C_FILING,schedule_13d,3,Icahn Enterprises L.P.,,year,1995-present,https://www.ielp.com/financial-information/sec-filings,,PUBLIC_DOMAIN,FULL_TEXT_STORED,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,"Paginated, filterable by form group; back to 1995 SC 13D/A and 1998 SC 14D1/A"
carl-icahn,series,"EDGAR filer browse, CIK 0000813762",C_FILING,schedule_13d,3,U.S. SEC,,year,,https://www.sec.gov/edgar/browse/?CIK=CIK0000813762,,PUBLIC_DOMAIN,FULL_TEXT_STORED,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,
carl-icahn,item,Icahn open letter to Illumina shareholders (DFAN14A exhibit),C_FILING,proxy_exhibit,3,U.S. SEC,,year,2023,https://www.sec.gov/Archives/edgar/data/1110803/000153949723000923/0001539497-23-000923-index.html,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"KEY PATTERN: filed under Illumina's CIK 1110803, not Icahn's. Exhibit prose authored by Icahn"
carl-icahn,item,Icahn Enterprises 8-K,C_FILING,form_8k,3,U.S. SEC,,year,2026,https://www.sec.gov/Archives/edgar/data/813762/000110465926085237/tm2620847d1_8k.htm,,PUBLIC_DOMAIN,FULL_TEXT_STORED,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
ray-dalio,item,"Bridgewater Associates, LP Archives at HBS Baker Library",E_ARCHIVE,archival_collection,5,Harvard Business School Baker Library,2026-02-27,day,1978-1996,https://www.hbs.edu/news/releases/bridgewater-archives,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Daily Observations 1978-1996 + photographs. ACCESS BY APPLICATION: specialcollectionsref@hbs.edu
ray-dalio,series,Bridgewater research and insights,A_WRITING,academic_paper,1,Bridgewater Associates,,year,,https://www.bridgewater.com/research-and-insights,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,"Document URLs /_document/<slug>?id=<guid>; GUID opaque, must be extracted"
ray-dalio,item,Why and How Capitalism Needs to Be Reformed,A_WRITING,essay,1,Bridgewater Associates,2019-04-08,day,2019,https://www.bridgewater.com/research-and-insights,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
ray-dalio,item,Lessons Learned: Ray Dalio,B_SPOKEN,oral_history,5,Yale Journal of Financial Crises,,year,,https://elischolar.library.yale.edu/journal-of-financial-crises/vol1/iss4/10/,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,TRUE,FALSE,FALSE,"Open-access academic journal; check licence, may permit fuller use"
ray-dalio,item,Unofficial Principles PDF (Kindle conversion),D_BOOK,book,4,unauthorised,,unknown,,,,REVIEW_REQUIRED,BLOCKED,DISPUTED,2026-08-22,FALSE,FALSE,FALSE,cpcglobal.org copy is an unofficial Kindle conversion. DO NOT INGEST
ray-dalio,item,HBS case 413-702 (Bridgewater Associates),E_ARCHIVE,academic_paper,5,Harvard Business School,,year,,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
mohnish-pabrai,series,Letters to partners,A_WRITING,partner_letter,1,Pabrai Investment Funds,,year,,https://pabraifunds.com/letter-to-partner/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,Published openly by the manager - rare in this corpus
mohnish-pabrai,series,Annual reports and meetings,A_WRITING,annual_meeting,1,Pabrai Investment Funds,,year,2002-present,https://pabraifunds.com/annual-reports-and-meetings/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,Back to the 2002 annual meeting presentation
mohnish-pabrai,series,Chai with Pabrai,B_SPOKEN,podcast_episode,2,Mohnish Pabrai,,year,,https://www.chaiwithpabrai.com/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,TRUE,TRUE,TRUE,
mohnish-pabrai,series,Chai with Pabrai transcripts,B_SPOKEN,podcast_episode,2,Mohnish Pabrai,,year,,https://www.chaiwithpabrai.com/transcripts.html,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,TRUE,FALSE,FALSE,transcript_is_first_party=TRUE
mohnish-pabrai,item,The Dhandho Investor,D_BOOK,book,4,Wiley,,year,2007,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
david-swensen,series,Yale Investments Office,A_WRITING,endowment_report,1,Yale University,,year,1985-present,https://investments.yale.edu/,,LINK_ONLY,METADATA_ONLY,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,Institutional authorship; set attribution_note accordingly
david-swensen,item,Yale Endowment 2021 report,A_WRITING,endowment_report,1,Yale University,,year,2021,https://swensenmemorial.com/img/2021-Endowment-Report.pdf,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Mirrored copy; prefer a Yale-hosted original where available
david-swensen,series,Yale historical news archive,F_SECONDARY,news_article,6,Yale University,,year,,http://archives.news.yale.edu/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
david-swensen,item,Pioneering Portfolio Management,D_BOOK,book,4,Free Press,,year,2000,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Revised 2009; foundational endowment-model text
david-swensen,item,Unconventional Success,D_BOOK,book,4,Free Press,,year,2005,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Argues individuals should do roughly the opposite of Yale
peter-lynch,item,Frontline: Betting on the Market - Peter Lynch interview,B_SPOKEN,interview,2,PBS Frontline / WGBH,,year,,https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,TRUE,FALSE,FALSE,Best free primary Lynch source on the open web
peter-lynch,item,Peter Lynch profile,E_ARCHIVE,finding_aid,5,Museum of American Finance,,year,,https://www.moaf.org/about/people/peter-lynch,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
peter-lynch,item,One Up on Wall Street,D_BOOK,book,4,Simon & Schuster,,year,1989,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
peter-lynch,item,Beating the Street,D_BOOK,book,4,Simon & Schuster,,year,1993,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
peter-lynch,item,Learn to Earn,D_BOOK,book,4,Simon & Schuster,,year,1995,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
benjamin-graham,item,Security Analysis (1934 first-edition reprint),D_BOOK,book,4,Whittlesey House / McGraw-Hill,,year,1934,https://archive.org/details/securityanalysis0000grah,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"Internet Archive record marked Access-restricted-item: true, lending only. NOT public domain"
benjamin-graham,item,Security Analysis (second IA copy),D_BOOK,book,4,McGraw-Hill,,year,1934,https://archive.org/details/securityanalysis0000grah_k7k1,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Access-restricted-item: true
benjamin-graham,item,Graham and Dodd's Security Analysis,D_BOOK,book,4,McGraw-Hill,,year,,https://archive.org/details/grahamdoddssecur0000grah,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,IA returns 'No suitable files to display here'
benjamin-graham,item,Security Analysis: Principles and Technique,D_BOOK,book,4,McGraw-Hill,,year,,https://archive.org/details/securityanalysis0000benj,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,IA returns 'No suitable files to display here'
benjamin-graham,item,Security Analysis (Open Library record),D_BOOK,book,4,Open Library,,year,,https://openlibrary.org/books/OL52875825M/Security_analysis,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Catalog anchor
benjamin-graham,item,"Benjamin Graham, Columbia C250 profile",E_ARCHIVE,finding_aid,5,Columbia University,,year,,https://c250.columbia.edu/c250_celebrates/your_columbians/benjamin_graham.html,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
benjamin-graham,item,The Intelligent Investor,D_BOOK,book,4,Harper,,year,1949,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,"Multiple editions incl. Zweig-annotated, all in copyright"
philip-fisher,item,Common Stocks and Uncommon Profits,D_BOOK,book,4,Harper & Brothers,,year,1958,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Canonical text; source of scuttlebutt and the fifteen points
philip-fisher,item,Paths to Wealth Through Common Stocks,D_BOOK,book,4,Prentice-Hall,,year,1960,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
philip-fisher,item,Conservative Investors Sleep Well,D_BOOK,book,4,Harper & Row,,year,1975,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
philip-fisher,item,Developing an Investment Philosophy,D_BOOK,book,4,Financial Analysts Research Foundation,,year,1980,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
joel-greenblatt,item,You Can Be a Stock Market Genius,D_BOOK,book,4,Simon & Schuster,,year,1997,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
joel-greenblatt,item,The Little Book That Beats the Market,D_BOOK,book,4,Wiley,,year,2005,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Reissued 2010 as The Little Book That Still Beats the Market - separate edition row
joel-greenblatt,item,Common Sense,D_BOOK,book,4,Columbia Business School Publishing,,year,2020,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,
joel-greenblatt,item,Columbia class notes (audited 2002-2006),F_SECONDARY,class_notes,6,Focused Compounding (mirror),,year,2002-2006,https://focusedcompounding.com/wp-content/uploads/2018/03/Joel-Greenblatt-Class.pdf,,REVIEW_REQUIRED,BLOCKED,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Student notes from a private course. Attribution would be PARAPHRASED at best. Likely BLOCKED
joel-greenblatt,item,The Knowledge Project: Joel Greenblatt,B_SPOKEN,podcast_episode,2,Farnam Street,,year,,https://fs.blog/knowledge-project-podcast/joel-greenblatt/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,TRUE,TRUE,FALSE,Clean first-party alternative to the class notes
john-templeton,item,Templeton Prize address,A_WRITING,speech,1,Templeton Prize,1985-05-14,day,1985,https://www.templetonprize.org/laureate-sub/hardy-templeton-speech/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Strongest verified Tier 1 primary artifact in his own voice
john-templeton,series,John Templeton Foundation,F_SECONDARY,news_article,6,John Templeton Foundation,,year,,https://www.templeton.org/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"News, guest essays, Templeton Ideas podcast - MOSTLY BY OTHERS, not by Templeton"
john-templeton,item,Oxford doctoral thesis on Templeton,E_ARCHIVE,academic_paper,5,University of Oxford (ORA),,year,,https://ora.ox.ac.uk/objects/uuid:d4738b73-0a52-4f0c-96a1-89e134d3ae98/files/rnv935423w,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"Open-access repository; check licence, may permit fuller use"
john-templeton,item,The Humble Approach,D_BOOK,book,4,Seabury Press,,year,1981,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Internet Archive copy is lending-restricted
john-templeton,item,Worldwide Laws of Life,D_BOOK,book,4,Templeton Foundation Press,,year,1997,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Internet Archive copy is lending-restricted
jim-simons,item,Jim Simons on his career in mathematics (interview with Jeff Cheeger),B_SPOKEN,oral_history,2,Simons Foundation,2012-09-28,day,2012,https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,TRUE,TRUE,Indexed into 35 video chapters
jim-simons,item,Jim Simons reflects on his career in mathematics (republished),B_SPOKEN,oral_history,2,Simons Foundation,2024-05-14,day,2024,https://www.simonsfoundation.org/2024/05/14/jim-simons-reflects-on-his-career-in-mathematics/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,TRUE,TRUE,"Same interview, second location - model as one source, two URLs"
jim-simons,item,AIP Oral History interview by David Zierler,B_SPOKEN,oral_history,5,American Institute of Physics,,month,2020-12,https://celebratio.org/Simons_J/article/507/,,REVIEW_REQUIRED,METADATA_ONLY,URL_RESOLVED,2026-08-22,TRUE,FALSE,FALSE,Formal oral-history programme; check AIP access terms
jim-simons,series,Celebratio Mathematica: James Simons,E_ARCHIVE,finding_aid,5,Celebratio Mathematica,,year,,https://celebratio.org/Simons_J/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Best single bibliographic hub for Simons
jim-simons,item,"Quant pioneer James Simons on math, money and philanthropy",B_SPOKEN,lecture,2,MIT Sloan,,year,2019,https://mitsloan.mit.edu/ideas-made-to-matter/quant-pioneer-james-simons-math-money-and-philanthropy,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,TRUE,
jim-simons,item,Remembering the life and careers of Jim Simons,F_SECONDARY,news_article,6,Institute for Advanced Study,,year,2024,https://www.ias.edu/news/remembering-life-and-careers-jim-simons,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
jim-simons,item,Renaissance Technologies founding date,F_SECONDARY,news_article,6,multiple,,year,1978 or 1982,,,REVIEW_REQUIRED,METADATA_ONLY,DISPUTED,2026-08-22,FALSE,FALSE,FALSE,Sources conflict between 1978 and 1982. Do not resolve silently
seth-klarman,item,Masters in Business: Seth Klarman (audio),B_SPOKEN,podcast_episode,2,Bloomberg,2026-06-18,day,2026,https://www.bloomberg.com/news/audio/2026-06-18/masters-in-business-seth-klarman-podcast,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,TRUE,TRUE,FALSE,The clean modern primary source - build the profile on this
seth-klarman,item,Transcript: Seth Klarman,B_SPOKEN,podcast_episode,2,ritholtz.com,2026-06-18,day,2026,https://ritholtz.com/2026/06/transcript-seth-klarman/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,TRUE,FALSE,FALSE,"First-party to the interviewer, so effectively Tier 2 not Tier 6"
seth-klarman,series,"Baupost partner letters (circulating copies, c.1995-2001)",A_WRITING,partner_letter,1,unauthorised distributions,,year,1995-2001,,,REVIEW_REQUIRED,BLOCKED,DISPUTED,2026-08-22,FALSE,FALSE,FALSE,"Confidential LP communications. DO NOT INGEST, DO NOT LINK"
seth-klarman,item,Margin of Safety,D_BOOK,book,4,HarperBusiness,,year,1991,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Out of print; extreme secondary-market prices
seth-klarman,item,Security Analysis 6th edition (lead editor),D_BOOK,book,4,McGraw-Hill,,year,2008,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Documented Graham stewardship - strong investor_relations evidence
seth-klarman,series,Baupost Group 13F filings,C_FILING,form_13f,3,U.S. SEC,,year,,https://www.sec.gov/edgar/search/,,PUBLIC_DOMAIN,FULL_TEXT_STORED,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,
stanley-druckenmiller,item,CNBC Delivering Alpha interview with Joe Kernen,B_SPOKEN,interview,2,CNBC,2022-09-28,day,2022,https://nbcuniversalnewsgroup.com/cnbc/2022/09/28/cnbc-transcript-duquesne-family-office-chairman-ceo-stanley-druckenmiller-speaks-with-cnbcs-joe-kernen-live-during-the-cnbc-delivering-alpha-conference-today/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,TRUE,FALSE,TRUE,Video also at https://www.youtube.com/watch?v=IMeuzvzToPQ
stanley-druckenmiller,item,CNBC Squawk Box exclusive interview,B_SPOKEN,interview,2,CNBC,2024-05-07,day,2024,https://www.cnbc.com/2024/05/07/cnbc-exclusive-cnbc-transcript-billionaire-investor-stanley-druckenmiller-speaks-with-cnbcs-squawk-box-today.html,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,TRUE,FALSE,TRUE,
stanley-druckenmiller,item,Bloomberg interview with Sonali Basak,B_SPOKEN,interview,2,Bloomberg,2024-10-16,day,2024,https://podcasts.apple.com/us/podcast/duquesne-family-office-chairman-and-chief-executive/id1690236827?i=1000673335724,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,TRUE,FALSE,
stanley-druckenmiller,item,Hard Lessons: Stan Druckenmiller with Iliana Bouzali,B_SPOKEN,interview,2,Morgan Stanley,2026-03-12,day,2026,https://www.morganstanley.com/insights/videos/hard-lessons/duquesne-stan-druckenmiller-iliana-bouzali,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,TRUE,Extended version with bonus clips on Morgan Stanley's own site
stanley-druckenmiller,series,Duquesne Family Office 13F filings,C_FILING,form_13f,3,U.S. SEC,,year,,https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets,,PUBLIC_DOMAIN,FULL_TEXT_STORED,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,"COVERAGE CAVEAT: long US equities only; omits FX, rates, commodities, shorts, derivatives"
jesse-livermore,item,Reminiscences of a Stock Operator (Project Gutenberg #60979),D_BOOK,book,4,Project Gutenberg,2019-12-20,day,1923,https://www.gutenberg.org/ebooks/60979,,PUBLIC_DOMAIN,FULL_TEXT_STORED,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,Public domain in the USA. jurisdiction=US. By Edwin Lefevre; narrator 'Larry Livingston'. FICTIONALISED_ATTRIBUTION
jesse-livermore,item,Reminiscences of a Stock Operator (plain text),D_BOOK,book_chapter,4,Project Gutenberg,,year,1923,https://www.gutenberg.org/cache/epub/60979/pg60979.txt,,PUBLIC_DOMAIN,FULL_TEXT_STORED,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Retains 1923 Doran copyright notice in front matter - annotate in rights_note
jesse-livermore,item,Reminiscences of a Stock Operator (HTML),D_BOOK,book,4,Project Gutenberg,,year,1923,https://www.gutenberg.org/files/60979/60979-h/60979-h.htm,,PUBLIC_DOMAIN,FULL_TEXT_STORED,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
jesse-livermore,item,Reminiscences of a Stock Operator (Internet Archive record),D_BOOK,book,4,Internet Archive,,year,1923,https://archive.org/details/reminiscencesofs0000lefe,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Access-restricted-item: true. Catalog reference only; do not fetch _djvu.txt
jesse-livermore,item,Reminiscences of a Stock Operator (Wikipedia),F_SECONDARY,news_article,6,Wikipedia,,year,,https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Confirms 1923 roman a clef by Edwin Lefevre; 2020 annotated edition separately in copyright
jesse-livermore,item,How to Trade in Stocks,D_BOOK,book,4,"Duell, Sloan and Pearce",,year,1940,,,LINK_ONLY,METADATA_ONLY,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Livermore's own work - the correct source for attribution=DIRECT passages
_infrastructure,item,EDGAR full-text search,C_FILING,finding_aid,3,U.S. SEC,,year,2001-present,https://www.sec.gov/edgar/search/,,PUBLIC_DOMAIN,FULL_TEXT_STORED,FIRST_PARTY_CONFIRMED,2026-08-22,FALSE,FALSE,FALSE,Covers filings since 2001 only
_infrastructure,item,SEC search filings landing,C_FILING,finding_aid,3,U.S. SEC,,year,,https://www.sec.gov/search-filings,,PUBLIC_DOMAIN,FULL_TEXT_STORED,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,
_infrastructure,item,Form 13F Data Sets (quarterly ZIPs),C_FILING,form_13f,3,U.S. SEC,2026-05-31,day,,https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets,,PUBLIC_DOMAIN,FULL_TEXT_STORED,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Submission + cover-page + information tables. Latest listed: 2026 Mar-May (94.81MB)
_infrastructure,item,EDGAR full-text search cluster endpoint,C_FILING,finding_aid,3,U.S. SEC,,year,,https://efts.sec.gov/LATEST/search-index?q=,,PUBLIC_DOMAIN,FULL_TEXT_STORED,UNVERIFIED,2026-08-22,FALSE,FALSE,FALSE,Undocumented but public; requires descriptive User-Agent
_infrastructure,item,SEC EDGAR data API description (licence statement),C_FILING,finding_aid,3,apis.io,,year,,https://apis.io/apis/sec-edgar/sec-edgar-full-text-search-api/,,PUBLIC_DOMAIN,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Records licence as Public Domain (U.S. Government Work); notes User-Agent requirement
_infrastructure,item,13F parsing guidance (fixed-width pre-Q3-2013),F_SECONDARY,news_article,6,edgartools docs,,year,,https://edgartools.readthedocs.io/en/stable/13f-filings/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,Confirms pre-Q3-2013 13F filings use fixed-width TXT not XML
_infrastructure,item,EDGAR API endpoint reference,F_SECONDARY,news_article,6,EDGARScout,2026-07-31,day,2026,https://edgarscout.com/edgar-api/,,LINK_ONLY,METADATA_ONLY,URL_RESOLVED,2026-08-22,FALSE,FALSE,FALSE,"Documents data.sec.gov submissions, companyfacts, companyconcept, frames endpoints"
```

---
