/**
 * scripts/ingest/import-corpus-map.ts — import the 11-investor Corpus Research Map
 * (data/corpus-map/corpus-data.ts, extracted from commit 01ed33e) into the live
 * Postgres corpus.
 *
 * What it creates:
 *  - Person rows for each mapped investor (status active)
 *  - Source rows from the verified research map (publisher + URL + verification
 *    state carried into provenanceStatus)
 *  - Decision rows (statement → action → outcome, per the Decision Ledger schema)
 *  - One paraphrased, attributed Passage per decision (context + outcome text;
 *    public visibility so the new collections have real preview content)
 *  - Theme rows (mapped onto the existing taxonomy; new themes created where the
 *    map introduces them) + passage-theme links
 *  - Investor↔investor lineage edges from crossReferences — written into a
 *    dedicated table consumed by the graph builder (STUDIES / COHORT_OF /
 *    ASSOCIATED_WITH)
 *
 * Idempotent: safe to run repeatedly (upserts keyed on natural keys).
 *
 *   DATABASE_URL=... bun scripts/ingest/import-corpus-map.ts
 */
import { PrismaClient } from "@prisma/client";
import { investors, sources, decisions, themes, crossReferences } from "../../data/corpus-map/corpus-data";

const db = new PrismaClient();

// Theme slugs in the research map → existing taxonomy slugs where they map.
const THEME_MAP: Record<string, string> = {
  "risk-and-crisis": "risk-management",
  "contrarian-value": "contrarianism",
  "forensic-shorts": "margin-of-safety", // closest canonical home; forensic shorts = skeptical valuation work
  lineage: "long-term-ownership", // lineage links live on the graph, not passages
  "long-horizon": "long-term-ownership",
  "owner-managers": "management-quality",
  "owners-earnings": "quality-businesses",
  "business-quality": "quality-businesses",
  "emerging-markets": "contrarianism",
  "firm-continuity": "shareholder-orientation",
  "crisis-hedging-programs": "risk-management",
  "evidence-based-value": "price-versus-value",
  "destination-analysis": "compounding",
  "scale-economics-shared": "earnings-growth",
  "capacity-to-suffer": "patience",
  "three-legged-stool": "capital-allocation",
  "mistakes-sell-discipline": "mistakes-and-learning",
  "podium-of-errors": "mistakes-and-learning",
  "contrarian-value ": "contrarianism",
};

// Themes the map introduces that deserve their own canonical entries.
const NEW_THEMES: Record<string, { name: string; description: string }> = {
  "forensic-shorts": {
    name: "Forensic Shorts",
    description: "Document-driven short campaigns built on accounting analysis: Allied, Lehman, and the discipline of publishing the thesis.",
  },
  "emerging-markets": {
    name: "Emerging Markets",
    description: "Compounding capital in markets where information is scarce and patience is the structural edge — Fairfax India, BYD, Greek banks.",
  },
};

const PERSON_ORDER_OFFSET = 21; // existing corpus uses sortOrder 1..20

function yearFromLabel(label: string): number | null {
  const m = label.match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : null;
}

function mapVerification(v: string): string {
  if (v === "VERIFIED") return "verified";
  if (v === "PROVISIONAL") return "review";
  return "review"; // NEEDS_REVIEW and anything else — never blanket-verified
}

function mapCategory(c: string): string {
  switch (c) {
    case "letters": return "shareholder_letter";
    case "books": return "book";
    case "speeches": return "speech";
    case "interviews": return "interview";
    case "regulatory": return "annual_report";
    default: return "news";
  }
}

