export type TagKind = "theme" | "concept" | "company" | "event";
export type TagRule = { slug: string; name: string; patterns: RegExp[] };

const re = (...words: string[]) =>
  words.map((w) => new RegExp(`\\b${w.replace(/ /g, "\\s+")}\\b`, "i"));

export const THEME_RULES: TagRule[] = [
  { slug: "moats", name: "Economic Moats", patterns: re("moat", "moats", "economic goodwill", "durable competitive advantage", "competitive advantage") },
  { slug: "capital-allocation", name: "Capital Allocation", patterns: re("capital allocation", "allocate capital", "deploy capital", "reinvestment", "retained earnings") },
  { slug: "valuation", name: "Valuation", patterns: re("valuation", "intrinsic value", "fair value", "overvalued", "undervalued", "appraisal") },
  { slug: "margin-of-safety", name: "Margin of Safety", patterns: re("margin of safety", "price paid", "bargain price") },
  { slug: "circle-of-competence", name: "Circle of Competence", patterns: re("circle of competence", "within our competence", "understand the business", "outside our expertise") },
  { slug: "compounding", name: "Compounding", patterns: re("compound", "compounding", "compounded annually", "snowball") },
  { slug: "risk-management", name: "Risk Management", patterns: re("risk management", "downside", "permanent loss", "preservation of capital", "tail risk") },
  { slug: "inflation", name: "Inflation", patterns: re("inflation", "inflationary", "purchasing power", "rising prices erode") },
  { slug: "market-psychology", name: "Market Psychology", patterns: re("mr\\.? market", "fear and greed", "investor psychology", "market sentiment", "euphoria", "panic", "pessimism") },
  { slug: "contrarianism", name: "Contrarianism", patterns: re("be greedy when", "be fearful when", "unpopular", "against the crowd", "consensus view", "when others are") },
  { slug: "long-term-ownership", name: "Long-Term Ownership", patterns: re("forever", "indefinitely", "hold for", "long[- ]term owner", "decades") },
  { slug: "management-quality", name: "Management Quality", patterns: re("management quality", "capable manager", "honest and capable", "stewardship", "rational management", "managerial") },
  { slug: "corporate-governance", name: "Corporate Governance", patterns: re("board of directors", "governance", "fiduciary", "shareholder rights", "agency cost") },
  { slug: "diversification", name: "Diversification", patterns: re("diversification", "diworsification", "portfolio concentration", "few stocks", "eggs in one basket") },
  { slug: "index-investing", name: "Index Investing", patterns: re("index fund", "indexing", "passive investing", "market portfolio", "expense ratio", "active management underperform") },
  { slug: "credit-cycles", name: "Credit Cycles", patterns: re("credit cycle", "lending standards", "availability of credit", "easy money", "credit boom") },
  { slug: "liquidity", name: "Liquidity", patterns: re("liquidity", "cash reserves", "cash on hand", "dry powder", "liquid assets") },
  { slug: "volatility-vs-risk", name: "Volatility vs Risk", patterns: re("volatility", "beta", "fluctuat", "price movement is not risk") },
  { slug: "price-versus-value", name: "Price vs Value", patterns: re("price is what you pay", "value is what you get", "price versus value", "what a business is worth") },
  { slug: "patience", name: "Patience", patterns: re("patience", "wait for", "sit on your hands", "baseball analogy", "fat pitch", "no action is") },
  { slug: "mistakes-and-learning", name: "Mistakes & Learning", patterns: re("mistake", "error", "wrong", "lessons from", "i was wrong", "our worst") },
  { slug: "insurance-economics", name: "Insurance Economics", patterns: re("float", "underwriting", "combined ratio", "insurance operation", "reinsurance") },
  { slug: "second-level-thinking", name: "Second-Level Thinking", patterns: re("second[- ]level thinking", "first[- ]level thinking", "what is it priced in", "everyone knows") },
  { slug: "opportunity-cost", name: "Opportunity Cost", patterns: re("opportunity cost", "next best alternative", "relative attractiveness") },
  { slug: "cash-reserves", name: "Cash Reserves", patterns: re("cash position", "holding cash", "treasury bills", "defensive cash") },
  { slug: "bubbles-and-crashes", name: "Bubbles & Crashes", patterns: re("bubble", "speculative mania", "crash", "irrational exuberance", "tulip", "dot[- ]com") },
  { slug: "shareholder-orientation", name: "Shareholder Orientation", patterns: re("shareholder letter", "treat shareholders", "owner orientation", "partner", "minority interest") },
  { slug: "position-sizing", name: "Position Sizing", patterns: re("position size", "how much to buy", "bet sizing", "conviction weight") },
  { slug: "debt-discipline", name: "Debt Discipline", patterns: re("leverage", "debt burden", "borrowed money", "highly indebted", "margin debt") },
  { slug: "quality-businesses", name: "Quality Businesses", patterns: re("wonderful business", "great business", "high return on", "pricing power", "franchise business", "consumer monopoly") },
  { slug: "turnarounds", name: "Turnarounds", patterns: re("turnaround", "turn around", "recovery situation", "cyclically depressed") },
  { slug: "earnings-growth", name: "Earnings Growth", patterns: re("earnings growth", "growth rate", "earnings trajectory", "growing earnings") },
  { slug: "dividends-policy", name: "Dividend Policy", patterns: re("dividend policy", "pay dividends", "payout ratio", "distribution") },
];

