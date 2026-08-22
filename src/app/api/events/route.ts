import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "search_started",
  "search_submitted",
  "search_result_opened",
  "filter_applied",
  "source_opened",
  "entity_opened",
  "investor_explored",
  "theme_explored",
  "company_explored",
  "event_explored",
  "comparison_started",
  "comparison_completed",
  "save_clicked",
  "bookmark_created",
  "saved_search_created",
  "collection_created",
  "paywall_viewed",
  "checkout_started",
  "subscription_started",
  "share_clicked",
  "public_page_viewed",
]);

// POST /api/events  { name, props? } — best-effort, never blocks UX
export async function POST(req: Request) {
  let body: { name?: string; props?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 204 });
  }
  const name = body.name;
  if (!name || !ALLOWED.has(name)) return new Response(null, { status: 204 });

  try {
    const user = await getSessionUser();
    await db.searchEvent.create({
      data: {
        userId: user?.id ?? null,
        name,
        props: body.props ? JSON.stringify(body.props).slice(0, 2000) : null,
      },
    });
  } catch {
    // analytics must never break the product
  }
  return new Response(null, { status: 204 });
}
