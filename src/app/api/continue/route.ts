/**
 * GET /api/continue?person=<slug> — "Continue reading" feed.
 * Logged-in: next UNREAD passages per source for this person, ordered by
 * sequence — strictly excludes anything already in PassageProgress.
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
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const url = new URL(req.url);
  const personSlug = url.searchParams.get("person") || "buffett";

  const person = await db.person.findUnique({
    where: { slug: personSlug },
    select: { id: true },
  });
  if (!person) return NextResponse.json({ items: [] });

  const sources: SourceMeta[] = await db.source.findMany({
    where: { personId: person.id },
    select: { id: true, slug: true, title: true, year: true, sourceType: true },
  });
  const sourceIds = sources.map((s) => s.id);
  if (sourceIds.length === 0) return NextResponse.json({ items: [] });
  const sourceById = new Map(sources.map((s) => [s.id, s]));

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

  const candidates = await db.passage.findMany({
    where: {
      sourceId: { in: orderedSources },
      // Entitlement-aware: free users are only offered passages they can open.
      ...(user.entitlement === "pro" ? {} : { visibility: "public" }),
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
    { items },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
