import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

// GET /api/bookmarks — list current user's bookmarks
export async function GET() {
  let user;
  try { user = await requireUser(); } catch { return error("Authentication required", 401); }
  const bookmarks = await db.bookmark.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return json({ bookmarks });
}

// POST /api/bookmarks — create
export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return error("Authentication required", 401); }
  if (user.entitlement !== "pro") return error("Pro required to save bookmarks", 403);
  let body: { kind?: string; entityId?: string; label?: string; note?: string };
  try { body = await req.json(); } catch { return error("Invalid JSON", 400); }
  const kind = body.kind;
  const entityId = body.entityId;
  const label = body.label || "";
  if (!kind || !entityId) return error("kind and entityId are required", 400);
  if (!["source", "passage", "company", "theme", "search"].includes(kind)) return error("Invalid kind", 400);

  const bm = await db.bookmark.upsert({
    where: { userId_kind_entityId: { userId: user.id, kind, entityId } },
    update: { label, note: body.note || null },
    create: { userId: user.id, kind, entityId, label, note: body.note || null },
  });
  return json({ bookmark: bm });
}

// DELETE /api/bookmarks?kind=&entityId=
export async function DELETE(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return error("Authentication required", 401); }
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const entityId = url.searchParams.get("entityId");
  if (!kind || !entityId) return error("kind and entityId are required", 400);
  await db.bookmark.deleteMany({ where: { userId: user.id, kind, entityId } });
  return json({ ok: true });
}
