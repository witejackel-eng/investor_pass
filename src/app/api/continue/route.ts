/**
 * GET /api/continue?person=<slug> — "Continue reading" feed.
 * Logged-in: next UNREAD passages per source for this person, ordered by
 * sequence — strictly excludes anything already in PassageProgress.
 *
 * If no ?person param: auto-detects the user's most-recently-read person
 * (from PassageProgress JOIN Source JOIN Person, ordered by viewedAt desc).
 * Returns the person's slug + name so the UI can render "Continue reading
 * [Person Name]".
 *
 * Guests: empty array so the UI falls back to localStorage recents.
 */
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const TAKE = 6;

type SourceMeta = { id: string; slug: string; title: string; year: number | null; sourceType: string };

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ items: [], person: null }, { status: 401 });

  const url = new URL(req.url);
  let personSlug = url.searchParams.get("person");

  // ── Auto-detect: find the user's most-recently-read person ──────────────
  // Joins PassageProgress → Passage → Source → Person, ordered by viewedAt
  // desc, takes the first. This is the "resume where you left off" behavior.
  if (!personSlug) {
    const recentPerson = await db.$queryRaw<{ slug: string; name: string; kind: string }[]>`
      SELECT DISTINCT p.slug, p.name, p.kind
      FROM "PassageProgress" pp
      JOIN "Passage" pa ON pa.id = pp."passageId"
      JOIN "Source" s ON s.id = pa."sourceId"
      JOIN "Person" p ON p.id = s."personId"
      WHERE pp."userId" = ${user.id}
      ORDER BY pp."viewedAt" DESC
      LIMIT 1
    `;
    if (recentPerson.length > 0) {
      personSlug = recentPerson[0].slug;
    }
  }

  // ── Fallback: no reading history. Return empty + suggestions. ──────────
  if (!personSlug) {
    // No reading history yet — suggest the most-followed person as a starting point.
    const suggested = await db.$queryRaw<{ slug: string; name: string }[]>`
      SELECT p.slug, p.name
      FROM "Follow" f
      JOIN "Person" p ON p.id = f."entityId"
      WHERE f."userId" = ${user.id} AND f."entityType" = 'person'
      ORDER BY f."createdAt" DESC
      LIMIT 1
    `;
    if (suggested.length > 0) {
      personSlug = suggested[0].slug;
    } else {
      // Truly no history — suggest Buffett as the default starting point.
      personSlug = "buffett";
    }
  }

  const person = await db.person.findUnique({
    where: { slug: personSlug },
    select: { id: true, slug: true, name: true, kind: true },
  });
  if (!person) return NextResponse.json({ items: [], person: null });

  const sources: SourceMeta[] = await db.source.findMany({
    where: { personId: person.id },
    select: { id: true, slug: true, title: true, year: true, sourceType: true },
  });
  const sourceIds = sources.map((s) => s.id);
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  if (sourceIds.length === 0) {
    return NextResponse.json({ items: [], person: { slug: person.slug, name: person.name, kind: person.kind } });
  }

  // Read positions for this user across these sources.
  const progress = await db.passageProgress.findMany({
    where: { userId: user.id, sourceId: { in: sourceIds } },
    orderBy: { viewedAt: "desc" },
    select: { sourceId: true, sequence: true, passageId: true },
  });
  const readIds = new Set(progress.map((p) => p.passageId));
  const recentSourceIds = progress
    .map((p) => p.sourceId)
    .filter((id): id is string => id !== null)
    .slice(0, 5);

  // Resume order: most recently read sources first, then everything else.
  const orderedSources = [
    ...new Set([...recentSourceIds, ...sourceIds]),
  ];

  // Last-read sequence per source.
  const lastSeqBySource = new Map<string, number>();
  for (const p of progress) {
    if (p.sourceId === null) continue;
    lastSeqBySource.set(p.sourceId, Math.max(lastSeqBySource.get(p.sourceId) ?? -1, p.sequence));
  }

  // PAYWALL DORMANT — all passages are public. No visibility filter needed.
  const candidates = await db.passage.findMany({
    where: {
      sourceId: { in: orderedSources },
    },
    orderBy: [{ sourceId: "asc" }, { sequence: "asc" }],
    select: { id: true, text: true, sequence: true, sourceId: true },
  });

  const bySource = new Map<string, typeof candidates>();
  for (const row of candidates) {
    const list = bySource.get(row.sourceId) ?? [];
    list.push(row);
    bySource.set(row.sourceId, list);
  }

  const picked: typeof candidates = [];
  for (const sid of orderedSources) {
    const rows = bySource.get(sid);
    if (!rows) continue;
    const lastSeq = lastSeqBySource.get(sid) ?? -1;
    const unread = rows.filter((r) => !readIds.has(r.id));
    const ahead = unread.filter((r) => r.sequence > lastSeq).slice(0, 2);
    const fallback = ahead.length ? ahead : unread.slice(0, 1);
    picked.push(...fallback);
    if (picked.length >= TAKE) break;
  }

  const items = picked.slice(0, TAKE).map((p) => {
    const s = sourceById.get(p.sourceId);
    return {
      id: p.id,
      excerpt: `${p.text.slice(0, 140)}`,
      sequence: p.sequence,
      view: "passage" as const,
      slug: p.id,
      label: s?.title ?? "Passage",
      meta: [s ? s.sourceType.replace(/_/g, " ") : "", s?.year ?? ""].filter(Boolean).join(" · "),
    };
  });

  return NextResponse.json(
    { items, person: { slug: person.slug, name: person.name, kind: person.kind } },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
