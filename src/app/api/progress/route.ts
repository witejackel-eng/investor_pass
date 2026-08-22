/**
 * POST /api/progress { passageId } — record a read (fire-and-forget from client).
 * Called after the dwell threshold so scrolling past ≠ reading.
 */
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { passageId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const passageId = body.passageId;
  if (!passageId) return NextResponse.json({ ok: false }, { status: 400 });

  const passage = await db.passage.findUnique({
    where: { id: passageId },
    select: { id: true, sourceId: true, sequence: true },
  });
  if (!passage) return NextResponse.json({ ok: false }, { status: 404 });

  await db.passageProgress.upsert({
    where: { userId_passageId: { userId: user.id, passageId: passage.id } },
    create: {
      userId: user.id,
      passageId: passage.id,
      sourceId: passage.sourceId,
      sequence: passage.sequence,
    },
    update: { viewedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
