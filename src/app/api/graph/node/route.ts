import { getGraphNode } from "@/lib/server/graph";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/graph/node?id=person:buffett — ego neighborhood of any node.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  if (!id || id.length > 128 || !/^[a-z]+:[a-z0-9-]+$/i.test(id)) {
    return error("A valid node id is required (e.g. person:buffett)", 400);
  }
  try {
    const detail = await getGraphNode(id);
    if (!detail) return error("Node not found", 404);
    return json(detail, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return error("The graph is temporarily unavailable.", 503);
  }
}
