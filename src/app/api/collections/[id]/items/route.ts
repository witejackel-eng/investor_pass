import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// POST /api/collections/[id]/items { kind, entityId, label }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);
  if (user.entitlement !== "pro") return error("Pro required", 403);
  const collection = await db.collection.findUnique({ where: { id } });
  if (!collection || collection.userId !== user.id) return error("Collection not found", 404);

  let body: { kind?: string; entityId?: string; label?: string };
  try { body = await req.json(); } catch { return error("Invalid JSON", 400); }
  if (!body.kind || !body.entityId) return error("kind and entityId required", 400);
  if (!["passage", "source", "company", "theme"].includes(body.kind)) return error("Invalid kind", 400);

  const item = await db.collectionItem.create({
    data: { collectionId: id, kind: body.kind, entityId: body.entityId, label: body.label || "" },
  });
  return json({ item });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);
  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");
  if (!itemId) return error("itemId required", 400);
  await db.collectionItem.deleteMany({ where: { id: itemId, collection: { id, userId: user.id } } });
  return json({ ok: true });
}
