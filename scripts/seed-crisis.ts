/**
 * Investor/Pass — Supplementary seed: 2008 crisis preferred-stake passages.
 * Adds Goldman Sachs and General Electric as companies, and passages about
 * Berkshire's preferred-stock investments during the 2008 financial crisis.
 * All paraphrased contextual summaries with provenance.
 */
import { db } from "../src/lib/db";

async function main() {
  console.log("Adding 2008 crisis preferred-stake passages…");

  // Add Goldman Sachs and GE companies
  const finance = await db.industry.findUnique({ where: { slug: "finance" } });
  const tech = await db.industry.findUnique({ where: { slug: "technology" } });

  const goldman = await db.company.upsert({
    where: { slug: "goldman-sachs" },
    update: {},
    create: {
      slug: "goldman-sachs",
      name: "Goldman Sachs",
      canonicalName: "The Goldman Sachs Group, Inc.",
      ticker: "GS",
      industryId: finance?.id,
      description: "Investment bank in which Berkshire bought a $5 billion preferred stake during the 2008 crisis.",
    },
  });

  const ge = await db.company.upsert({
    where: { slug: "general-electric" },
    update: {},
    create: {
      slug: "general-electric",
      name: "General Electric",
      canonicalName: "General Electric Company",
      ticker: "GE",
      industryId: finance?.id,
      description: "Industrial conglomerate in which Berkshire bought a $3 billion preferred stake during the 2008 crisis.",
    },
  });

  // Link to Buffett
  const buffett = await db.person.findUnique({ where: { slug: "buffett" } });
  if (!buffett) { console.log("Buffett not found"); return; }
  await db.personCompany.upsert({ where: { personId_companyId: { personId: buffett.id, companyId: goldman.id } }, update: {}, create: { personId: buffett.id, companyId: goldman.id } });
  await db.personCompany.upsert({ where: { personId_companyId: { personId: buffett.id, companyId: ge.id } }, update: {}, create: { personId: buffett.id, companyId: ge.id } });

  // Find the 2008 letter source
  const source = await db.source.findUnique({ where: { slug: "buffett-2008-letter" } });
  if (!source) { console.log("2008 letter not found"); return; }

  // Check for existing passages to avoid duplicates
  const existing = await db.passage.findMany({ where: { sourceId: source.id } });
  const existingTexts = new Set(existing.map((p) => p.text.slice(0, 60)));
  let seq = existing.length > 0 ? Math.max(...existing.map((p) => p.sequence)) + 1 : 0;

  const newPassages = [
    {
      text: "Buffett described Berkshire's $5 billion preferred-stock investment in Goldman Sachs as a transaction that offered a combination of downside protection and upside optionality rare in public markets. The preferred shares carried a 10% dividend and were accompanied by warrants to purchase common stock, terms that reflected both the distress of the seller and the strength of Berkshire's capital position. He argued that the transaction was possible only because Berkshire had preserved capital and reputation through the boom years and could act decisively when others were forced to retrench.",
      context: "On the Goldman Sachs preferred stake structure.",
      section: "Crisis Investments",
      visibility: "pro" as const,
      themes: ["capital-allocation", "margin-of-safety", "market-mr"],
      concepts: ["retained-earnings", "intrinsic-value"],
      companies: ["goldman-sachs", "berkshire-hathaway"],
      events: ["2008-financial-crisis"],
    },
    {
      text: "Buffett described the $3 billion preferred-stock investment in General Electric as structurally similar to the Goldman Sachs transaction: a fixed dividend, redemption rights, and warrants providing upside participation in the common stock. He argued that both transactions illustrated the principle that capital is most valuable when it is available precisely when it is scarce, and that the investor who can act as a lender of last resort to high-quality businesses earns terms unavailable in normal markets.",
      context: "On the GE preferred stake and the lender-of-last-resort principle.",
      section: "Crisis Investments",
      visibility: "pro" as const,
      themes: ["capital-allocation", "margin-of-safety"],
      concepts: ["retained-earnings"],
      companies: ["general-electric", "berkshire-hathaway"],
      events: ["2008-financial-crisis"],
    },
    {
      text: "Buffett wrote that the crisis investments reinforced the lesson that the investor who is prepared for dislocation — by holding capital, avoiding leverage, and having pre-analyzed the businesses worth buying — captures opportunities that are invisible to the investor who must scramble in the moment. He argued that preparation, not prediction, is the source of crisis-era advantage, and that the work of analyzing businesses continuously is what makes decisive action possible when prices dislocate from value.",
      context: "On preparation as the source of crisis-era advantage.",
      section: "Lessons",
      visibility: "public" as const,
      themes: ["capital-allocation", "circle-of-competence", "long-horizon"],
      concepts: ["retained-earnings"],
      companies: ["berkshire-hathaway"],
      events: ["2008-financial-crisis"],
    },
  ];

  let added = 0;
  for (const p of newPassages) {
    if (existingTexts.has(p.text.slice(0, 60))) continue;
    const passage = await db.passage.create({
      data: {
        sourceId: source.id,
        text: p.text,
        context: p.context,
        section: p.section,
        sequence: seq++,
        visibility: p.visibility,
      },
    });
    added++;
    for (const ts of p.themes) {
      const t = await db.theme.findUnique({ where: { slug: ts } });
      if (t) await db.passageTheme.upsert({ where: { passageId_themeId: { passageId: passage.id, themeId: t.id } }, update: {}, create: { passageId: passage.id, themeId: t.id } });
    }
    for (const cs of p.companies) {
      const c = await db.company.findUnique({ where: { slug: cs } });
      if (c) await db.passageCompany.upsert({ where: { passageId_companyId: { passageId: passage.id, companyId: c.id } }, update: {}, create: { passageId: passage.id, companyId: c.id } });
    }
    for (const es of p.events) {
      const e = await db.event.findUnique({ where: { slug: es } });
      if (e) await db.passageEvent.upsert({ where: { passageId_eventId: { passageId: passage.id, eventId: e.id } }, update: {}, create: { passageId: passage.id, eventId: e.id } });
    }
    for (const cs of p.concepts) {
      const c = await db.concept.findUnique({ where: { slug: cs } });
      if (c) await db.passageConcept.upsert({ where: { passageId_conceptId: { passageId: passage.id, conceptId: c.id } }, update: {}, create: { passageId: passage.id, conceptId: c.id } });
    }
  }

  const total = await db.passage.count();
  const companyCount = await db.company.count();
  console.log(`Done. Added ${added} passages. Total passages: ${total}. Total companies: ${companyCount}.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
