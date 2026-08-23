/**
 * GET /api/new-since — "What's new since your last visit" (Master Plan §2).
 * Reads the visit cursor, aggregates new passages/sources since it
 * (prioritising followed entities), then ADVANCES the cursor — banner
 * semantics: shown once per visit.
 */
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const TAKE = 12;

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ isNew: false, items: [], followedNew: 0 });

  const cursor = await db.visitCursor.findUnique({ where: { userId: user.id } });
  const since = cursor?.lastSeenAt ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // first visit: last 7 days

  // Followed entity slugs (persons/topics/companies/concepts/events).
  const follows = await db.follow.findMany({ where: { userId: user.id }, select: { entityType: true, entityId: true } });
  const followedPersons = follows.filter((f) => f.entityType === "person").map((f) => f.entityId);
  const personIds = followedPersons.length
    ? (await db.person.findMany({ where: { slug: { in: followedPersons } }, select: { id: true } })).map((p) => p.id)
    : [];

  const [newSources, totalNew] = await Promise.all([
    db.source.findMany({
      where: { createdAt: { gt: since }, ...(personIds.length ? {} : {}) },
      orderBy: { createdAt: "desc" },
      take: TAKE * 2,
      select: {
        id: true, slug: true, title: true, year: true, sourceType: true, personId: true,
        _count: { select: { passages: true } },
        person: { select: { slug: true, name: true } },
      },
    }),
    db.source.count({ where: { createdAt: { gt: since } } }),
  ]);

  // Prioritise sources from followed persons.
  const sorted = [...newSources].sort((a, b) => {
    const fa = personIds.includes(a.personId) ? 0 : 1;
    const fb = personIds.includes(b.personId) ? 0 : 1;
    return fa - fb;
  });
  const followedNew = sorted.filter((s) => personIds.includes(s.personId)).length;

  const items = sorted.slice(0, TAKE).map((s) => ({
    view: "source" as const,
    slug: s.slug,
    label: s.title,
    meta: `${s.person.name}${s.year ? ` · ${s.year}` : ""} · ${s._count.passages} passages`,
    personName: s.person.name,
    personSlug: s.person.slug,
    year: s.year,
    passageCount: s._count.passages,
    followed: personIds.includes(s.personId),
  }));

  // Advance cursor AFTER computing results.
  await db.visitCursor.upsert({
    where: { userId: user.id },
    update: { lastSeenAt: new Date() },
    create: { userId: user.id, lastSeenAt: new Date() },
  });

  return NextResponse.json(
    { isNew: totalNew > 0, totalNew, followedNew, items },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
