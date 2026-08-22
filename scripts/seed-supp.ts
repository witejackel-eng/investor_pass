/**
 * Investor/Pass — Supplementary seed: add more passages to sources that
 * currently have only 1, making the Pro library richer and the year grid
 * more populated. All paraphrased contextual summaries with provenance.
 */
import { db } from "../src/lib/db";

async function main() {
  console.log("Adding supplementary passages…");

  type Supp = {
    sourceSlug: string;
    passages: {
      text: string;
      context?: string;
      section?: string;
      visibility?: "public" | "pro";
      themes?: string[];
      concepts?: string[];
      companies?: string[];
      events?: string[];
    }[];
  };

  const supps: Supp[] = [
    {
      sourceSlug: "buffett-1990-letter",
      passages: [
        {
          text: "Buffett wrote that the test of whether a business deserves to be held is whether its intrinsic value is growing over time, not whether its market price is rising in a given quarter. He argued that market-price movements reflect sentiment and liquidity, while intrinsic-value movements reflect the economics of the business, and that the two diverge for long stretches before reconciling. The owner's task is to monitor the business, not the ticker.",
          context: "On intrinsic value vs market price.",
          section: "Intrinsic Value",
          visibility: "pro",
          themes: ["valuation", "market-mr", "long-horizon"],
          concepts: ["intrinsic-value", "book-value"],
          companies: ["berkshire-hathaway", "coca-cola"],
        },
        {
          text: "Buffett discussed the structural advantages of Berkshire's wholly-owned insurance businesses, arguing that the combination of disciplined underwriting, permanent capital, and a tolerance for declining volume during soft markets produced a cost of float that was reliably negative. He wrote that most insurers could not match this because their capital structures forced them to write business at inadequate prices to maintain premium volume, and that this structural difference was more important than any individual underwriting decision.",
          context: "On the structural advantage of Berkshire's insurance model.",
          section: "Insurance",
          visibility: "pro",
          themes: ["float", "capital-allocation", "economic-moats"],
          concepts: ["float-cost"],
          companies: ["geico"],
        },
      ],
    },
    {
      sourceSlug: "buffett-1993-letter",
      passages: [
        {
          text: "Buffett argued that the conventional academic view of risk as price volatility was a fundamental error, and that the true risk an owner faces is the probability of permanent loss of capital over the holding period. He wrote that volatility is useful to the trader and irrelevant to the owner, and that defining risk as volatility leads investors to avoid businesses whose prices fluctuate for reasons unrelated to their underlying economics — the very businesses most likely to compound value over decades.",
          context: "On redefining risk as permanent loss, not volatility.",
          section: "Risk",
          visibility: "pro",
          themes: ["valuation", "market-mr", "long-horizon"],
          concepts: ["intrinsic-value"],
          companies: ["coca-cola"],
        },
      ],
    },
    {
      sourceSlug: "buffett-1994-letter",
      passages: [
        {
          text: "Buffett wrote that Berkshire's recent acquisitions of wholly-owned businesses had taught him that the quality of management was the single hardest variable to assess in advance and the most important one in retrospect. He argued that Berkshire's policy of leaving acquired managers in place — without imposing budgets, reporting cycles, or strategic plans from headquarters — was both a competitive advantage in winning deals and a test of whether the original assessment of management quality had been correct.",
          context: "On the decentralization principle and management trust.",
          section: "Management",
          visibility: "pro",
          themes: ["management-quality", "capital-allocation"],
          companies: ["berkshire-hathaway"],
        },
      ],
    },
    {
      sourceSlug: "buffett-1999-letter",
      passages: [
        {
          text: "Buffett addressed the criticism that Berkshire had 'missed' the technology boom by arguing that the businesses he understood — consumer franchises, insurance, regulated utilities — had economics he could evaluate with sufficient confidence to commit capital permanently. Technology businesses whose competitive landscapes changed every few quarters, he wrote, were outside his circle of competence regardless of their growth rates, and committing capital to businesses one does not understand is not investing but speculation.",
          context: "On the circle of competence and the refusal to chase technology.",
          section: "Circle of Competence",
          visibility: "pro",
          themes: ["circle-of-competence", "long-horizon"],
          events: ["dot-com-bubble"],
        },
      ],
    },
    {
      sourceSlug: "buffett-2000-letter",
      passages: [
        {
          text: "Buffett wrote that Berkshire's acquisitions of non-insurance operating businesses had shifted the company's center of gravity from a portfolio of marketable securities to a collection of wholly-owned operating companies, and that this shift was permanent. He argued that owning whole businesses allowed Berkshire to redeploy their cash flows without tax drag, and that the acquisition of good businesses at fair prices was the most reliable long-term use of Berkshire's capital.",
          context: "On the shift from securities to wholly-owned businesses.",
          section: "Capital Allocation",
          visibility: "pro",
          themes: ["capital-allocation", "long-horizon"],
          concepts: ["retained-earnings"],
          companies: ["berkshire-hathaway"],
        },
      ],
    },
    {
      sourceSlug: "buffett-2010-letter",
      passages: [
        {
          text: "Buffett described the principle of 'normal earnings' — the earnings a business should produce in a typical year, abstracted from cyclical peaks and troughs — as the anchor for valuation. He argued that a business whose earnings swing widely should be valued on normalized earnings, not on the current year's figure, and that the common practice of extrapolating recent earnings forward was a source of systematic valuation error.",
          context: "On normalized earnings and cyclical valuation.",
          section: "Valuation",
          visibility: "pro",
          themes: ["valuation", "cyclical-businesses"],
          concepts: ["owner-earnings", "intrinsic-value"],
        },
        {
          text: "Buffett wrote that the role of a CEO in capital allocation was to act as a owner would, not as a hired manager would, and that the difference showed up most clearly in the decision of whether to return cash to shareholders when no attractive reinvestment opportunity existed. He argued that the CEO who retains earnings for empire-building rather than returning them is destroying owner wealth, and that the CEO who buys back stock above intrinsic value is transferring wealth from continuing to selling owners.",
          context: "On the CEO as capital allocator.",
          section: "Capital Allocation",
          visibility: "pro",
          themes: ["capital-allocation", "management-quality"],
          concepts: ["retained-earnings", "intrinsic-value"],
          companies: ["berkshire-hathaway"],
        },
      ],
    },
    {
      sourceSlug: "buffett-2012-letter",
      passages: [
        {
          text: "Buffett wrote that the newspaper industry — once the textbook example of an economic moat, with local monopoly, recurring subscription revenue, and advertiser lock-in — had seen its moat eroded not by a competitor but by a change in the underlying technology of distribution. He argued that the lesson generalizes: a moat built on a technology that can be disrupted is not a permanent moat, regardless of how durable it has appeared, and that the investor's task is to distinguish businesses whose advantages are structural from those whose advantages are merely technological.",
          context: "On the erosion of the newspaper moat and the technology-vs-structure distinction.",
          section: "Moats",
          visibility: "pro",
          themes: ["economic-moats", "cyclical-businesses"],
          companies: ["washington-post"],
        },
      ],
    },
    {
      sourceSlug: "buffett-2013-letter",
      passages: [
        {
          text: "Buffett described the 'Berkshire-style' acquisition as one where the seller cares about who buys the business, not just the price, and where the buyer commits to holding the business permanently and leaving its management in place. He argued that this style — rare in a market dominated by financial buyers and flip-and-sell private equity — gave Berkshire an enduring edge in acquiring privately-held businesses whose founders cared about the legacy of what they had built.",
          context: "On the Berkshire-style acquisition as a competitive advantage.",
          section: "Acquisitions",
          visibility: "pro",
          themes: ["capital-allocation", "management-quality", "long-horizon"],
          companies: ["berkshire-hathaway"],
        },
      ],
    },
    {
      sourceSlug: "buffett-2017-letter",
      passages: [
        {
          text: "Buffett argued that the American economy's resilience — its capacity to absorb shocks, reinvent itself, and compound living standards across generations — was the single most important fact underlying Berkshire's long-term success. He wrote that betting against America had been a mistake consistently since the country's founding, and that the businesses Berkshire owned were beneficiaries of this underlying growth regardless of the specific industries in which they operated.",
          context: "On American economic resilience as the bedrock of Berkshire's thesis.",
          section: "The American Tailwind",
          visibility: "pro",
          themes: ["long-horizon", "capital-allocation"],
          companies: ["berkshire-hathaway", "bnsf", "berkshire-energy"],
        },
      ],
    },
    {
      sourceSlug: "buffett-2020-letter",
      passages: [
        {
          text: "Buffett acknowledged publicly that Berkshire had been too slow to deploy capital during the early weeks of the pandemic, and that the opportunity to buy good businesses at distressed prices had been briefer than anticipated. He used the admission to make the point that the window for aggressive deployment in a crisis is often short — measured in weeks, not months — and that the investor who waits for clarity waits past the point of opportunity.",
          context: "On being too slow to deploy during the pandemic crash.",
          section: "Mistakes",
          visibility: "pro",
          themes: ["mistakes", "capital-allocation", "market-mr"],
          companies: ["berkshire-hathaway"],
        },
      ],
    },
  ];

  let added = 0;
  for (const s of supps) {
    const source = await db.source.findUnique({ where: { slug: s.sourceSlug } });
    if (!source) { console.log(`  SKIP ${s.sourceSlug} (not found)`); continue; }
    // Get current max sequence
    const existing = await db.passage.findMany({ where: { sourceId: source.id }, orderBy: { sequence: "desc" }, take: 1 });
    let seq = (existing[0]?.sequence ?? -1) + 1;

    for (const p of s.passages) {
      // Check for duplicate text
      const dup = await db.passage.findFirst({ where: { sourceId: source.id, text: p.text.slice(0, 80) } });
      if (dup) { continue; }

      const passage = await db.passage.create({
        data: {
          sourceId: source.id,
          text: p.text,
          context: p.context,
          section: p.section,
          sequence: seq++,
          visibility: p.visibility ?? "pro",
        },
      });
      added++;

      // Link themes
      for (const ts of p.themes ?? []) {
        const t = await db.theme.findUnique({ where: { slug: ts } });
        if (t) await db.passageTheme.upsert({
          where: { passageId_themeId: { passageId: passage.id, themeId: t.id } },
          update: {},
          create: { passageId: passage.id, themeId: t.id },
        });
      }
      // Link concepts
      for (const cs of p.concepts ?? []) {
        const c = await db.concept.findUnique({ where: { slug: cs } });
        if (c) await db.passageConcept.upsert({
          where: { passageId_conceptId: { passageId: passage.id, conceptId: c.id } },
          update: {},
          create: { passageId: passage.id, conceptId: c.id },
        });
      }
      // Link companies
      for (const co of p.companies ?? []) {
        const c = await db.company.findUnique({ where: { slug: co } });
        if (c) await db.passageCompany.upsert({
          where: { passageId_companyId: { passageId: passage.id, companyId: c.id } },
          update: {},
          create: { passageId: passage.id, companyId: c.id },
        });
      }
      // Link events
      for (const es of p.events ?? []) {
        const e = await db.event.findUnique({ where: { slug: es } });
        if (e) await db.passageEvent.upsert({
          where: { passageId_eventId: { passageId: passage.id, eventId: e.id } },
          update: {},
          create: { passageId: passage.id, eventId: e.id },
        });
      }
    }
    console.log(`  +${s.passages.length} passages for ${s.sourceSlug}`);
  }

  const total = await db.passage.count();
  console.log(`Done. Added ${added} passages. Total passages: ${total}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
