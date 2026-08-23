/**
 * GET /api/ops/overview — Control Room status cards + corpus counts.
 * Live DB counts + cached health snapshots. Private (middleware-gated).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Single pooled round-trip instead of 10 parallel connections.
    const countsRow = await db.$queryRawUnsafe<Record<string, number>>(`
      SELECT
        (SELECT COUNT(*)::int FROM "Passage") AS passages,
        (SELECT COUNT(*)::int FROM "Source") AS sources,
        (SELECT COUNT(*)::int FROM "Person" WHERE status = 'active') AS investors,
        (SELECT COUNT(*)::int FROM "Theme") AS themes,
        (SELECT COUNT(*)::int FROM "Concept") AS concepts,
        (SELECT COUNT(*)::int FROM "Company") AS companies,
        (SELECT COUNT(*)::int FROM "Event") AS events,
        (SELECT COUNT(*)::int FROM "Decision") AS decisions,
        (SELECT COUNT(*)::int FROM "AppConfig" WHERE key LIKE 'newsletter:%') AS "newsletterSubs",
        (SELECT COUNT(*)::int FROM "Subscription" WHERE state = 'active') AS "activePro"
    `);
    const c = countsRow[0] as unknown as { passages: number; sources: number; investors: number; themes: number; concepts: number; companies: number; events: number; decisions: number; newsletterSubs: number; activePro: number };

    return json({
      corpus: c,
      newsletterSubs: c.newsletterSubs,
      activePro: c.activePro,
      at: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Overview unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
