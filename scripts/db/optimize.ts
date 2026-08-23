/**
 * scripts/db/optimize.ts — idempotent database optimization.
 *
 * Safe to run repeatedly (CREATE ... IF NOT EXISTS everywhere). Applies:
 *  1. pg_trgm extension + GIN trigram indexes for ILIKE '%token%' search
 *     over Passage.text and Source.title (turns per-token seq-scans into
 *     index scans).
 *  2. Composite b-tree indexes matching the hot query shapes:
 *     - Passage(sourceId, visibility)  — every public-page passage filter
 *     - Source(personId, year)         — directory counts + year spans
 *  3. ANALYZE — refresh planner statistics.
 *
 * NOTE: the trigram indexes are NOT expressible in schema.prisma. If you ever
 * run `prisma db push`, re-run this script afterwards to restore them:
 *   bun scripts/db/optimize.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("→ enabling pg_trgm extension…");
  await db.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

  console.log("→ creating composite indexes…");
  await db.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Passage_sourceId_visibility_idx" ON "Passage"("sourceId", "visibility")`
  );
  await db.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Source_personId_year_idx" ON "Source"("personId", "year")`
  );

  console.log("→ creating trigram indexes for search…");
  await db.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Passage_text_trgm_idx" ON "Passage" USING gin (text gin_trgm_ops)`
  );
  await db.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Source_title_trgm_idx" ON "Source" USING gin (title gin_trgm_ops)`
  );

  console.log("→ refreshing planner statistics (ANALYZE)…");
  await db.$executeRawUnsafe(`ANALYZE`);

  console.log("✓ database optimized.");
}

main()
  .catch((e) => {
    console.error("optimize failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
