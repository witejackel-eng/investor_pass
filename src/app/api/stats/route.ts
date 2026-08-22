/**
 * GET /api/stats — live library counts for public surfaces.
 * Cached at the edge; failures return 503 so the UI can hide stat rows
 * instead of ever showing stale-wrong numbers (honesty rule).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [passages, sources, investors, themes, concepts, companies] = await Promise.all([
      db.passage.count(),
      db.source.count(),
      db.person.count({ where: { status: "active" } }),
      db.theme.count(),
      db.concept.count(),
      db.company.count(),
    ]);
    return NextResponse.json(
      { passages, sources, investors, themes, concepts, companies },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch {
    return NextResponse.json({ error: "Stats unavailable" }, { status: 503 });
  }
}
