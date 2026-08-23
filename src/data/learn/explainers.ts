/**
 * Finance Explainers — the LEARN layer (Master Plan Phase 6).
 *
 * Static, typed, editorially-reviewed content — same pattern as
 * src/data/trails/trails.json. No DB table needed (deliberate: the layer
 * ships without a migration; moving to CMS later is a content-port, not a
 * schema change).
 *
 * CONTENT RULES (docs/EVIDENCE_AND_RIGHTS_POLICY.md):
 * - Educational explanations of how finance works — standard, checkable
 *   domain knowledge. NO invented investor quotes, beliefs, decisions or
 *   outcomes. Where an investor appears, it is via the canonical graph
 *   links (their real indexed pages), not claims about what they "think".
 * - Every graph link is a REAL canonical slug validated against the
 *   production corpus (themes, investors, companies, events, trails).
 * - Small, high-quality set by design — no thin programmatic articles.
 */

export type ExplainerSection = { heading: string; body: string[] };

export type FinanceExplainer = {
  slug: string;
  title: string;
  summary: string;
  category: "INVESTING" | "MARKETS" | "HEDGE FUNDS" | "QUANTS" | "FINANCE SYSTEMS" | "CAREERS";
  difficulty: "BEGINNER" | "INTERMEDIATE";
  updatedAt: string;
  /** What this is → why it matters → how it works → example → misunderstandings → key concepts */
  sections: ExplainerSection[];
  /** Real canonical slugs — the LEARN → STUDY bridge. */
  related: {
    themes: { slug: string; name: string }[];
    investors: { slug: string; name: string }[];
    companies?: { slug: string; name: string }[];
    events?: { slug: string; name: string }[];
    trail?: { slug: string; title: string };
  };
  furtherReading: { label: string; href: string; note: string }[];
};

