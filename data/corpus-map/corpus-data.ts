// ─────────────────────────────────────────────────────────────────────────────
// INVESTOR/PASS — CORPUS RESEARCH MAP
// Consolidated deep-research dataset for 11 investors, mapped to the
// Master End-to-End Execution Plan:
//   §6–9   Evidence model & verification states (VERIFIED / PROVISIONAL / NEEDS_REVIEW / REJECTED)
//   §12    Corpus audit (Phase 3) — source-level coverage baseline
//   §13–15 Canonical taxonomy (Phase 4) — themes vs concepts
//   §16–17 Cross-reference engine (Phase 5) — explainable edges
//   §27–29 Decision Ledger — statement → decision → outcome
//   §65    research_depth tiers — CORE / ACTIVE / DEVELOPING / DISCOVERY
// Sources: /research/*.md (verified via web search, tasks 1-a…1-d) and
// /upload/investor-source-data.md (original data sheets).
// ─────────────────────────────────────────────────────────────────────────────

export type VerificationState = 'VERIFIED' | 'PROVISIONAL' | 'NEEDS_REVIEW' | 'REJECTED'
export type Tier = 'CORE' | 'ACTIVE' | 'DEVELOPING' | 'DISCOVERY'
export type OutcomeState = 'KNOWN' | 'PARTIAL' | 'UNKNOWN'
export type Category = 'letters' | 'books' | 'speeches' | 'interviews' | 'regulatory' | 'archival' | 'other'

export interface ThemeLink { slug: string; strength: 1 | 2 | 3; note?: string }

export interface InvestorSeed {
  slug: string
  name: string
  aliases: string
  firm: string
  activePeriod: string
  location: string
  tier: Tier
  tierRationale: string
  passageYield: 'VERY HIGH' | 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM'
  status: 'active' | 'wound_down' | 'terminal'
  statusNote: string
  summary: string
  themes: ThemeLink[]
  gaps: string[]
  notableFacts: { fact: string; url: string }[]
  timeline: { date: string; event: string }[]
}

export interface SourceSeed {
  investorSlug: string
  yearLabel: string
  title: string
  type: string
  category: Category
  publisher: string
  url: string
  access: string
  provenance: string
  verificationState: VerificationState
  value: 1 | 2 | 3 | 4 | 5
  notes: string
}

export interface DecisionSeed {
  investorSlug: string
  dateLabel: string
  sortDate: string
  action: string
  company: string
  context: string
  outcome: string
  outcomeState: OutcomeState
  sourceTitle: string
  sourceUrl: string
  themes: string[]
}

export interface ThemeSeed {
  slug: string
  name: string
  type: 'THEME' | 'CONCEPT'
  parent?: string
  description: string
  investors: ThemeLink[]
}

export interface CorrectionSeed {
  investorSlug?: string
  subject: string
  claim: string
  verdict: 'CORRECTED' | 'VALIDATED' | 'FLIPPED' | 'RESOLVED' | 'UPDATED'
  detail: string
  url: string
}

export interface CrossRefSeed {
  fromSlug: string
  fromName: string
  toSlug: string
  toName: string
  toContext: boolean
  reason: string
  kind: 'apprenticeship' | 'lineage' | 'cohort' | 'cluster' | 'network'
}

export interface AcquisitionSeed {
  priority: number
  investorSlug: string
  item: string
  access: string
  rationale: string
}

// ─── INVESTORS ───────────────────────────────────────────────────────────────

