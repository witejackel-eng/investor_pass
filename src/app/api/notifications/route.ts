/**
 * /api/notifications — in-app notification inbox.
 * GET  → { unreadCount, notifications } (latest 20)
 * POST { ids?: string[], all?: boolean } → mark read
 */
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);

  const [unreadCount, notifications] = await Promise.all([
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json(
    {
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id, type: n.type, title: n.title, body: n.body, url: n.url,
        read: n.readAt !== null, createdAt: n.createdAt,
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);

  let body: { ids?: string[]; all?: boolean };
  try { body = await req.json(); } catch { body = {}; }

  if (body.all) {
    await db.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  } else if (body.ids?.length) {
    await db.notification.updateMany({
      where: { userId: user.id, id: { in: body.ids }, readAt: null },
      data: { readAt: new Date() },
    });
  }
  return json({ ok: true });
}
