import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

async function requirePro() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.entitlement !== "pro") throw new Error("FORBIDDEN");
  return user;
}

export async function GET() {
  let user;
  try { user = await requirePro(); } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return error("Authentication required", 401);
    return error("Pro required", 403);
  }
  const collections = await db.collection.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return json({ collections });
}

export async function POST(req: Request) {
  let user;
  try { user = await requirePro(); } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return error("Authentication required", 401);
    return error("Pro required", 403);
  }
  let body: { title?: string; description?: string };
  try { body = await req.json(); } catch { return error("Invalid JSON", 400); }
  if (!body.title) return error("title is required", 400);
  const c = await db.collection.create({ data: { userId: user.id, title: body.title, description: body.description || null } });
  return json({ collection: c });
}

export async function DELETE(req: Request) {
  let user;
  try { user = await requirePro(); } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return error("Authentication required", 401);
    return error("Pro required", 403);
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return error("id is required", 400);
  await db.collection.deleteMany({ where: { id, userId: user.id } });
  return json({ ok: true });
}
