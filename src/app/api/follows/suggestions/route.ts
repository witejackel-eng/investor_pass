/**
 * /api/follows/suggestions — co-occurrence suggestions from the follow graph.
 * GET ?entityType=&entityId= → { suggestions: [{ entityType, entityId, label, count }] }
 * Public (works logged-out); when a session exists, entities the viewer
 * already follows are excluded. Never returns other users' ids.
 */
import { error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { getFollowSuggestions, ENTITY_KINDS } from "@/lib/server/follow-suggestions";

export const dynamic = "force-dynamic";

const MAX_ID_LENGTH = 200;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const entityType = url.searchParams.get("entityType") || "";
  const entityId = (url.searchParams.get("entityId") || "").trim();
  if (!ENTITY_KINDS.includes(entityType as any) || !entityId) {
    return error("Valid entityType and entityId required", 400);
  }
  if (entityId.length > MAX_ID_LENGTH) {
    return error("entityId too long", 400);
  }

  const viewer = await getSessionUser(); // optional — public endpoint
  const suggestions = await getFollowSuggestions(entityType, entityId, viewer?.id ?? null);

  return new Response(JSON.stringify({ suggestions }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=30" },
  });
}
