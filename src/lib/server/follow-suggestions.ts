/**
 * Follow-graph co-occurrence suggestions ("readers of X also follow Y").
 * Public-safe: never returns or leaks userIds. Aggregates over the capped
 * set of users who follow the anchor entity, ranks their other follows of
 * kind "person" and "topic" by count, excludes entities the viewer already
 * follows, and resolves display labels (stored label → canonical name).
 */
import { db } from "@/lib/db";

export const ENTITY_KINDS = ["person", "topic", "concept", "company", "event", "source", "search"] as const;

/** Kinds we suggest across. Cross-kind is the interesting signal. */
const SUGGESTABLE_KINDS = ["person", "topic"];

/** Cap the seed user list so aggregation stays cheap on a cold graph. */
const MAX_SEED_USERS = 500;

export type FollowSuggestion = {
  entityType: string;
  entityId: string;
  label: string;
  count: number;
};

const keyOf = (entityType: string, entityId: string) => `${entityType}:${entityId}`;

export async function getFollowSuggestions(
  entityType: string,
  entityId: string,
  viewerUserId?: string | null,
  limit = 5
): Promise<FollowSuggestion[]> {
  try {
    if (!ENTITY_KINDS.includes(entityType as any) || !entityId) return [];
    const take = Math.max(1, Math.min(10, Math.floor(limit)));

    // 1. Seed cohort — users who follow this exact entity (capped).
    const seeds = await db.follow.findMany({
      where: { entityType, entityId },
      select: { userId: true },
      take: MAX_SEED_USERS,
    });
    if (seeds.length === 0) return [];
    const seedUserIds = seeds.map((s) => s.userId);

    // 2. Rank their other person/topic follows by co-occurrence count.
    const grouped = await db.follow.groupBy({
      by: ["entityType", "entityId"],
      where: {
        userId: { in: seedUserIds },
        entityType: { in: SUGGESTABLE_KINDS },
        NOT: [
          { entityType, entityId }, // the anchor itself
          ...(viewerUserId ? [{ userId: viewerUserId }] : []), // anything the viewer already follows
        ],
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      // Overfetch: some rows drop out at label-resolution time.
      take: take * 4,
    });
    if (grouped.length === 0) return [];

    // Deterministic order: count desc, then key asc for stable ties.
    const ranked = [...grouped].sort(
      (a, b) =>
        b._count.id - a._count.id ||
        keyOf(a.entityType, a.entityId).localeCompare(keyOf(b.entityType, b.entityId))
    );

    // 3. Labels — prefer the denormalized follow.label, else canonical names.
    const storedLabels = new Map<string, string>();
    const labelRows = await db.follow.findMany({
      where: {
        OR: ranked.map((r) => ({ entityType: r.entityType, entityId: r.entityId })),
      },
      select: { entityType: true, entityId: true, label: true },
    });
    for (const row of labelRows) {
      if (row.label && !storedLabels.has(keyOf(row.entityType, row.entityId))) {
        storedLabels.set(keyOf(row.entityType, row.entityId), row.label);
      }
    }

    const slugsOfKind = (kind: string) =>
      ranked.filter((r) => r.entityType === kind).map((r) => r.entityId);

    const [persons, themes, companies] = await Promise.all([
      db.person.findMany({ where: { slug: { in: slugsOfKind("person") } }, select: { slug: true, name: true } }),
      db.theme.findMany({ where: { slug: { in: slugsOfKind("topic") } }, select: { slug: true, name: true } }),
      db.company.findMany({ where: { slug: { in: slugsOfKind("company") } }, select: { slug: true, name: true } }),
    ]);
    const canonicalNames = new Map<string, string>();
    for (const p of persons) canonicalNames.set(keyOf("person", p.slug), p.name);
    for (const t of themes) canonicalNames.set(keyOf("topic", t.slug), t.name);
    for (const c of companies) canonicalNames.set(keyOf("company", c.slug), c.name);

    // 4. Assemble; drop rows with no resolvable display name.
    const out: FollowSuggestion[] = [];
    for (const r of ranked) {
      const k = keyOf(r.entityType, r.entityId);
      const label = storedLabels.get(k) ?? canonicalNames.get(k);
      if (!label) continue;
      out.push({ entityType: r.entityType, entityId: r.entityId, label, count: r._count.id });
      if (out.length >= take) break;
    }
    return out;
  } catch {
    // Suggestions are decorative — fail quiet and empty, never throw into a page render.
    return [];
  }
}
