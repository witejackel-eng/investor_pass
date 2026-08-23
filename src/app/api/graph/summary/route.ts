import { getGraphSummary } from "@/lib/server/graph";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/graph/summary — whole-graph stats: counts by kind/relation,
// god nodes (highest degree), communities. Public metadata only.
export async function GET() {
  try {
    const summary = await getGraphSummary();
    return json(summary, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (e) {
    console.error("[graph-api]", e instanceof Error ? e.message : e);
    return error("Graph summary is temporarily unavailable.", 503);
  }
}
