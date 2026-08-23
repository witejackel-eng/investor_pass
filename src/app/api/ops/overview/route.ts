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
    const [passages, sources, investors, themes, concepts, companies, events, decisions, newsletterSubs, activePro] =
      await Promise.all([
        db.passage.count(),
        db.source.count(),
        db.person.count({ where: { status: "active" } }),
        db.theme.count(),
        db.concept.count(),
        db.company.count(),
        db.event.count(),
        db.decision.count(),
        db.appConfig.count({ where: { key: { startsWith: "newsletter:" } } }),
        db.subscription.count({ where: { state: "active" } }),
      ]);

    return json({
      corpus: { passages, sources, investors, themes, concepts, companies, events, decisions },
      newsletterSubs,
      activePro,
      at: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Overview unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
