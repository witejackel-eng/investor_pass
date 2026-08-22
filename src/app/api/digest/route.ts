/**
 * GET /api/digest — weekly brief (in-app; Master Plan §5, Tech Plan §8).
 * Pro-gated: aggregates the past 7 days of notifications per followed entity.
 * Free users get a gate payload, never an email — EMAIL_MODE stays off until
 * payments-live (Phase 8 gate).
 */
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ isPro: false, gated: true }, { status: 401 });

  if (user.entitlement !== "pro") {
    return NextResponse.json(
      { isPro: false, gated: true, message: "Weekly digests are part of Pro." },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const notifications = await db.notification.findMany({
    where: { userId: user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Group by followed entity.
  const groups = new Map<string, { entityType: string; entityId: string; count: number; latestTitle: string }>();
  for (const n of notifications) {
    const key = `${n.entityType}:${n.entityId}`;
    const g = groups.get(key);
    if (g) {
      g.count++;
    } else {
      groups.set(key, { entityType: n.entityType, entityId: n.entityId, count: 1, latestTitle: n.title });
    }
  }

  return NextResponse.json(
    {
      isPro: true,
      gated: false,
      weekOf: since.toISOString(),
      totalNew: notifications.length,
      groups: [...groups.values()].sort((a, b) => b.count - a.count),
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
