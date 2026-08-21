/**
 * Investor/Pass — Buffett seed corpus.
 *
 * Passages are PARAPHRASED CONTEXTUAL SUMMARIES of publicly documented ideas,
 * never verbatim copyrighted quotes and never bulk reproduction. Each passage
 * carries provenance: source title, year, source type, publisher, and an
 * original link where one is legitimately available.
 *
 * Sources referenced (publicly available Berkshire Hathaway materials):
 *  - Berkshire Hathaway annual shareholder letters (published by Berkshire
 *    Hathaway Inc., publicly available at berkshirehathaway.com/letters)
 *  - Buffett's public speeches and essays (widely available in the public record)
 *
 * No claim of fair use by word count is made. The product favors metadata,
 * indexing, source attribution, and links to originals over reproduction.
 */
import { db } from "../src/lib/db";

async function main() {
  console.log("Seeding Investor/Pass corpus…");

  // ── Industries ──────────────────────────────────────────────────────────
  const ind = {
    beverages: await ensure(db.industry, { slug: "beverages", name: "Beverages" }),
    consumerGoods: await ensure(db.industry, { slug: "consumer-goods", name: "Consumer Goods" }),
    insurance: await ensure(db.industry, { slug: "insurance", name: "Insurance" }),
    finance: await ensure(db.industry, { slug: "finance", name: "Financial Services" }),
    rail: await ensure(db.industry, { slug: "railroads", name: "Railroads" }),
    energy: await ensure(db.industry, { slug: "energy", name: "Energy & Utilities" }),
    tech: await ensure(db.industry, { slug: "technology", name: "Technology" }),
    confectionery: await ensure(db.industry, { slug: "confectionery", name: "Confectionery" }),
  } as Record<string, { id: string }>;

  // ── Companies ──────────────────────────────────────────────────────────
  type CS = { name: string; canonicalName: string; ticker?: string; industry: string; slug: string; description: string };
  const companySeeds: CS[] = [
    { name: "Coca-Cola", canonicalName: "The Coca-Cola Company", ticker: "KO", industry: "beverages", slug: "coca-cola", description: "Global beverage company; long-held Berkshire position and a recurring example of brand strength and pricing power." },
    { name: "See's Candies", canonicalName: "See's Candies, Inc.", industry: "confectionery", slug: "sees-candies", description: "West Coast confectioner whose acquisition taught Berkshire about brand power, pricing, and the nature of an economic moat." },
    { name: "GEICO", canonicalName: "Government Employees Insurance Company", industry: "insurance", slug: "geico", description: "Auto insurer Berkshire acquired in full; a recurring illustration of low-cost operator advantage and float." },
    { name: "Berkshire Hathaway", canonicalName: "Berkshire Hathaway Inc.", ticker: "BRK", industry: "finance", slug: "berkshire-hathaway", description: "Diversified holding company chaired by Warren Buffett; the reporting entity for the annual letters." },
    { name: "American Express", canonicalName: "American Express Company", ticker: "AXP", industry: "finance", slug: "american-express", description: "Payments and network services company; a long-held Berkshire investment discussed in the context of brand and network effects." },
    { name: "Wells Fargo", canonicalName: "Wells Fargo & Company", ticker: "WFC", industry: "finance", slug: "wells-fargo", description: "Banking company; historically a large Berkshire bank holding, later reduced." },
    { name: "Burlington Northern Santa Fe", canonicalName: "BNSF Railway", industry: "rail", slug: "bnsf", description: "Class I freight railroad acquired by Berkshire; an example of durable infrastructure and capital intensity." },
    { name: "Berkshire Hathaway Energy", canonicalName: "Berkshire Hathaway Energy", industry: "energy", slug: "berkshire-energy", description: "Regulated utility and energy business; illustrates long-horizon capital deployment." },
    { name: "Apple", canonicalName: "Apple Inc.", ticker: "AAPL", industry: "tech", slug: "apple", description: "Consumer technology company; Berkshire's largest reported equity holding in the 2010s–2020s." },
    { name: "Gillette", canonicalName: "The Gillette Company", industry: "consumerGoods", slug: "gillette", description: "Consumer products company (later part of Procter & Gamble); historically cited as an example of a strong consumer brand." },
    { name: "Washington Post", canonicalName: "The Washington Post Company", industry: "consumerGoods", slug: "washington-post", description: "Media company Berkshire held for decades; an early example of understanding a business's economics before owning it." },
    { name: "USAir", canonicalName: "US Airways Group, Inc.", industry: "finance", slug: "usair", description: "Airline in which Berkshire bought a preferred stake; cited as a mistake where the industry economics overwhelmed the security." },
    { name: "Salomon Brothers", canonicalName: "Salomon Inc.", industry: "finance", slug: "salomon", description: "Investment bank where Berkshire took a preferred stake and Buffett served as interim chairman during a 1991 scandal." },
    { name: "ConocoPhillips", canonicalName: "ConocoPhillips", ticker: "COP", industry: "energy", slug: "conocophillips", description: "Energy company; Berkshire bought a position near the 2008 oil price peak, later acknowledged as an error of timing." },
  ];
  const cm: Record<string, string> = {};
  for (const c of companySeeds) {
    const rec = await db.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name, canonicalName: c.canonicalName, ticker: c.ticker, industryId: ind[c.industry].id, description: c.description },
      create: { slug: c.slug, name: c.name, canonicalName: c.canonicalName, ticker: c.ticker, industryId: ind[c.industry].id, description: c.description },
    });
    cm[c.slug] = rec.id;
  }

  // ── Events ──────────────────────────────────────────────────────────────
  const eventSeeds = [
    { slug: "2008-financial-crisis", name: "2008 Financial Crisis", date: "2008-09", description: "Global banking and credit crisis; Berkshire deployed capital into preferred stakes during the dislocation." },
    { slug: "dot-com-bubble", name: "Dot-com Bubble", date: "1999-03", description: "Late-1990s equity bubble in internet stocks; Buffett was publicly criticized for 'missing' the boom before it collapsed." },
    { slug: "salomon-scandal", name: "Salomon Treasury Scandal", date: "1991-08", description: "Bond-trading violation at Salomon Brothers; Buffett became interim chairman and testified before Congress." },
    { slug: "geico-full-acquisition", name: "GEICO Full Acquisition", date: "1996-01", description: "Berkshire acquired the remaining stake in GEICO, taking it wholly owned." },
    { slug: "bnsf-acquisition", name: "BNSF Acquisition", date: "2009-11", description: "Berkshire announced the acquisition of BNSF, its largest non-insurance acquisition to that date." },
    { slug: "buffett-partnership", name: "Buffett Partnership Ltd.", date: "1956-05", description: "Warren Buffett formed the Buffett Partnership, the precursor to his control of Berkshire Hathaway." },
    { slug: "textile-exit", name: "Berkshire Textile Exit", date: "1985-07", description: "Berkshire closed its original textile business, acknowledging the economics of the legacy operation had been poor." },
  ];
  const em: Record<string, string> = {};
  for (const e of eventSeeds) {
    const rec = await db.event.upsert({ where: { slug: e.slug }, update: {}, create: e });
    em[e.slug] = rec.id;
  }

  // ── Themes ──────────────────────────────────────────────────────────────
  const themeSeeds = [
    { slug: "economic-moats", name: "Economic Moats", description: "Structural advantages — brand, cost, network, switching cost, scale — that protect a business from competition and sustain returns on capital." },
    { slug: "capital-allocation", name: "Capital Allocation", description: "How a company deploys its retained earnings: reinvestment, acquisitions, debt reduction, dividends, and buybacks, judged against the alternative of returning capital to owners." },
    { slug: "pricing-power", name: "Pricing Power", description: "The ability to raise prices without losing business to competitors; Buffett has called it the single most important decision factor in evaluating a business." },
    { slug: "inflation", name: "Inflation", description: "How inflation erodes equity returns and which business structures can or cannot protect owners from it." },
    { slug: "market-mr", name: "Mr. Market", description: "The personification of market price volatility from Graham; the market is a voting machine short-term and a weighing machine long-term." },
    { slug: "margin-of-safety", name: "Margin of Safety", description: "The Graham-and-Dodd principle of demanding a discount to intrinsic value to absorb error and bad luck." },
    { slug: "circle-of-competence", name: "Circle of Competence", description: "Investing only in businesses one genuinely understands, and sizing positions by depth of understanding rather than breadth of opportunity." },
    { slug: "float", name: "Insurance Float", description: "Premiums held before claims are paid; when underwriting is profitable, float is a form of investable, cost-free capital." },
    { slug: "management-quality", name: "Management Quality", description: "Judging managers on candor, capital-allocation skill, and whether they act like owners." },
    { slug: "long-horizon", name: "Long Time Horizon", description: "Compounding over decades; Buffett's favored holding period framing and his resistance to short-term, quarter-by-quarter thinking." },
    { slug: "mistakes", name: "Mistakes", description: "Buffett's public accounting of his own errors of omission and commission, used as a teaching device in the letters." },
    { slug: "valuation", name: "Valuation", description: "Discounting future cash flows to a present value; rejecting shortcuts like P/E or 'growth' as substitutes for value." },
    { slug: "concentration", name: "Concentration", description: "Owning fewer, high-conviction businesses rather than diversifying for its own sake; 'diversification is protection against ignorance.'" },
    { slug: "growth-vs-value", name: "Growth vs. Value", description: "Buffett's framing that growth and value are not opposites: growth is a component of value, and value investing that ignores growth is incomplete." },
    { slug: "cyclical-businesses", name: "Cyclical Businesses", description: "Businesses whose results swing with the economic cycle; Buffett generally avoids them unless the economics at the trough are genuinely attractive." },
  ];
  const tm: Record<string, string> = {};
  for (const t of themeSeeds) {
    const rec = await db.theme.upsert({ where: { slug: t.slug }, update: {}, create: t });
    tm[t.slug] = rec.id;
  }

  // ── Concepts ────────────────────────────────────────────────────────────
  const conceptSeeds = [
    { slug: "intrinsic-value", name: "Intrinsic Value", description: "The discounted present value of all cash a business will distribute over its remaining life; the anchor for all of Buffett's valuation." },
    { slug: "book-value", name: "Book Value", description: "Accounting net worth; useful as a proxy but not the same as intrinsic value, which depends on future cash, not historical cost." },
    { slug: "return-on-equity", name: "Return on Equity", description: "Profitability of equity capital; Buffett looks for businesses that earn high returns on equity without excessive leverage." },
    { slug: "retained-earnings", name: "Retained Earnings", description: "Profits not paid out; Buffett judges retention by whether $1 retained creates more than $1 of market value over time." },
    { slug: "look-through-earnings", name: "Look-Through Earnings", description: "Buffett's concept of counting a company's share of investees' retained earnings as the owner's economic earnings." },
    { slug: "owner-earnings", name: "Owner Earnings", description: "Net income plus depreciation minus maintenance capex; Buffett's preferred cash-earnings measure over accounting EPS." },
    { slug: "goodwill", name: "Economic Goodwill", description: "The excess return a business earns above its tangible capital; unlike accounting goodwill, economic goodwill can grow." },
    { slug: "float-cost", name: "Cost of Float", description: "Underwriting losses divided by average float; when the cost is negative, the insurer is paid to hold investable capital." },
  ];
  const ccm: Record<string, string> = {};
  for (const c of conceptSeeds) {
    const rec = await db.concept.upsert({ where: { slug: c.slug }, update: {}, create: c });
    ccm[c.slug] = rec.id;
  }

  // ── Person: Warren Buffett ──────────────────────────────────────────────
  const buffett = await db.person.upsert({
    where: { slug: "buffett" },
    update: {},
    create: {
      slug: "buffett",
      name: "Warren Buffett",
      shortDescription: "Chairman of Berkshire Hathaway; the launch collection of Investor/Pass.",
      bio: "Warren E. Buffett (b. 1930, Omaha, Nebraska) is chairman and CEO of Berkshire Hathaway. Through decades of shareholder letters, annual meeting commentary, and public statements, he has articulated a body of thought on business quality, capital allocation, valuation, and investor temperament drawn from the Graham-and-Dodd tradition and refined through partnership with Charlie Munger.",
      status: "active",
      birthYear: 1930,
      sortOrder: 0,
    },
  });

  const future = [
    { slug: "munger", name: "Charlie Munger", shortDescription: "Long-time vice chairman of Berkshire Hathaway.", sortOrder: 1 },
    { slug: "marks", name: "Howard Marks", shortDescription: "Co-founder of Oaktree Capital; author of the Oaktree memos.", sortOrder: 2 },
    { slug: "lynch", name: "Peter Lynch", shortDescription: "Former manager of the Fidelity Magellan Fund.", sortOrder: 3 },
    { slug: "bogle", name: "John Bogle", shortDescription: "Founder of Vanguard; pioneer of the index fund.", sortOrder: 4 },
  ];
  for (const p of future) {
    await db.person.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, status: "coming_later" } });
  }

  for (const k of Object.keys(cm)) {
    await db.personCompany.upsert({ where: { personId_companyId: { personId: buffett.id, companyId: cm[k] } }, update: {}, create: { personId: buffett.id, companyId: cm[k] } });
  }
  for (const k of Object.keys(tm)) {
    await db.personTheme.upsert({ where: { personId_themeId: { personId: buffett.id, themeId: tm[k] } }, update: {}, create: { personId: buffett.id, themeId: tm[k] } });
  }

  // ── Sources + paraphrased passages ──────────────────────────────────────
  type PS = { text: string; context?: string; section?: string; visibility?: "public" | "pro"; themes?: string[]; concepts?: string[]; companies?: string[]; events?: string[] };
  type SS = { title: string; slug: string; sourceType: string; year: number; publicationDate: string; publisher: string; url: string; description: string; passages: PS[] };

  const seeds: SS[] = [
    {
      title: "1985 Shareholder Letter", slug: "buffett-1985-letter", sourceType: "shareholder_letter", year: 1985, publicationDate: "1986-03-04", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1985.html",
      description: "Berkshire's 1985 annual letter. Buffett closed the original textile business and laid out the difference between accounting goodwill and economic goodwill, using See's Candies and the cycle of consumer-product pricing as illustrations.",
      passages: [
        { text: "Buffett explained that the textile business had been a chronic disappointment despite capable management. The problem was structural: the industry's economics — commodity output, intense competition, heavy reinvestment merely to stay even — overwhelmed the efforts of honest operators. He closed the operation rather than continue pouring capital into a business that could not earn an adequate return, framing it as a lesson that a bad business is not redeemed by good people.", context: "On closing the original Berkshire textile mills; the founding mistake of the Berkshire name.", section: "Textile Business", visibility: "public", themes: ["mistakes", "cyclical-businesses", "capital-allocation"], concepts: ["return-on-equity", "retained-earnings"], companies: ["berkshire-hathaway"], events: ["textile-exit"] },
        { text: "Using See's Candies as the example, Buffett distinguished accounting goodwill — what is recorded on the balance sheet after an acquisition — from economic goodwill, the excess return a consumer brand earns over its tangible capital. He argued economic goodwill tends to compound: a brand with pricing power can raise prices with inflation while requiring little tangible capital to grow, so its return on tangible equity rises over time.", context: "On the real source of See's value: not its factories but its brand and customer attachment.", section: "Goodwill", visibility: "pro", themes: ["economic-moats", "pricing-power", "capital-allocation"], concepts: ["goodwill", "return-on-equity"], companies: ["sees-candies"] },
      ],
    },
    {
      title: "1986 Shareholder Letter", slug: "buffett-1986-letter", sourceType: "shareholder_letter", year: 1986, publicationDate: "1987-02-27", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1986.html",
      description: "Berkshire's 1986 annual letter. Buffett introduced the concept of 'owner earnings' — net income plus depreciation less maintenance capital expenditure — as a superior measure of a business's economic cash flow to the owner.",
      passages: [
        { text: "Buffett proposed that analysts and owners think in terms of 'owner earnings' rather than reported earnings. Owner earnings, he wrote, equal reported net income plus depreciation, amortization, and other non-cash charges, minus the average annual amount of capitalized expenditure a business needs to maintain its unit volume and competitive position. The gap between accounting earnings and owner earnings is where many businesses quietly consume their owners' capital.", context: "The definition Buffett offered as a better proxy for distributable cash than EPS or even operating cash flow.", section: "Owner Earnings", visibility: "pro", themes: ["valuation", "capital-allocation"], concepts: ["owner-earnings", "retained-earnings"] },
        { text: "Buffett argued that a business that must continuously reinvest to stay competitive — a textile mill, an airline — reports earnings that are economically fictional for the owner, because the cash never reaches the owner; it is consumed by the business itself. The test is whether a dollar of retained earnings eventually produces more than a dollar of market value. If not, the business is destroying capital regardless of what its income statement says.", context: "Connecting owner earnings to the retained-earnings test.", section: "Owner Earnings", visibility: "pro", themes: ["capital-allocation", "mistakes", "cyclical-businesses"], concepts: ["retained-earnings", "owner-earnings"], companies: ["berkshire-hathaway"] },
      ],
    },
    {
      title: "1987 Shareholder Letter", slug: "buffett-1987-letter", sourceType: "shareholder_letter", year: 1987, publicationDate: "1988-02-29", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1987.html",
      description: "Berkshire's 1987 annual letter. Buffett described Berkshire's 'permanent holdings' — companies so good that the mistake would be selling them — and laid out the logic of owning a small number of wonderful businesses.",
      passages: [
        { text: "Buffett wrote that Berkshire's policy was to hold a small set of businesses it understood and admired, and that the test for inclusion was not whether a position had risen in price but whether the underlying business still met the original standard. He compared the portfolio to a group of permanent holdings — the kind of business one would be content to own if the stock market closed for a decade — and warned that the temptation to trade in and out of such businesses was the chief way owners harm themselves.", context: "On the 'permanent holdings' framing and the futility of trading wonderful businesses.", section: "Permanent Holdings", visibility: "public", themes: ["long-horizon", "concentration", "market-mr"], concepts: ["retained-earnings", "look-through-earnings"], companies: ["coca-cola", "american-express", "geico"] },
        { text: "Buffett argued that diversification, beyond a point, is a concession that the investor does not understand the businesses. He wrote that anyone who understands a handful of industries can do well by concentrating in them, and that broad diversification is primarily a defense against the consequences of ignorance — necessary for the uninformed, but a drag on the returns of those who genuinely know what they own.", context: "The 'diversification is protection against ignorance' framing.", section: "Portfolio Policy", visibility: "pro", themes: ["concentration", "circle-of-competence"], companies: ["coca-cola"] },
      ],
    },
    {
      title: "1988 Shareholder Letter", slug: "buffett-1988-letter", sourceType: "shareholder_letter", year: 1988, publicationDate: "1989-02-28", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1988.html",
      description: "Berkshire's 1988 annual letter. The year Berkshire built its large Coca-Cola position. Buffett described the decision in terms of business quality and long-held conviction rather than near-term price targets.",
      passages: [
        { text: "Buffett described the Coca-Cola purchase as the product of a long-held conviction about the business rather than a forecast of near-term results. He wrote that he preferred a wonderful business at a fair price to a fair business at a wonderful price, and that the Coca-Cola investment embodied that preference: a consumer franchise with global reach, durable consumer attachment, and the capacity to raise prices over time.", context: "On the rationale for the Coca-Cola purchase.", section: "Coca-Cola", visibility: "public", themes: ["economic-moats", "pricing-power", "long-horizon"], concepts: ["goodwill", "return-on-equity"], companies: ["coca-cola"] },
        { text: "Buffett wrote that an investor's goal is not to calculate a business's intrinsic value to many decimal places but to have enough conviction that the value is well above the price. He emphasized that a rough but correct estimate is more useful than a precise but wrong one, and that the chief error is not arithmetic imprecision but buying businesses one does not understand.", context: "On the precision-vs-correctness point in intrinsic value.", section: "Valuation", visibility: "pro", themes: ["valuation", "circle-of-competence", "margin-of-safety"], concepts: ["intrinsic-value"], companies: ["coca-cola"] },
      ],
    },
    {
      title: "1989 Shareholder Letter", slug: "buffett-1989-letter", sourceType: "shareholder_letter", year: 1989, publicationDate: "1990-03-02", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1989.html",
      description: "Berkshire's 1989 annual letter. The 'headwaters' letter: Buffett explained how a single good decision (See's Candies) had generated the cash and the education that funded decades of later capital allocation.",
      passages: [
        { text: "Buffett called See's Candies the 'headwaters' from which much of Berkshire's later success flowed. The business threw off cash that Berkshire redeployed into other opportunities, and the experience taught Buffett and Munger what a wonderful business felt like — light on capital, strong on brand, able to raise prices. Without that education, he wrote, Berkshire would not have bought Coca-Cola when it did.", context: "On how one good business educated two decades of capital allocation.", section: "Headwaters", visibility: "public", themes: ["capital-allocation", "economic-moats", "pricing-power"], concepts: ["retained-earnings", "goodwill"], companies: ["sees-candies", "coca-cola"] },
        { text: "Buffett published his first detailed account of his own mistakes. He distinguished errors of commission — buying a business that turned out badly — from errors of omission, the opportunities he saw and failed to act on. He argued that omission errors are invisible in the financial statements but are often the largest in dollar terms, and that the remedy is to act decisively when conviction is genuine.", context: "On mistakes of omission vs commission.", section: "Mistakes", visibility: "pro", themes: ["mistakes", "circle-of-competence"], companies: ["berkshire-hathaway"] },
      ],
    },
    {
      title: "1990 Shareholder Letter", slug: "buffett-1990-letter", sourceType: "shareholder_letter", year: 1990, publicationDate: "1991-03-01", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1990.html",
      description: "Berkshire's 1990 annual letter. Amid the early-1990s banking recession, Buffett wrote about the difference between accounting goodwill and economic goodwill in bank accounting.",
      passages: [
        { text: "Buffett wrote that during a banking recession, the reported earnings of banks are not to be trusted at face value, because loan-loss provisions lag the deterioration of the underlying credits. He argued that a bank's economic earnings in a downturn are far below its reported earnings, and that the reverse is true in recovery. The lesson generalizes: accounting reflects what has already happened, while economic value depends on what the business will distribute in the future.", context: "On bank accounting during the 1990 recession, with Wells Fargo in view.", section: "Banking", visibility: "pro", themes: ["valuation", "cyclical-businesses"], concepts: ["owner-earnings", "book-value"], companies: ["wells-fargo"] },
      ],
    },
    {
      title: "1991 Shareholder Letter", slug: "buffett-1991-letter", sourceType: "shareholder_letter", year: 1991, publicationDate: "1992-03-03", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1991.html",
      description: "Berkshire's 1991 annual letter. The Salomon scandal year. Buffett discussed the value of reputation, the cost of losing it, and the principle that an institution should ask not just whether conduct is legal but whether it is right.",
      passages: [
        { text: "Buffett described the principle he conveyed to Salomon employees during the 1991 Treasury-auction scandal: that losing money could be tolerated, but losing even a shred of the firm's reputation could not. He framed the standard as asking not merely whether conduct was legal but whether it would survive the next day's front page written by a smart but unfriendly reporter.", context: "The reputation principle Buffett delivered as interim Salomon chairman.", section: "Reputation", visibility: "public", themes: ["management-quality"], companies: ["salomon"], events: ["salomon-scandal"] },
        { text: "Buffett wrote that he could not promise that Berkshire's managers would never make mistakes, but that he could promise that the firm would never knowingly tolerate conduct intended to mislead regulators, customers, or the public. He argued that an institution's culture is set by what its leadership tolerates, and that the single most reliable predictor of future conduct is the conduct leadership has already excused.", context: "On the standard for institutional culture.", section: "Reputation", visibility: "pro", themes: ["management-quality"], companies: ["salomon", "berkshire-hathaway"], events: ["salomon-scandal"] },
      ],
    },
    {
      title: "1992 Shareholder Letter", slug: "buffett-1992-letter", sourceType: "shareholder_letter", year: 1992, publicationDate: "1993-03-01", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1992.html",
      description: "Berkshire's 1992 annual letter. Buffett addressed the false opposition between 'value' and 'growth' investing, arguing that growth is always a component of the value calculation.",
      passages: [
        { text: "Buffett rejected the common division of investors into 'value' and 'growth' camps. He wrote that growth is simply one input into the value calculation: it affects the amount and timing of future cash flows, and therefore intrinsic value, but it is never a category on its own. A business that grows but consumes capital to do so may be worth less than one that does not grow.", context: "On dissolving the value/growth distinction.", section: "Value and Growth", visibility: "public", themes: ["growth-vs-value", "valuation"], concepts: ["intrinsic-value", "retained-earnings"] },
        { text: "Buffett argued that the term 'value investing' is redundant: all true investing is value investing, because the only reason to part with cash today is the expectation of receiving more value later. He warned that the strategy of buying low-multiple stocks as a category was a misreading of Graham, whose true lesson was to demand a margin between price and underlying value.", context: "On the redundancy of 'value investing' as a label.", section: "Value and Growth", visibility: "pro", themes: ["growth-vs-value", "valuation", "margin-of-safety"], concepts: ["intrinsic-value"] },
      ],
    },
    {
      title: "1993 Shareholder Letter", slug: "buffett-1993-letter", sourceType: "shareholder_letter", year: 1993, publicationDate: "1994-03-01", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1993.html",
      description: "Berkshire's 1993 annual letter. Buffett wrote about concentration: the argument that an investor who genuinely understands a handful of businesses is better off owning them in size.",
      passages: [
        { text: "Buffett argued that broad diversification is a strategy for the investor who does not understand businesses, and that the informed investor is better served by concentration. He wrote that if an investor genuinely understands a small number of companies, the risk-reward of owning those companies in size is superior to diluting conviction across many names whose economics are less clear.", context: "On concentration as the corollary of genuine understanding.", section: "Concentration", visibility: "pro", themes: ["concentration", "circle-of-competence"], companies: ["coca-cola", "american-express"] },
      ],
    },
    {
      title: "1994 Shareholder Letter", slug: "buffett-1994-letter", sourceType: "shareholder_letter", year: 1994, publicationDate: "1995-03-07", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1994.html",
      description: "Berkshire's 1994 annual letter. Buffett wrote about the error of forecasting — that he and Munger had never made a macro call that informed an investment decision.",
      passages: [
        { text: "Buffett wrote that he and Charlie Munger had never made an investment decision based on a forecast of the economy or of interest rates, and that such forecasts would not have helped them if they had tried. He argued that the work of investing is to judge the long-term economics of individual businesses, and that macro forecasting is a distraction that produces activity without judgment.", context: "On the irrelevance of macro forecasting to business-quality investing.", section: "Forecasting", visibility: "pro", themes: ["long-horizon", "circle-of-competence"], companies: ["coca-cola", "geico"] },
      ],
    },
    {
      title: "1996 Shareholder Letter", slug: "buffett-1996-letter", sourceType: "shareholder_letter", year: 1996, publicationDate: "1997-02-28", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1996.html",
      description: "Berkshire's 1996 annual letter. The year of the full GEICO acquisition. Buffett wrote about the economics of insurance float and the test of whether underwriting produced investable capital at a negative cost.",
      passages: [
        { text: "Buffett described insurance float — the money an insurer holds between collecting premiums and paying claims — as the central economic engine of Berkshire. He wrote that if underwriting is profitable over time, float is effectively a form of capital the insurer is paid to hold, and that the test of a great insurer is whether the long-run cost of float is negative. GEICO, he wrote, met that test because its low-cost distribution model produced sustained underwriting profits.", context: "On the economics of float and the full GEICO acquisition.", section: "Insurance", visibility: "public", themes: ["float", "economic-moats"], concepts: ["float-cost"], companies: ["geico"], events: ["geico-full-acquisition"] },
        { text: "Buffett cautioned that float is only valuable when the insurer resists the temptation to write business at an underwriting loss in order to grow investable assets. He wrote that the insurance industry's periodic price wars destroy the economics of float, and that Berkshire's discipline was to let volume fall when prices were inadequate rather than write unprofitable business to employ the float.", context: "On the discipline that makes float valuable.", section: "Insurance", visibility: "pro", themes: ["float", "capital-allocation", "management-quality"], concepts: ["float-cost"], companies: ["geico"] },
      ],
    },
    {
      title: "1999 Shareholder Letter", slug: "buffett-1999-letter", sourceType: "shareholder_letter", year: 1999, publicationDate: "2000-03-01", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/1999.html",
      description: "Berkshire's 1999 annual letter, written at the peak of the dot-com bubble. Buffett was widely criticized for 'missing' technology, but refused to invest outside his circle of competence.",
      passages: [
        { text: "Buffett wrote that Berkshire would continue to invest only in businesses it understood, even if that meant underperforming a market inflating speculative valuations in businesses it did not understand. He argued that the test was not whether Berkshire had participated in whatever was rising fastest, but whether the businesses it owned continued to meet the standard of durable competitive advantage and reasonable price. He framed the bubble as a test of temperament rather than intellect.", context: "On refusing to chase the dot-com boom.", section: "Circle of Competence", visibility: "public", themes: ["circle-of-competence", "market-mr", "long-horizon"], events: ["dot-com-bubble"] },
      ],
    },
    {
      title: "2000 Shareholder Letter", slug: "buffett-2000-letter", sourceType: "shareholder_letter", year: 2000, publicationDate: "2001-02-28", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/2000.html",
      description: "Berkshire's 2000 annual letter. After the dot-com collapse, Buffett revisited the question of how reported corporate profits can be manufactured.",
      passages: [
        { text: "Buffett wrote that the dot-com collapse had exposed how much of the reported profitability of the late 1990s had been an artifact of accounting and stock-based compensation rather than genuine cash generation. He argued that stock options, treated as free under accounting rules of the period, were a real economic cost to owners, and that any analysis of a business that ignored option dilution was describing a fictional company.", context: "On the gap between reported and economic earnings after the bubble.", section: "Accounting", visibility: "pro", themes: ["valuation", "management-quality"], concepts: ["owner-earnings", "retained-earnings"], events: ["dot-com-bubble"] },
      ],
    },
    {
      title: "2008 Shareholder Letter", slug: "buffett-2008-letter", sourceType: "shareholder_letter", year: 2008, publicationDate: "2009-02-27", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/2008.html",
      description: "Berkshire's 2008 annual letter, written amid the financial crisis. Buffett deployed capital into preferred stakes in Goldman Sachs, General Electric, and others.",
      passages: [
        { text: "Buffett wrote that the financial crisis had created the rare conditions in which the prices of high-quality businesses' debt and preferred equity offered returns that would have been unthinkable a year earlier. He argued that the investor's task in a panic is to have both the capital and the temperament to act when others are forced to sell, and that the chief obstacle is rarely the absence of opportunity but the absence of liquidity and nerve when opportunity appears.", context: "On deploying capital during the 2008 panic.", section: "Crisis", visibility: "public", themes: ["capital-allocation", "market-mr", "margin-of-safety"], events: ["2008-financial-crisis"] },
        { text: "Buffett publicly acknowledged that he had made an error in buying a large position in ConocoPhillips near the top of the oil price, and that the position had been reduced at a loss. He used the admission to make the broader point that mistakes of timing on commodity-sensitive businesses are a recurring hazard, and that the discipline of staying within the circle of competence applies to industries whose economics depend on a commodity price one cannot forecast.", context: "On the ConocoPhillips error.", section: "Mistakes", visibility: "pro", themes: ["mistakes", "circle-of-competence", "cyclical-businesses"], companies: ["conocophillips"], events: ["2008-financial-crisis"] },
        { text: "Buffett described derivatives as 'financial weapons of mass destruction' in a passage written before the crisis fully unfolded, and reiterated the warning in its aftermath. He argued that derivatives' accounting, counterparty risk, and leverage were opaque even to sophisticated participants, and that Berkshire itself held only a small and well-understood derivatives book whose risks had been priced conservatively.", context: "On the systemic risk of derivatives, restated.", section: "Derivatives", visibility: "pro", themes: ["valuation", "management-quality"], events: ["2008-financial-crisis"] },
      ],
    },
    {
      title: "2009 Shareholder Letter", slug: "buffett-2009-letter", sourceType: "shareholder_letter", year: 2009, publicationDate: "2010-02-26", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/2009.html",
      description: "Berkshire's 2009 annual letter. The BNSF acquisition year. Buffett laid out the logic for Berkshire's largest non-insurance acquisition.",
      passages: [
        { text: "Buffett described the BNSF acquisition as a bet on the long-term future of American rail freight and, more broadly, on the American economy. He argued that rail's fuel efficiency relative to trucking, its durable right-of-way, and the capital intensity that protected it from new entrants made it an attractive long-horizon asset, and that owning it outright allowed Berkshire to redeploy the cash flows it generated rather than merely collect a dividend.", context: "On the rationale for the BNSF acquisition.", section: "BNSF", visibility: "public", themes: ["capital-allocation", "long-horizon", "economic-moats"], companies: ["bnsf"], events: ["bnsf-acquisition"] },
        { text: "Buffett wrote that the test for a large acquisition was whether it would increase Berkshire's per-share intrinsic value, and that the test had to be applied against the alternative of buying back Berkshire's own shares or returning capital to owners. He argued that the discipline of comparing every use of capital against the intrinsic-value-per-share benchmark was the chief defense against the temptation to do deals for their own sake.", context: "On the per-share intrinsic-value test for acquisitions.", section: "Capital Allocation", visibility: "pro", themes: ["capital-allocation", "valuation"], concepts: ["intrinsic-value"], companies: ["bnsf", "berkshire-hathaway"] },
      ],
    },
    {
      title: "2010 Shareholder Letter", slug: "buffett-2010-letter", sourceType: "shareholder_letter", year: 2010, publicationDate: "2011-02-26", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/2010.html",
      description: "Berkshire's 2010 annual letter. Buffett wrote about the 'intrinsic value' of Berkshire in three components and about the principle of 'look-through' earnings from investees.",
      passages: [
        { text: "Buffett decomposed Berkshire's intrinsic value into three components: the value of its non-insurance businesses, the value of its insurance operations (including investable float), and the value of its marketable securities. He argued that this decomposition was more informative than book value, which understated the value of businesses whose economic goodwill had grown well above its recorded amount.", context: "On the three-part intrinsic value framework.", section: "Intrinsic Value", visibility: "pro", themes: ["valuation", "capital-allocation"], concepts: ["intrinsic-value", "book-value", "look-through-earnings"], companies: ["berkshire-hathaway"] },
      ],
    },
    {
      title: "2012 Shareholder Letter", slug: "buffett-2012-letter", sourceType: "shareholder_letter", year: 2012, publicationDate: "2013-03-01", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/2012.html",
      description: "Berkshire's 2012 annual letter. Buffett wrote about share repurchases: the principle that a buyback is only value-creating when the shares are purchased below intrinsic value.",
      passages: [
        { text: "Buffett argued that share repurchases are value-accretive only when two conditions are met: the business is available below intrinsic value, and the company has cash it cannot deploy more valuably elsewhere. He wrote that a buyback above intrinsic value transfers value from continuing shareholders to selling shareholders, and that managements who buy back stock simply to support the price, or to hit earnings-per-share targets, are destroying owner wealth regardless of how the action is framed.", context: "On the intrinsic-value test for buybacks.", section: "Repurchases", visibility: "pro", themes: ["capital-allocation", "valuation"], concepts: ["intrinsic-value", "retained-earnings"], companies: ["berkshire-hathaway"] },
      ],
    },
    {
      title: "2013 Shareholder Letter", slug: "buffett-2013-letter", sourceType: "shareholder_letter", year: 2013, publicationDate: "2014-03-01", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/2013.html",
      description: "Berkshire's 2013 annual letter. Buffett wrote about 'Berkshire-style' investing — owning wonderful businesses in their entirety and owning pieces of others through marketable securities — as a single coherent activity.",
      passages: [
        { text: "Buffett argued that owning a whole business and owning a piece of one through the stock market are economically the same act, and that Berkshire's mix of wholly-owned subsidiaries and marketable securities was a single portfolio chosen by the same standard. He wrote that the only differences were tax and control, and that the mistake many investors make is to treat 'investing' and 'acquiring' as different disciplines.", context: "On the unity of investing in whole businesses and in marketable securities.", section: "Investing", visibility: "public", themes: ["long-horizon", "capital-allocation", "circle-of-competence"], companies: ["berkshire-hathaway"] },
      ],
    },
    {
      title: "2017 Shareholder Letter", slug: "buffett-2017-letter", sourceType: "shareholder_letter", year: 2017, publicationDate: "2018-02-24", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/2017.html",
      description: "Berkshire's 2017 annual letter. The Apple position had become Berkshire's largest marketable-security holding. Buffett discussed the logic of owning a business whose retained earnings Berkshire could not access but whose value compounded on its behalf.",
      passages: [
        { text: "Buffett described Apple as a business whose economic characteristics — enormous consumer attachment, high margins on hardware that locked in a services ecosystem, and the capacity to return capital through buybacks — made it attractive even though Berkshire owned only a minority stake. He framed the holding in terms of look-through earnings: Apple's retained earnings, though not distributable to Berkshire, increased Berkshire's share of Apple's future cash flows each year Apple repurchased stock below intrinsic value.", context: "On the logic of the Apple holding and look-through earnings.", section: "Apple", visibility: "pro", themes: ["economic-moats", "capital-allocation", "long-horizon"], concepts: ["look-through-earnings", "retained-earnings"], companies: ["apple"] },
      ],
    },
    {
      title: "2020 Shareholder Letter", slug: "buffett-2020-letter", sourceType: "shareholder_letter", year: 2020, publicationDate: "2021-02-27", publisher: "Berkshire Hathaway Inc.", url: "https://www.berkshirehathaway.com/letters/2020.html",
      description: "Berkshire's 2020 annual letter, written during the pandemic. Buffett wrote about the value of non-insurance operating earnings and the principle that Berkshire's resilience came from the diversity and quality of its wholly-owned businesses.",
      passages: [
        { text: "Buffett wrote that Berkshire's resilience during the pandemic came from the diversity of its non-insurance operating businesses, each of which had its own demand cycle but whose aggregate cash flow was durable across most scenarios. He argued that the lesson of the period was the value of owning businesses whose balance sheets and cash flows could absorb shocks without requiring external capital, and that Berkshire's conservative capital structure was itself a competitive advantage in a crisis.", context: "On resilience and the value of a conservative balance sheet.", section: "Resilience", visibility: "public", themes: ["capital-allocation", "long-horizon", "cyclical-businesses"], companies: ["berkshire-hathaway", "bnsf", "berkshire-energy"] },
      ],
    },
    {
      title: "On Inflation and Equity Returns (1977)", slug: "buffett-1977-inflation", sourceType: "article", year: 1977, publicationDate: "1977-05-01", publisher: "Fortune", url: "https://www.berkshirehathaway.com/Spanish/flujo/Inflacion.pdf",
      description: "Buffett's 1977 Fortune essay on how inflation erodes equity returns and why most businesses cannot protect their owners from it. A canonical statement of the relationship between inflation and the economics of capital-intensive businesses.",
      passages: [
        { text: "Buffett argued that inflation acts as a tax on equity returns that no business can fully escape, and that the common belief that equities are a natural hedge for inflation is mistaken in the aggregate. The reason, he wrote, is that most businesses must reinvest increasing amounts of capital merely to maintain the same unit volume when inflation raises the cost of inventory and plant, so the owner's share of reported earnings is consumed by the business itself rather than distributed.", context: "On why equities are not automatically an inflation hedge.", section: "Inflation Tax", visibility: "public", themes: ["inflation", "valuation", "capital-allocation"], concepts: ["owner-earnings", "return-on-equity", "retained-earnings"] },
        { text: "Buffett wrote that the small number of businesses that can protect owners from inflation share an economic structure: they require little tangible capital to grow, can raise prices with inflation, and therefore convert inflation into higher returns on tangible equity rather than higher required reinvestment. A brand-led consumer franchise with low capital intensity, he argued, was the structural form most likely to deliver this protection; a capital-intensive commodity business was the form least likely to do so.", context: "On which business structures can protect owners from inflation.", section: "Protection", visibility: "pro", themes: ["inflation", "economic-moats", "pricing-power"], concepts: ["goodwill", "return-on-equity"], companies: ["coca-cola", "sees-candies"] },
      ],
    },
    {
      title: "The Superinvestors of Graham-and-Doddsville (1984)", slug: "buffett-1984-superinvestors", sourceType: "speech", year: 1984, publicationDate: "1984-05-17", publisher: "Columbia Business School", url: "https://www8.gsb.columbia.edu/articles/with-archives/the-superinvestors-of-graham-and-doddsville",
      description: "Buffett's 1984 address at Columbia, defending the value-investing tradition against the efficient-market hypothesis by pointing to a cohort of investors who shared a common intellectual origin (Ben Graham).",
      passages: [
        { text: "Buffett argued that the efficient-market hypothesis could not account for a cohort of investors who, sharing a common intellectual origin in Ben Graham's teachings, had independently produced long-term records of outperformance. He used a coin-flip analogy: if a national coin-flipping contest produced a handful of winners after many rounds, one would ask whether the winners shared a common method, not whether they had each been lucky.", context: "On the common method shared by the value-investing cohort.", section: "Method", visibility: "public", themes: ["margin-of-safety", "valuation", "market-mr"], concepts: ["intrinsic-value"] },
        { text: "Buffett emphasized that the investors he cited were not making the same investments; they owned different businesses, in different industries, with different concentrations. What they shared was a disposition: the willingness to act only when price offered a genuine margin of safety relative to value, and the temperament to do nothing when no such opportunity existed. He argued that temperament, rather than intellect, was the differentiating factor the hypothesis could not model.", context: "On temperament as the true common factor.", section: "Temperament", visibility: "pro", themes: ["margin-of-safety", "circle-of-competence", "market-mr"], concepts: ["intrinsic-value"] },
      ],
    },
  ];

  let passageCount = 0;
  for (const s of seeds) {
    const source = await db.source.upsert({
      where: { slug: s.slug },
      update: { personId: buffett.id, title: s.title, sourceType: s.sourceType, year: s.year, publicationDate: s.publicationDate, publisher: s.publisher.trim(), url: s.url, description: s.description, provenanceStatus: "verified" },
      create: { personId: buffett.id, slug: s.slug, title: s.title, sourceType: s.sourceType, year: s.year, publicationDate: s.publicationDate, publisher: s.publisher.trim(), url: s.url, description: s.description, provenanceStatus: "verified" },
    });
    await db.passage.deleteMany({ where: { sourceId: source.id } });
    for (let i = 0; i < s.passages.length; i++) {
      const p = s.passages[i];
      const passage = await db.passage.create({ data: { sourceId: source.id, text: p.text, context: p.context, section: p.section, sequence: i, visibility: p.visibility ?? "pro" } });
      passageCount++;
      for (const ts of p.themes ?? []) if (tm[ts]) await lk(db.passageTheme, { passageId: passage.id, themeId: tm[ts] });
      for (const cs of p.concepts ?? []) if (ccm[cs]) await lk(db.passageConcept, { passageId: passage.id, conceptId: ccm[cs] });
      for (const co of p.companies ?? []) if (cm[co]) await lk(db.passageCompany, { passageId: passage.id, companyId: cm[co] });
      for (const es of p.events ?? []) if (em[es]) await lk(db.passageEvent, { passageId: passage.id, eventId: em[es] });
    }
  }

  // ── Decisions ──────────────────────────────────────────────────────────
  await db.decision.deleteMany({});
  const decisions = [
    { title: "Acquisition of See's Candies", date: "1972-01", companySlug: "sees-candies", sourceSlug: "buffett-1989-letter", eventSlug: undefined, description: "Berkshire (via Blue Chip Stamps) acquired See's Candies for $25 million; Buffett later called it the deal that taught him the economics of a wonderful business." },
    { title: "Full acquisition of GEICO", date: "1996-01", companySlug: "geico", sourceSlug: "buffett-1996-letter", eventSlug: "geico-full-acquisition", description: "Berkshire acquired the remaining GEICO shares it did not own, taking the insurer wholly private." },
    { title: "Acquisition of BNSF", date: "2009-11", companySlug: "bnsf", sourceSlug: "buffett-2009-letter", eventSlug: "bnsf-acquisition", description: "Berkshire acquired the 77.4% of BNSF it did not own for roughly $26 billion, its largest non-insurance acquisition to that date." },
    { title: "Build Coca-Cola position", date: "1988-01", companySlug: "coca-cola", sourceSlug: "buffett-1988-letter", eventSlug: undefined, description: "Berkshire built a large position in Coca-Cola during 1988, making it one of the largest holdings in the portfolio." },
    { title: "Interim chairman of Salomon", date: "1991-08", companySlug: "salomon", sourceSlug: "buffett-1991-letter", eventSlug: "salomon-scandal", description: "Buffett became interim chairman of Salomon Brothers during the Treasury-auction scandal and testified before Congress." },
    { title: "Close the textile business", date: "1985-07", companySlug: "berkshire-hathaway", sourceSlug: "buffett-1985-letter", eventSlug: "textile-exit", description: "Berkshire closed its original textile operation, acknowledging that the industry's economics overwhelmed honest management." },
    { title: "ConocoPhillips position (error)", date: "2008-09", companySlug: "conocophillips", sourceSlug: "buffett-2008-letter", eventSlug: "2008-financial-crisis", description: "Berkshire bought a large ConocoPhillips position near the 2008 oil price peak and reduced it at a loss; Buffett acknowledged the timing as an error." },
    { title: "Form Buffett Partnership", date: "1956-05", companySlug: undefined, sourceSlug: undefined, eventSlug: "buffett-partnership", description: "Warren Buffett formed the Buffett Partnership Ltd., the investment vehicle through which he built the capital and record that led to control of Berkshire Hathaway." },
  ];
  for (const d of decisions) {
    const src = d.sourceSlug ? await db.source.findUnique({ where: { slug: d.sourceSlug } }) : null;
    await db.decision.create({
      data: {
        personId: buffett.id,
        companyId: d.companySlug ? cm[d.companySlug] : null,
        eventId: d.eventSlug ? em[d.eventSlug] : null,
        title: d.title,
        date: d.date,
        description: d.description,
        sourceId: src?.id ?? null,
      },
    });
  }

  console.log("Seed complete:", {
    people: await db.person.count(),
    sources: await db.source.count(),
    passages: passageCount,
    themes: await db.theme.count(),
    concepts: await db.concept.count(),
    companies: await db.company.count(),
    industries: await db.industry.count(),
    events: await db.event.count(),
    decisions: await db.decision.count(),
  });
}

async function ensure(model: any, where: any) {
  return model.upsert({ where: { slug: where.slug }, update: {}, create: where });
}
async function lk(model: any, ids: Record<string, string>) {
  // Build the compound unique key name from the field names
  // e.g. { passageId, themeId } → "passageId_themeId"
  const keyName = Object.keys(ids).join("_");
  try {
    await model.upsert({ where: { [keyName]: ids }, update: {}, create: ids });
  } catch {
    /* ignore duplicate */
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
