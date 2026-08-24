/**
 * GET /api/new-since — "What's new since your last visit" (Master Plan §2).
 * Reads the visit cursor, aggregates new sources since it (prioritising
 * followed investors, themes, companies, events), then ADVANCES the cursor —
 * banner semantics: shown once per visit.
 *
 * High-signal filter: only sources with ≥ 1 passage (no empty stubs).
 * Prioritization: any source connected to a followed entity bubbles up.
 */
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const TAKE = 12;
const FIRST_VISIT_WINDOW_DAYS = 7;

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ isNew: false, items: [], followedNew: 0, totalNew: 0 });

  const cursor = await db.visitCursor.findUnique({ where: { userId: user.id } });
  const since = cursor?.lastSeenAt ?? new Date(Date.now() - FIRST_VISIT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // ── Resolve all followed entities ──────────────────────────────────────
  const follows = await db.follow.findMany({
    where: { userId: user.id },
    select: { entityType: true, entityId: true },
  });
  const followedPersons = follows.filter((f) => f.entityType === "person").map((f) => f.entityId);
  const followedThemes = follows.filter((f) => f.entityType === "topic").map((f) => f.entityId);
  const followedCompanies = follows.filter((f) => f.entityType === "company").map((f) => f.entityId);
  const followedEvents = follows.filter((f) => f.entityType === "event").map((f) => f.entityId);

  // Resolve person IDs from slugs (for direct personId matching).
  const personIds = followedPersons.length
    ? (await db.person.findMany({ where: { slug: { in: followedPersons } }, select: { id: true, slug: true } })).map((p) => p.id)
    : [];
  const personIdSet = new Set(personIds);

  // Resolve theme/company/event IDs from slugs (for junction matching).
  const [themeIds, companyIds, eventIds] = await Promise.all([
    followedThemes.length ? db.theme.findMany({ where: { slug: { in: followedThemes } }, select: { id: true } }) : Promise.resolve([]),
    followedCompanies.length ? db.company.findMany({ where: { slug: { in: followedCompanies } }, select: { id: true } }) : Promise.resolve([]),
    followedEvents.length ? db.event.findMany({ where: { slug: { in: followedEvents } }, select: { id: true } }) : Promise.resolve([]),
  ]);
  const themeIdSet = new Set(themeIds.map((t) => t.id));
  const companyIdSet = new Set(companyIds.map((c) => c.id));
  const eventIdSet = new Set(eventIds.map((e) => e.id));

  // ── Query new sources (high-signal: ≥ 1 passage) ──────────────────────
  const [newSources, totalNew] = await Promise.all([
    db.source.findMany({
      where: {
        createdAt: { gt: since },
        passages: { some: {} }, // at least 1 passage — high-signal filter
      },
      orderBy: { createdAt: "desc" },
      take: TAKE * 3, // over-fetch so we can re-sort by followed-first
      select: {
        id: true, slug: true, title: true, year: true, sourceType: true, personId: true, createdAt: true,
        _count: { select: { passages: true } },
        person: { select: { slug: true, name: true } },
        passages: {
          take: 50, // sample for junction matching
          select: {
            id: true,
            passageThemes: { select: { themeId: true } },
            passageCompanies: { select: { companyId: true } },
            passageEvents: { select: { eventId: true } },
          },
        },
      },
    }),
    db.source.count({ where: { createdAt: { gt: since }, passages: { some: {} } } }),
  ]);

  // ── Compute "followed" flag per source ─────────────────────────────────
  // A source is "followed" if its person is followed, OR any of its passages
  // touch a followed theme/company/event.
  const annotated = newSources.map((s) => {
    const personFollowed = personIdSet.has(s.personId);
    let junctionFollowed = false;
    for (const p of s.passages) {
      if (p.passageThemes.some((pt) => themeIdSet.has(pt.themeId))) { junctionFollowed = true; break; }
      if (p.passageCompanies.some((pc) => companyIdSet.has(pc.companyId))) { junctionFollowed = true; break; }
      if (p.passageEvents.some((pe) => eventIdSet.has(pe.eventId))) { junctionFollowed = true; break; }
    }
    return { ...s, followed: personFollowed || junctionFollowed };
  });

  // Sort: followed-first, then by recency.
  const sorted = [...annotated].sort((a, b) => {
    if (a.followed !== b.followed) return a.followed ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  const followedNew = sorted.filter((s) => s.followed).length;

  const items = sorted.slice(0, TAKE).map((s) => ({
    view: "source" as const,
    slug: s.slug,
    label: s.title,
    meta: `${s.person.name}${s.year ? ` · ${s.year}` : ""} · ${s._count.passages} passage${s._count.passages === 1 ? "" : "s"}`,
    personName: s.person.name,
    personSlug: s.person.slug,
    year: s.year,
    passageCount: s._count.passages,
    followed: s.followed,
  }));

  // Advance cursor AFTER computing results.
  await db.visitCursor.upsert({
    where: { userId: user.id },
    update: { lastSeenAt: new Date() },
    create: { userId: user.id, lastSeenAt: new Date() },
  });

  return NextResponse.json(
    {
      isNew: totalNew > 0,
      totalNew,
      followedNew,
      hasFollows: follows.length > 0,
      items,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