export const CONCEPT_RULES: TagRule[] = [
  { slug: "mr-market", name: "Mr. Market", patterns: re("mr\\.? market") },
  { slug: "owner-earnings", name: "Owner Earnings", patterns: re("owner earnings", "owner-related", "shareholders earnings") },
  { slug: "look-through-earnings", name: "Look-Through Earnings", patterns: re("look[- ]through earnings") },
  { slug: "float", name: "Float", patterns: re("\\bfloat\\b") },
  { slug: "dollar-cost-averaging", name: "Dollar-Cost Averaging", patterns: re("dollar[- ]cost averaging", "regular intervals", "fixed sum") },
  { slug: "mean-reversion", name: "Mean Reversion", patterns: re("mean rever", "revert to", "regression to the mean") },
  { slug: "asymmetric-payoffs", name: "Asymmetric Payoffs", patterns: re("asymmetric", "limited downside.*unlimited", "heads i win") },
  { slug: "network-effects", name: "Network Effects", patterns: re("network effect", "more users.*more valuable", "critical mass") },
  { slug: "switching-costs", name: "Switching Costs", patterns: re("switching cost", "costly to switch", "locked in") },
  { slug: "brand-equity", name: "Brand Equity", patterns: re("brand", "trademark", "brand loyalty", "mind share") },
  { slug: "cost-advantage", name: "Cost Advantage", patterns: re("low[- ]cost (producer|operator|provider)", "cost advantage", "lowest costs") },
  { slug: "survivorship", name: "Survivorship", patterns: re("survive", "survival", "stay in the game", "avoid ruin") },
  { slug: "cyclical-recovery", name: "Cyclical Recovery", patterns: re("cyclical recovery", "cycle turns", "pendulum swings") },
  { slug: "time-horizon", name: "Time Horizon", patterns: re("time horizon", "long horizon", "years not months", "decades ahead") },
];

export const EVENT_RULES: TagRule[] = [
  { slug: "great-financial-crisis", name: "Great Financial Crisis", patterns: re("financial crisis", "lehman", "2008", "subprime", "mortgage crisis") },
  { slug: "dot-com-crash", name: "Dot-Com Crash", patterns: re("dot[- ]com", "internet bubble", "technology bubble", "new economy") },
  { slug: "black-monday-1987", name: "Black Monday 1987", patterns: re("october 1987", "black monday", "1987 crash") },
  { slug: "covid-crash", name: "COVID Crash", patterns: re("covid", "pandemic", "2020 crash", "coronavirus") },
  { slug: "oil-shock-1973", name: "Oil Shock 1973", patterns: re("1973", "oil embargo", "oil shock", "opec") },
  { slug: "nifty-fifty-era", name: "Nifty Fifty Era", patterns: re("nifty fifty", "one[- ]decision stocks") },
  { slug: "salomon-scandal", name: "Salomon Scandal", patterns: re("salomon", "treasury auction scandal", "1991 scandal") },
  { slug: "ltcm-1998", name: "LTCM 1998", patterns: re("long[- ]term capital", "ltcm") },
  { slug: "2022-rate-shock", name: "2022 Rate Shock", patterns: re("rate hikes", "rising rates 2022", "tightening cycle") },
  { slug: "japan-bubble", name: "Japan Bubble", patterns: [new RegExp("\\bjapan\\b.{0,40}\\bbubble\\b", "i"), new RegExp("\\bbubble\\b.{0,40}\\bjapan\\b", "i")] },
  { slug: "savings-loan-crisis", name: "Savings & Loan Crisis", patterns: re("savings and loan", "\\bs&l\\b") },
];