export const EXPLAINERS: FinanceExplainer[] = [
  {
    slug: "how-hedge-funds-work",
    title: "How hedge funds work",
    summary:
      "What a hedge fund actually is, how the fee structure works, and how the main strategies — long/short, activism, macro, quant — fit the indexed investors in this library.",
    category: "HEDGE FUNDS",
    difficulty: "BEGINNER",
    updatedAt: "2026-02-10",
    sections: [
      {
        heading: "What this is",
        body: [
          "A hedge fund is a privately offered investment vehicle that pools capital from accredited investors and institutions and can pursue a much wider range of strategies than a traditional mutual fund. The classic mental model is long/short equity: buy securities you expect to rise and short securities you expect to fall, so the fund is not simply a leveraged bet on the market going up.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "Hedge funds sit at the center of modern markets: they are among the most active short sellers, they run activist campaigns that reshape company boards, and their letters and transcripts are some of the richest public records in this library. You cannot read the records of David Einhorn, Bill Ackman, or George Soros without understanding the vehicle they operate.",
        ],
      },
      {
        heading: "How it works",
        body: [
          "Structure: a management company runs the fund; investors commit capital under a partnership agreement. Because the fund is privately offered, it faces fewer disclosure rules than a mutual fund — but also cannot market to the general public.",
          "Fees: the industry standard became “2 and 20” — a 2% annual management fee on assets plus 20% of profits above a benchmark. The math is why fund size matters: a $10B fund earns $200M a year in management fees alone, even with mediocre performance.",
          "Strategies: equity long/short (the core model), activist investing (buying stakes and pushing for change), global macro (betting on currencies, rates and economies — the Soros and Druckenmiller lineage), and quantitative/statistical arbitrage (the Renaissance model).",
          "Constraints: lock-ups on investor capital, borrowing for leverage, and concentration limits set by the fund's own documents rather than by regulation.",
        ],
      },
      {
        heading: "Example",
        body: [
          "The most documented hedge-fund trade in this library's era is the 2007–2008 subprime short: funds including Michael Burry's Scion Capital bought credit default swaps on mortgage bonds — a short position on housing credit — paying an ongoing premium like an insurance cost until the bonds collapsed. The indexed record of that trade, in Burry's own letters, is in this library.",
        ],
      },
      {
        heading: "Common misunderstandings",
        body: [
          "“Hedge funds are hedged.” Rarely entirely. Many run net-long exposure; some blow up precisely because they were levered in one direction.",
          "“They beat the market.” After fees, the industry aggregate has trailed a simple index over long periods — a case John Bogle spent a career documenting in his indexed speeches and letters.",
          "“It's only for rich people.” Mostly true: minimums and accredited-investor rules keep it institutional and high-net-worth — which is exactly why the letters and interviews in this library matter. They are the public window into a private world.",
        ],
      },
      {
        heading: "Key concepts",
        body: [
          "Long/short · short selling · leverage · management and performance fees · accredited investors · lock-ups · net exposure · activism · global macro.",
        ],
      },
    ],
    related: {
      themes: [
        { slug: "risk-management", name: "Risk Management" },
        { slug: "credit-cycles", name: "Credit Cycles" },
        { slug: "market-psychology", name: "Market Psychology" },
      ],
      investors: [
        { slug: "michael-burry", name: "Michael Burry" },
        { slug: "david-einhorn", name: "David Einhorn" },
        { slug: "ackman", name: "Bill Ackman" },
        { slug: "soros", name: "George Soros" },
        { slug: "druckenmiller", name: "Stanley Druckenmiller" },
        { slug: "marks", name: "Howard Marks" },
      ],
      companies: [{ slug: "goldman-sachs", name: "Goldman Sachs" }],
      events: [
        { slug: "great-financial-crisis", name: "Great Financial Crisis" },
        { slug: "dot-com-crash", name: "Dot-Com Crash" },
      ],
      trail: { slug: "2008-through-five-investors", title: "2008 Through Five Investors" },
    },
    furtherReading: [
      { label: "How short selling works", href: "/learn/how-short-selling-works", note: "The mechanics under the short side of long/short" },
      { label: "2008 Through Five Investors", href: "/trails/2008-through-five-investors", note: "The crisis across five indexed records" },
      { label: "Howard Marks on Risk Management", href: "/investors/marks/topics/risk-management", note: "105 indexed research units" },
    ],
  },
  {
    slug: "how-short-selling-works",
    title: "How short selling works",
    summary:
      "The actual mechanics of shorting — borrowing, selling, repaying — where the risk really lies, and why the best-documented shorts in this library (Lehman, Allied Capital) were forensic.",
    category: "INVESTING",
    difficulty: "BEGINNER",
    updatedAt: "2026-02-10",
    sections: [
      {
        heading: "What this is",
        body: [
          "Short selling is selling a security you do not own, in the expectation of buying it back later at a lower price. You borrow the shares from a holder (via your broker), sell them into the market, and later repurchase them to return to the lender. Profit is the difference — minus borrow costs and any dividends you must pay the lender while the position is open.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "Shorts are the market's fraud detectors and its discipline on overpriced assets. The two most famous forensic short campaigns documented in this library — David Einhorn's Allied Capital thesis and his public Lehman Brothers analysis — show how a short is really a research product: the position is the output of evidence, not a mood.",
        ],
      },
      {
        heading: "How it works",
        body: [
          "Mechanics: locate shares to borrow → sell → post margin → repurchase (“cover”) → return shares. If the price rises, losses are theoretically unlimited — there is no ceiling on a stock price, and that asymmetry defines shorting.",
          "Costs: borrow fees (which can spike on crowded shorts), dividends owed to the lender, and margin interest.",
          "Squeezes: when many shorts must cover at once, forced buying drives the price up further — the dynamic behind the 2021 GameStop episode, which is also part of this library's indexed record of Michael Burry.",
          "Forensic shorts: durable campaigns are built on accounting analysis — revenue recognition, capitalizing expenses, channel stuffing — documented point by point. That is why the best short theses read like research reports.",
        ],
      },
      {
        heading: "Example",
        body: [
          "Einhorn's Lehman thesis (2007–2008): a public, point-by-point argument that the bank's accounting for its real-estate exposures understated losses. Agree with every number or not, the structure is the lesson: claim → accounting evidence → observable outcome.",
        ],
      },
      {
        heading: "Common misunderstandings",
        body: [
          "“Short sellers crash companies.” Shorts cannot sell what other investors refuse to buy; they profit from detecting overvaluation or fraud that already exists.",
          "“It's gambling.” It is a regulated, collateralized position — and the incentive structure behind much fraud detection.",
          "“Unlimited downside” is often repeated but worth internalizing: a long can only go to zero; a short has no natural floor, which is why position sizing on shorts is a survival skill.",
        ],
      },
      {
        heading: "Key concepts",
        body: [
          "Borrow · locate · cover · squeeze · borrow fee · margin · forensic accounting · asymmetric payoff.",
        ],
      },
    ],
    related: {
      themes: [
        { slug: "risk-management", name: "Risk Management" },
        { slug: "margin-of-safety", name: "Margin of Safety" },
        { slug: "corporate-governance", name: "Corporate Governance" },
      ],
      investors: [
        { slug: "david-einhorn", name: "David Einhorn" },
        { slug: "michael-burry", name: "Michael Burry" },
        { slug: "ackman", name: "Bill Ackman" },
      ],
      events: [{ slug: "great-financial-crisis", name: "Great Financial Crisis" }],
      trail: { slug: "margin-of-safety-graham-to-klarman", title: "Margin of Safety: Graham to Klarman" },
    },
    furtherReading: [
      { label: "How hedge funds work", href: "/learn/how-hedge-funds-work", note: "The vehicle most shorts run inside" },
      { label: "David Einhorn's indexed record", href: "/investors/david-einhorn", note: "Sources and documented decisions" },
    ],
  },
  {
    slug: "what-is-quantitative-investing",
    title: "What is quantitative investing?",
    summary:
      "How quant funds turn hypotheses into testable rules — signal, backtest, execution — why the Renaissance model differs from discretionary investing, and where Jim Simons fits in this library.",
    category: "QUANTS",
    difficulty: "INTERMEDIATE",
    updatedAt: "2026-02-10",
    sections: [
      {
        heading: "What this is",
        body: [
          "Quantitative investing replaces human security selection with statistical models: rules that map observable data to portfolio weights, tested against history before a dollar is deployed. The fund does not “have views” on companies in the discretionary sense — it has signals, estimated edges, and risk limits.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "Quant and systematic funds account for a large share of daily market volume, and they represent a genuinely different intellectual tradition from the value investors who dominate this library. Seeing both in one place is the point: Munger's mental models and Simons' statistical edges are different answers to the same question — where does repeatable performance come from?",
        ],
      },
      {
        heading: "How it works",
        body: [
          "Signal: a hypothesis expressible in data — momentum, mean reversion, value factors, carry. It must be measurable across thousands of securities.",
          "Backtest: apply the rule to history, simulate costs, estimate the edge. The graveyard of quant investing is overfitting — rules tuned so tightly to the past that they encode noise. Discipline means out-of-sample testing and skepticism of your own results.",
          "Portfolio construction: combine signals under a risk model — position limits, sector neutrality, factor-exposure budgets — so no single bet dominates.",
          "Execution: trade large baskets cheaply; at scale, execution quality alone can be a meaningful share of returns.",
          "People: researchers (often PhD scientists), not analysts visiting companies. Jim Simons' insight at Renaissance was to hire mathematicians and let small statistical regularities compound at scale.",
        ],
      },
      {
        heading: "Example",
        body: [
          "Momentum is the canonical teaching example: securities that outperformed over 3–12 months tend to keep outperforming slightly, on average, for a short horizon. It is a testable rule, documented across markets and long histories, and it can be sized across thousands of names — three properties that make it a model input rather than a stock pick.",
        ],
      },
      {
        heading: "Common misunderstandings",
        body: [
          "“It's just algorithms buying random things.” The models encode hypotheses; the difference is that the hypothesis must survive statistics, not storytelling.",
          "“Quants don't take risk.” They take different, carefully budgeted risks — and leverage makes small edges meaningful, which is also how small errors become large ones.",
          "“Backtest = proof.” A backtest is a hypothesis test with look-ahead and survivorship traps at every step; treating it as proof is the classic quant failure mode.",
        ],
      },
      {
        heading: "Key concepts",
        body: [
          "Signal · backtest · overfitting · out-of-sample · factor exposure · risk model · transaction costs · statistical arbitrage.",
        ],
      },
    ],
    related: {
      themes: [
        { slug: "diversification", name: "Diversification" },
        { slug: "volatility-vs-risk", name: "Volatility vs. Risk" },
        { slug: "market-psychology", name: "Market Psychology" },
      ],
      investors: [
        { slug: "simons", name: "Jim Simons" },
        { slug: "bogle", name: "John Bogle" },
        { slug: "buffett", name: "Warren Buffett" },
      ],
      trail: { slug: "2008-through-five-investors", title: "2008 Through Five Investors" },
    },
    furtherReading: [
      { label: "Jim Simons' indexed record", href: "/investors/simons", note: "Sources and research units in this library" },
      { label: "John Bogle on index investing", href: "/investors/bogle", note: "The low-cost counter-tradition" },
    ],
  },
];

export const explainerBySlug = (slug: string) => EXPLAINERS.find((e) => e.slug === slug);

export const LEARN_CATEGORIES = ["INVESTING", "MARKETS", "HEDGE FUNDS", "QUANTS", "FINANCE SYSTEMS", "CAREERS"] as const;
