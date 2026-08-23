import { getInvestorNetwork } from "@/lib/server/graph";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/graph/network — the investor cross-reference network: every
// investor node, its strongest theme links, and all investor↔investor
// SHARED_THEME / SHARED_COMPANY edges.
export async function GET() {
  try {
    const network = await getInvestorNetwork();
    return json(network, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return error("The network map is temporarily unavailable.", 503);
  }
}
