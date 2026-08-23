import { db } from "@/lib/db";
import { FEATURES } from "@/data/ops/registry";
import qa from "@/data/ops/qa-snapshot.json";

/**
 * Control Room page data — ONE raw query per view (pooler-safe: Supabase
 * session mode caps at 15 clients; parallel Prisma calls each hold one).
 */
export type Corpus = {
  passages: number; sources: number; investors: number; themes: number;
  concepts: number; companies: number; events: number; decisions: number;
};

export async function getCorpus(): Promise<Corpus | null> {
  try {
    const rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(`
      SELECT
        (SELECT COUNT(*)::int FROM "Passage") AS passages,
        (SELECT COUNT(*)::int FROM "Source") AS sources,
        (SELECT COUNT(*)::int FROM "Person" WHERE status = 'active') AS investors,
        (SELECT COUNT(*)::int FROM "Theme") AS themes,
        (SELECT COUNT(*)::int FROM "Concept") AS concepts,
        (SELECT COUNT(*)::int FROM "Company") AS companies,
        (SELECT COUNT(*)::int FROM "Event") AS events,
        (SELECT COUNT(*)::int FROM "Decision") AS decisions
    `);
    const c = rows[0] as Record<string, number>;
    return {
      passages: Number(c.passages), sources: Number(c.sources), investors: Number(c.investors),
      themes: Number(c.themes), concepts: Number(c.concepts), companies: Number(c.companies),
      events: Number(c.events), decisions: Number(c.decisions),
    };
  } catch {
    return null;
  }
}

export async function getExtras(): Promise<{ newsletterSubs: number; activePro: number; live: boolean }> {
  try {
    const rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(`
      SELECT
        (SELECT COUNT(*)::int FROM "AppConfig" WHERE key LIKE 'newsletter:%') AS subs,
        (SELECT COUNT(*)::int FROM "Subscription" WHERE state = 'active') AS pro
    `);
    const r = rows[0] as Record<string, number>;
    return { newsletterSubs: Number(r.subs), activePro: Number(r.pro), live: true };
  } catch {
    return { newsletterSubs: -1, activePro: -1, live: false };
  }
}

export function qaStatus(key: string): { status: string; at: string; detail: string } {
  const s = (qa as Record<string, { status: string; at: string; detail: string }>)[key];
  return s ?? { status: "UNKNOWN", at: "never", detail: "no snapshot" };
}

export function featureSummary() {
  const counts = { LIVE: 0, PARTIAL: 0, DEFERRED: 0, NOT_BUILT: 0, BROKEN: 0, UNKNOWN: 0 } as Record<string, number>;
  for (const f of FEATURES) counts[f.status]++;
  return counts;
}