const C = (
  slug: string,
  name: string,
  ...patterns: string[]
): TagRule => ({ slug, name, patterns: re(...patterns) });

export const COMPANY_RULES: TagRule[] = [
  C("coca-cola", "Coca-Cola", "coca[- ]cola", "\\bko\\b"),
  C("sees-candies", "See's Candies", "see'?s candies", "see'?s"),
  C("geico", "GEICO", "geico"),
  C("berkshire-hathaway", "Berkshire Hathaway", "berkshire hathaway", "berkshire"),
  C("american-express", "American Express", "american express", "\\baxp\\b", "amex"),
  C("wells-fargo", "Wells Fargo", "wells fargo"),
  C("bnsf", "BNSF Railway", "burlington northern", "\\bbnsf\\b"),
  C("berkshire-energy", "Berkshire Hathaway Energy", "midamerican", "berkshire hathaway energy"),
  C("apple", "Apple", "\\bapple inc\\b", "apple's"),
  C("gillette", "Gillette", "gillette"),
  C("washington-post", "Washington Post", "washington post"),
  C("usair", "USAir", "usair", "us airways"),
  C("salomon", "Salomon Brothers", "salomon"),
  C("conocophillips", "ConocoPhillips", "conocophillips", "conoco"),
  C("ibm", "IBM", "\\bibm\\b"),
  C("kraft-heinz", "Kraft Heinz", "kraft heinz", "\\bkraft\\b", "heinz"),
  C("petrochina", "PetroChina", "petrochina"),
  C("byd", "BYD", "\\bbyd\\b"),
  C("moodys", "Moody's", "moody'?s"),
  C("goldman-sachs", "Goldman Sachs", "goldman sachs"),
  C("general-electric", "General Electric", "general electric", "\\bge\\b(?!cko)"),
  C("freddie-mac", "Freddie Mac", "freddie mac"),
  C("johnson-johnson", "Johnson & Johnson", "johnson & johnson"),
  C("procter-gamble", "Procter & Gamble", "procter & gamble"),
  C("vanguard", "Vanguard", "vanguard"),
  C("fidelity-magellan", "Fidelity Magellan", "magellan fund", "fidelity"),
  C("dunkin", "Dunkin'", "dunkin"),
  C("pepsi", "PepsiCo", "pepsi"),
  C("volvo", "Volvo", "volvo"),
  C("fannie-mae", "Fannie Mae", "fannie mae"),
  C("northern-pipeline", "Northern Pipeline", "northern pipeline"),
  C("graham-newman", "Graham-Newman", "graham[- ]newman"),
  C("oaktree", "Oaktree Capital", "oaktree"),
  C("toyota", "Toyota", "toyota"),
  C("gen-re", "General Re", "general re(?!\\w)", "\\bgenco\\b"),
  C("netjets", "NetJets", "netjets"),
  C("helzberg", "Helzberg Diamonds", "helzberg"),
  C("nebraska-furniture-mart", "Nebraska Furniture Mart", "nebraska furniture mart", "\\bnfm\\b"),
  C("jordans-furniture", "Jordan's Furniture", "jordan'?s furniture"),
  C("flight-safety", "FlightSafety International", "flightsafety"),
];

export type TagResult = {
  themes: string[];
  concepts: string[];
  companies: string[];
  events: string[];
};

export function tagPassage(text: string): TagResult {
  const result: TagResult = { themes: [], concepts: [], companies: [], events: [] };
  const match = (rules: TagRule[], key: keyof TagResult) => {
    for (const rule of rules) {
      if (rule.patterns.some((p) => p.test(text))) {
        if (!result[key].includes(rule.slug)) result[key].push(rule.slug);
      }
    }
  };
  match(THEME_RULES, "themes");
  match(CONCEPT_RULES, "concepts");
  match(COMPANY_RULES, "companies");
  match(EVENT_RULES, "events");
  return result;
}
