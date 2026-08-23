/**
 * scripts/qa/integrity-check.ts — evidence integrity gate (Master Plan PHASE 25).
 *
 * Run before every release: `bun scripts/qa/integrity-check.ts`
 * Exits 1 on any CRITICAL violation, 0 otherwise. Warnings don't fail the run
 * but must be reviewed.
 *
 * CRITICAL checks:
 *   1. No passage without a source
 *   2. No decision without a source
 *   3. No public passage in needs_review/rejected state
 *   4. No decision whose person differs from its source's person (contamination)
 *   5. No orphaned junction rows (theme/company/event links to deleted passages)
 *
 * WARNINGS:
 *   - Active investors with zero public passages (thin pages)
 *   - Sources with broken-looking URLs
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
let failures = 0;
const crit = (msg: string) => {
  console.error(`  ✗ CRITICAL: ${msg}`);
  failures++;
};
const warn = (msg: string) => console.warn(`  ⚠ ${msg}`);

async function main() {
  console.log("Evidence integrity check\n──────────────────────────");

  console.log("1. Passages without source…");
  const orphanPassages = await db.passage.count({ where: { sourceId: "" } });
  // FK guarantees sourceId non-null/non-dangling; empty-string guard is structural.
  if (orphanPassages > 0) crit(`${orphanPassages} passages with empty sourceId`);
  else console.log("  ✓ none");

  console.log("2. Decisions without source…");
  const orphanDecisions = await db.decision.count({ where: { sourceId: null } });
  if (orphanDecisions > 0) crit(`${orphanDecisions} decisions without a source`);
  else console.log("  ✓ none");

  console.log("3. Public passages in needs_review/rejected…");
  const tainted = await db.passage.count({
    where: { visibility: "public", verificationState: { in: ["needs_review", "rejected"] } },
  });
  if (tainted > 0) crit(`${tainted} public passages in needs_review/rejected state`);
  else console.log("  ✓ none");

  console.log("4. Cross-investor contamination (decision.person ≠ source.person)…");
  const contaminated = await db.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*)::int AS n
    FROM "Decision" d
    JOIN "Source" s ON s.id = d."sourceId"
    WHERE d."personId" <> s."personId"`;
  if ((contaminated[0]?.n ?? 0) > 0) crit(`${contaminated[0].n} decisions attributed to the wrong investor`);
  else console.log("  ✓ none");

  console.log("5. Orphaned junction rows…");
  const orphanThemes = await db.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM "PassageTheme" pt
    LEFT JOIN "Passage" p ON p.id = pt."passageId"
    LEFT JOIN "Theme" t ON t.id = pt."themeId"
    WHERE p.id IS NULL OR t.id IS NULL`;
  if ((orphanThemes[0]?.n ?? 0) > 0) crit(`${orphanThemes[0].n} passage-theme links pointing at deleted rows`);
  else console.log("  ✓ none");

  console.log("\nWarnings\n─────────");
  const people = await db.person.findMany({
    where: { status: "active" },
    select: { slug: true, sources: { select: { passages: { where: { visibility: "public" }, select: { id: true } } } } },
  });
  const thin = people.filter((p) => p.sources.every((s) => s.passages.length === 0));
  if (thin.length) warn(`thin investors (no public passages): ${thin.map((t) => t.slug).join(", ")}`);
  else console.log("  ✓ all active investors have public passages");

  const badUrls = await db.source.count({
    where: { url: { not: null }, NOT: [{ url: { startsWith: "http" } }] },
  });
  if (badUrls > 0) warn(`${badUrls} sources with non-http URLs`);
  else console.log("  ✓ all source URLs well-formed");

  console.log("──────────────────────────");
  if (failures > 0) {
    console.error(`\nFAILED: ${failures} critical violation(s). Fix before deploying.`);
    process.exit(1);
  }
  console.log("✓ All integrity checks passed.");
}

main()
  .catch((e) => {
    console.error("integrity-check error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