export const investors: InvestorSeed[] = [
  {
    slug: 'michael-burry',
    name: 'Michael Burry',
    aliases: 'Dr. Michael Burry · @michaeljburry',
    firm: 'Scion Capital (2000–2008) · Scion Asset Management (2016–2025)',
    activePeriod: '2000–present',
    location: 'Saratoga, California',
    tier: 'ACTIVE',
    tierRationale: 'Living primary corpus (Substack + X), a fresh terminal event (Scion shutdown), newly accessible long-form interview and FCIC audio make Burry one of the highest-yield subjects in the batch.',
    passageYield: 'VERY HIGH',
    status: 'terminal',
    statusNote: 'Scion Asset Management liquidated — Oct 27, 2025 letter, SEC deregistration Nov 2025, final 13F Q3 2025. He now publishes via Cassandra Unchained ($400/yr).',
    summary:
      'The Big Short\u2019s documented primary record is stronger than the source sheet assumed: FCIC interview audio (97MB, Stanford mirror), a Vanderbilt speech with full transcript (re-dated to Apr 5, 2011), a UCLA commencement transcript (2012), the Dec 2025 Against the Rules interview, and an ongoing paid Substack. Circulating Scion letter mirrors remain unofficial and require Wayback authentication before ingest.',
    themes: [
      { slug: 'risk-and-crisis', strength: 3, note: 'CDS short of subprime RMBS — the defining crisis trade' },
      { slug: 'contrarian-value', strength: 3, note: 'Deep-value screens; contrarian macro pivots' },
      { slug: 'forensic-shorts', strength: 2, note: 'Depreciation / reported-earnings critique' },
      { slug: 'lineage', strength: 1, note: 'Stated Graham/Buffett roots' },
    ],
    gaps: [
      'FCIC audio has no transcript',
      'Letter authentication vs Wayback scioncapital.com (bot-blocked from sandbox)',
      'GameStop exit lacks a filing-by-filing map',
      'Pre-fame MSN columns only partially recovered',
      'Substack paywall limits full-text access',
    ],
    notableFacts: [
      { fact: 'Oct 27, 2025 liquidation letter: \u201cWith a heavy heart, I will liquidate the funds and return capital, but for a small audit/tax holdback.\u201d', url: 'https://www.reuters.com/sustainability/sustainable-finance-reporting/michael-burry-big-short-fame-deregisters-scion-asset-management-2025-11-13' },
      { fact: 'Scion EDGAR record: CIK 0001649339, 42 filings since Feb 16, 2016; final 13F-HR Q3 2025.', url: 'https://www.sec.gov/edgar/browse/?CIK=1649339' },
      { fact: 'FCIC audio: \u201c2010-05-18 FCIC staff audiotape of interview with Michael Burry, Cornwall Capital.mp3, 97M\u201d — no transcript located.', url: 'https://fcic-static.law.stanford.edu/cdn_media/fcic-audio' },
      { fact: '\u201cMichael Burry Speaks\u201d (Against the Rules, ~40 min, Dec 2, 2025) — his first long-form interview of substance in 15 years.', url: 'https://www.pushkin.fm/podcasts/against-the-rules' },
      { fact: 'Bloomberg (Jan 26, 2026): post-shutdown, Burry says he has been buying GameStop again.', url: 'https://www.bloomberg.com/news/articles/2026-01-26/michael-burry-an-early-gamestop-buyer-is-back-hyping-the-stock' },
    ],
    timeline: [
      { date: '2000–01', event: 'Scion Capital launch after MSN Money column / Silicon Investor era' },
      { date: '2003–07', event: 'CDS short of subprime RMBS (~$1bn notional)' },
      { date: '2010', event: 'FCIC staff interview (May 18); NYT op-ed (Apr 4); 60 Minutes appearance' },
      { date: '2011–12', event: 'Vanderbilt \u201cMissteps to Mayhem\u201d (Apr 2011); UCLA commencement (2012)' },
      { date: '2019–21', event: 'GameStop position, board letters, tweets, SEC subpoena' },
      { date: 'Oct–Nov 2025', event: 'Scion liquidation letter (Oct 27); deregistration; Cassandra Unchained launches' },
      { date: 'Dec 2025 – 2026', event: 'ATR interview; Substack \u201cTrading Post\u201d era; reported GME re-buy' },
    ],
  },
  {
    slug: 'david-einhorn',
    name: 'David Einhorn',
    aliases: '—',
    firm: 'Greenlight Capital (founded May 1996) · now DME Capital Management, LP d/b/a Greenlight Capital',
    activePeriod: '1996–present',
    location: 'New York, NY',
    tier: 'ACTIVE',
    tierRationale: 'Continuous quarterly primary letters (via press recaps), annual public Sohn decks, live campaigns (Vitesco \u2192 2026 transition basket), and newly surfaced long-form interviews.',
    passageYield: 'HIGH',
    status: 'active',
    statusNote: 'Investor letters login-gated, but Sohn decks remain freely downloadable on greenlightcapital.com. Current performance: +1.9% YTD net (Q2 2026).',
    summary:
      'Forensic-accounting short seller with the best-documented crisis-era record in the cohort: the Nov 2007 VIC talk survives as a Lehman bankruptcy exhibit (Stanford mirror) and the May 2008 Sohn deck is hosted by Yale EliScholar. The Allied Capital battle is bookended by the 2008 FSOPOTAT memoir. The sheet\u2019s \u201cno major podcasts\u201d gap is now closed (Masters in Business Feb 2024, Simplify fireside Oct 2025).',
    themes: [
      { slug: 'forensic-shorts', strength: 3, note: 'Allied Capital, Lehman, fracking shorts — the canon' },
      { slug: 'risk-and-crisis', strength: 3, note: 'Lehman short Jul 2007–Sep 2008' },
      { slug: 'contrarian-value', strength: 2, note: '\u201cBroken market\u201d thesis; compelling-values longs' },
    ],
    gaps: [
      'Wayback crawl of pre-gating letter PDFs (archive.org blocked from sandbox)',
      'Aeropostale equity-committee episode unresearched',
      'No authorized long-form biography/profile',
    ],
    notableFacts: [
      { fact: 'Nov 13, 2008 House hearing witnesses were Soros, Paulson, Simons, Falcone, Griffin + regulators — Einhorn was NOT among them (premise validated).', url: 'https://www.govinfo.gov/content/pkg/CHRG-110hhrg56582/html/CHRG-110hhrg56582.htm' },
      { fact: 'Feb 22, 2013: Judge Richard Sullivan granted Greenlight\u2019s preliminary injunction against Apple\u2019s bundled Proposal 2 vote (the \u201ciPrefs\u201d fight).', url: 'https://www.law.com/almID/1202590550081' },
      { fact: 'Sohn 2026 deck (public download): five transition stories — Acadia, Centene, Fluor, Versant, Victoria\u2019s Secret.', url: 'https://seekingalpha.com/news/4591548-david-einhorn-of-greenlight-capital-touts-5-transition-stories-at-sohn-conference' },
      { fact: 'Q2 2026 letter: \u22124.3% net (+1.9% YTD); Einhorn called SpaceX\u2019s $1.75 trillion IPO a major concern.', url: 'https://hedgefundalpha.com/investor-letters/greenlight-capital-q2-2026-letter/' },
      { fact: 'Legal entity now \u201cDME Capital Management, LP d/b/a Greenlight Capital\u201d per deck disclaimers.', url: 'https://www.greenlightcapital.com' },
    ],
    timeline: [
      { date: '1996', event: 'Greenlight Capital founded (May)' },
      { date: '2002–09', event: 'Allied Capital short + public campaign; profits donated' },
      { date: 'Nov 2007 – Sep 2008', event: 'Lehman short (VIC talk Nov 29, 2007; Sohn deck May 21, 2008)' },
      { date: '2013', event: 'Apple iPrefs proposal + SDNY lawsuit \u2192 withdrawal' },
      { date: '2015', event: 'Sohn fracking shorts (Pioneer, Concho, EOG, Whiting, Continental)' },
      { date: '2023–26', event: 'Vitesco/Schaeffler advocacy; turnaround basket; quarterly letters via press' },
    ],
  },
  {
    slug: 'prem-watsa',
    name: 'V. Prem Watsa',
    aliases: '\u201cOracle of Ontario\u201d (media tag)',
    firm: 'Fairfax Financial Holdings (founded 1985) · Hamblin Watsa Investment Counsel',
    activePeriod: '1985–present',
    location: 'Toronto, Canada',
    tier: 'ACTIVE',
    tierRationale: 'Deepest free primary letter archive of the whole batch (1985–2025 verified live end-to-end), an authorized 2025 biography, and a live 2026 news cycle supplying current-state passages.',
    passageYield: 'VERY HIGH',
    status: 'active',
    statusNote: 'Succession to Ben Watsa announced Nov 2025. 2025 was the record year: $4.8B net income, 18.7% BVPS CAGR since 1985. Q2 2026: BVPS $1,304.39.',
    summary:
      'A 40-year, free, complete CEO-letter run — the single best compounding narrative in the cohort: Nikkei puts (1988–90), the $18B-notional CDS crisis program (2003–09), the India build-out (BIAL 74%, Go Digit IPO), and the BlackBerry arc (failed take-private \u2192 debentures \u2192 full exit Aug 2026). The Fairfax Way (Nov 2025) is the authorized biography spine.',
    themes: [
      { slug: 'risk-and-crisis', strength: 3, note: 'Nikkei puts \u2192 2008 CDS windfall \u2192 2009 deployment' },
      { slug: 'contrarian-value', strength: 3, note: 'Contrarian macro calls; \u201c1-in-50-year storm\u201d deployment' },
      { slug: 'emerging-markets', strength: 3, note: 'India build-out: BIAL, Eurobank bridge, Go Digit' },
      { slug: 'firm-continuity', strength: 3, note: 'Ben Watsa succession (announced Nov 2025)' },
      { slug: 'lineage', strength: 2, note: 'Fairfax explicitly modeled on the Berkshire template' },
    ],
    gaps: [
      'No official AGM Q&A transcripts (community notes only)',
      'University convocation speech texts not located',
      'Short-seller-war settlement court documents unverified',
      'OSC 2014 trading-review outcome unconfirmed',
      'Sheet\u2019s BNN 2018 video ID unverified (Bloomberg\u2019s upload is BW08lI8518A)',
    ],
    notableFacts: [
      { fact: '2025 (40th anniversary) was Fairfax\u2019s best year in history: record net income $4.8B; BVPS compounded 18.7%/yr since 1985.', url: 'https://www.fairfax.ca/wp-content/uploads/2026/03/FFH_Fairfax-Financials-Shareholders-Letter-2025-with-attachments-092704.pdf' },
      { fact: 'The 1988 letter contains the verbatim line \u201cCount me among the skeptics\u201d on Japan; the 1990 letter reports $2.4M realized gains on Nikkei Puts as Japan fell 38.7%.', url: 'https://www.fairfax.ca/wp-content/uploads/1988-Letter.pdf' },
      { fact: 'Fairfax India\u2019s BIAL (Bengaluru airport) ownership reached 74.0% after the Feb 20, 2025 closing.', url: 'https://www.fairfaxindia.ca/press-releases/fairfax-india-completes-acquisition-of-an-additional-10-interest-in-bangalore-international-airport-limited-02-20-2025' },
      { fact: 'Go Digit listed May 23, 2024 on NSE at \u20b9286 vs \u20b9272 issue price (+5.15%).', url: 'https://bfsi.economictimes.indiatimes.com/news/insurance/go-digits-ipo-listing-market-volatility-and-moderate-subscription-impact-debut/110357359' },
      { fact: 'Fairfax has now fully exited BlackBerry (Globe & Mail, Aug 14, 2026) after ~US$200M debenture interest income over 16 years.', url: 'https://www.theglobeandmail.com/business/article-fairfax-financial-sells-out-of-blackberry-at-a-steep-loss' },
    ],
    timeline: [
      { date: '1985', event: 'Fairfax founded' },
      { date: '1988–90', event: 'Nikkei puts hedge — \u201cCount me among the skeptics\u201d' },
      { date: '2003–09', event: 'Crisis hedging program (>80% equity hedges, ~$18B CDS) \u2192 2008 windfall \u2192 2009 deployment' },
      { date: '2013–22', event: 'BlackBerry: failed $4.7B LOI \u2192 debentures \u2192 consortium participation' },
      { date: '2013–19', event: 'Eurobank / Greek bank rescue through recapitalization' },
      { date: '2015–24', event: 'Fairfax India platform; BIAL to 74%; Go Digit IPO (May 2024)' },
      { date: 'Nov 2025', event: 'Ben Watsa named successor chairman' },
      { date: 'Aug 2026', event: 'Full BlackBerry exit; Q2 2026 BVPS $1,304.39' },
    ],
  },
  {
    slug: 'li-lu',
    name: 'Li Lu',
    aliases: 'Li Lu (李录)',
    firm: 'Himalaya Capital Management (founded 1997; long-only since ~2004)',
    activePeriod: '1997–present',
    location: 'Seattle / Beijing',
    tier: 'ACTIVE',
    tierRationale: 'Official free corpus is essay-length and framework-grade (8+ PDFs); the newly discovered 13F spine adds a verifiable decision trail; only the letter archive is structurally missing (documented gap).',
    passageYield: 'HIGH',
    status: 'active',
    statusNote: 'Himalaya letters remain private by policy; the official site moved to himcap.com. Q2 2026 13F (filed Aug 14, 2026) shows 8 US holdings incl. a new ~$469M PDD block.',
    summary:
      'Framework-grade public voice: the Dec 2024 PKU keynote \u201cGlobal Value Investing in Our Era,\u201d the 2015 \u201cThe Prospect of Value Investing in China,\u201d the Munger eulogy, the 2006 Columbia masterclass (faithful transcript), and a 12,490-word Zhenghe Island interview translation. The sheet\u2019s \u201cno regulatory sources\u201d verdict was wrong — Himalaya files quarterly 13Fs.',
    themes: [
      { slug: 'emerging-markets', strength: 3, note: 'Civilization-3.0 framework; value investing in China' },
      { slug: 'lineage', strength: 3, note: 'Munger apprenticeship; BYD introduction; $88M entrustment' },
      { slug: 'long-horizon', strength: 2, note: 'Long-only conversion; circle-of-competence discipline' },
      { slug: 'contrarian-value', strength: 1, note: 'Turbulent-era positioning (2024 keynote)' },
    ],
    gaps: [
      'Private investor letters (only fragments circulate via mastersinvest)',
      'CITIC 2020/2025 book untranslated into English',
      'No audio/video originals of the PKU keynotes',
      'FT profile exact publication date provisional',
    ],
    notableFacts: [
      { fact: 'Himalaya\u2019s Q2 2026 13F (filed Aug 14, 2026) shows 8 US holdings including a newly disclosed 6,153,119-share PDD position (~$469M).', url: 'https://valuesider.com/guru/li-lu-himalaya-capital-management/portfolio' },
      { fact: 'Berkshire bought 225M BYD H-shares at ~HK$8 (~$230M) in September 2008 — \u201cMunger deserves 100 percent of the credit.\u201d', url: 'https://www.cnbc.com/2018/05/08/charlie-munger-plays-berkshires-hand-in-china-bet-and-seeks-more-opportunities.html' },
      { fact: 'Munger entrusted ~$88M of family money to Li Lu; by 2023 it was ~$400M.', url: 'https://markets.businessinsider.com/news/stocks/charlie-munger-li-lu-investment-stocks-himalaya-byd-buffett-berkshire-2023-9' },
      { fact: 'The official publications page is now himcap.com/publications — 8+ free PDFs incl. two Modernization essays and a Recommended Book List.', url: 'https://www.himcap.com/publications' },
      { fact: 'The 2006 Columbia masterclass survives in a full faithful transcript, and a second Li Lu\u2013Greenwald conversation transcript also exists.', url: 'https://roiss.substack.com/p/li-lus-investing-masterclass-at-columbia' },
    ],
    timeline: [
      { date: '1997', event: 'Himalaya founded (long/short)' },
      { date: '~2004', event: 'Conversion to long-only after near-death experience; Munger entrustment' },
      { date: '2008', event: 'Introduces BYD to Munger; Berkshire buys ~10% (~$230M)' },
      { date: '2015–24', event: 'PKU keynote series: \u201cThe Prospect of Value Investing in China\u201d (2015) \u2192 \u201cGlobal Value Investing in Our Era\u201d (Dec 2024)' },
      { date: 'Nov 2023', event: 'Munger eulogy essay published' },
      { date: 'Aug 2026', event: 'Q2 2026 13F: new PDD block disclosed' },
    ],
  },
  {
    slug: 'thomas-russo',
    name: 'Thomas Russo',
    aliases: 'Tom Russo',
    firm: 'Gardner Russo & Quinn LLC (EDGAR CIK 860643; firm lineage to 1968)',
    activePeriod: '1989–present (firm lineage to 1968)',
    location: 'Lancaster, Pennsylvania',
    tier: 'ACTIVE',
    tierRationale: 'Dense, free, primary-rich spoken corpus spanning 2009–2026, with two brand-new 2025/2026 transcripts; only minor unverified remnants (one video ID).',
    passageYield: 'HIGH',
    status: 'active',
    statusNote: '13F current through Q2 2026 ($8.93B). ADV (Mar 2026): Russo remains Managing Member & Chairman. Semper Vic commentary partially circulates via aggregator mirrors.',
    summary:
      'The \u201ccapacity to suffer\u201d canon: three Talks at Google, two Ivey Ben Graham Centre decks, Latticework 2022 + 2025 transcripts, the 75-minute 2013 interview, and the Graham & Doddsville ecosystem. Tenure arcs documented back to 1981 (Berkshire) and 1986 (Nestlé); >40% of AUM in family-controlled firms.',
    themes: [
      { slug: 'owner-managers', strength: 3, note: '>40% AUM family-controlled; \u201cavoid agency costs at all costs\u201d' },
      { slug: 'long-horizon', strength: 3, note: 'Capacity to suffer; 40-year Heineken tenure' },
      { slug: 'business-quality', strength: 2, note: 'Global consumer-brand durability (Nestlé, Richemont)' },
      { slug: 'lineage', strength: 2, note: 'Berkshire holder since 1981; G&D ecosystem' },
    ],
    gaps: [
      'Apr 15, 2024 Google-talk video ID (08clbvAO0KY) NOT_FOUND — verify directly before ingest',
      'WealthTrack #436 (Mar 2009) episode number unconfirmed',
      'Registered-fund registrant CIK still unidentified (N-CSR trail)',
      'Official Semper Vic letter archive absent (aggregator mirrors only)',
    ],
    notableFacts: [
      { fact: 'Gardner Russo & Quinn\u2019s last reported 13F (Q2 2026) covered $8.93B in managed securities.', url: 'https://whalewisdom.com/filer/gardner-russo-gardner' },
      { fact: 'At Latticework 2025, Russo described the Semper Vic partnership compounding at 11.5% annually.', url: 'https://www.latticework.com/p/latticework-2025-tom-russo-on-finding' },
      { fact: 'Semper Vic May 2025 commentary (via HFA mirror): Russo \u201cnot worried\u201d about Berkshire after Buffett\u2019s exit.', url: 'https://hedgefundalpha.com/investor-letters/tom-russo-semper-vic-may-2025/' },
      { fact: 'Ivey BGC 2026 conference (Apr 15, 2026): Russo spoke on \u201cCapacity to Suffer – Global Value Investing.\u201d', url: 'https://hedgefundalpha.com/conferences/ben-graham-centre-2026-value-investing-conference/' },
      { fact: 'Graham & Doddsville Issue 15 (Spring 2012) Russo profile preserved as PDF at Stanford Law.', url: 'https://law.stanford.edu/index.php?webauth-document=event/691663/media/slspublic/Graham%20%26%20Doddsville%20-%20Issue%2015%20-%20Spring%202012%20-%20Russo%20Profile.pdf' },
    ],
    timeline: [
      { date: '1981 / 1986', event: 'Foundational buys: Berkshire (1981), Nestlé (1986); Heineken ~40yrs' },
      { date: '1989', event: 'Joins Gardner Russo & Gardner (renamed Gardner Russo & Quinn)' },
      { date: '2009–18', event: 'Spoken-corpus era: Google talks 2015/2018, Ivey deck 2012, 75-min interview 2013' },
      { date: '2022', event: 'Latticework keynote: tenure data disclosed' },
      { date: '2025–26', event: 'Latticework 2025 transcript; \u201cInvesting by the Book\u201d Ep. 84 (Jun 2026); BGC 2026 deck' },
    ],
  },
  {
    slug: 'chuck-akre',
    name: 'Charles T. \u201cChuck\u201d Akre Jr.',
    aliases: 'Chuck Akre',
    firm: 'Akre Capital Management (founded 1989) · Akre Focus Fund \u2192 Akre Focus ETF (AKRE, NYSE Arca)',
    activePeriod: '1970s–present (own shop 1989–)',
    location: 'Middleburg, Virginia',
    tier: 'ACTIVE',
    tierRationale: 'Free primary corpus (our-thinking + 1988 letter + current commentaries) live and verified, with a major 2025 structural event (ETF conversion) documented on EDGAR and press.',
    passageYield: 'MEDIUM-HIGH',
    status: 'active',
    statusNote: 'ETF conversion completed Oct 27, 2025 (~$11.2B — one of the largest MF\u2192ETF conversions ever). John Neff now CEO/CIO; Chuck remains Chairman.',
    summary:
      'The \u201cthree-legged stool\u201d (business quality, management, reinvestment) framework corpus: white papers on akrecapital.com, the recovered 1988 shareholder letter, the ILTB Episode 135 interview (re-dated to Jun 18, 2019), and quarterly fund commentaries. The 2009–2022 commentary run needs Wayback/fiscal.ai recovery.',
    themes: [
      { slug: 'business-quality', strength: 3, note: 'Three-legged stool; compounding machines' },
      { slug: 'firm-continuity', strength: 3, note: 'John Neff succession; ETF conversion Oct 2025' },
      { slug: 'owner-managers', strength: 2, note: 'Management leg of the stool' },
      { slug: 'long-horizon', strength: 2, note: 'Buy-and-hold compounders (Berkshire holder since 1977)' },
      { slug: 'lineage', strength: 2, note: 'Buffett reinvestment-rate canon' },
    ],
    gaps: [
      '2009–2022 quarterly commentary run missing from current site',
      'Individual compounder names (CSU/Moody\u2019s/Mastercard) to verify in commentary text',
      'MOI sessions remain member-walled',
    ],
    notableFacts: [
      { fact: 'Akre Focus Fund \u2192 ETF conversion completed October 27, 2025; ticker AKRE on NYSE Arca; ~$11.2B at conversion.', url: 'https://www.akrefund.com' },
      { fact: 'John Neff serves as CEO and CIO; Chuck Akre remains Chairman.', url: 'https://www.akrefund.com/people/john-neff' },
      { fact: 'The most-cited Akre interview (Invest Like the Best \u201cThree-Legged Stool\u201d) is Episode 135, first aired June 18, 2019.', url: 'https://colossus.com/episode/akre-the-three-legged-stool' },
      { fact: 'The 1988 Shareholder Letter survives on Akre Capital\u2019s own site (Akre has been a Berkshire shareholder since 1977).', url: 'https://www.akrecapital.com/1988-shareholder-letter' },
      { fact: 'Q1 2026 commentary reports \u22124.33% total return citing valuation contraction despite strong fundamentals.', url: 'https://seekingalpha.com/article/4896233-akre-focus-etf-q1-2026-commentary' },
    ],
    timeline: [
      { date: '1989', event: 'Akre Capital Management founded' },
      { date: '2009', event: 'Akre Focus Fund launched' },
      { date: '2017–19', event: 'Google talk \u201cPeregrinations\u2026\u201d; ILTB EP.135; WealthTrack #1619' },
      { date: '2021–24', event: 'Team transition; \u201cHow We Think About Cash\u201d; Q2 2024 law-of-large-numbers commentary' },
      { date: 'Oct 27, 2025', event: 'MF\u2192ETF conversion completed (~$11.2B)' },
    ],
  },
  {
    slug: 'robert-vinall',
    name: 'Robert Vinall',
    aliases: 'Rob Vinall',
    firm: 'RV Capital AG (Kilchberg/Zurich; started 2006) · Business Owner Fund (inception Sept 30, 2008)',
    activePeriod: '2008–present',
    location: 'Kilchberg/Zurich, Switzerland',
    tier: 'ACTIVE',
    tierRationale: 'Free, decision-rich, owner-published corpus with a live 2026 event trail; only mechanical enumeration work remains on the letter index.',
    passageYield: 'HIGH',
    status: 'active',
    statusNote: 'NAV \u20ac1,405.32 at Sept 2025 (+17.1% YTD). 2025 annual letter: Prosus and PDD sold; new selling framework. 13F US sleeve Q2 2026: $382.9M, 13 stocks.',
    summary:
      'The crown jewels are the Co-Investor Letters — decision-rich including formal loss autopsies (Ryman: \u201cby far the worst investment I have ever made\u201d). Multi-modal corpus: letters + letter audio (podcast read-throughs) + Annual Gathering videos + a verbatim 13F trail. Founder-character underwriting exemplified by the Carvana chain (initiation \u2192 \u221280% drawdown \u2192 doubling down \u2192 Ernie Garcia headlining the 2026 Gathering).',
    themes: [
      { slug: 'owner-managers', strength: 3, note: 'Founder-character underwriting (Garcia/Carvana)' },
      { slug: 'mistakes-sell-discipline', strength: 3, note: 'Ryman autopsy; 2025 selling framework' },
      { slug: 'long-horizon', strength: 2, note: 'Holding-period patience; AUM limits' },
      { slug: 'business-quality', strength: 2, note: 'Owner-earnings lineage; compounder phases' },
      { slug: 'emerging-markets', strength: 2, note: 'China basket 2024–25 (fear-greed entries \u2192 exits)' },
    ],
    gaps: [
      'rvcapital.ch /post/* enumeration (index behind login)',
      'Pre-2011 letters claimed by community but unverified',
      'IPCO initiation not directly re-verified',
      'Swiss KVG/prospectus docs offline',
    ],
    notableFacts: [
      { fact: 'Q2 2026 US 13F sleeve: 13 stocks, $382,888,000 (portfolio date 30 Jun 2026).', url: 'https://www.dataroma.com/m/holdings.php?m=RVC' },
      { fact: 'The H1 2025 Co-Investor letter contains a formal Ryman Healthcare postmortem — \u201cby far the worst investment.\u201d', url: 'https://www.worldlyinvest.com/p/mistaken-investments-from-letters-parti' },
      { fact: 'Business Owner Fund NAV stood at \u20ac1,405.32 at end-September 2025, +17.1% YTD.', url: 'https://hedgefundalpha.com/investor-letters/business-owner-fund-september-2025-commentary/' },
      { fact: 'The 2025 annual letter reveals sales of Prosus and PDD Holdings plus a new selling framework.', url: 'https://podcasts.apple.com/us/podcast/the-rob-vinall-podcast/id1548228664' },
      { fact: 'Carvana founder Ernie Garcia gave a \u201cMountainside Chat\u201d at RV Capital\u2019s 2026 Annual Gathering (Jan 12, 2026).', url: 'https://www.youtube.com/watch?v=p5aIarG8rLo' },
    ],
    timeline: [
      { date: '2006–08', event: 'RV Capital started; Business Owner Fund inception Sept 30, 2008' },
      { date: '2014–16', event: 'Credit Acceptance and Meta initiations' },
      { date: '2021–22', event: 'Carvana initiation; crisis doubling-down (\u221280% drawdown)' },
      { date: '2024', event: 'IPCO first O&G position; China basket (\u201csix investments\u201d)' },
      { date: '2025', event: 'Ryman autopsy (H1 letter); Prosus/PDD sold; selling framework' },
      { date: 'Jan 2026', event: 'Annual Gathering: Ernie Garcia + live Q&A (YouTube primaries)' },
    ],
  },
  {
    slug: 'nicholas-sleep',
    name: 'Nicholas Sleep',
    aliases: 'Nick Sleep (with Qais \u201cZak\u201d Zakaria)',
    firm: 'Nomad Investment Partnership (2001–2014) · I.G.Y. Foundation',
    activePeriod: '2001–2014',
    location: 'London, UK',
    tier: 'ACTIVE',
    tierRationale: 'The deepest free single-source corpus in the batch: one authorized 219-page document (~110k words) yields the entire letters canon.',
    passageYield: 'VERY HIGH',
    status: 'wound_down',
    statusNote: 'Fund liquidated early 2014 (final letter Dec 2013, verified verbatim). Letters\u2019 authorized home = IGY Foundation; Stripe Press print edition ships Dec 1, 2026.',
    summary:
      'The single highest-yield ingest in the batch: the IGY-authorized full collection of Nomad letters (free, 219pp) containing the Amazon free-cash-flow analyses, the Costco \u201cscale economics shared\u201d thesis, and the destination-analysis framework. FT-cited record: 921.1% cumulative / 18.4% p.a. after fees over 12 years. Final letter recommended partners simply hold Amazon, Costco and Berkshire.',
    themes: [
      { slug: 'business-quality', strength: 3, note: 'Scale economics shared; \u201chonestly run compounding machines\u201d' },
      { slug: 'long-horizon', strength: 3, note: 'Destination analysis; inactive investing' },
      { slug: 'lineage', strength: 2, note: 'Buffett-style partnership structure; final BRK recommendation' },
      { slug: 'mistakes-sell-discipline', strength: 2, note: 'Error-admitting letters' },
    ],
    gaps: [
      'No pre-2001 material (Marathon-era references only)',
      'Minimal interviews/appearances by Sleep himself',
      'Stripe Press pagination pending (Dec 2026) — re-paginate after print',
    ],
    notableFacts: [
      { fact: '921.1% cumulative / 18.4% p.a. after performance fees over 12 years to 2013 (FT).', url: 'https://www.ft.com/content/2b41c6cb-ba68-47c7-b488-7bf778d64050' },
      { fact: 'Final letter December 2013; portfolio liquidated \u201ca few months later\u201d — confirmed verbatim in the authorized PDF postamble.', url: 'https://igyfoundation.org.uk/wp-content/uploads/2021/03/Full_Collection_Nomad_Letters_.pdf' },
      { fact: 'Stripe Press print edition \u201cNomad Letters\u201d ships Dec 1, 2026 (336pp, new prologue by Sleep, foreword by John Collison).', url: 'https://www.porchlightbooks.com/products/nomad-letters-nick-sleep-9781953953599' },
      { fact: 'The authors request attribution and links to the IGY authorized version rather than bootleg copies.', url: 'https://igyfoundation.org.uk/nomad-partnership-letters' },
    ],
    timeline: [
      { date: '2001–02', event: 'Nomad launch; cigar-butt beginnings' },
      { date: '2001–03', event: 'Amazon initiation and post-crash defense' },
      { date: '2002–03', event: 'Costco bought and re-underwritten (\u201cDeconstructing the Business case\u201d)' },
      { date: '2006', event: 'Spin-out from Marathon to independence' },
      { date: 'Dec 2013 – early 2014', event: 'Final letter (hold Amazon/Costco/Berkshire); liquidation' },
      { date: '2021–26', event: 'IGY authorized PDF published; Stripe Press print edition calendared' },
    ],
  },
  {
    slug: 'guy-spier',
    name: 'Guy Spier',
    aliases: '@gspier · \u201cThe Education of a Value Investor\u201d author',
    firm: 'Aquamarine Capital / Aquamarine Fund (founded 1997, Zurich) · VALUEx Zurich (founder)',
    activePeriod: '1997–2026',
    location: 'Zurich, Switzerland',
    tier: 'ACTIVE',
    tierRationale: 'Free, registration-light primary letters (2010–2025 incl. the final letter), a verified memoir, and a historic, time-sensitive final letter; wind-down makes prompt capture a priority.',
    passageYield: 'HIGH',
    status: 'wound_down',
    statusNote: 'Wind-down announced Feb 2026 (final 2025 letter) after a cancer diagnosis; converting to a family office. 2025 return 11.3%; cumulative ~1,185.6%.',
    summary:
      'A 16-vintage letter archive (DocSend-hosted, free) plus the memoir and the Bloomberg op-ed \u201cThe Golden Age of Value Investing Is Over\u201d (Sep 18, 2025). The $650,100 Buffett lunch (2008, with Pabrai) is the arc\u2019s anchor. TEDx credit narrowed; ILTB and Masters-in-Business credits verified-negative — do not import.',
    themes: [
      { slug: 'lineage', strength: 3, note: 'Buffett lunch arc; inner scorecard' },
      { slug: 'firm-continuity', strength: 3, note: 'Wind-down after 28 years; family-office conversion' },
      { slug: 'mistakes-sell-discipline', strength: 1, note: 'Meta-level honesty: \u201cgolden age is over\u201d mea culpa' },
    ],
    gaps: [
      'Pre-2010 letters (1997–2009) not on the public archive',
      'No 13F-style holdings trail (private fund)',
      'ILTB and Masters-in-Business credits are dead ends (verified-negative)',
    ],
    notableFacts: [
      { fact: 'Aquamarine letter archive 2010–2024 is free on the fund site, every letter DocSend-hosted.', url: 'https://www.aquamarinefund.com/annual-letter-to-investors' },
      { fact: 'Final 2025 letter announced the fund\u2019s wind-down after 28 years; 2025 return 11.3%; cumulative ~1,185.6%.', url: 'https://www.opalesque.com/713551/Guy_Spier_winds_down_Aquamarine_Fund_after_28355.html' },
      { fact: '$650,100 Buffett lunch (with Pabrai) — auction won June 2007, lunch June 25, 2008.', url: 'https://www.cnbc.com/2008/06/25/lunch-with-warren-buffett-worth-every-penny-at-650100.html' },
      { fact: 'Bloomberg Opinion, \u201cThe Golden Age of Value Investing Is Over\u201d (Sep 18, 2025).', url: 'https://www.bloomberg.com/opinion/articles/2025-09-18/buffett-munger-soros-golden-age-of-value-investing-is-over' },
    ],
    timeline: [
      { date: '1997', event: 'Aquamarine founded in Zurich, modeled on the Buffett partnerships' },
      { date: 'Jun 2008', event: 'Buffett charity lunch (won 2007 with Pabrai, $650,100)' },
      { date: '2014', event: 'The Education of a Value Investor published' },
      { date: 'Sep 2025', event: '\u201cGolden age of value investing is over\u201d op-ed' },
      { date: 'Feb 2026', event: 'Wind-down announced in final letter; family-office conversion' },
    ],
  },
  {
    slug: 'francois-rochon',
    name: 'François Rochon',
    aliases: 'Rochon Global Portfolio (model composite)',
    firm: 'Giverny Capital Inc. (Montreal, founded 1998) · Giverny Capital Asset Management LLC (2020)',
    activePeriod: '1993–present (composite since Jul 1, 1993)',
    location: 'Montreal, Québec',
    tier: 'ACTIVE',
    tierRationale: 'A nearly-complete free primary letters run (2017–2025 live; 2001–2016 recoverable), a verified talk transcript, a named podcast canon, and an authorized biography; only pre-2017 recovery and translation keep it from CORE-adjacent.',
    passageYield: 'HIGH',
    status: 'active',
    statusNote: 'Letters continue through the 2025 annual letter (posted Mar 2026). Rochon Global Portfolio: 15.3% CAGR vs 9.5% benchmark since 1993 (2020 letter).',
    summary:
      'Owner-earnings orientation with the cohort\u2019s most systematic error canon: the annual \u201cPodium of Errors\u201d (five-year post-mortems, medals for errors of omission), the Carret sell-discipline rule, and named decisions (AMETEK, Stericycle, Five Below, the TSM delay, the 14-year Pool Corp omission). Google talk \u201cThe Art of Investing\u201d (Dec 5, 2017) survives with a full transcript.',
    themes: [
      { slug: 'business-quality', strength: 3, note: 'Owner\u2019s-earnings orientation' },
      { slug: 'mistakes-sell-discipline', strength: 3, note: 'Podium of Errors; Carret rule' },
      { slug: 'long-horizon', strength: 2, note: 'Buy-and-hold quality; art-collection identity' },
      { slug: 'lineage', strength: 2, note: 'Buffett/Graham/Templeton/Fisher synthesis; Ruane Cunniff via David Poppe' },
      { slug: 'contrarian-value', strength: 2, note: 'COVID-crash purchases; fully-invested stance' },
    ],
    gaps: [
      '2001–2016 letters off the live site (Wayback/mirror recovery needed)',
      'Gosselin biography untranslated (French)',
      '\u201cOur Companies\u201d letter sections partially reserved-for-partners',
    ],
    notableFacts: [
      { fact: 'Rochon Global Portfolio: 15.3% CAGR vs 9.5% benchmark since July 1, 1993 (as of the 2020 letter).', url: 'https://givernycapital.com/wp-content/uploads/2022/07/giverny-capital-annual-letter-2020.pdf' },
      { fact: 'RWH016 = \u201cThe Best of the Best w/ François Rochon\u201d, William Green, TIP Network, Nov 12, 2022.', url: 'https://www.theinvestorspodcast.com/richer-wiser-happier/the-best-of-the-best-w-francois-rochon' },
      { fact: 'Google Talk \u201cThe Art of Investing\u201d (Dec 5, 2017) with full transcript PDF.', url: 'https://www.youtube.com/watch?v=ejmn_pxJwtI' },
      { fact: 'Gosselin biography: \u201cFrançois Rochon. Le parcours singulier d\u2019un investisseur d\u2019exception\u201d (Guy Saint-Jean Éditeur, Feb 2023).', url: 'https://saint-jeanediteur.com/titre/francois-rochon-le-parcours-singulier-dun-investisseur-dexception' },
    ],
    timeline: [
      { date: 'Jul 1, 1993', event: 'Rochon Global Portfolio inception (family accounts as model)' },
      { date: '1998', event: 'Giverny Capital founded' },
      { date: '2004→', event: 'Letter covers feature the Giverny corporate art collection' },
      { date: '2015–20', event: 'Named decisions: AMETEK, Stericycle, Five Below; Podium of Errors canon' },
      { date: '2017–25', event: 'Live letters run; Google talk; RWH016/TIP709 podcast canon' },
    ],
  },
  {
    slug: 'tweedy-browne',
    name: 'Tweedy, Browne',
    aliases: 'Tweedy, Browne Company LLC · \u201coldest value investing firm on Wall Street\u201d',
    firm: 'Tweedy, Browne Company LLC (founded 1920; Stamford, CT)',
    activePeriod: '1920–present',
    location: 'Stamford, Connecticut',
    tier: 'DEVELOPING',
    tierRationale: 'The free primary archive is arguably the deepest in the batch, but the corpus is firm-level (committee-authored) rather than person-level — decision attribution is thinner; upgrade after ingestion shows decision-passage density.',
    passageYield: 'MEDIUM-HIGH',
    status: 'active',
    statusNote: 'William Browne now Senior Advisor; committee of seven MDs; buybacks fund renamed May 27, 2026; partnerships arm launched. \u201cNo Investment Committee member has ever left to join another investment firm.\u201d',
    summary:
      'The Graham-lineage institutional record: Graham-Newman was a primary brokerage client; Tom Knapp joined from Graham-Newman in 1957; Knapp & Anderson\u2019s Tweedy, Browne Partners results appear in Table 2 of Buffett\u2019s Superinvestors essay. Free archive: legacy fund reports back to 1994, 187 commentary items (2003–2026), and the \u201cWhat Has Worked in Investing\u201d evidence booklet.',
    themes: [
      { slug: 'contrarian-value', strength: 3, note: 'What Has Worked: low P/B, low P/E, buyback effects' },
      { slug: 'lineage', strength: 3, note: 'Graham-Newman \u2192 Knapp (1957) \u2192 Anderson (1968)' },
      { slug: 'firm-continuity', strength: 3, note: 'Committee stability; AMG structure since 1997' },
    ],
    gaps: [
      'Pre-1993 partnership-era letters not on the live site',
      'Decision attribution is committee-level',
      'Chris Browne\u2019s 1990s newsletter letters need extraction from old fund reports',
      'Official \u201cWhat Has Worked\u201d PDF URL not located this session (mirror available)',
    ],
    notableFacts: [
      { fact: 'Founded 1920 by Forrest B. Tweedy; Graham-Newman was a primary brokerage client; Tom Knapp joined 1957 from Graham-Newman and led the broker\u2192investor conversion.', url: 'https://www.tweedyfunds.com/about' },
      { fact: 'Buffett\u2019s \u201cSuperinvestors of Graham-and-Doddsville\u201d (1984): \u201cTom Knapp and Ed Anderson\u2026 formed Tweedy, Browne Partners, and their investment results appear in Table 2.\u201d', url: 'https://business.columbia.edu/insights/chazen-global-insights/superinvestors-graham-and-doddsville' },
      { fact: 'Chris Browne died December 13, 2009 (not 2019).', url: 'https://dealbook.nytimes.com/2009/12/16/christopher-h-browne-value-investor-dies' },
      { fact: 'AMG bought 70% of the firm in 1997 for $300M; the first public mutual fund was created in 1993.', url: 'https://en.wikipedia.org/wiki/Tweedy,_Browne' },
      { fact: '\u201cWhat Has Worked in Investing\u201d booklet (50+ studies) referenced on the firm\u2019s philosophy page with a full 60-page mirror available.', url: 'https://www.tweedyfunds.com/investment-philosophy' },
    ],
    timeline: [
      { date: '1920', event: 'Forrest B. Tweedy founds the firm — \u201cbuyers of last resort\u201d' },
      { date: '1930s–50s', event: 'Graham-Newman a primary brokerage client; Schloss/Buffett relationships' },
      { date: '1957 / 1968', event: 'Knapp joins from Graham-Newman; Tweedy, Browne Partners formed with Anderson' },
      { date: '1993 / 1997', event: 'First public mutual fund; AMG acquires 70%' },
      { date: '2020–26', event: '100-year anniversary podcast; succession completed; fund renames; partnerships arm' },
    ],
  },
]

