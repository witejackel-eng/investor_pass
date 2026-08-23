/**
 * GET /api/changelog — public editorial changelog (Master Plan §36).
 */
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await db.changelog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return json({ entries }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return error("Changelog is temporarily unavailable.", 503);
  }
}