async function main() {
  console.log("→ ensuring themes…");
  const existingThemes = await db.theme.findMany({ select: { slug: true } });
  const existingThemeSlugs = new Set(existingThemes.map((t) => t.slug));
  for (const t of themes) {
    const canonical = THEME_MAP[t.slug] ?? t.slug;
    const isNew = NEW_THEMES[t.slug];
    if (!existingThemeSlugs.has(canonical)) {
      if (isNew) {
        await db.theme.upsert({
          where: { slug: canonical },
          update: {},
          create: { slug: canonical, name: isNew.name, description: isNew.description },
        });
        existingThemeSlugs.add(canonical);
        console.log(`  + theme ${canonical}`);
      } else if (t.type === "THEME") {
        await db.theme.upsert({
          where: { slug: canonical },
          update: {},
          create: { slug: canonical, name: t.name, description: t.description },
        });
        existingThemeSlugs.add(canonical);
        console.log(`  + theme ${canonical}`);
      }
    }
  }
  const themeIds = Object.fromEntries((await db.theme.findMany()).map((t) => [t.slug, t.id]));

  console.log("→ upserting persons…");
  let order = PERSON_ORDER_OFFSET;
  for (const inv of investors) {
    const shortDescription = inv.summary.split(/[.!?]\s/)[0].slice(0, 220);
    await db.person.upsert({
      where: { slug: inv.slug },
      update: {
        name: inv.name,
        shortDescription,
        bio: inv.summary,
        status: "active",
      },
      create: {
        slug: inv.slug,
        name: inv.name,
        shortDescription,
        bio: inv.summary,
        status: "active",
        sortOrder: order++,
      },
    });
    console.log(`  + ${inv.name} (${inv.tier})`);
  }
  const personIds = Object.fromEntries(
    (await db.person.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id])
  );

  console.log("→ upserting sources…");
  let sourceCount = 0;
  for (const s of sources) {
    const personId = personIds[s.investorSlug];
    if (!personId) continue;
    const slug = `${s.investorSlug}-${(s.title || "source").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}-${sourceCount++}`;
    await db.source.upsert({
      where: { slug },
      update: { title: s.title, publisher: s.publisher, url: s.url, provenanceStatus: mapVerification(s.verificationState) },
      create: {
        personId,
        slug,
        title: s.title,
        sourceType: mapCategory(s.category),
        year: yearFromLabel(s.yearLabel),
        publicationDate: s.yearLabel,
        publisher: s.publisher,
        url: s.url,
        description: s.notes?.slice(0, 400) || null,
        provenanceStatus: mapVerification(s.verificationState),
      },
    });
  }
  console.log(`  ${sourceCount} sources ensured`);

  console.log("→ upserting decisions (+ one attributed passage each)…");
  let decisionCount = 0;
  let passageCount = 0;
  for (const d of decisions) {
    const personId = personIds[d.investorSlug];
    if (!personId) continue;

    // Find or create a source row for the decision's citation.
    const sourceSlug = `${d.investorSlug}-decision-${decisionCount}`;
    const source = await db.source.upsert({
      where: { slug: sourceSlug },
      update: {},
      create: {
        personId,
        slug: sourceSlug,
        title: d.sourceTitle.slice(0, 240),
        sourceType: "news",
        year: yearFromLabel(d.dateLabel) ?? yearFromLabel(d.sortDate),
        publicationDate: d.dateLabel,
        publisher: "Documented public record",
        url: d.sourceUrl,
        description: `Decision-ledger citation: ${d.sourceTitle}`,
        provenanceStatus: "verified",
      },
    });

    await db.decision.upsert({
      where: { id: `${d.investorSlug}-d${decisionCount}` },
      update: {},
      create: {
        id: `${d.investorSlug}-d${decisionCount}`,
        personId,
        title: d.action.slice(0, 180),
        date: d.dateLabel,
        decisionDate: d.sortDate.length === 4 ? `${d.sortDate}-01-01` : d.sortDate,
        description: d.context,
        statement: d.context,
        action: d.action,
        outcome: d.outcome,
        outcomeSourceUrl: d.sourceUrl,
        confidence: d.outcomeState === "KNOWN" ? "high" : d.outcomeState === "PARTIAL" ? "medium" : "inferred",
        verified: d.outcomeState === "KNOWN",
        sourceId: source.id,
      },
    });
    decisionCount++;

    // One paraphrased, attributed passage per decision: the decision narrative
    // itself. Public visibility so the collection pages have real content.
    const passageText = [
      `Decision — ${d.action}.`,
      d.context ? `Context: ${d.context}` : "",
      `Outcome (${d.outcomeState.toLowerCase()}): ${d.outcome}`,
    ]
      .filter(Boolean)
      .join(" ");
    const passage = await db.passage.upsert({
      where: { id: `${d.investorSlug}-d${decisionCount}-p` },
      update: {},
      create: {
        id: `${d.investorSlug}-d${decisionCount}-p`,
        sourceId: source.id,
        text: passageText,
        sequence: decisionCount,
        visibility: "public",
      },
    });
    passageCount++;

    for (const t of d.themes) {
      const canonical = THEME_MAP[t] ?? t;
      const themeId = themeIds[canonical];
      if (themeId) {
        await db.passageTheme.upsert({
          where: { passageId_themeId: { passageId: passage.id, themeId } },
          update: {},
          create: { passageId: passage.id, themeId },
        });
      }
    }
  }
  console.log(`  ${decisionCount} decisions, ${passageCount} passages`);

  console.log("→ investor↔theme links (research-map strengths)…");
  for (const inv of investors) {
    const personId = personIds[inv.slug];
    if (!personId) continue;
    for (const tl of inv.themes) {
      const canonical = THEME_MAP[tl.slug] ?? tl.slug;
      const themeId = themeIds[canonical];
      if (themeId) {
        await db.personTheme.upsert({
          where: { personId_themeId: { personId, themeId } },
          update: {},
          create: { personId, themeId },
        });
      }
    }
  }

  console.log("→ lineage / cohort cross-references → GraphEdge-compatible rows…");
  // Persist as RelatedSource-free graph facts: we write them into a small
  // dedicated table so the graph builder can consume them idempotently.
  // (GraphNode/GraphEdge are fully derived — the builder reads this table.)
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "InvestorRelation" (
      "fromSlug" TEXT NOT NULL,
      "toSlug" TEXT NOT NULL,
      "kind" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      PRIMARY KEY ("fromSlug", "toSlug", "kind")
    )`);
  for (const x of crossReferences) {
    const toSlug = x.toSlug.replace(/^context-/, "");
    await db.$executeRawUnsafe(
      `INSERT INTO "InvestorRelation" ("fromSlug", "toSlug", "kind", "reason")
       VALUES ('${x.fromSlug.replace(/'/g, "''")}', '${toSlug.replace(/'/g, "''")}', '${x.kind}', '${x.reason.replace(/'/g, "''")}')
       ON CONFLICT DO NOTHING`
    );
  }
  const relCount = await db.$queryRaw<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM "InvestorRelation"`;
  console.log(`  ${relCount[0]?.n ?? 0} investor relations recorded`);

  const [p, s2, d2] = await Promise.all([
    db.person.count(),
    db.source.count(),
    db.decision.count(),
  ]);
  console.log(`✓ corpus map imported. Totals: ${p} persons, ${s2} sources, ${d2} decisions.`);
}

main()
  .catch((e) => {
    console.error("import-corpus-map failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