// ─── SOURCES (audited inventory) ─────────────────────────────────────────────

export const sources: SourceSeed[] = [
  // ── Michael Burry ──
  { investorSlug: 'michael-burry', yearLabel: '2000–2008', title: 'Scion Capital investor letters (unofficial mirror set)', type: 'letters', category: 'letters', publisher: 'Unofficial mirrors (Scribd · diyinvestor · mastersinvest)', url: 'https://www.scribd.com/document/436898728/Scion-Capital-Letters-pdf', access: 'Archive-only', provenance: 'likely primary (unofficial)', verificationState: 'NEEDS_REVIEW', value: 4, notes: 'Multiple mirrors confirmed; authenticate page-by-page against Wayback scioncapital.com before ingest; letters are Burry\u2019s copyrighted property — paraphrase-only indexing.' },
  { investorSlug: 'michael-burry', yearLabel: 'May 18, 2010', title: 'FCIC staff interview audio (97MB, no transcript)', type: 'interview', category: 'interviews', publisher: 'FCIC via Stanford Law mirror', url: 'https://fcic-static.law.stanford.edu/cdn_media/fcic-audio', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Bundled with Cornwall Capital session; transcription project queued.' },
  { investorSlug: 'michael-burry', yearLabel: 'Dec 2, 2025', title: '\u201cMichael Burry Speaks\u201d — Against the Rules (Pushkin)', type: 'interview', category: 'interviews', publisher: 'Pushkin', url: 'https://www.pushkin.fm/podcasts/against-the-rules', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: '~40 min; full YouTube video (nsE13fvjz18); companion Substack post same day.' },
  { investorSlug: 'michael-burry', yearLabel: 'Oct 27, 2025', title: 'Final Scion investor letter (liquidation notice)', type: 'letters', category: 'letters', publisher: 'Scion (quoted by Reuters)', url: 'https://www.reuters.com/sustainability/sustainable-finance-reporting/michael-burry-big-short-fame-deregisters-scion-asset-management-2025-11-13', access: 'Free (quotes)', provenance: 'verified primary (press-quoted)', verificationState: 'VERIFIED', value: 5, notes: '\u201cWith a heavy heart, I will liquidate the funds and return capital, but for a small audit/tax holdback.\u201d' },
  { investorSlug: 'michael-burry', yearLabel: '2025–2026', title: 'Cassandra Unchained (ongoing Substack corpus)', type: 'letters', category: 'letters', publisher: 'Substack', url: 'https://michaeljburry.substack.com', access: 'Paid ($400/yr)', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: '\u201cDr. Michael Burry\u2019s sole focus\u201d; \u201cTrading Post\u201d series; AI-bubble circular-financing thesis (~$176B depreciation understatement 2026–28).' },
  { investorSlug: 'michael-burry', yearLabel: 'Apr 4, 2010', title: 'NYT op-ed: \u201cI Saw the Crisis Coming. Why Didn\u2019t the Fed?\u201d', type: 'article', category: 'other', publisher: 'New York Times', url: 'https://www.nytimes.com/2010/04/04/opinion/04burry.html', access: 'Paywall/free-mirror', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'First-person decision account; posted online Apr 3, print Apr 4.' },
  { investorSlug: 'michael-burry', yearLabel: 'Apr 2010', title: '\u201cBetting on the Blind Side\u201d (Big Short excerpt)', type: 'article', category: 'other', publisher: 'Vanity Fair', url: 'https://archive.vanityfair.com/article/2010/4/betting-on-the-blind-side', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 4, notes: 'Title corrected from \u201cBetting on the Blind\u201d.' },
  { investorSlug: 'michael-burry', yearLabel: '2010', title: 'The Big Short', type: 'book', category: 'books', publisher: 'W. W. Norton', url: 'https://www.penguinrandomhouse.com/books/305889/the-big-short-by-michael-lewis/', access: 'Purchase', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 4, notes: 'Narrative record of the CDS trade; pairs with the letters.' },
  { investorSlug: 'michael-burry', yearLabel: 'Apr 5, 2011', title: 'Vanderbilt Chancellor\u2019s Lecture \u201cMissteps to Mayhem\u201d (video + transcript)', type: 'speech', category: 'speeches', publisher: 'Vanderbilt News', url: 'https://news.vanderbilt.edu/2011/04/13/michael-burry-transcript', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Re-dated from 2010 to Apr 5, 2011.' },
  { investorSlug: 'michael-burry', yearLabel: '2012', title: 'UCLA Economics Commencement keynote (full transcript)', type: 'speech', category: 'speeches', publisher: 'UCLA Dept. of Economics', url: 'https://economics.ucla.edu/wp-content/uploads/2016/09/2012-Commencement-Speech.doc', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Re-dated from 2010 to 2012; .doc on official dept site.' },
  { investorSlug: 'michael-burry', yearLabel: '2016–Q3 2025', title: 'Scion 13F / EDGAR filings (terminal run)', type: 'regulatory', category: 'regulatory', publisher: 'SEC EDGAR (CIK 1649339)', url: 'https://www.sec.gov/edgar/browse/?CIK=1649339', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: '42 filings since Feb 16, 2016; final 13F-HR Q3 2025 filed Nov 3, 2025.' },
  { investorSlug: 'michael-burry', yearLabel: '1996–2000', title: 'MSN Money / Silicon Investor early writings (compiled)', type: 'archival', category: 'archival', publisher: 'csinvesting.org · Scribd mirrors', url: 'https://www.scribd.com/document/243827775/Michael-Burry-Some-Old-Posts-From-Silicon-Investor', access: 'Free', provenance: 'likely primary (mirrors)', verificationState: 'PROVISIONAL', value: 4, notes: 'Partially closes the pre-fame gap; original MSN URLs dead.' },
  { investorSlug: 'michael-burry', yearLabel: 'Jan 26, 2026', title: 'GME re-engagement coverage', type: 'article', category: 'other', publisher: 'Bloomberg', url: 'https://www.bloomberg.com/news/articles/2026-01-26/michael-burry-an-early-gamestop-buyer-is-back-hyping-the-stock', access: 'Metered', provenance: 'verified secondary', verificationState: 'PROVISIONAL', value: 3, notes: 'Post-shutdown GME buying per his own statement.' },

  // ── David Einhorn ──
  { investorSlug: 'david-einhorn', yearLabel: '1996→2018+', title: 'Greenlight quarterly investor letters (gated; Wayback recovery)', type: 'letters', category: 'letters', publisher: 'Greenlight Capital', url: 'https://www.greenlightcapital.com', access: 'Gated (login)', provenance: 'verified primary (gating confirmed)', verificationState: 'VERIFIED', value: 5, notes: 'Pre-restriction letters recoverable via Wayback (313 homepage captures since Mar 2000 — count not re-verifiable from sandbox).' },
  { investorSlug: 'david-einhorn', yearLabel: '2023–2026', title: 'Sohn decks publicly posted (Vitesco 2023 \u2192 \u201cTransition Stories\u201d 2026)', type: 'speech', category: 'speeches', publisher: 'Greenlight Capital', url: 'https://www.greenlightcapital.com/Download.aspx?ID=bf30b0db-b301-4169-9db5-ab0d2ba7d9b7', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Decks remain open while letters are gated; 2026 names: Acadia, Centene, Fluor, Versant, Victoria\u2019s Secret.' },
  { investorSlug: 'david-einhorn', yearLabel: '2008 / Dec 7, 2010', title: 'Fooling Some of the People All of the Time (both editions)', type: 'book', category: 'books', publisher: 'Wiley', url: 'https://www.wiley.com/en-us/Fooling+Some+of+the+People+All+of+the+Time%3A+A+Long+Short+Story-p-9780470536720', access: 'Purchase', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Allied Capital battle end-to-end; revised edition dated Dec 7, 2010 (2011 = later printing).' },
  { investorSlug: 'david-einhorn', yearLabel: 'Nov 29, 2007', title: '\u201cA Few Thoughts About Risk\u201d (VIC talk, Lehman exhibit LBEX-DOCID 2490444)', type: 'speech', category: 'speeches', publisher: 'Stanford (jbulow) Lehman docs mirror', url: 'https://web.stanford.edu/~jbulow/lehmandocs/docs/DEBTORS/LBEX-DOCID%202490444.pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'First public Lehman-short rationale; cited in the Lehman Examiner\u2019s Report.' },
  { investorSlug: 'david-einhorn', yearLabel: 'May 21, 2008', title: 'Sohn deck \u201cAccounting Ingenuity\u201d (Yale EliScholar)', type: 'speech', category: 'speeches', publisher: 'Yale EliScholar (YPFS)', url: 'https://elischolar.library.yale.edu/ypfs-documents/4372', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'The famous pitch; FCIC digital archive migrated to Yale.' },
  { investorSlug: 'david-einhorn', yearLabel: 'Nov 13, 2008', title: 'House hearing record (Einhorn NOT a witness)', type: 'testimony', category: 'regulatory', publisher: 'US GPO (govinfo)', url: 'https://www.govinfo.gov/content/pkg/CHRG-110hhrg56582/html/CHRG-110hhrg56582.htm', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Witnesses: Soros, Paulson, Simons, Falcone, Griffin + regulators. Public domain; peer-context record.' },
  { investorSlug: 'david-einhorn', yearLabel: 'Feb 22, 2013', title: 'Greenlight v. Apple, No. 13 Civ. 900 (SDNY) — iPrefs injunction', type: 'litigation', category: 'regulatory', publisher: 'SDNY (Law.com reprint)', url: 'https://www.law.com/almID/1202590550081', access: 'Free (reg)', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Bundled-vote injunction; Apple withdrew Proposal 2; governance precedent.' },
  { investorSlug: 'david-einhorn', yearLabel: 'Feb 8, 2024', title: 'Masters in Business interview + full transcript', type: 'interview', category: 'interviews', publisher: 'Bloomberg Radio / Ritholtz', url: 'https://ritholtz.com/2024/02/transcript-david-einhorn', access: 'Free', provenance: 'verified primary (transcript)', verificationState: 'VERIFIED', value: 5, notes: 'Closes the sheet\u2019s \u201cno major podcasts located\u201d gap.' },
  { investorSlug: 'david-einhorn', yearLabel: 'Oct 2025', title: '\u201cStill Broken? More Broken? Never Broken?\u201d — Simplify fireside with Michael Green', type: 'interview', category: 'interviews', publisher: 'Simplify', url: 'https://enteringthefall.simplify.us', access: 'Free', provenance: 'verified primary (video)', verificationState: 'VERIFIED', value: 4, notes: 'Indexing / \u201cbroken market\u201d themes.' },
  { investorSlug: 'david-einhorn', yearLabel: 'Nov 6, 2023', title: 'Vitesco letter to Special Committee (Schaeffler tender)', type: 'letters', category: 'letters', publisher: 'Business Wire', url: 'https://www.businesswire.com/news/home/20231105427728/en/Greenlight-Capital-Sends-Letter-to-Special-Committee-of-Vitesco-Technologies-Regarding-Schaeffler-AG-Tender-Offer-and-Merger-Proposal', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Greenlight argued Vitesco worth at least \u20ac150/share.' },
  { investorSlug: 'david-einhorn', yearLabel: 'May 4, 2015', title: 'Sohn fracking shorts coverage (\u201cmother fracker\u201d)', type: 'article', category: 'other', publisher: 'Fortune', url: 'https://fortune.com/2015/05/04/2015-sohn-conference-einhorn-shorting-mother-fracker-oil-companies', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 4, notes: 'Pioneer PT $78 vs $167; GM-short claim NOT confirmed — do not attribute.' },
  { investorSlug: 'david-einhorn', yearLabel: '2026', title: 'Q1/Q2 2026 letters (via press recaps)', type: 'letters', category: 'letters', publisher: 'Seeking Alpha · HFA', url: 'https://hedgefundalpha.com/investor-letters/greenlight-capital-q2-2026-letter/', access: 'Free (reg)', provenance: 'secondary (reprints)', verificationState: 'PROVISIONAL', value: 4, notes: 'Q1 2026 +6.5% net vs \u22124.4% S&P; Q2 \u22124.3% (+1.9% YTD); SpaceX $1.75T IPO critique.' },

  // ── Prem Watsa ──
  { investorSlug: 'prem-watsa', yearLabel: '1985–2025', title: 'Chairman\u2019s Annual Letters — complete run (free)', type: 'letters', category: 'letters', publisher: 'Fairfax Financial', url: 'https://www.fairfax.ca/investors', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Deepest free CEO-letter archive of any insurer checked; entire table live.' },
  { investorSlug: 'prem-watsa', yearLabel: 'Mar 2026', title: '2025 40th-anniversary letter (record $4.8B net income)', type: 'letters', category: 'letters', publisher: 'Fairfax Financial', url: 'https://www.fairfax.ca/wp-content/uploads/2026/03/FFH_Fairfax-Financials-Shareholders-Letter-2025-with-attachments-092704.pdf', access: 'Free', provenance: 'verified primary (text extracted)', verificationState: 'VERIFIED', value: 5, notes: 'BVPS CAGR 18.7% since 1985; record underwriting profit $1.8B; record interest & dividends $2.6B.' },
  { investorSlug: 'prem-watsa', yearLabel: '1988 / 1990', title: 'Nikkei-puts letters (\u201cCount me among the skeptics\u201d)', type: 'letters', category: 'letters', publisher: 'Fairfax Financial', url: 'https://www.fairfax.ca/wp-content/uploads/1988-Letter.pdf', access: 'Free', provenance: 'verified primary (text extracted)', verificationState: 'VERIFIED', value: 5, notes: '1988 letter carries the verbatim line; 1990 letter reports $2.4M realized gains as Japan fell 38.7%.' },
  { investorSlug: 'prem-watsa', yearLabel: 'Nov 18, 2025', title: 'The Fairfax Way (authorized biography)', type: 'book', category: 'books', publisher: 'Viking / Penguin Canada', url: 'https://www.penguinrandomhouse.com/books/806580/the-fairfax-way-by-david-thomas', access: 'Purchase', provenance: 'verified publisher pages', verificationState: 'VERIFIED', value: 5, notes: 'ISBN 9781037802195; blurbs from Pabrai, Cunningham, Templeton, Lang.' },
  { investorSlug: 'prem-watsa', yearLabel: '2025', title: '\u201cThe inside story of Fairfax\u2019s even bigger Big Short\u201d (book excerpt)', type: 'article', category: 'other', publisher: 'Financial Post', url: 'https://financialpost.com/fp-finance/inside-story-fairfax-financial-even-bigger-big-short', access: 'Free', provenance: 'verified primary (author excerpt)', verificationState: 'VERIFIED', value: 5, notes: 'David Thomas excerpt on the 2007–09 CDS windfall.' },
  { investorSlug: 'prem-watsa', yearLabel: 'Apr 16, 2026', title: 'AGM 2026 presentation deck', type: 'speech', category: 'speeches', publisher: 'Fairfax Financial', url: 'https://www.fairfax.ca/wp-content/uploads/2026/05/Fairfax-Financial-AGM-Presentation-2026.pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Posted May 2026; no official verbatim Q&A transcripts exist.' },
  { investorSlug: 'prem-watsa', yearLabel: 'May 25, 2018', title: 'BNN Bloomberg interview with Amanda Lang', type: 'interview', category: 'interviews', publisher: 'BNN Bloomberg', url: 'https://youtu.be/BW08lI8518A', access: 'Free', provenance: 'verified secondary', verificationState: 'NEEDS_REVIEW', value: 4, notes: 'Interview confirmed; Bloomberg\u2019s own video ID is BW08lI8518A — sheet\u2019s NQ1AAoNaPLU unverified. \u201cFirst-ever TV interview\u201d billing unconfirmed.' },
  { investorSlug: 'prem-watsa', yearLabel: '2019', title: 'Southeastern Asset Management podcast (Staley Cates × Watsa)', type: 'interview', category: 'interviews', publisher: 'Southeastern Asset Management', url: 'https://southeasternasset.com/podcasts/prem-watsa-insights-on-investing-underwriting-and-the-importance-of-culture', access: 'Free', provenance: 'secondary (official podcast)', verificationState: 'VERIFIED', value: 4, notes: 'Major interview missing from the original sheet; culture + short-attack survival.' },
  { investorSlug: 'prem-watsa', yearLabel: 'Aug 14, 2026', title: 'BlackBerry full-exit coverage', type: 'article', category: 'other', publisher: 'Globe and Mail', url: 'https://www.theglobeandmail.com/business/article-fairfax-financial-sells-out-of-blackberry-at-a-steep-loss', access: 'Paywall', provenance: 'verified secondary', verificationState: 'PROVISIONAL', value: 4, notes: 'Closes the BlackBerry decision arc (~US$200M debenture interest income).' },
  { investorSlug: 'prem-watsa', yearLabel: 'May 23, 2024', title: 'Go Digit IPO (NSE/BSE listing)', type: 'regulatory', category: 'regulatory', publisher: 'NSE/BSE · ET BFSI', url: 'https://bfsi.economictimes.indiatimes.com/news/insurance/go-digits-ipo-listing-market-volatility-and-moderate-subscription-impact-debut/110357359', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'Debuted \u20b9286 vs \u20b9272 issue (+5.15%).' },
  { investorSlug: 'prem-watsa', yearLabel: 'Feb 20, 2025', title: 'BIAL additional-10% acquisition (to 74.0%)', type: 'regulatory', category: 'regulatory', publisher: 'Fairfax India', url: 'https://www.fairfaxindia.ca/press-releases/fairfax-india-completes-acquisition-of-an-additional-10-interest-in-bangalore-international-airport-limited-02-20-2025', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 3, notes: 'Bengaluru airport control milestone.' },
  { investorSlug: 'prem-watsa', yearLabel: '2026', title: 'Q2 2026 financial results', type: 'regulatory', category: 'regulatory', publisher: 'Fairfax Financial', url: 'https://www.fairfax.ca/press-releases/fairfax-financial-holdings-limited-financial-results-for-the-second-quarter-2', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 3, notes: 'Net earnings $1,392.7M; BVPS $1,304.39 at Jun 30, 2026.' },

  // ── Li Lu ──
  { investorSlug: 'li-lu', yearLabel: '2024–2025', title: 'himcap.com publications corpus (8+ official PDFs)', type: 'speech', category: 'speeches', publisher: 'Himalaya Capital', url: 'https://www.himcap.com/publications', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Site moved from himalayacapital.com — re-point all URLs. Includes Modernization essays + Recommended Book List.' },
  { investorSlug: 'li-lu', yearLabel: 'Dec 7, 2024', title: '\u201cGlobal Value Investing in Our Era\u201d (PKU 10th-anniversary keynote)', type: 'speech', category: 'speeches', publisher: 'Himalaya Capital', url: 'https://cdn.prod.website-files.com/5ef3c7300432b40ed865991a/67a4f75703627bd3a927077e_Global%20Value%20Investing%20in%20Our%20Era%20(2024-12-07).pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Current worldview statement; turbulent-era framework.' },
  { investorSlug: 'li-lu', yearLabel: 'Nov 30, 2023', title: '\u201cRemembering My Teacher Charlie Munger\u201d (eulogy)', type: 'essay', category: 'speeches', publisher: 'Himalaya Capital', url: 'https://cdn.prod.website-files.com/5ef3c7300432b40ed865991a/656a8ceee9e7fe82b04f1156_Remember%20my%20teacher%20Charlie%20Munger%20Nov%2030%202023.pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Relationship record.' },
  { investorSlug: 'li-lu', yearLabel: 'Oct 2015', title: '\u201cThe Prospect of Value Investing in China\u201d (PKU keynote)', type: 'speech', category: 'speeches', publisher: 'Himalaya Capital', url: 'https://cdn.prod.website-files.com/5ef3c7300432b40ed865991a/5ef3c7300432b46a7e659977_The%20Prospect%20of%20Value%20Investing%20in%20China%20English%20Translation.pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Official English title corrected.' },
  { investorSlug: 'li-lu', yearLabel: '1990', title: 'Moving the Mountain (memoir)', type: 'book', category: 'books', publisher: 'Macmillan London', url: 'https://books.google.com/books/about/Moving_the_Mountain.html?id=wcFbOQAACAAJ', access: 'Free scan/libraries', provenance: 'bibliographic-verified (1990)', verificationState: 'VERIFIED', value: 4, notes: 'Some editions print author as \u201cLu Li\u201d; 1990 dating confirmed (not 1993).' },
  { investorSlug: 'li-lu', yearLabel: '2020 / 2025', title: 'Civilization, Modernization, Value Investing and China (CITIC + expanded ed.)', type: 'book', category: 'books', publisher: 'CITIC Press', url: 'https://www.amazon.com/Civilized-modern-value-investing-Chinese/dp/7521712595', access: 'Purchase', provenance: 'bibliographic-verified', verificationState: 'VERIFIED', value: 5, notes: 'Collects otherwise-unavailable lecture transcripts; Munger foreword; expanded 增订版 2025.' },
  { investorSlug: 'li-lu', yearLabel: '2006', title: 'Columbia Business School masterclass (Greenwald class) + Roiss transcript', type: 'speech', category: 'speeches', publisher: 'CBS / Roiss Substack', url: 'https://roiss.substack.com/p/li-lus-investing-masterclass-at-columbia', access: 'Free', provenance: 'faithful transcript of primary', verificationState: 'VERIFIED', value: 5, notes: 'THE masterclass; poor audio — use transcript. A second Li Lu × Greenwald transcript also exists.' },
  { investorSlug: 'li-lu', yearLabel: 'Nov 28, 2024', title: 'Zhenghe Island interview + English translation PDF (~12,490 words)', type: 'interview', category: 'interviews', publisher: 'Zhenghe Island / MOI Global', url: 'https://www.moiglobal.com/wp-content/uploads/li-lu-on-charlie-munger-202412.pdf', access: 'Free', provenance: 'secondary-translation of primary', verificationState: 'VERIFIED', value: 5, notes: 'BYD held \u201cabout 22 years\u201d; 50%+ drawdowns six-seven times; mark translated-provenance.' },
  { investorSlug: 'li-lu', yearLabel: 'Feb 22, 2024', title: 'FT Magazine profile', type: 'article', category: 'other', publisher: 'Financial Times', url: 'https://www.ft.com/content/5308cd9f-037e-4524-a6d8-7388b3514199', access: 'Metered paywall', provenance: 'verified secondary', verificationState: 'PROVISIONAL', value: 5, notes: 'Headline/date verified; one crawl showed Sep 2023 — treat exact date as provisional.' },
  { investorSlug: 'li-lu', yearLabel: 'Spring 2013', title: 'Graham & Doddsville interview (official PDF)', type: 'interview', category: 'interviews', publisher: 'Heilbrunn Center / CBS', url: 'https://cdn.prod.website-files.com/5ef3c7300432b40ed865991a/642e161699ad88498e9c681a_2013-03-28%20Graham%20%26%20Doddsville%20Article_LL.pdf', access: 'Free', provenance: 'verified primary (official copy)', verificationState: 'VERIFIED', value: 5, notes: 'BYD-era philosophy.' },
  { investorSlug: 'li-lu', yearLabel: 'Q2 2026', title: 'Himalaya 13F (newly discovered regulatory spine)', type: 'regulatory', category: 'regulatory', publisher: 'SEC EDGAR (via trackers)', url: 'https://valuesider.com/guru/li-lu-himalaya-capital-management/portfolio', access: 'Free', provenance: 'secondary mirror of primary filings', verificationState: 'VERIFIED', value: 4, notes: 'Q2 2026 filed Aug 14, 2026: 8 holdings, ~$3.2B sleeve, new ~$469M PDD block. Sheet\u2019s verified-negative FLIPPED.' },
  { investorSlug: 'li-lu', yearLabel: '2018', title: 'Munger–Li Lu joint TV interview (\u201cWeekly on Stocks\u201d)', type: 'interview', category: 'interviews', publisher: 'Chinese TV / Kingswell', url: 'https://www.kingswell.io/p/charlie-munger-q-and-a-transcript-305', access: 'Free', provenance: 'secondary (summarized transcript)', verificationState: 'PROVISIONAL', value: 4, notes: 'Partially resolves the sheet\u2019s \u201cAsia Society / CCTV not located\u201d gap.' },

  // ── Thomas Russo ──
  { investorSlug: 'thomas-russo', yearLabel: '1999–2026', title: '13F-HR quarterly runs (EDGAR CIK 860643)', type: 'regulatory', category: 'regulatory', publisher: 'SEC EDGAR', url: 'https://www.sec.gov/edgar/browse/?CIK=860643', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Q2 2026: $8.93B, 86 holdings; GOOG ~12%, BRK-A, PM, MA, Richemont concentration.' },
  { investorSlug: 'thomas-russo', yearLabel: 'Oct 7, 2015', title: 'Talks at Google — \u201cGlobal Value Investing\u201d', type: 'speech', category: 'speeches', publisher: 'Google', url: 'https://www.youtube.com/watch?v=skrSif0vhOk', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Nestlé; capacity-to-suffer framing; \u201cfarmer, not a hunter.\u201d' },
  { investorSlug: 'thomas-russo', yearLabel: 'Feb 26, 2018', title: 'Talks at Google (second appearance)', type: 'speech', category: 'speeches', publisher: 'Google', url: 'https://www.youtube.com/watch?v=IzEvI1HOwN8', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Tax-efficient compounding themes.' },
  { investorSlug: 'thomas-russo', yearLabel: 'Apr 15, 2024?', title: 'Talks at Google (third — video ID unverified)', type: 'speech', category: 'speeches', publisher: 'Google', url: 'https://www.youtube.com/watch?v=08clbvAO0KY', access: 'Free', provenance: 'unverified', verificationState: 'NEEDS_REVIEW', value: 3, notes: 'NOT_FOUND in search — verify the video ID directly on YouTube before ingest.' },
  { investorSlug: 'thomas-russo', yearLabel: '2012', title: 'Ivey Ben Graham Centre deck + companion video', type: 'speech', category: 'speeches', publisher: 'Ivey BGC', url: 'https://www.ivey.uwo.ca/media/3775733/2012_russo.pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Position-level attribute tables (Heineken/Richemont/Nestlé/Scripps…).' },
  { investorSlug: 'thomas-russo', yearLabel: 'Apr 15, 2026', title: 'Ivey BGC conference deck — \u201cCapacity to Suffer\u201d', type: 'speech', category: 'speeches', publisher: 'Ivey BGC', url: 'https://www.ivey.uwo.ca/media/txmd1swc/20-thomas-russo.pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Resolves the sheet\u2019s filename/year conflict; IRR net of fees thru 12/31/2025.' },
  { investorSlug: 'thomas-russo', yearLabel: 'Dec 2022', title: 'MOI Latticework keynote + extended Q&A transcript', type: 'interview', category: 'interviews', publisher: 'MOI Global', url: 'https://moiglobal.com/latticework-2022-tom-russo', access: 'Free', provenance: 'secondary-full-text', verificationState: 'VERIFIED', value: 5, notes: 'Tenure data: Nestlé est. 1986, BRK 1981, Heineken ~40yrs.' },
  { investorSlug: 'thomas-russo', yearLabel: 'Oct 2025', title: 'Latticework 2025 transcript — \u201cFinding Global Compounders\u201d', type: 'speech', category: 'speeches', publisher: 'Latticework', url: 'https://www.latticework.com/p/latticework-2025-tom-russo-on-finding', access: 'Free', provenance: 'secondary-full-text', verificationState: 'VERIFIED', value: 5, notes: 'New find: Alphabet dual-class praise; Semper Vic 11.5% annual compounding.' },
  { investorSlug: 'thomas-russo', yearLabel: 'Mar 11, 2013', title: '\u201c75-Minute Interview\u201d (GuruFocus/Nasdaq)', type: 'interview', category: 'interviews', publisher: 'GuruFocus', url: 'https://www.gurufocus.com/news/211779/75minute-interview-with-value-investor-tom-russo', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 4, notes: 'Process deep-dive.' },
  { investorSlug: 'thomas-russo', yearLabel: 'Jun 2, 2026', title: '\u201cInvesting by the Book\u201d Ep. 84 (new find)', type: 'interview', category: 'interviews', publisher: 'Investing by the Book', url: 'https://podcasts.apple.com/us/podcast/84-tom-russo-on-common-stocks-and-uncommon-profits/id1577368197?i=1000770740342', access: 'Free', provenance: 'primary audio', verificationState: 'VERIFIED', value: 5, notes: 'Recorded May 8, 2026; Fisher-book framing.' },
  { investorSlug: 'thomas-russo', yearLabel: 'Spring 2012', title: 'Graham & Doddsville interview (Issue 15)', type: 'interview', category: 'interviews', publisher: 'CBS students (Stanford Law mirror)', url: 'https://law.stanford.edu/index.php?webauth-document=event/691663/media/slspublic/Graham%20%26%20Doddsville%20-%20Issue%2015%20-%20Spring%202012%20-%20Russo%20Profile.pdf', access: 'Free', provenance: 'likely primary (PDF mirror)', verificationState: 'VERIFIED', value: 4, notes: 'Same journal ecosystem as Li Lu.' },
  { investorSlug: 'thomas-russo', yearLabel: 'May 2025', title: 'Semper Vic commentary (HFA verbatim mirror)', type: 'letters', category: 'letters', publisher: 'HedgeFundAlpha (mirror)', url: 'https://hedgefundalpha.com/investor-letters/tom-russo-semper-vic-may-2025/', access: 'Free', provenance: 'secondary verbatim mirror', verificationState: 'PROVISIONAL', value: 4, notes: 'Proves some fund commentary circulates publicly despite \u201cno official archive.\u201d' },

  // ── Chuck Akre ──
  { investorSlug: 'chuck-akre', yearLabel: 'n.d. (live)', title: 'our-thinking white-paper corpus (incl. \u201cHow We Think About Cash\u201d)', type: 'letters', category: 'letters', publisher: 'Akre Capital', url: 'https://www.akrecapital.com/our-thinking', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Canonical three-legged-stool framework texts.' },
  { investorSlug: 'chuck-akre', yearLabel: '1988', title: '1988 Shareholder Letter (pre-fund era)', type: 'letters', category: 'letters', publisher: 'Akre Capital', url: 'https://www.akrecapital.com/1988-shareholder-letter', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Earliest letter artifact located; Buffett-derived lessons.' },
  { investorSlug: 'chuck-akre', yearLabel: '2009→', title: 'Akre Focus quarterly commentaries (2009–2022 gap)', type: 'letters', category: 'letters', publisher: 'Akre Capital', url: 'https://www.akrefund.com', access: 'Free/gated', provenance: 'verified primary (recent)', verificationState: 'VERIFIED', value: 5, notes: '2009–2022 quarters absent from current site — Wayback/fiscal.ai recovery needed.' },
  { investorSlug: 'chuck-akre', yearLabel: 'Jul 2024', title: 'Q2 2024 commentary (law-of-large-numbers essay)', type: 'letters', category: 'letters', publisher: 'Akre Focus (Seeking Alpha mirror)', url: 'https://seekingalpha.com/article/4704241-akre-focus-fund-q2-2024-commentary', access: 'Free/gated', provenance: 'secondary mirror', verificationState: 'VERIFIED', value: 4, notes: 'Reclassified: fund commentary, not a standalone white paper.' },
  { investorSlug: 'chuck-akre', yearLabel: 'Apr 2017', title: 'Talks at Google — \u201cThe Peregrinations of an English Major\u2026\u201d', type: 'speech', category: 'speeches', publisher: 'Google', url: 'https://www.marketfolly.com/2017/04/chuck-akres-talk-at-google-three-legged.html', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Title corrected; best single primary talk.' },
  { investorSlug: 'chuck-akre', yearLabel: 'Jun 18, 2019', title: 'Invest Like the Best EP.135 — \u201cThree-Legged Stool\u201d', type: 'interview', category: 'interviews', publisher: 'Colossus', url: 'https://colossus.com/episode/akre-the-three-legged-stool', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Air date corrected to Jun 18, 2019 (Feb 6, 2024 replay caused confusion).' },
  { investorSlug: 'chuck-akre', yearLabel: 'Nov 8, 2019', title: 'WealthTrack #1619 (with John Neff)', type: 'interview', category: 'interviews', publisher: 'WealthTrack', url: 'https://wealthtrack.com/finding-compounding-machines-with-the-great-investor-chuck-akre-his-gen-x-co-manager-john-neff', access: 'Free/partial', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Guest name corrected: John Neff (not Ron Neff).' },
  { investorSlug: 'chuck-akre', yearLabel: '2009–2023', title: 'N-CSR/N-CSRS filings + ETF conversion file (EDGAR CIK 811030)', type: 'regulatory', category: 'regulatory', publisher: 'SEC EDGAR', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000811030', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Audited commentary + conversion record.' },
  { investorSlug: 'chuck-akre', yearLabel: 'Oct 27, 2025', title: 'MF\u2192ETF conversion completed (AKRE, NYSE Arca, ~$11.2B)', type: 'regulatory', category: 'regulatory', publisher: 'Akre press (Yahoo mirror)', url: 'https://finance.yahoo.com/news/akre-capital-completes-one-industry-142200246.html', access: 'Free', provenance: 'primary press (mirrored)', verificationState: 'VERIFIED', value: 4, notes: 'One of the largest single mutual-fund-to-ETF conversions to date.' },
  { investorSlug: 'chuck-akre', yearLabel: 'Apr 29, 2026', title: 'Q1 2026 commentary', type: 'letters', category: 'letters', publisher: 'Akre Focus ETF (SA mirror)', url: 'https://seekingalpha.com/article/4896233-akre-focus-etf-q1-2026-commentary', access: 'Free/gated', provenance: 'secondary mirror', verificationState: 'VERIFIED', value: 3, notes: '\u22124.33% total return citing valuation contraction.' },
  { investorSlug: 'chuck-akre', yearLabel: 'Aug 2025', title: 'MutualFundObserver — \u201cEnduring Principles, Evolving Markets\u201d', type: 'article', category: 'other', publisher: 'MutualFundObserver', url: 'https://mutualfundobserver.com/2025/08/enduring-principles-evolving-markets-the-next-chapter-for-akre-focus', access: 'Free', provenance: 'secondary analysis', verificationState: 'PROVISIONAL', value: 4, notes: 'Succession + conversion narrative.' },

  // ── Robert Vinall ──
  { investorSlug: 'robert-vinall', yearLabel: 'H1 2011 → 2025', title: 'Co-Investor Letters (annual + half-year)', type: 'letters', category: 'letters', publisher: 'RV Capital', url: 'https://www.rvcapital.ch', access: 'Free (index login)', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Crown jewels — decision-rich incl. formal loss autopsies; /post/* enumeration still required; pre-2011 letters unverified.' },
  { investorSlug: 'robert-vinall', yearLabel: '2024–2025', title: 'HFA verbatim letter mirrors (H1-22, H1-24, H1-25, Sept 2025)', type: 'letters', category: 'letters', publisher: 'HedgeFundAlpha', url: 'https://hedgefundalpha.com/investor-letters/business-owner-fund-september-2025-commentary/', access: 'Free', provenance: 'secondary verbatim mirror', verificationState: 'VERIFIED', value: 4, notes: 'Sept 2025: NAV \u20ac1,405.32, +17.1% YTD.' },
  { investorSlug: 'robert-vinall', yearLabel: 'early 2026', title: '2025 annual letter (selling framework; Prosus/PDD sold)', type: 'letters', category: 'letters', publisher: 'RV Capital (podcast read-through)', url: 'https://podcasts.apple.com/us/podcast/the-rob-vinall-podcast/id1548228664', access: 'Free', provenance: 'verified primary (audio)', verificationState: 'VERIFIED', value: 5, notes: '\u201cA framework for selling investments; Why we sold Prosus; the idiosyncratic reason for selling PDD.\u201d' },
  { investorSlug: 'robert-vinall', yearLabel: '2019–2023', title: 'Good Investing corpus (Tilman Versch interviews)', type: 'interview', category: 'interviews', publisher: 'good-investing.net', url: 'https://www.good-investing.net/tag/rv-capital', access: 'Free (full transcripts)', verificationState: 'VERIFIED', value: 5, provenance: 'verified primary interviews', notes: 'Feb 2019 management interview; Jun 2021 Lechner talk; Mar 2022 process; Aug 2022 AGM Q&A; Oct 2023 investor QA.' },
  { investorSlug: 'robert-vinall', yearLabel: '2017–2026', title: 'Robert Vinall YouTube channel (55 videos)', type: 'speech', category: 'speeches', publisher: 'YouTube', url: 'https://www.youtube.com/c/RobertVinall', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Omaha 2017 talk; Annual Gathering Q&As; owner-culture talks.' },
  { investorSlug: 'robert-vinall', yearLabel: 'Jan 12, 2026', title: '2026 Annual Gathering: Ernie Garcia \u201cMountainside Chat\u201d + Annual Q&A', type: 'speech', category: 'speeches', publisher: 'YouTube (Robert Vinall channel)', url: 'https://www.youtube.com/watch?v=p5aIarG8rLo', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Extends the Carvana saga into a primary source.' },
  { investorSlug: 'robert-vinall', yearLabel: '2024–2025', title: '\u201cThe Rob Vinall Podcast\u201d (letter read-throughs)', type: 'speech', category: 'speeches', publisher: 'Spotify / Apple Podcasts', url: 'https://open.spotify.com/show/6o7el5KJdU4HnFI7zg2szp', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Letter audio versions; live Wix COO episode (2024 Gathering).' },
  { investorSlug: 'robert-vinall', yearLabel: '2011/2013', title: 'Yumpu flipbooks (RV-uploaded)', type: 'archival', category: 'archival', publisher: 'yumpu.com/user/rvcapital.ch', url: 'https://www.yumpu.com/en/document/view/25908186/introduction-to-business-owner-rv-capital', access: 'Free', provenance: 'likely primary', verificationState: 'PROVISIONAL', value: 4, notes: 'Pre-Wix-era preservation; 2013 intro doc + H1 2011 letter.' },
  { investorSlug: 'robert-vinall', yearLabel: '2013–Q2 2026', title: 'US 13F trail (Dataroma mirror)', type: 'regulatory', category: 'regulatory', publisher: 'SEC via Dataroma', url: 'https://www.dataroma.com/m/holdings.php?m=RVC', access: 'Free', provenance: 'secondary mirror of primary filings', verificationState: 'VERIFIED', value: 4, notes: 'Q2 2026: 13 stocks, $382,888,000 — exact match to sheet. US-only caveat.' },
  { investorSlug: 'robert-vinall', yearLabel: 'H1 2025', title: 'Ryman Healthcare loss autopsy (\u201cworst investment\u201d)', type: 'letters', category: 'letters', publisher: 'H1 2025 letter (Worldly Invest analysis)', url: 'https://www.worldlyinvest.com/p/mistaken-investments-from-letters-parti', access: 'Free', provenance: 'verified primary (letter) via secondary analysis', verificationState: 'VERIFIED', value: 5, notes: 'Rare public loss autopsy — high passage value.' },
  { investorSlug: 'robert-vinall', yearLabel: 'Oct 2018', title: '10-year anniversary letter (excerpts)', type: 'letters', category: 'letters', publisher: 'Acquirer\u2019s Multiple', url: 'https://acquirersmultiple.com/2018/10/robert-vinall-rv-capital-10-year-anniversary-letter', access: 'Free', provenance: 'secondary excerpt', verificationState: 'PROVISIONAL', value: 4, notes: '2008 fund inception corroborated.' },

  // ── Nicholas Sleep ──
  { investorSlug: 'nicholas-sleep', yearLabel: '2001–2014', title: 'The Full Collection of the Nomad Letters (authorized PDF, 219pp)', type: 'letters', category: 'letters', publisher: 'I.G.Y. Foundation', url: 'https://igyfoundation.org.uk/wp-content/uploads/2021/03/Full_Collection_Nomad_Letters_.pdf', access: 'Free', provenance: 'verified primary (downloaded & inspected)', verificationState: 'VERIFIED', value: 5, notes: '~110,000 words; Amazon/Costco theses; destination analysis; cite the authorized version, not bootlegs.' },
  { investorSlug: 'nicholas-sleep', yearLabel: '2021', title: 'Nomad Partnership Letters landing page', type: 'archival', category: 'archival', publisher: 'I.G.Y. Foundation', url: 'https://igyfoundation.org.uk/nomad-partnership-letters', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'Official index page for the collection.' },
  { investorSlug: 'nicholas-sleep', yearLabel: 'Dec 1, 2026', title: 'Nomad Letters (Stripe Press print edition)', type: 'book', category: 'books', publisher: 'Stripe Press', url: 'https://www.porchlightbooks.com/products/nomad-letters-nick-sleep-9781953953599', access: 'Purchase', provenance: 'verified (publisher/retailer listings)', verificationState: 'VERIFIED', value: 4, notes: '336pp; new prologue by Sleep; foreword by John Collison. Calendar re-pagination after Dec 1, 2026.' },
  { investorSlug: 'nicholas-sleep', yearLabel: 'Dec 2020', title: 'FT: \u201cThe complete letters of Nomad Investment Partnership\u201d', type: 'article', category: 'other', publisher: 'Financial Times', url: 'https://www.ft.com/content/2b41c6cb-ba68-47c7-b488-7bf778d64050', access: 'Gated', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: '921.1% / 18.4% p.a. after fees over 12 years.' },
  { investorSlug: 'nicholas-sleep', yearLabel: '2020', title: 'Richer, Wiser, Happier (Sleep & Zakaria chapter)', type: 'book', category: 'books', publisher: 'William Green / Harper Business', url: 'https://www.harpercollins.com/products/richer-wiser-happier-william-green', access: 'Purchase', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 4, notes: 'The only book treatment; pair endorses it in their own postamble.' },
  { investorSlug: 'nicholas-sleep', yearLabel: 'Sep 26, 2024', title: '\u201cNick & Zak\u2019s Excellent Adventure\u201d (Colossus ep. 364)', type: 'interview', category: 'interviews', publisher: 'Colossus', url: 'https://joincolossus.com/episode/364-nick-zaks-excellent-adventure-william-green', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 4, notes: 'Best long-form audio treatment of the partnership.' },
  { investorSlug: 'nicholas-sleep', yearLabel: 'Sep 16, 2024', title: 'Founders Podcast #365 — \u201cNick Sleep\u2019s Letters\u201d', type: 'interview', category: 'interviews', publisher: 'Founders (David Senra)', url: 'https://www.founderspodcast.com/episodes/365-nick-sleeps-letters-the-full-collection-of-the-nomad-investment-partnership-letters-to-partners', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'Episode-length walkthrough of the letters.' },
  { investorSlug: 'nicholas-sleep', yearLabel: 'Nov 7, 2022', title: 'TIP492 — \u201cThe BEST Investor You\u2019ve NEVER Heard Of\u201d', type: 'interview', category: 'interviews', publisher: 'The Investor\u2019s Podcast Network', url: 'https://m.youtube.com/watch?v=YJQaKHnurpo', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'Popular-audience synthesis.' },
  { investorSlug: 'nicholas-sleep', yearLabel: 'Dec 2020', title: '\u201cLearning from Nick Sleep\u201d', type: 'article', category: 'other', publisher: 'Investment Masters Class', url: 'http://mastersinvest.com/newblog/2020/9/16/learning-from-nicholas-sleep', access: 'Free', provenance: 'secondary', verificationState: 'PROVISIONAL', value: 3, notes: 'Bio + philosophy summary; \u201chonestly run compounding machines.\u201d' },

  // ── Guy Spier ──
  { investorSlug: 'guy-spier', yearLabel: '2010–2024', title: 'Annual Letters to Investors (15 letters, DocSend-hosted)', type: 'letters', category: 'letters', publisher: 'Aquamarine Fund', url: 'https://www.aquamarinefund.com/annual-letter-to-investors', access: 'Free', provenance: 'verified primary (page fetched)', verificationState: 'VERIFIED', value: 5, notes: 'Every year 2010–2024 present; time-sensitive capture (wind-down).' },
  { investorSlug: 'guy-spier', yearLabel: 'Feb 2026', title: 'Final 2025 letter — wind-down announcement', type: 'letters', category: 'letters', publisher: 'Aquamarine Fund', url: 'https://www.aquamarinefund.com/annual-letter-to-partners-2025', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: '\u201cThis Is Not the Letter I Wanted to Be Writing\u2026\u201d — 11.3% 2025 return; family-office conversion.' },
  { investorSlug: 'guy-spier', yearLabel: '2014', title: 'The Education of a Value Investor', type: 'book', category: 'books', publisher: 'Palgrave Macmillan / Harriman House', url: 'https://www.amazon.com/Education-Value-Investor-Transformative-Enlightenment/dp/1137278811', access: 'Purchase', provenance: 'verified', verificationState: 'VERIFIED', value: 5, notes: '>175,000 copies sold; lunch/wind-down arcs.' },
  { investorSlug: 'guy-spier', yearLabel: 'Jun 30, 2008', title: '\u201cLunch with Warren Buffett\u201d (first-person essay)', type: 'essay', category: 'other', publisher: 'guyspier.com', url: 'https://www.guyspier.com/lunch-with-warren-buffett', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'His own account of the $650,100 lunch with Pabrai.' },
  { investorSlug: 'guy-spier', yearLabel: 'Sep 18, 2025', title: '\u201cThe Golden Age of Value Investing Is Over\u201d (op-ed)', type: 'essay', category: 'other', publisher: 'Bloomberg Opinion', url: 'https://www.bloomberg.com/opinion/articles/2025-09-18/buffett-munger-soros-golden-age-of-value-investing-is-over', access: 'Gated', provenance: 'verified primary (authored)', verificationState: 'VERIFIED', value: 4, notes: 'LLMs eroding the research edge; republished by AFR.' },
  { investorSlug: 'guy-spier', yearLabel: 'Jun 25, 2008', title: 'CNBC: \u201cLunch With Warren Buffett \u2018Worth Every Penny\u2019 at $650,100\u201d', type: 'article', category: 'other', publisher: 'CNBC', url: 'https://www.cnbc.com/2008/06/25/lunch-with-warren-buffett-worth-every-penny-at-650100.html', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'Establishes lunch date and amount.' },
  { investorSlug: 'guy-spier', yearLabel: '2008', title: '\u201cMy $650,100 Lunch with Warren Buffett\u201d (TIME essay)', type: 'article', category: 'other', publisher: 'TIME', url: 'https://time.com/archive/6904425/my-650100-lunch-with-warren-buffett', access: 'Free (archive)', provenance: 'verified secondary (by Spier)', verificationState: 'VERIFIED', value: 3, notes: 'The widely reprinted lunch essay; companion to the Observer version.' },
  { investorSlug: 'guy-spier', yearLabel: '2015', title: 'Observer author page + lunch essay', type: 'article', category: 'other', publisher: 'Observer', url: 'https://observer.com/author/guy-spier', access: 'Free', provenance: 'secondary (by Spier)', verificationState: 'VERIFIED', value: 3, notes: 'Resolves the sheet\u2019s \u201cObserver op-ed\u201d item.' },
  { investorSlug: 'guy-spier', yearLabel: 'Feb 16, 2026', title: 'Opalesque: wind-down after 28 years', type: 'article', category: 'other', publisher: 'Opalesque', url: 'https://www.opalesque.com/713551/Guy_Spier_winds_down_Aquamarine_Fund_after_28355.html', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'Cumulative 1,185.6% figure.' },
  { investorSlug: 'guy-spier', yearLabel: 'May 21, 2025', title: 'The Investor\u2019s Podcast — \u201cMy Lunch with Warren Buffett\u201d', type: 'interview', category: 'interviews', publisher: 'TIP Network', url: 'https://www.theinvestorspodcast.com/episodes/guy-spier-my-lunch-with-warren-buffett', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'The verified TIP credit (TIP492 was about Nick Sleep, not Spier).' },
  { investorSlug: 'guy-spier', yearLabel: 'Jan 30, 2026', title: 'Talking Billings, Episode 11', type: 'interview', category: 'interviews', publisher: 'Talking Billings', url: 'https://www.talkingbillings.co/episodes/episode-11-guy-spier', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'Confirms VALUEx Zurich founder + TEDxZürich co-founder.' },
  { investorSlug: 'guy-spier', yearLabel: '—', title: 'Invest Like the Best / Masters in Business episodes', type: 'interview', category: 'interviews', publisher: '—', url: 'https://sloaninvestmentconference.org/guy-spier', access: '—', provenance: 'verified-negative', verificationState: 'REJECTED', value: 1, notes: 'No episodes found on either series — do NOT import. TEDx credit narrowed to \u201cTED India speaker / TEDxZürich co-host.\u201d' },

  // ── François Rochon ──
  { investorSlug: 'francois-rochon', yearLabel: '2017–2025', title: 'Annual letters to partners (live PDF run)', type: 'letters', category: 'letters', publisher: 'Giverny Capital', url: 'https://givernycapital.com/en/letters-to-our-partners', access: 'Free', provenance: 'verified primary (page fetched)', verificationState: 'VERIFIED', value: 5, notes: '2001–2016 NOT on live site — Wayback/mirror recovery needed (premise corrected).' },
  { investorSlug: 'francois-rochon', yearLabel: '2020', title: 'Annual letter 2020 (returns table · Podium of Errors · post-mortems)', type: 'letters', category: 'letters', publisher: 'Giverny Capital', url: 'https://givernycapital.com/wp-content/uploads/2022/07/giverny-capital-annual-letter-2020.pdf', access: 'Free', provenance: 'verified primary (read in full)', verificationState: 'VERIFIED', value: 5, notes: 'Full returns table since 1993; five-year post-mortems; owner\u2019s-earnings essay.' },
  { investorSlug: 'francois-rochon', yearLabel: 'Mar 2026', title: 'Annual letter 2025 (latest vintage)', type: 'letters', category: 'letters', publisher: 'Giverny Capital', url: 'https://givernycapital.com/wp-content/uploads/2026/03/giverny-capital-annual-letter-2025-1.pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Current frontier of the run.' },
  { investorSlug: 'francois-rochon', yearLabel: 'Dec 5, 2017', title: 'Talks at Google — \u201cThe Art of Investing\u201d (video + full transcript PDF)', type: 'speech', category: 'speeches', publisher: 'Google / brianlangis.ca', url: 'https://www.youtube.com/watch?v=ejmn_pxJwtI', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 5, notes: 'Clean philosophy statement; transcript PDF dated Dec 5, 2017.' },
  { investorSlug: 'francois-rochon', yearLabel: 'Nov 12, 2022', title: 'RWH016 — \u201cThe Best of the Best\u201d (William Green)', type: 'interview', category: 'interviews', publisher: 'TIP Network', url: 'https://www.theinvestorspodcast.com/richer-wiser-happier/the-best-of-the-best-w-francois-rochon', access: 'Free', provenance: 'verified primary (episode)', verificationState: 'VERIFIED', value: 4, notes: '1h40m; the \u201cRWH016\u201d mystery from the source notes resolved.' },
  { investorSlug: 'francois-rochon', yearLabel: 'Mar 2025', title: 'TIP709 — \u201cThe Art of Long-Term Investing\u201d', type: 'interview', category: 'interviews', publisher: 'TIP Network', url: 'https://open.spotify.com/episode/7CZNv0Kuvc4DqVQs6RSNID', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'Why Giverny will remain boutique-sized.' },
  { investorSlug: 'francois-rochon', yearLabel: 'Feb 2023', title: 'Gosselin biography (authorized, French)', type: 'book', category: 'books', publisher: 'Guy Saint-Jean Éditeur', url: 'https://saint-jeanediteur.com/titre/francois-rochon-le-parcours-singulier-dun-investisseur-dexception', access: 'Purchase', provenance: 'verified secondary (authorized)', verificationState: 'VERIFIED', value: 4, notes: 'The \u201cGosselin biography\u201d from the source notes identified.' },
  { investorSlug: 'francois-rochon', yearLabel: '2026 Q2', title: 'US 13F mirror (~$2.97B US sleeve)', type: 'regulatory', category: 'regulatory', publisher: 'SEC via ValueSider', url: 'https://valuesider.com/guru/francois-rochon-giverny-capital/portfolio', access: 'Free', provenance: 'secondary mirror of primary filings', verificationState: 'VERIFIED', value: 4, notes: '51 disclosed US holdings; US-sleeve-only caveat.' },
  { investorSlug: 'francois-rochon', yearLabel: 'ongoing', title: 'francoisrochon.com personal site', type: 'archival', category: 'archival', publisher: 'Personal (Squarespace)', url: 'https://www.francoisrochon.com', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 3, notes: 'French bio; 2003 \u201cOf Permanent Value\u201d chapter; Prix Giverny Capital.' },
  { investorSlug: 'francois-rochon', yearLabel: 'Dec 2025', title: 'WealthTrack appearance (Consuelo Mack)', type: 'interview', category: 'interviews', publisher: 'WealthTrack (AM recap)', url: 'https://acquirersmultiple.com/2025/12/francois-rochon-the-three-qualities-every-great-investor-needs', access: 'Free', provenance: 'secondary (recap)', verificationState: 'PROVISIONAL', value: 3, notes: '\u201cThe Three Qualities Every Great Investor Needs.\u201d' },
  { investorSlug: 'francois-rochon', yearLabel: '2001–2016', title: 'Legacy letter vintages (recovery project)', type: 'letters', category: 'letters', publisher: 'Giverny Capital (off-site)', url: 'https://givernycapital.com/en/letters-to-our-partners', access: 'Archive-only', provenance: 'referenced across corpus', verificationState: 'NEEDS_REVIEW', value: 4, notes: 'Exist (referenced in later letters) but not on live page — Wayback/secondary mirror recovery required.' },

  // ── Tweedy, Browne ──
  { investorSlug: 'tweedy-browne', yearLabel: '1920→ (live)', title: 'About — A Brief History (canonical lineage)', type: 'archival', category: 'archival', publisher: 'Tweedy, Browne', url: 'https://www.tweedyfunds.com/about', access: 'Free', provenance: 'verified primary (fetched)', verificationState: 'VERIFIED', value: 5, notes: 'Graham-Newman client; Knapp 1957; 1959 pooling; 1968 outside LPs; 1975 RIA.' },
  { investorSlug: 'tweedy-browne', yearLabel: '1994→', title: 'Legacy annual & semi-annual reports (live PDFs)', type: 'letters', category: 'letters', publisher: 'Tweedy, Browne', url: 'https://www.tweedy.com/usfunds/wp-content/uploads/sites/10/2019/10/3-31-1995-Annual-Report-TBGVX.pdf', access: 'Free', provenance: 'verified primary (HTTP 200 probed)', verificationState: 'VERIFIED', value: 5, notes: '~30+ year free report run; the Mar 31, 1995 report (p.7) carries the firm\u2019s own history.' },
  { investorSlug: 'tweedy-browne', yearLabel: '2003–2026', title: 'Quarterly fund commentary archive (187 items)', type: 'letters', category: 'letters', publisher: 'Tweedy, Browne', url: 'https://www.tweedyfunds.com/commentary/', access: 'Free', provenance: 'verified primary (sitemap enumerated)', verificationState: 'VERIFIED', value: 4, notes: 'Q3-2003 \u2192 Q2-2026 incl. annual letters 2014/2024/2026.' },
  { investorSlug: 'tweedy-browne', yearLabel: 'c. 1992→', title: '\u201cWhat Has Worked in Investing\u201d (research booklet, ~60pp)', type: 'research', category: 'other', publisher: 'Tweedy, Browne', url: 'https://www.scheuermannco.ch/wp-content/uploads/2023/02/worked_01.pdf', access: 'Free', provenance: 'likely primary (Tweedy-commissioned)', verificationState: 'PROVISIONAL', value: 4, notes: 'Official PDF URL not located this session — mirror available; 50+ academic studies.' },
  { investorSlug: 'tweedy-browne', yearLabel: 'May 17, 1984', title: '\u201cThe Superinvestors of Graham-and-Doddsville\u201d (names Knapp & Anderson)', type: 'speech', category: 'speeches', publisher: 'Warren Buffett / Columbia Business School', url: 'https://business.columbia.edu/insights/chazen-global-insights/superinvestors-graham-and-doddsville', access: 'Free', provenance: 'verified (essay text)', verificationState: 'VERIFIED', value: 5, notes: 'The external validation node; results in Table 2.' },
  { investorSlug: 'tweedy-browne', yearLabel: '2007', title: 'The Little Book of Value Investing (Chris Browne)', type: 'book', category: 'books', publisher: 'Wiley', url: 'https://www.goodreads.com/en/book/show/75893', access: 'Purchase', provenance: 'verified', verificationState: 'VERIFIED', value: 4, notes: 'The Browne-authored entry point.' },
  { investorSlug: 'tweedy-browne', yearLabel: 'Mar 5, 2020', title: '100-year anniversary video podcast (five partners)', type: 'interview', category: 'interviews', publisher: 'Tweedy, Browne (hosted)', url: 'https://www.tweedyfunds.com/commentary/celebrating-the-100-year-anniversary-of-tweedy-browne/', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 4, notes: 'With Tobias Carlisle; philosophy + history anchor.' },
  { investorSlug: 'tweedy-browne', yearLabel: 'Dec 31, 2025', title: 'Form ADV Part 2A/2B', type: 'regulatory', category: 'regulatory', publisher: 'SEC via firm site', url: 'https://www.tweedy.com/wp-content/uploads/2026/03/ADV_PART-2A_2B_Dec_31_2025_03302026.pdf', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 3, notes: 'Current ownership/committee structure.' },
  { investorSlug: 'tweedy-browne', yearLabel: 'live 2026', title: 'Our Team — Investment Committee bios + alignment data', type: 'archival', category: 'archival', publisher: 'Tweedy, Browne', url: 'https://www.tweedyfunds.com/our-team', access: 'Free', provenance: 'verified primary (fetched)', verificationState: 'VERIFIED', value: 4, notes: 'Seven committee members; >$348.8M of MD/employee family money in own funds (6/30/2026).' },
  { investorSlug: 'tweedy-browne', yearLabel: 'Dec 16, 2009', title: 'NYT DealBook obituary — Christopher H. Browne', type: 'article', category: 'other', publisher: 'NYT DealBook', url: 'https://dealbook.nytimes.com/2009/12/16/christopher-h-browne-value-investor-dies', access: 'Free', provenance: 'verified secondary', verificationState: 'VERIFIED', value: 3, notes: 'Fixes the Dec 13, 2009 death date (not 2019).' },
  { investorSlug: 'tweedy-browne', yearLabel: '2026', title: 'tweedypartnerships.com (new partnerships arm)', type: 'archival', category: 'archival', publisher: 'Tweedy, Browne', url: 'https://www.tweedypartnerships.com/about', access: 'Free', provenance: 'verified primary', verificationState: 'VERIFIED', value: 3, notes: 'Continuity claim: \u201cNo Managing Director or former general partner has ever left\u2026\u201d' },
  { investorSlug: 'tweedy-browne', yearLabel: 'Jan 2023', title: 'John Spears on the RWH Podcast (recap)', type: 'interview', category: 'interviews', publisher: 'RWH / TIP (AM recap)', url: 'https://acquirersmultiple.com/2023/01/tweedy-brownes-john-spears-boring-companies-outsized-returns', access: 'Free', provenance: 'secondary (recap)', verificationState: 'PROVISIONAL', value: 3, notes: 'Longest-tenured MD (since 1974); \u201cboring companies & outsized returns.\u201d' },
]

// ─── DECISIONS ───────────────────────────────────────────────────────────────

export const decisions: DecisionSeed[] = [
  // Burry
  { investorSlug: 'michael-burry', dateLabel: '2003–2007', sortDate: '2007', action: 'Bought credit-default swaps on subprime RMBS (~$1bn notional via banks)', company: 'Housing bubble', context: 'Contemporaneous rationale survives in Scion letters; the defining Big Short trade.', outcome: 'Well-documented win; profiled in VF/The Big Short/FCIC record.', outcomeState: 'KNOWN', sourceTitle: 'Scion letters (mirrors) + The Big Short + FCIC interview', sourceUrl: 'https://www.scribd.com/document/436898728/Scion-Capital-Letters-pdf', themes: ['risk-and-crisis'] },
  { investorSlug: 'michael-burry', dateLabel: '2000–2001', sortDate: '2001', action: 'Launched Scion Capital after the MSN column / Silicon Investor era', company: 'Scion founding', context: 'Value strategy documented from inception; early-thinking record recovers via archives.', outcome: 'Fund ran 2000–2008; documented in letters and Wayback captures.', outcomeState: 'KNOWN', sourceTitle: 'Wayback scioncapital.com + Silicon Investor posts', sourceUrl: 'http://web.archive.org/web/*/scioncapital.com', themes: ['contrarian-value'] },
  { investorSlug: 'michael-burry', dateLabel: 'Spring 2019', sortDate: '2019', action: 'Built GameStop position; published board letters', company: 'GameStop (GME)', context: 'Forbes transcriptions of the letters survive.', outcome: 'Exit timing Q4-19/Q1-20 lacks a filing-by-filing map (gap).', outcomeState: 'PARTIAL', sourceTitle: 'Forbes letter transcriptions', sourceUrl: 'https://www.forbes.com/sites/greatspeculations/', themes: ['contrarian-value'] },
  { investorSlug: 'michael-burry', dateLabel: 'Jan 2021', sortDate: '2021', action: 'Tweeted on GameStop (\u201cI was early\u201d), then deleted; SEC subpoena followed', company: 'GameStop (GME)', context: 'Bloomberg coverage of the deleted tweets; subpoena reported Sep 24, 2021.', outcome: 'Account deleted Nov 2021 after Musk spat; documented in press.', outcomeState: 'KNOWN', sourceTitle: 'Bloomberg / Business Insider record', sourceUrl: 'https://www.bloomberg.com/news/articles/2021-09-24/michael-burry-says-he-received-subpoena-from-sec-over-gamestop', themes: ['contrarian-value'] },
  { investorSlug: 'michael-burry', dateLabel: 'Oct 27, 2025', sortDate: '2025-10', action: 'Liquidated Scion Asset Management; returned capital', company: 'Scion shutdown', context: '\u201cWith a heavy heart\u2026\u201d letter; SEC deregistration ~Nov 10, 2025.', outcome: 'Final 13F Q3 2025 (filed Nov 3, 2025); firm terminal.', outcomeState: 'KNOWN', sourceTitle: 'Reuters coverage of liquidation letter', sourceUrl: 'https://www.reuters.com/sustainability/sustainable-finance-reporting/michael-burry-big-short-fame-deregisters-scion-asset-management-2025-11-13', themes: ['firm-continuity'] },
  { investorSlug: 'michael-burry', dateLabel: '2025–2026', sortDate: '2026', action: 'Launched Cassandra Unchained; AI-bubble thesis (circular financing, depreciation critique)', company: 'Substack era', context: '$400/yr paid tier; \u201cTrading Post\u201d series active through Aug 2026.', outcome: 'Ongoing — outcome open.', outcomeState: 'PARTIAL', sourceTitle: 'Cassandra Unchained', sourceUrl: 'https://michaeljburry.substack.com', themes: ['risk-and-crisis', 'forensic-shorts'] },
  { investorSlug: 'michael-burry', dateLabel: 'Jan 2026', sortDate: '2026-01', action: 'Reported re-buying GameStop post-shutdown', company: 'GameStop (GME)', context: 'Bloomberg Jan 26, 2026: \u201cback hyping the stock.\u201d', outcome: 'Open — position size/exit unknown.', outcomeState: 'PARTIAL', sourceTitle: 'Bloomberg', sourceUrl: 'https://www.bloomberg.com/news/articles/2026-01-26/michael-burry-an-early-gamestop-buyer-is-back-hyping-the-stock', themes: ['contrarian-value'] },

  // Einhorn
  { investorSlug: 'david-einhorn', dateLabel: '2002–2009', sortDate: '2009', action: 'Shorted Allied Capital; ran a public forensic campaign; donated profits', company: 'Allied Capital (ALL)', context: 'FSOPOTAT documents the battle end-to-end; firm\u2019s own dispute page survives in Wayback.', outcome: 'SEC findings vs Allied (BFP valuations); profits donated to charity.', outcomeState: 'KNOWN', sourceTitle: 'Fooling Some of the People All of the Time', sourceUrl: 'https://www.wiley.com/en-us/Fooling+Some+of+the+People+All+of+the+Time%3A+A+Long+Short+Story-p-9780470536720', themes: ['forensic-shorts'] },
  { investorSlug: 'david-einhorn', dateLabel: 'Jul 2007 – Sep 2008', sortDate: '2008', action: 'Shorted Lehman Brothers', company: 'Lehman Brothers (LEH)', context: 'Best-documented crisis short: Nov 2007 VIC talk (Lehman exhibit) + May 2008 Sohn deck.', outcome: 'Lehman bankrupt Sep 15, 2008 — the pitch vindicated.', outcomeState: 'KNOWN', sourceTitle: '\u201cAccounting Ingenuity\u201d (Yale EliScholar)', sourceUrl: 'https://elischolar.library.yale.edu/ypfs-documents/4372', themes: ['forensic-shorts', 'risk-and-crisis'] },
  { investorSlug: 'david-einhorn', dateLabel: '2013', sortDate: '2013', action: 'Proposed Apple \u201ciPrefs\u201d; sued over bundled vote', company: 'Apple (AAPL)', context: 'SDNY preliminary injunction Feb 22, 2013 (Judge Sullivan).', outcome: 'Apple withdrew Proposal 2; Cook\u2019s \u201csilly sideshow\u201d retort documented.', outcomeState: 'KNOWN', sourceTitle: 'Greenlight v. Apple opinion', sourceUrl: 'https://www.law.com/almID/1202590550081', themes: ['forensic-shorts'] },
  { investorSlug: 'david-einhorn', dateLabel: 'May 4, 2015', sortDate: '2015', action: 'Presented fracking shorts at Sohn (Pioneer PT $78 vs $167)', company: 'Pioneer, Concho, EOG, Whiting, Continental', context: 'Fortune/FT/Reuters same-day coverage; \u201cmother fracker\u201d critique.', outcome: 'Bet paid off (CNBC follow-up Apr 2016); GM-short claim remains unattributed.', outcomeState: 'KNOWN', sourceTitle: 'Fortune coverage', sourceUrl: 'https://fortune.com/2015/05/04/2015-sohn-conference-einhorn-shorting-mother-fracker-oil-companies', themes: ['forensic-shorts'] },
  { investorSlug: 'david-einhorn', dateLabel: '2023–2026', sortDate: '2026', action: 'Vitesco/Schaeffler advocacy; five transition stories at Sohn 2026', company: 'Vitesco · Acadia · Centene · Fluor · Versant · Victoria\u2019s Secret', context: 'Public decks + Business Wire letters; Q1 2026 +6.5% vs \u22124.4% S&P.', outcome: 'Ongoing — \u201ccapital protection\u201d stance; +1.9% YTD net at Q2 2026.', outcomeState: 'PARTIAL', sourceTitle: 'Sohn 2026 deck (public download)', sourceUrl: 'https://seekingalpha.com/news/4591548-david-einhorn-of-greenlight-capital-touts-5-transition-stories-at-sohn-conference', themes: ['contrarian-value'] },

  // Watsa
  { investorSlug: 'prem-watsa', dateLabel: '1988–1990', sortDate: '1990', action: 'Bought Nikkei puts (\u201cCount me among the skeptics\u201d)', company: 'Japan bubble', context: '1988 letter carries the verbatim line; 1990 letter reports results.', outcome: '$2.4M realized gains in 1990 as Japan fell 38.7% — the first famous crisis trade.', outcomeState: 'KNOWN', sourceTitle: 'Fairfax 1988/1990 letters', sourceUrl: 'https://www.fairfax.ca/wp-content/uploads/1988-Letter.pdf', themes: ['risk-and-crisis'] },
  { investorSlug: 'prem-watsa', dateLabel: '2003–2009', sortDate: '2009', action: 'Ran the crisis hedging program (>80% equity hedges, T-bills, ~$18B CDS)', company: 'Global financial crisis', context: '2007–2009 letters/ARs; \u201c1-in-50-year storm\u201d deployment framing.', outcome: '2008 CDS windfall (US$2.1B+ realized/unrealized); 2009 deployment.', outcomeState: 'KNOWN', sourceTitle: 'Fairfax AR2008 (SEC-filed letter)', sourceUrl: 'https://www.sec.gov/Archives/edgar/data/915191/000090956709000228/o54008exv4.htm', themes: ['risk-and-crisis'] },
  { investorSlug: 'prem-watsa', dateLabel: 'Sep 2013 → Aug 2026', sortDate: '2026', action: 'BlackBerry: $4.7B LOI (failed) → $500M debentures → full exit', company: 'BlackBerry (BB)', context: 'Consortium LOI Sep 2013; debenture/preferred purchases; take-private never completed.', outcome: '~US$200M debenture interest income; full exit Aug 2026 (Globe & Mail).', outcomeState: 'KNOWN', sourceTitle: 'Globe and Mail exit coverage', sourceUrl: 'https://www.theglobeandmail.com/business/article-fairfax-financial-sells-out-of-blackberry-at-a-steep-loss', themes: ['contrarian-value'] },
  { investorSlug: 'prem-watsa', dateLabel: '2013–2019', sortDate: '2019', action: 'Led Eurobank/Greek bank rescue through recapitalization', company: 'Eurobank (EUROB)', context: 'Largest-shareholder saga documented in ARs and FP coverage.', outcome: 'Recapitalization completed; Fairfax remains anchor shareholder.', outcomeState: 'KNOWN', sourceTitle: 'Fairfax annual reports + FP', sourceUrl: 'https://www.fairfax.ca/investors', themes: ['contrarian-value', 'emerging-markets'] },
  { investorSlug: 'prem-watsa', dateLabel: '2015–2025', sortDate: '2025', action: 'Built Fairfax India platform incl. Bengaluru airport control', company: 'Fairfax India / BIAL', context: 'Additional-10% acquisition Feb 20, 2025 completed the build to control.', outcome: 'BIAL ownership 74.0%.', outcomeState: 'KNOWN', sourceTitle: 'Fairfax India press release', sourceUrl: 'https://www.fairfaxindia.ca/press-releases/fairfax-india-completes-acquisition-of-an-additional-10-interest-in-bangalore-international-airport-limited-02-20-2025', themes: ['emerging-markets'] },
  { investorSlug: 'prem-watsa', dateLabel: 'May 23, 2024', sortDate: '2024', action: 'Took Go Digit public (NSE/BSE IPO)', company: 'Go Digit (DIGIT)', context: 'Fairfax-backed insurtech; SEBI RHP on record.', outcome: 'Listed at \u20b9286 vs \u20b9272 issue (+5.15%).', outcomeState: 'KNOWN', sourceTitle: 'ET BFSI listing coverage', sourceUrl: 'https://bfsi.economictimes.indiatimes.com/news/insurance/go-digits-ipo-listing-market-volatility-and-moderate-subscription-impact-debut/110357359', themes: ['emerging-markets'] },
  { investorSlug: 'prem-watsa', dateLabel: 'Nov 2025', sortDate: '2025-11', action: 'Named Ben Watsa successor chairman', company: 'Fairfax succession', context: 'Two-stage: Fairfax India chairmanship Jul 2024; Fairfax transition announced Nov 13, 2025.', outcome: 'In progress — gradual handover.', outcomeState: 'PARTIAL', sourceTitle: 'Deccan Chronicle', sourceUrl: 'https://www.deccanchronicle.com/southern-states/telangana/ben-watsa-named-successor-for-fairfax-financial-1916895', themes: ['firm-continuity'] },

  // Li Lu
  { investorSlug: 'li-lu', dateLabel: '~1997–2004', sortDate: '2004', action: 'Converted long/short fund to long-only after a near-death experience', company: 'Himalaya strategy shift', context: 'His own account: PCA p.61 + the 2006 Columbia lecture.', outcome: 'Long-only concentration discipline became the core philosophy; Munger\u2019s ~$88M entrustment followed.', outcomeState: 'KNOWN', sourceTitle: '2006 CBS lecture (Roiss transcript)', sourceUrl: 'https://roiss.substack.com/p/li-lus-investing-masterclass-at-columbia', themes: ['long-horizon'] },
  { investorSlug: 'li-lu', dateLabel: 'Sep 2008', sortDate: '2008', action: 'Introduced BYD to Munger; Berkshire bought ~10% (~$230M)', company: 'BYD', context: '225M H-shares at ~HK$8; \u201cMunger deserves 100 percent of the credit.\u201d', outcome: 'Multi-bagger anchor position; BYD held \u201cabout 22 years\u201d per the 2024 interview.', outcomeState: 'KNOWN', sourceTitle: 'CNBC (Munger account)', sourceUrl: 'https://www.cnbc.com/2018/05/08/charlie-munger-plays-berkshires-hand-in-china-bet-and-seeks-more-opportunities.html', themes: ['lineage', 'emerging-markets'] },
  { investorSlug: 'li-lu', dateLabel: '2010s→', sortDate: '2020', action: 'Built the Alphabet/US mega-cap book alongside Asia', company: 'Himalaya portfolio', context: 'PKU 2024 keynote describes current positioning.', outcome: 'US sleeve visible in 13F filings (~$3.2B).', outcomeState: 'KNOWN', sourceTitle: 'PKU 2024 keynote + 13F trackers', sourceUrl: 'https://valuesider.com/guru/li-lu-himalaya-capital-management/portfolio', themes: ['emerging-markets'] },
  { investorSlug: 'li-lu', dateLabel: 'Q2 2026', sortDate: '2026', action: 'Disclosed new 6,153,119-share PDD block (~$469M)', company: 'PDD Holdings', context: '13F filed Aug 14, 2026; 8 US holdings.', outcome: 'Open — newly disclosed.', outcomeState: 'PARTIAL', sourceTitle: 'SEC 13F (via trackers)', sourceUrl: 'https://valuesider.com/guru/li-lu-himalaya-capital-management/portfolio', themes: ['emerging-markets'] },

  // Russo
  { investorSlug: 'thomas-russo', dateLabel: '1981', sortDate: '1981', action: 'Initiated Berkshire Hathaway position', company: 'Berkshire Hathaway (BRK)', context: 'Documented tenure per Latticework 2022 transcript.', outcome: 'Held 45 years; BRK-A remains a top-3 13F holding.', outcomeState: 'KNOWN', sourceTitle: 'Latticework 2022 transcript', sourceUrl: 'https://moiglobal.com/latticework-2022-tom-russo', themes: ['lineage', 'long-horizon'] },
  { investorSlug: 'thomas-russo', dateLabel: '1986', sortDate: '1986', action: 'Initiated Nestlé position', company: 'Nestlé', context: 'Tenure data per Latticework 2022.', outcome: 'Held ~40 years; capacity-to-suffer exemplar.', outcomeState: 'KNOWN', sourceTitle: 'Latticework 2022 transcript', sourceUrl: 'https://moiglobal.com/latticework-2022-tom-russo', themes: ['long-horizon', 'owner-managers'] },
  { investorSlug: 'thomas-russo', dateLabel: 'ongoing', sortDate: '2015', action: 'Maintained >40% of AUM in family-controlled firms (\u201cavoid agency costs at all costs\u201d)', company: 'Portfolio doctrine', context: 'Google 2015 talk + Ivey decks.', outcome: 'Structural — visible in 13F concentration (GOOG ~12%, BRK-A, PM, MA, Richemont).', outcomeState: 'KNOWN', sourceTitle: 'Talks at Google 2015', sourceUrl: 'https://www.youtube.com/watch?v=skrSif0vhOk', themes: ['owner-managers'] },
  { investorSlug: 'thomas-russo', dateLabel: '2010s–2020s', sortDate: '2020', action: 'Held Alphabet, Philip Morris, Mastercard, Richemont concentration book', company: '13F book', context: 'Filing-level record via EDGAR CIK 860643.', outcome: 'Q2 2026: $8.93B across 86 holdings.', outcomeState: 'KNOWN', sourceTitle: 'SEC EDGAR 13F run', sourceUrl: 'https://www.sec.gov/edgar/browse/?CIK=860643', themes: ['owner-managers', 'business-quality'] },

  // Akre
  { investorSlug: 'chuck-akre', dateLabel: '1989', sortDate: '1989', action: 'Founded Akre Capital Management', company: 'Firm founding', context: 'After the 1970s brokerage career; 1988 letter is the earliest artifact.', outcome: 'Firm continues under successor leadership.', outcomeState: 'KNOWN', sourceTitle: 'akrecapital.com', sourceUrl: 'https://www.akrecapital.com/1988-shareholder-letter', themes: ['firm-continuity'] },
  { investorSlug: 'chuck-akre', dateLabel: '2009', sortDate: '2009', action: 'Launched Akre Focus Fund', company: 'Akre Focus Fund', context: 'Mutual-fund vehicle for the three-legged-stool strategy.', outcome: 'Ran 16 years as a mutual fund; commentaries quarterly.', outcomeState: 'KNOWN', sourceTitle: 'EDGAR CIK 811030 N-CSR run', sourceUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000811030', themes: ['business-quality'] },
  { investorSlug: 'chuck-akre', dateLabel: '2009→', sortDate: '2010', action: 'Built the compounder book (Constellation Software, Moody\u2019s, Mastercard-style)', company: 'Compounders', context: 'Three-legged-stool case studies in quarterly commentaries — verify each name in commentary text before tagging.', outcome: 'Long-running compounder track record documented in fund commentary.', outcomeState: 'KNOWN', sourceTitle: 'Akre Focus commentaries', sourceUrl: 'https://www.akrefund.com', themes: ['business-quality'] },
  { investorSlug: 'chuck-akre', dateLabel: 'Oct 27, 2025', sortDate: '2025-10', action: 'Completed mutual-fund→ETF conversion (AKRE, NYSE Arca)', company: 'Akre Focus ETF', context: '~$11.2B at conversion — one of the largest MF\u2192ETF conversions ever; Form 485/425 on EDGAR.', outcome: 'Conversion completed; ETF trades as AKRE; John Neff CEO/CIO.', outcomeState: 'KNOWN', sourceTitle: 'Akre press release (Yahoo mirror)', sourceUrl: 'https://finance.yahoo.com/news/akre-capital-completes-one-industry-142200246.html', themes: ['firm-continuity'] },

  // Vinall
  { investorSlug: 'robert-vinall', dateLabel: '2014', sortDate: '2014', action: 'Initiated Credit Acceptance — \u201cfavourite\u201d buyback-compounding case', company: 'Credit Acceptance (CACC)', context: 'H1-14 + H1-22 letters.', outcome: '9–18% position held through Q2 2025 (18.01% of US sleeve).', outcomeState: 'KNOWN', sourceTitle: 'H1 2014 Co-Investor letter', sourceUrl: 'https://rvcapital.ch/post/co-investor-letter-2014', themes: ['owner-managers', 'business-quality'] },
  { investorSlug: 'robert-vinall', dateLabel: '2016', sortDate: '2016', action: 'Initiated Meta (\u201cmost frustrating investment\u201d framing)', company: 'Meta (META)', context: '$4.20 EPS thesis → $13.77 actual by 2022.', outcome: 'Contrarian durability test passed; META now ~20.45% of US sleeve.', outcomeState: 'KNOWN', sourceTitle: '2016 Co-Investor letter', sourceUrl: 'https://rvcapital.ch/post/2016-co-investor-letter', themes: ['long-horizon'] },
  { investorSlug: 'robert-vinall', dateLabel: '2021→', sortDate: '2021', action: 'Initiated Carvana; doubled down through the \u221280% crisis', company: 'Carvana (CVNA)', context: 'Founder-character underwriting (Ernie Garcia defense); lowest buys ~20x.', outcome: 'Now largest holding (~30% of US sleeve); Garcia headlined the 2026 Gathering.', outcomeState: 'PARTIAL', sourceTitle: '2021 letter + H1-22 + Q2-25', sourceUrl: 'https://www.youtube.com/watch?v=3JGStVfr17w', themes: ['owner-managers'] },
  { investorSlug: 'robert-vinall', dateLabel: '2017–2024', sortDate: '2024', action: 'Ryman Healthcare: NZ$8.60 entry → ~NZ$4.50 exit; formal postmortem', company: 'Ryman Healthcare (RYM.NZ)', context: '\u201cBy far the worst investment I have ever made\u201d — H1 2025 letter.', outcome: 'Loss exit; documented autopsy — a rare public loss postmortem.', outcomeState: 'KNOWN', sourceTitle: 'H1 2025 letter (Worldly Invest analysis)', sourceUrl: 'https://www.worldlyinvest.com/p/mistaken-investments-from-letters-parti', themes: ['mistakes-sell-discipline'] },
  { investorSlug: 'robert-vinall', dateLabel: '2024', sortDate: '2024', action: 'Initiated IPCO (first O&G position; Lundin 34%)', company: 'International Petroleum (IPCO)', context: 'ESG trade-offs essay-length treatment in H1-24.', outcome: 'Position open; initiation verified via letter only.', outcomeState: 'PARTIAL', sourceTitle: 'H1 2024 letter (HFA mirror)', sourceUrl: 'https://hedgefundalpha.com', themes: ['contrarian-value'] },
  { investorSlug: 'robert-vinall', dateLabel: '2024–2025', sortDate: '2025', action: 'China basket (NetEase, Yum China, H World, Didi) + Prosus 10% → sold', company: 'China basket / Prosus / PDD', context: 'Fear-greed entry logic articulated in H1-24; \u201csix investments in China\u201d per the 2024 letter podcast.', outcome: 'Prosus and PDD SOLD per the 2025 annual letter; new selling framework introduced.', outcomeState: 'KNOWN', sourceTitle: '2025 annual letter (podcast read-through)', sourceUrl: 'https://podcasts.apple.com/us/podcast/the-rob-vinall-podcast/id1548228664', themes: ['emerging-markets', 'mistakes-sell-discipline'] },
  { investorSlug: 'robert-vinall', dateLabel: '2015', sortDate: '2015', action: 'Initiated Berkshire & Google (quality-phase evidence)', company: 'BRK · GOOG', context: 'Phase map: 2008–14 deep value → 2015–19 high quality → 2019–22 future quality (COBF thread).', outcome: 'Documented in letters; Salesforce (H1-21) and Wix (2019) followed.', outcomeState: 'KNOWN', sourceTitle: 'Co-Investor letters + COBF phase map', sourceUrl: 'https://thecobf.com/topic/19384', themes: ['business-quality'] },

  // Sleep
  { investorSlug: 'nicholas-sleep', dateLabel: '2001–02', sortDate: '2002', action: 'Launched Nomad; cigar-butt beginnings (Saks, Int\u2019l Speedway, Conseco\u2026)', company: 'Nomad portfolio', context: 'Dec 2002 letter documents the early book.', outcome: 'Journey \u201cfrom cigar butt investing to near permanent holdings\u201d (preamble).', outcomeState: 'KNOWN', sourceTitle: 'Nomad letters (IGY authorized PDF)', sourceUrl: 'https://igyfoundation.org.uk/wp-content/uploads/2021/03/Full_Collection_Nomad_Letters_.pdf', themes: ['contrarian-value'] },
  { investorSlug: 'nicholas-sleep', dateLabel: '2001–03', sortDate: '2003', action: 'Initiated and defended Amazon through the post-crash controversy', company: 'Amazon.com', context: 'FCF-per-share logic; Bezos quote on givebacks; \u201cthe ever widening of the moat.\u201d', outcome: 'Signature position; final letter recommended partners simply hold it.', outcomeState: 'KNOWN', sourceTitle: 'Nomad letters (Amazon passages)', sourceUrl: 'https://igyfoundation.org.uk/wp-content/uploads/2021/03/Full_Collection_Nomad_Letters_.pdf', themes: ['business-quality'] },
  { investorSlug: 'nicholas-sleep', dateLabel: '2002–03', sortDate: '2003', action: 'Bought Costco (~3.1%) and re-underwritten it (\u201cDeconstructing the Business case\u201d)', company: 'Costco Wholesale', context: 'EDLP 14% markup; membership loyalty; \u201cas perfect a growth stock as we have found.\u201d', outcome: 'Scale-economics-shared thesis fully articulated by the 2008 letter; held to liquidation.', outcomeState: 'KNOWN', sourceTitle: 'Nomad letters (Costco section)', sourceUrl: 'https://igyfoundation.org.uk/wp-content/uploads/2021/03/Full_Collection_Nomad_Letters_.pdf', themes: ['business-quality'] },
  { investorSlug: 'nicholas-sleep', dateLabel: 'Dec 2013', sortDate: '2013', action: 'Final letter: recommended partners simply hold Amazon, Costco and Berkshire; wound up the fund', company: 'Nomad wind-down', context: 'Verified verbatim in the IGY postamble; liquidation completed early 2014.', outcome: '921.1% cumulative / 18.4% p.a. after fees (FT) over 12 years.', outcomeState: 'KNOWN', sourceTitle: 'IGY authorized PDF postamble', sourceUrl: 'https://igyfoundation.org.uk/wp-content/uploads/2021/03/Full_Collection_Nomad_Letters_.pdf', themes: ['long-horizon', 'lineage'] },
  { investorSlug: 'nicholas-sleep', dateLabel: '2014→', sortDate: '2014', action: 'Post-Nomad pivot: philanthropy (IGY Foundation) and school governance', company: 'IGY Foundation', context: 'He \u201chas not entirely left investing\u201d (postamble).', outcome: 'IGY is now the authorized home of the letters.', outcomeState: 'KNOWN', sourceTitle: 'IGY Foundation', sourceUrl: 'https://igyfoundation.org.uk/nomad-partnership-letters', themes: ['firm-continuity'] },

  // Spier
  { investorSlug: 'guy-spier', dateLabel: '1997', sortDate: '1997', action: 'Founded Aquamarine Fund in Zurich, modeled on the Buffett partnerships', company: 'Aquamarine founding', context: '\u201cLeave Wall Street norms behind\u201d arc detailed in the memoir.', outcome: 'Fund ran 28 years; cumulative ~1,185.6%.', outcomeState: 'KNOWN', sourceTitle: 'The Education of a Value Investor', sourceUrl: 'https://www.guyspier.com', themes: ['lineage'] },
  { investorSlug: 'guy-spier', dateLabel: 'Jun 25, 2008', sortDate: '2008', action: '$650,100 Buffett charity lunch (with Mohnish Pabrai)', company: 'Glide Foundation lunch', context: 'Auction won June 2007; Spier credits it with redirecting his life.', outcome: 'Documented in his own essay, TIME, and CNBC.', outcomeState: 'KNOWN', sourceTitle: '\u201cLunch with Warren Buffett\u201d (guyspier.com)', sourceUrl: 'https://www.guyspier.com/lunch-with-warren-buffett', themes: ['lineage'] },
  { investorSlug: 'guy-spier', dateLabel: 'Sep 18, 2025', sortDate: '2025', action: 'Publicly declared \u201cthe golden age of value investing is over\u201d', company: 'Value-investing meta-thesis', context: 'Bloomberg Opinion op-ed: LLMs have obliterated the research edge he had.', outcome: 'Rare practitioner mea culpa; pairs with the wind-down.', outcomeState: 'KNOWN', sourceTitle: 'Bloomberg Opinion op-ed', sourceUrl: 'https://www.bloomberg.com/opinion/articles/2025-09-18/buffett-munger-soros-golden-age-of-value-investing-is-over', themes: ['mistakes-sell-discipline'] },
  { investorSlug: 'guy-spier', dateLabel: 'Feb 2026', sortDate: '2026', action: 'Announced wind-down of Aquamarine after 28 years; family-office conversion', company: 'Aquamarine wind-down', context: 'Trigger: cancer diagnosis (grade 4 glioblastoma); \u201cone of the bravest investor letters\u201d (Rubinstein).', outcome: '2025 return 11.3%; final letter posted Feb 2026.', outcomeState: 'KNOWN', sourceTitle: 'Final 2025 letter + Opalesque', sourceUrl: 'https://www.aquamarinefund.com/annual-letter-to-partners-2025', themes: ['firm-continuity'] },

  // Rochon
  { investorSlug: 'francois-rochon', dateLabel: 'Jul 1, 1993', sortDate: '1993', action: 'Incepted the Rochon Global Portfolio (family accounts as model)', company: 'Rochon Global Portfolio', context: '+37.0% in H2-1993; the \u201csince 1993\u201d record\u2019s true anchor.', outcome: '15.3% CAGR vs 9.5% benchmark since inception (2020 letter).', outcomeState: 'KNOWN', sourceTitle: '2020 annual letter (returns table)', sourceUrl: 'https://givernycapital.com/wp-content/uploads/2022/07/giverny-capital-annual-letter-2020.pdf', themes: ['long-horizon'] },
  { investorSlug: 'francois-rochon', dateLabel: '2015', sortDate: '2015', action: 'Bought AMETEK', company: 'AMETEK', context: 'Five-year post-mortem in the 2020 letter.', outcome: 'EPS +50% (2015–19); stock more than doubled.', outcomeState: 'KNOWN', sourceTitle: '2020 annual letter', sourceUrl: 'https://givernycapital.com/wp-content/uploads/2022/07/giverny-capital-annual-letter-2020.pdf', themes: ['business-quality'] },
  { investorSlug: 'francois-rochon', dateLabel: '2015', sortDate: '2015', action: 'Bought Stericycle — sold at a loss', company: 'Stericycle', context: 'The sell-discipline canon passage: \u201cquick to take your losses, reluctant to take your profits\u201d (Carret, 1930).', outcome: 'Stock lower four years after exit — discipline vindicated.', outcomeState: 'KNOWN', sourceTitle: '2020 annual letter', sourceUrl: 'https://givernycapital.com/wp-content/uploads/2022/07/giverny-capital-annual-letter-2020.pdf', themes: ['mistakes-sell-discipline'] },
  { investorSlug: 'francois-rochon', dateLabel: 'Mar–Apr 2020', sortDate: '2020', action: 'COVID-crash purchases: bought Five Below; missed Floor & Decor on a ~$30 limit', company: 'Five Below · Floor & Decor', context: '\u201cPodium of Errors\u201d — Bronze Medal error; stock later $102.', outcome: 'Five Below bought; Floor & Decor omission documented.', outcomeState: 'KNOWN', sourceTitle: '2020 annual letter (Podium of Errors)', sourceUrl: 'https://givernycapital.com/wp-content/uploads/2022/07/giverny-capital-annual-letter-2020.pdf', themes: ['contrarian-value', 'mistakes-sell-discipline'] },
  { investorSlug: 'francois-rochon', dateLabel: '2019–20', sortDate: '2020', action: 'Delayed the TSM purchase for a \u201cbetter price\u201d', company: 'Taiwan Semiconductor (TSM)', context: 'Silver Medal error; thesis loved, execution delayed.', outcome: 'Stock $50→$127 — omission documented in the Podium of Errors.', outcomeState: 'KNOWN', sourceTitle: '2020 annual letter', sourceUrl: 'https://givernycapital.com/wp-content/uploads/2022/07/giverny-capital-annual-letter-2020.pdf', themes: ['mistakes-sell-discipline'] },
  { investorSlug: 'francois-rochon', dateLabel: '2006–2020', sortDate: '2020', action: 'Studied Pool Corp for 14 years; never bought', company: 'Pool Corp (POOL)', context: 'Gold Medal error — the marquee errors-of-omission case study.', outcome: '~800%+ foregone; documented annually.', outcomeState: 'KNOWN', sourceTitle: '2020 annual letter', sourceUrl: 'https://givernycapital.com/wp-content/uploads/2022/07/giverny-capital-annual-letter-2020.pdf', themes: ['mistakes-sell-discipline'] },
  { investorSlug: 'francois-rochon', dateLabel: '2024', sortDate: '2024', action: 'Ran the portfolio to +24.9% (\u22122.0% vs benchmark)', company: 'Rochon Global Portfolio', context: '2024 annual letter (via SA republication).', outcome: '31st consecutive year documented in the returns table.', outcomeState: 'KNOWN', sourceTitle: '2024 annual letter', sourceUrl: 'https://seekingalpha.com/article/4772260-giverny-capital-inc-2024-annual-letter', themes: ['business-quality'] },

  // Tweedy, Browne
  { investorSlug: 'tweedy-browne', dateLabel: '1920', sortDate: '1920', action: 'Founded as a dealer in closely held securities — \u201cbuyers of last resort\u201d', company: 'Firm formation', context: 'The niche that attracted Graham\u2019s brokerage business.', outcome: 'The firm operates to this day — 100+ years.', outcomeState: 'KNOWN', sourceTitle: 'About — A Brief History', sourceUrl: 'https://www.tweedyfunds.com/about', themes: ['contrarian-value'] },
  { investorSlug: 'tweedy-browne', dateLabel: '1930s–50s', sortDate: '1950', action: 'Served Graham-Newman as a primary brokerage client', company: 'Graham-Newman Corp.', context: 'Through Graham the partners met Walter Schloss and Warren Buffett.', outcome: 'Relationships formed that defined the lineage.', outcomeState: 'KNOWN', sourceTitle: 'About page (primary)', sourceUrl: 'https://www.tweedyfunds.com/about', themes: ['lineage'] },
  { investorSlug: 'tweedy-browne', dateLabel: '1957', sortDate: '1957', action: 'Hired Tom Knapp from Graham-Newman; converted from broker to investor', company: 'Knapp hire', context: 'Bill Tweedy retired 1957; Howard Browne became president.', outcome: '1959 partnership pooling; the investor era began.', outcomeState: 'KNOWN', sourceTitle: 'About page (primary)', sourceUrl: 'https://www.tweedyfunds.com/about', themes: ['lineage'] },
  { investorSlug: 'tweedy-browne', dateLabel: '1968', sortDate: '1968', action: 'Knapp & Ed Anderson formed Tweedy, Browne Partners; first outside LPs admitted', company: 'Tweedy, Browne Partners', context: 'Buffett\u2019s Superinvestors essay (1984) covers the pair\u2019s results in Table 2.', outcome: 'Partnership-era results externally validated.', outcomeState: 'KNOWN', sourceTitle: 'Superinvestors of Graham-and-Doddsville', sourceUrl: 'https://business.columbia.edu/insights/chazen-global-insights/superinvestors-graham-and-doddsville', themes: ['lineage'] },
  { investorSlug: 'tweedy-browne', dateLabel: '1993', sortDate: '1993', action: 'Created the first public mutual fund (Global Value Fund)', company: 'Fund launch', context: 'Letter/report archive effectively begins with this launch.', outcome: '30+ year free report run (1994→).', outcomeState: 'KNOWN', sourceTitle: 'Legacy reports', sourceUrl: 'https://www.tweedy.com/usfunds/wp-content/uploads/sites/10/2019/10/3-31-1995-Annual-Report-TBGVX.pdf', themes: ['firm-continuity'] },
  { investorSlug: 'tweedy-browne', dateLabel: '1997', sortDate: '1997', action: 'AMG acquired 70% of the firm for $300M', company: 'AMG deal', context: 'Confirms the 1997 (not later) dating; funds distributed by AMG Distributors.', outcome: 'Ownership structure set; same ecosystem as Akre Capital.', outcomeState: 'KNOWN', sourceTitle: 'Wikipedia + firm records', sourceUrl: 'https://en.wikipedia.org/wiki/Tweedy,_Browne', themes: ['firm-continuity'] },
]

// ─── THEMES (Phase 4 taxonomy — themes vs concepts per master plan §14) ─────

export const themes: ThemeSeed[] = [
  { slug: 'risk-and-crisis', name: 'Risk & Crisis', type: 'THEME', description: 'Positioning for — and through — systemic events: the CDS/Nikkei-put hedging programs and the short books of the crisis cohort.', investors: [
    { slug: 'michael-burry', strength: 3, note: 'CDS short of subprime — the defining trade' },
    { slug: 'david-einhorn', strength: 3, note: 'Lehman short; Nov 2007 \u201cA Few Thoughts About Risk\u201d' },
    { slug: 'prem-watsa', strength: 3, note: 'Nikkei puts \u2192 $18B CDS program \u2192 2009 deployment' },
  ] },
  { slug: 'business-quality', name: 'Business Quality & Compounding', type: 'THEME', description: 'Durable economics, moats, and reinvestment: the compounder canon that dominates this cohort.', investors: [
    { slug: 'nicholas-sleep', strength: 3, note: 'Scale economics shared; destination analysis' },
    { slug: 'chuck-akre', strength: 3, note: 'Three-legged stool' },
    { slug: 'francois-rochon', strength: 3, note: 'Owner\u2019s earnings orientation' },
    { slug: 'thomas-russo', strength: 2, note: 'Global consumer-brand durability' },
    { slug: 'robert-vinall', strength: 2, note: 'Owner-earnings lineage; quality phases' },
    { slug: 'tweedy-browne', strength: 1, note: 'Quality within the value discipline' },
  ] },
  { slug: 'owner-managers', name: 'Owner-Managers & Family Control', type: 'THEME', description: 'Underwriting the people: founder character, family control, and the avoidance of agency costs.', investors: [
    { slug: 'robert-vinall', strength: 3, note: 'Founder-character underwriting (Garcia/Carvana)' },
    { slug: 'thomas-russo', strength: 3, note: '>40% AUM family-controlled' },
    { slug: 'chuck-akre', strength: 2, note: 'Management leg of the stool' },
  ] },
  { slug: 'forensic-shorts', name: 'Forensic Accounting & Short Selling', type: 'THEME', description: 'Reading the footnotes against the narrative: accounting-driven short theses and public campaigns.', investors: [
    { slug: 'david-einhorn', strength: 3, note: 'Allied, Lehman, fracking — the canon' },
    { slug: 'michael-burry', strength: 2, note: 'Depreciation / reported-earnings critique' },
  ] },
  { slug: 'contrarian-value', name: 'Contrarian & Deep Value', type: 'THEME', description: 'Buying when others won\u2019t: statistical cheapness, crisis purchases, fear-greed entries, and the evidence base for value.', investors: [
    { slug: 'michael-burry', strength: 3, note: 'Deep-value screens; contrarian macro pivots' },
    { slug: 'prem-watsa', strength: 3, note: 'Contrarian macro calls; crisis deployment' },
    { slug: 'tweedy-browne', strength: 3, note: 'What Has Worked: the evidence base' },
    { slug: 'david-einhorn', strength: 2, note: '\u201cBroken market\u201d compelling values' },
    { slug: 'francois-rochon', strength: 2, note: 'COVID-crash purchases; fully-invested stance' },
    { slug: 'robert-vinall', strength: 2, note: 'China fear-greed entries' },
  ] },
  { slug: 'long-horizon', name: 'Long-Horizon Patience', type: 'THEME', description: 'Decade-scale holding periods, capacity to suffer, and the discipline of doing nothing.', investors: [
    { slug: 'thomas-russo', strength: 3, note: 'Capacity to suffer' },
    { slug: 'nicholas-sleep', strength: 3, note: 'Destination analysis; inactive investing' },
    { slug: 'chuck-akre', strength: 2, note: 'Buy-and-hold compounders' },
    { slug: 'robert-vinall', strength: 2, note: 'Holding-period patience' },
    { slug: 'francois-rochon', strength: 2, note: 'Since-1993 composite discipline' },
    { slug: 'li-lu', strength: 2, note: 'Long-only conversion; circle of competence' },
  ] },
  { slug: 'lineage', name: 'Lineage & Apprenticeship', type: 'THEME', description: 'The connective tissue of the corpus: Graham-Newman descent, the Munger circle, the Buffett lunch, and partnership models.', investors: [
    { slug: 'li-lu', strength: 3, note: 'Munger apprenticeship; BYD introduction' },
    { slug: 'guy-spier', strength: 3, note: 'The $650,100 lunch; inner scorecard' },
    { slug: 'tweedy-browne', strength: 3, note: 'Graham-Newman \u2192 Knapp \u2192 Anderson' },
    { slug: 'prem-watsa', strength: 2, note: 'Fairfax modeled on Berkshire' },
    { slug: 'nicholas-sleep', strength: 2, note: 'Buffett-style partnership structure' },
    { slug: 'chuck-akre', strength: 2, note: 'Berkshire holder since 1977' },
    { slug: 'thomas-russo', strength: 2, note: 'Berkshire holder since 1981' },
    { slug: 'francois-rochon', strength: 2, note: 'Buffett/Graham/Templeton/Fisher synthesis' },
    { slug: 'michael-burry', strength: 1, note: 'Stated Graham roots' },
    { slug: 'robert-vinall', strength: 1, note: 'Owner-earnings lineage' },
  ] },
  { slug: 'mistakes-sell-discipline', name: 'Mistakes, Autopsies & Sell Discipline', type: 'THEME', description: 'The honest-error canon: formal loss autopsies, annual Podiums of Errors, and articulated selling frameworks.', investors: [
    { slug: 'robert-vinall', strength: 3, note: 'Ryman autopsy; 2025 selling framework' },
    { slug: 'francois-rochon', strength: 3, note: 'Podium of Errors; Carret rule' },
    { slug: 'nicholas-sleep', strength: 2, note: 'Error-admitting letters' },
    { slug: 'guy-spier', strength: 1, note: 'Meta-level honesty: \u201cgolden age is over\u201d' },
  ] },
  { slug: 'emerging-markets', name: 'Emerging Markets: China & India', type: 'THEME', description: 'Building durable exposure to China and India — civilization frameworks, airport platforms, and fear-greed baskets.', investors: [
    { slug: 'li-lu', strength: 3, note: 'Civilization-3.0 framework; value investing in China' },
    { slug: 'prem-watsa', strength: 3, note: 'India build-out: BIAL, Go Digit' },
    { slug: 'robert-vinall', strength: 2, note: 'China basket 2024–25' },
  ] },
  { slug: 'firm-continuity', name: 'Firm Continuity & Succession', type: 'THEME', description: 'The 2025–26 inflection: shutdowns, wind-downs, ETF conversions, and successions that will define the next decade of the corpus.', investors: [
    { slug: 'prem-watsa', strength: 3, note: 'Ben Watsa succession (Nov 2025)' },
    { slug: 'chuck-akre', strength: 3, note: 'ETF conversion; John Neff CEO/CIO' },
    { slug: 'tweedy-browne', strength: 3, note: 'Committee stability since 1920' },
    { slug: 'guy-spier', strength: 3, note: 'Wind-down after 28 years' },
    { slug: 'michael-burry', strength: 3, note: 'Scion shutdown; Substack era' },
    { slug: 'nicholas-sleep', strength: 1, note: 'IGY Foundation as letters\u2019 home' },
  ] },
  // CONCEPTS (specific ideas under themes — master plan §14)
  { slug: 'crisis-hedging-programs', name: 'Crisis Hedging Programs', type: 'CONCEPT', parent: 'risk-and-crisis', description: 'Structural tail hedges: Nikkei puts, CDS books, equity-index puts — bought before the storm, monetized in it.', investors: [
    { slug: 'prem-watsa', strength: 3, note: '~$18B CDS notional 2003–09' },
    { slug: 'michael-burry', strength: 3, note: '~$1bn CDS notional' },
    { slug: 'david-einhorn', strength: 2, note: 'Lehman-specific short' },
  ] },
  { slug: 'scale-economics-shared', name: 'Scale Economics Shared', type: 'CONCEPT', parent: 'business-quality', description: 'Costco\u2019s moat mechanic: passing scale advantages to customers, deepening the moat — named and articulated in the Nomad letters.', investors: [
    { slug: 'nicholas-sleep', strength: 3, note: 'The 2008 letter\u2019s full articulation' },
  ] },
  { slug: 'three-legged-stool', name: 'The Three-Legged Stool', type: 'CONCEPT', parent: 'business-quality', description: 'Akre\u2019s framework: business quality, management/people, and reinvestment rate — all three legs required.', investors: [
    { slug: 'chuck-akre', strength: 3, note: 'Framework owner' },
  ] },
  { slug: 'owners-earnings', name: 'Owner Earnings', type: 'CONCEPT', parent: 'business-quality', description: 'Buffett-lineage cash-earnings lens applied to valuation — the analytical core of the Giverny and RV Capital letters.', investors: [
    { slug: 'francois-rochon', strength: 3, note: 'Owner\u2019s-earnings essay (2020 letter)' },
    { slug: 'robert-vinall', strength: 2, note: 'Owner-earnings lineage' },
  ] },
  { slug: 'capacity-to-suffer', name: 'Capacity to Suffer', type: 'CONCEPT', parent: 'long-horizon', description: 'Russo\u2019s criterion: the willingness (of manager and investor) to endure drawdowns in quality holdings without selling.', investors: [
    { slug: 'thomas-russo', strength: 3, note: 'Framework owner' },
  ] },
  { slug: 'destination-analysis', name: 'Destination Analysis', type: 'CONCEPT', parent: 'long-horizon', description: 'Sleep\u2019s inversion: value the destination (what the business must become), not next quarter\u2019s earnings.', investors: [
    { slug: 'nicholas-sleep', strength: 3, note: 'Framework owner' },
  ] },
  { slug: 'podium-of-errors', name: 'Podium of Errors', type: 'CONCEPT', parent: 'mistakes-sell-discipline', description: 'Rochon\u2019s annual medals for errors of omission and commission — a systematic, published error canon.', investors: [
    { slug: 'francois-rochon', strength: 3, note: 'Annual tradition since the 1990s' },
    { slug: 'robert-vinall', strength: 2, note: 'Formal loss autopsies' },
  ] },
  { slug: 'evidence-based-value', name: 'Evidence-Based Value', type: 'CONCEPT', parent: 'contrarian-value', description: 'Tweedy\u2019s \u201cWhat Has Worked in Investing\u201d: 50+ academic studies assembled into a house view of statistical cheapness.', investors: [
    { slug: 'tweedy-browne', strength: 3, note: 'Booklet owner' },
  ] },
  { slug: 'civilization-3-0', name: 'Civilization 3.0', type: 'CONCEPT', parent: 'emerging-markets', description: 'Li Lu\u2019s modernization framework: the science-technology-market matrix driving China\u2019s compounding — the intellectual base of his China thesis.', investors: [
    { slug: 'li-lu', strength: 3, note: 'Framework owner' },
  ] },
]

// ─── CORRECTIONS (premise-correction ledger — evidence rules §6, Phase 2) ────

export const corrections: CorrectionSeed[] = [
  { investorSlug: 'david-einhorn', subject: 'Nov 13, 2008 House hearing', claim: 'Einhorn testified at the hedge-funds hearing', verdict: 'VALIDATED', detail: 'The sheet\u2019s premise correction holds: witnesses were Soros, Paulson, Simons, Falcone, Griffin + regulators. Einhorn was NOT a witness.', url: 'https://www.govinfo.gov/content/pkg/CHRG-110hhrg56582/html/CHRG-110hhrg56582.htm' },
  { investorSlug: 'david-einhorn', subject: 'Sohn 2015 GM short', claim: 'Einhorn shorted GM at Sohn 2015', verdict: 'VALIDATED', detail: 'Re-checked Fortune/Reuters/CNBC coverage — zero corroboration; keep unattributed.', url: 'https://fortune.com/2015/05/04/2015-sohn-conference-einhorn-shorting-mother-fracker-oil-companies' },
  { investorSlug: 'david-einhorn', subject: 'FSOPOTAT revised edition', claim: 'Year conflict: 2010 vs 2011', verdict: 'RESOLVED', detail: 'Evidence favors Dec 7, 2010 (Goodreads/Wiley); 2011 = later printing. Cite \u201c2010 (2011 printing).\u201d', url: 'https://www.goodreads.com/work/editions/3665258-fooling-some-of-the-people-all-of-the-time' },
  { investorSlug: 'david-einhorn', subject: 'Podcast gap', claim: 'No major podcasts located', verdict: 'UPDATED', detail: 'Gap closed: Masters in Business Feb 2024 (full transcript), Simplify fireside Oct 2025, Money Maze 2023, Long and Short of Investing.', url: 'https://ritholtz.com/2024/02/transcript-david-einhorn' },
  { investorSlug: 'michael-burry', subject: 'Vanderbilt speech date', claim: 'Speech given 2010', verdict: 'CORRECTED', detail: 'April 5, 2011 — \u201cMissteps to Mayhem\u201d; both video and transcript live on news.vanderbilt.edu.', url: 'https://news.vanderbilt.edu/2011/04/13/michael-burry-transcript' },
  { investorSlug: 'michael-burry', subject: 'UCLA speech date', claim: 'Speech given 2010', verdict: 'CORRECTED', detail: '2012 Economics Commencement keynote; transcript hosted by the econ department.', url: 'https://economics.ucla.edu/wp-content/uploads/2016/09/2012-Commencement-Speech.doc' },
  { investorSlug: 'michael-burry', subject: 'VF excerpt title', claim: '\u201cBetting on the Blind\u201d', verdict: 'CORRECTED', detail: 'Actual title: \u201cBetting on the Blind Side\u201d (April 2010 issue).', url: 'https://archive.vanityfair.com/article/2010/4/betting-on-the-blind-side' },
  { investorSlug: 'michael-burry', subject: '13F spine', claim: 'Holdings spine 2013\u2192present', verdict: 'UPDATED', detail: 'Spine now TERMINAL: Scion deregistered Nov 2025; final 13F-HR Q3 2025 (filed Nov 3, 2025).', url: 'https://www.sec.gov/edgar/browse/?CIK=1649339' },
  { investorSlug: 'prem-watsa', subject: 'BlackBerry take-private', claim: 'Consortium take-private completed 2022', verdict: 'CORRECTED', detail: 'The 2013 $4.7B LOI failed; Fairfax held $500M debentures (~US$200M interest income); BlackBerry remains public — and Fairfax fully exited Aug 2026.', url: 'https://www.theglobeandmail.com/business/article-fairfax-financial-sells-out-of-blackberry-at-a-steep-loss' },
  { investorSlug: 'prem-watsa', subject: 'BNN 2018 video ID', claim: 'YouTube ID NQ1AAoNaPLU', verdict: 'UPDATED', detail: 'Bloomberg\u2019s own upload is BW08lI8518A; the sheet\u2019s ID did not resurface — map NEEDS_REVIEW.', url: 'https://youtu.be/BW08lI8518A' },
  { investorSlug: 'li-lu', subject: 'Regulatory footprint', claim: 'Testimony & regulatory: none located (verified-negative)', verdict: 'FLIPPED', detail: 'Himalaya Capital Management LLC files quarterly SEC 13F — Q2 2026 filed Aug 14, 2026, incl. a new ~$469M PDD block. The sheet\u2019s negative finding was wrong.', url: 'https://valuesider.com/guru/li-lu-himalaya-capital-management/portfolio' },
  { investorSlug: 'li-lu', subject: 'Official domain', claim: 'himalayacapital.com publications', verdict: 'CORRECTED', detail: 'Site rebranded to himcap.com — re-point all URLs; CDN PDFs live under website-files paths.', url: 'https://www.himcap.com/publications' },
  { investorSlug: 'li-lu', subject: 'PKU keynote title', claim: '\u201cValue Investing in China\u201d', verdict: 'CORRECTED', detail: 'Official English title: \u201cThe Prospect of Value Investing in China.\u201d', url: 'https://www.himcap.com/publications' },
  { investorSlug: 'li-lu', subject: 'PCA foreword attribution', claim: 'Li Lu wrote the Stripe Press 2023 English foreword', verdict: 'VALIDATED', detail: 'Sheet\u2019s correction confirmed: Li Lu\u2019s foreword belongs to Chinese editions only; the Stripe Press English foreword is John Collison\u2019s.', url: 'https://www.stripe.press/poor-charlies-almanack' },
  { investorSlug: 'li-lu', subject: 'Moving the Mountain year', claim: 'Published 1993', verdict: 'VALIDATED', detail: 'Confirmed 1990 Macmillan (sheet\u2019s correction held); some editions print the author as \u201cLu Li.\u201d', url: 'https://books.google.com/books/about/Moving_the_Mountain.html?id=wcFbOQAACAAJ' },
  { investorSlug: 'chuck-akre', subject: 'ILTB air date', claim: '\u201cThree-Legged Stool\u201d aired ~Oct/Nov 2020', verdict: 'CORRECTED', detail: 'Episode 135, June 18, 2019. The Feb 6, 2024 REPLAY likely caused the confusion.', url: 'https://colossus.com/episode/akre-the-three-legged-stool' },
  { investorSlug: 'chuck-akre', subject: 'WealthTrack guest', claim: 'Episode #1619 \u201cwith Ron Neff\u201d', verdict: 'CORRECTED', detail: 'The co-manager is John Neff (now CEO/CIO) — the famous Ron Neff was at Wells Fargo.', url: 'https://wealthtrack.com/finding-compounding-machines-with-the-great-investor-chuck-akre-his-gen-x-co-manager-john-neff' },
  { investorSlug: 'chuck-akre', subject: 'Google talk title', claim: '\u201cThree-legged stool presentation\u201d (2017)', verdict: 'CORRECTED', detail: 'Actual title: \u201cThe Peregrinations of an English Major Trying to Figure Out How to Compound Money.\u201d', url: 'https://www.marketfolly.com/2017/04/chuck-akres-talk-at-google-three-legged.html' },
  { investorSlug: 'chuck-akre', subject: 'Law-of-large-numbers essay', claim: 'Standalone white paper on /our-thinking', verdict: 'CORRECTED', detail: 'It is the Q2 2024 Akre Focus Fund quarterly commentary (Seeking Alpha mirror, Jul 16, 2024).', url: 'https://seekingalpha.com/article/4704241-akre-focus-fund-q2-2024-commentary' },
  { investorSlug: 'thomas-russo', subject: 'Google talk 2024', claim: 'Talks at Google Apr 15, 2024 (video ID 08clbvAO0KY)', verdict: 'UPDATED', detail: 'NOT_FOUND in search — zero traces; verify the video ID directly on YouTube before ingest.', url: 'https://www.youtube.com/watch?v=08clbvAO0KY' },
  { investorSlug: 'thomas-russo', subject: 'Ivey deck year conflict', claim: '\u201c20-thomas-russo.pdf\u201d year unclear', verdict: 'RESOLVED', detail: 'It is the Apr 15, 2026 Ben Graham Centre conference deck (\u201cCapacity to Suffer \u2013 Global Value Investing\u201d).', url: 'https://hedgefundalpha.com/conferences/ben-graham-centre-2026-value-investing-conference/' },
  { investorSlug: 'francois-rochon', subject: 'Letter archive depth', claim: 'Giverny letters 2001\u20132025 all free', verdict: 'CORRECTED', detail: 'The live site hosts 2017\u20132025 only; the 2001\u20132016 vintages exist but require Wayback/mirror recovery.', url: 'https://givernycapital.com/en/letters-to-our-partners' },
  { investorSlug: 'francois-rochon', subject: 'Since-1993 record', claim: '\u201cGiverny CAP since 1993\u201d', verdict: 'RESOLVED', detail: 'The since-1993 record belongs to the Rochon Global Portfolio composite (15.3% CAGR vs 9.5% benchmark); the Giverny firm dates from 1998.', url: 'https://givernycapital.com/en/returns' },
  { investorSlug: 'guy-spier', subject: 'Podcast/TEDx credits', claim: 'TEDx talk; Invest Like the Best; Masters in Business', verdict: 'CORRECTED', detail: 'TEDx narrowed to \u201cTED India speaker / TEDxZürich co-founder\u201d; ILTB and Masters-in-Business appearances verified-negative — do not import.', url: 'https://sloaninvestmentconference.org/guy-spier' },
  { investorSlug: 'tweedy-browne', subject: 'Chris Browne death year', claim: 'Died 2019', verdict: 'VALIDATED', detail: 'Confirmed December 13, 2009 (NYT DealBook obituary) — the sheet\u2019s correction held.', url: 'https://dealbook.nytimes.com/2009/12/16/christopher-h-browne-value-investor-dies' },
  { investorSlug: 'tweedy-browne', subject: 'AMG deal year', claim: 'AMG deal was 1997', verdict: 'VALIDATED', detail: 'Confirmed: 70% for $300M in 1997.', url: 'https://en.wikipedia.org/wiki/Tweedy,_Browne' },
  { investorSlug: 'nicholas-sleep', subject: 'Nomad final letter', claim: 'Final letter is Dec 2013', verdict: 'VALIDATED', detail: 'Verified verbatim in the IGY authorized PDF postamble; liquidation ran into early 2014.', url: 'https://igyfoundation.org.uk/wp-content/uploads/2021/03/Full_Collection_Nomad_Letters_.pdf' },
  { investorSlug: 'robert-vinall', subject: 'China/Prosus basket status', claim: 'Prosus 10% with switch-to-Tencent trigger', verdict: 'UPDATED', detail: 'The 2025 annual letter reports Prosus and PDD Holdings SOLD, plus a new selling framework — the basket has been materially unwound.', url: 'https://podcasts.apple.com/us/podcast/the-rob-vinall-podcast/id1548228664' },
]

// ─── CROSS-REFERENCES (Phase 5 — explainable edges) ─────────────────────────

export const crossReferences: CrossRefSeed[] = [
  { fromSlug: 'li-lu', fromName: 'Li Lu', toSlug: 'context-munger', toName: 'Charlie Munger', toContext: true, reason: 'Apprenticeship; BYD introduction; ~$88M family entrustment (now ~$400M)', kind: 'apprenticeship' },
  { fromSlug: 'guy-spier', fromName: 'Guy Spier', toSlug: 'context-buffett', toName: 'Warren Buffett', toContext: true, reason: '$650,100 Glide charity lunch (2008, with Pabrai); inner-scorecard doctrine', kind: 'lineage' },
  { fromSlug: 'guy-spier', fromName: 'Guy Spier', toSlug: 'context-pabrai', toName: 'Mohnish Pabrai', toContext: true, reason: 'Lunch co-bidder; Pabrai circle', kind: 'network' },
  { fromSlug: 'li-lu', fromName: 'Li Lu', toSlug: 'context-pabrai', toName: 'Mohnish Pabrai', toContext: true, reason: 'Pabrai circle (per Li Lu sheet cross-references)', kind: 'network' },
  { fromSlug: 'prem-watsa', fromName: 'Prem Watsa', toSlug: 'context-pabrai', toName: 'Mohnish Pabrai', toContext: true, reason: 'Pabrai blurbed The Fairfax Way', kind: 'network' },
  { fromSlug: 'prem-watsa', fromName: 'Prem Watsa', toSlug: 'context-buffett', toName: 'Warren Buffett', toContext: true, reason: 'Fairfax explicitly modeled on the Berkshire/float template', kind: 'lineage' },
  { fromSlug: 'nicholas-sleep', fromName: 'Nicholas Sleep', toSlug: 'context-buffett', toName: 'Warren Buffett', toContext: true, reason: 'Buffett-style partnership structure; final letter recommends holding Berkshire', kind: 'lineage' },
  { fromSlug: 'thomas-russo', fromName: 'Thomas Russo', toSlug: 'context-buffett', toName: 'Warren Buffett', toContext: true, reason: 'Berkshire holder since 1981; pre-AGM Omaha circuit', kind: 'lineage' },
  { fromSlug: 'chuck-akre', fromName: 'Chuck Akre', toSlug: 'context-buffett', toName: 'Warren Buffett', toContext: true, reason: 'Berkshire holder since 1977; reinvestment-rate canon', kind: 'lineage' },
  { fromSlug: 'robert-vinall', fromName: 'Robert Vinall', toSlug: 'context-buffett', toName: 'Warren Buffett', toContext: true, reason: 'Owner-earnings lineage; Berkshire initiation 2015', kind: 'lineage' },
  { fromSlug: 'francois-rochon', fromName: 'François Rochon', toSlug: 'context-buffett', toName: 'Warren Buffett', toContext: true, reason: 'Buffett/Graham/Templeton/Fisher synthesis (2020 letter)', kind: 'lineage' },
  { fromSlug: 'tweedy-browne', fromName: 'Tweedy, Browne', toSlug: 'context-graham', toName: 'Benjamin Graham', toContext: true, reason: 'Graham-Newman was a primary brokerage client; Knapp joined from Graham-Newman (1957)', kind: 'lineage' },
  { fromSlug: 'tweedy-browne', fromName: 'Tweedy, Browne', toSlug: 'context-buffett', toName: 'Warren Buffett', toContext: true, reason: 'Buffett a brokerage client/associate; Superinvestors essay validates Knapp & Anderson', kind: 'lineage' },
  { fromSlug: 'michael-burry', fromName: 'Michael Burry', toSlug: 'context-graham', toName: 'Benjamin Graham', toContext: true, reason: 'Stated Graham roots (per source sheet cross-references)', kind: 'lineage' },
  { fromSlug: 'david-einhorn', fromName: 'David Einhorn', toSlug: 'michael-burry', toName: 'Michael Burry', toContext: false, reason: 'Crisis-era short cohort; same-era crisis positioning (per Einhorn sheet cross-references)', kind: 'cohort' },
  { fromSlug: 'robert-vinall', fromName: 'Robert Vinall', toSlug: 'chuck-akre', toName: 'Chuck Akre', toContext: false, reason: 'Constellation Software / compounder-cluster overlap', kind: 'cluster' },
  { fromSlug: 'robert-vinall', fromName: 'Robert Vinall', toSlug: 'francois-rochon', toName: 'François Rochon', toContext: false, reason: 'Compounder-framework kinship; Good Investing / MOI network', kind: 'cluster' },
  { fromSlug: 'chuck-akre', fromName: 'Chuck Akre', toSlug: 'tweedy-browne', toName: 'Tweedy, Browne', toContext: false, reason: 'AMG affiliation ecosystem (both under AMG)', kind: 'cluster' },
  { fromSlug: 'thomas-russo', fromName: 'Thomas Russo', toSlug: 'li-lu', toName: 'Li Lu', toContext: false, reason: 'Graham & Doddsville journal ecosystem', kind: 'network' },
  { fromSlug: 'guy-spier', fromName: 'Guy Spier', toSlug: 'nicholas-sleep', toName: 'Nicholas Sleep', toContext: false, reason: 'William Green / Richer, Wiser, Happier network; TIP ecosystem', kind: 'network' },
  { fromSlug: 'nicholas-sleep', fromName: 'Nicholas Sleep', toSlug: 'francois-rochon', toName: 'François Rochon', toContext: false, reason: 'William Green RWH network (TIP492 / RWH016)', kind: 'network' },
  { fromSlug: 'guy-spier', fromName: 'Guy Spier', toSlug: 'li-lu', toName: 'Li Lu', toContext: false, reason: 'Munger/Buffett circle; Spier a BYD holder (per Li Lu sheet)', kind: 'network' },
]

// ─── ACQUISITION QUEUE (priority-ordered next actions) ──────────────────────

export const acquisitionQueue: AcquisitionSeed[] = [
  { priority: 1, investorSlug: 'nicholas-sleep', item: 'IGY-authorized Nomad letters PDF (219pp, ~110k words) — ingest whole', access: 'Free', rationale: 'Single-document, highest-yield ingest in the batch; paraphrase-index; calendar Stripe Press re-pagination (Dec 1, 2026).' },
  { priority: 2, investorSlug: 'prem-watsa', item: 'Fairfax Chairman\u2019s letters 1985\u20132025 — full chronological run', access: 'Free', rationale: 'Deepest free primary series in the batch; theme-drift tracking across four decades; pair with The Fairfax Way excerpt.' },
  { priority: 3, investorSlug: 'guy-spier', item: 'Aquamarine DocSend archive (2010\u20132024) + final 2025 letter', access: 'Free', rationale: 'TIME-SENSITIVE: wind-down announced Feb 2026 — capture before links rot; pair with memoir chapters.' },
  { priority: 4, investorSlug: 'francois-rochon', item: 'Giverny letters 2017\u20132025 + Wayback recovery of 2001\u20132016', access: 'Free', rationale: 'Owner-earnings and sell-discipline canons; recover pre-2017 vintages via archive/mirrors.' },
  { priority: 5, investorSlug: 'robert-vinall', item: 'RV Capital /post/* enumeration (login-gated index)', access: 'Free (login)', rationale: 'Owner-published, decision-rich letters; enumerate post-by-post; HFA mirrors as backup.' },
  { priority: 6, investorSlug: 'david-einhorn', item: 'Wayback crawl of greenlightcapital.com letter PDFs (pre-gating)', access: 'Free via archive', rationale: '313 homepage captures since Mar 2000; archive.org unreachable from sandbox — run from different infrastructure.' },
  { priority: 7, investorSlug: 'li-lu', item: 'himcap.com publications corpus (8+ PDFs) + Roiss transcripts + MOI interview translation', access: 'Free', rationale: 'Essay-length, framework-grade primaries; re-point all URLs to the new domain.' },
  { priority: 8, investorSlug: 'tweedy-browne', item: 'Legacy reports 1994\u2192 + 187 commentary items + \u201cWhat Has Worked\u201d booklet + Mar 31 1995 history letter', access: 'Free', rationale: 'Deepest free archival run in the batch; locate the official booklet URL (only mirror found this session).' },
  { priority: 9, investorSlug: 'chuck-akre', item: 'our-thinking corpus + 1988 letter + 2009\u20132022 commentary recovery', access: 'Free / fiscal.ai', rationale: 'Wayback CDX or fiscal.ai subscription for the missing quarters.' },
  { priority: 10, investorSlug: 'michael-burry', item: 'FCIC audio transcription project (97MB, no transcript exists)', access: 'Free', rationale: 'The only long-form recorded Burry interview before 2025 — produce the transcript.' },
  { priority: 11, investorSlug: 'michael-burry', item: 'Wayback scioncapital.com captures — authenticate circulating letter PDFs', access: 'Archive-only', rationale: 'Bot-blocked from sandbox; manual/browser fetch; page-by-page authentication of mirrors.' },
  { priority: 12, investorSlug: 'multiple', item: 'Purchases: The Fairfax Way · FSOPOTAT (both editions) · Gosselin biography · CITIC 2020/2025 · Little Book of Value Investing', access: 'Purchase', rationale: 'The book spine for narrative layers across five investors.' },
]

// ─── CONTEXT NODES (graph anchors outside the researched cohort) ─────────────

export const contextNodes = [
  { slug: 'context-buffett', name: 'Warren Buffett', note: 'Master-plan CORE tier anchor; the dominant lineage node' },
  { slug: 'context-munger', name: 'Charlie Munger', note: 'Master-plan CORE tier anchor; Li Lu\u2019s apprenticeship source' },
  { slug: 'context-graham', name: 'Benjamin Graham', note: 'Master-plan CORE tier anchor; Graham-Newman lineage source' },
  { slug: 'context-pabrai', name: 'Mohnish Pabrai', note: 'Network node: lunch co-bidder, blurb author, circle connector' },
]

// ─── STATUS CHANGES (2025–26 terminal events) ───────────────────────────────

export const statusChanges = [
  { investorSlug: 'michael-burry', date: 'Oct 27, 2025', event: 'Scion Asset Management shut down', detail: 'Liquidation letter; SEC deregistration Nov 2025; final 13F Q3 2025. He now publishes via Cassandra Unchained ($400/yr).' },
  { investorSlug: 'guy-spier', date: 'Feb 2026', event: 'Aquamarine Fund wind-down announced', detail: 'Final 2025 letter; family-office conversion after a cancer diagnosis. 28-year run; cumulative ~1,185.6%. Time-sensitive capture.' },
  { investorSlug: 'chuck-akre', date: 'Oct 27, 2025', event: 'Akre Focus Fund \u2192 ETF conversion completed', detail: 'Ticker AKRE on NYSE Arca; ~$11.2B at conversion — one of the largest MF\u2192ETF conversions ever; John Neff now CEO/CIO.' },
  { investorSlug: 'prem-watsa', date: 'Nov 2025', event: 'Fairfax succession announced', detail: 'Ben Watsa named successor chairman; two-stage handover (Fairfax India chair since Jul 2024).' },
  { investorSlug: 'nicholas-sleep', date: 'Dec 1, 2026', event: 'Nomad Letters print edition (Stripe Press)', detail: '336pp; new prologue by Sleep; foreword by John Collison. Calendar re-pagination of the IGY-authorized digital corpus.' },
]

// ─── MASTER-PLAN MAPPING (which phases this research advances) ───────────────

export const masterPlanMapping = [
  { phase: 'Phase 2 — Evidence system first (§6\u2013§11)', contribution: 'Every audited source carries a verification state; 28 premise corrections logged BEFORE ingest so false premises cannot enter the corpus; public-visibility rules pre-applied.' },
  { phase: 'Phase 3 — Corpus audit (§12)', contribution: '127 sources audited across 11 investors with coverage, access, provenance and value scores — the source-level baseline that precedes the passage-level coverage report.' },
  { phase: 'Phase 4 — Canonical taxonomy (§13\u2013§15)', contribution: '10 themes + 9 concepts derived from the actual corpus (Risk & Crisis, Business Quality, Owner-Managers, Forensic Shorts, Contrarian Value, Long-Horizon, Lineage, Mistakes & Sell Discipline, Emerging Markets, Firm Continuity).' },
  { phase: 'Phase 5 — Cross-reference engine (§16\u2013§17)', contribution: '22 explainable edges (apprenticeship / lineage / cohort / cluster / network) with reasons — no semantic AI similarity, per the master plan\u2019s V1 rule (§18).' },
  { phase: 'Phase 10 — Decision Ledger (§27\u2013§29)', contribution: '60 decisions mapped with the Statement \u2192 Decision \u2192 Outcome chain and outcome states (KNOWN / PARTIAL / UNKNOWN) — no fabricated outcomes.' },
  { phase: '§65 — research_depth tiers', contribution: 'Tier assignment for the expansion cohort: 10 ACTIVE, 1 DEVELOPING (Tweedy, leaning ACTIVE). The 8 CORE investors of the master plan remain the primary-tier anchors.' },
]
