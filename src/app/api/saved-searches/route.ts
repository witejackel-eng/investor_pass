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
  const searches = await db.savedSearch.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return json({ searches: searches.map((s) => ({ ...s, filters: JSON.parse(s.filters) })) });
}

export async function POST(req: Request) {
  let user;
  try { user = await requirePro(); } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return error("Authentication required", 401);
    return error("Pro required", 403);
  }
  let body: { title?: string; query?: string; filters?: any };
  try { body = await req.json(); } catch { return error("Invalid JSON", 400); }
  if (!body.title || body.query === undefined) return error("title and query are required", 400);
  const ss = await db.savedSearch.create({
    data: { userId: user.id, title: body.title, query: body.query, filters: JSON.stringify(body.filters || {}) },
  });
  return json({ search: { ...ss, filters: JSON.parse(ss.filters) } });
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
  await db.savedSearch.deleteMany({ where: { id, userId: user.id } });
  return json({ ok: true });
}
