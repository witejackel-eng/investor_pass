/**
 * /api/follows — follow graph (free tier, Master Plan §1).
 * GET  → current user's follows
 * POST { entityType, entityId } → follow (idempotent)
 * DELETE ?entityType=&entityId= → unfollow
 */
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ENTITY_TYPES = ["person", "topic", "concept", "company", "event", "source"];

export async function GET() {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);
  const follows = await db.follow.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ follows }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);

  let body: { entityType?: string; entityId?: string; alertFrequency?: string };
  try { body = await req.json(); } catch { return error("Invalid JSON", 400); }
  const { entityType, entityId, alertFrequency } = body;
  if (!entityType || !entityId || !ENTITY_TYPES.includes(entityType)) {
    return error("Valid entityType and entityId required", 400);
  }
  const frequency = ["off", "weekly", "instant"].includes(alertFrequency || "") ? alertFrequency : undefined;

  const follow = await db.follow.upsert({
    where: { userId_entityType_entityId: { userId: user.id, entityType, entityId } },
    update: frequency ? { alertFrequency: frequency } : {},
    create: {
      userId: user.id,
      entityType,
      entityId,
      ...(frequency ? { alertFrequency: frequency } : {}),
    },
  });
  return json({ ok: true, following: true, follow });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);

  const url = new URL(req.url);
  const entityType = url.searchParams.get("entityType") || "";
  const entityId = url.searchParams.get("entityId") || "";
  if (!ENTITY_TYPES.includes(entityType) || !entityId) {
    return error("Valid entityType and entityId required", 400);
  }

  await db.follow.deleteMany({ where: { userId: user.id, entityType, entityId } });
  return json({ ok: true, following: false });
}
