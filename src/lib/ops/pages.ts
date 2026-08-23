import { db } from "@/lib/db";
import { FEATURES } from "@/data/ops/registry";
import qa from "@/data/ops/qa-snapshot.json";

export type Corpus = {
  passages: number; sources: number; investors: number; themes: number;
  concepts: number; companies: number; events: number; decisions: number;
};

export async function getCorpus(): Promise<Corpus | null> {
  try {
    const [passages, sources, investors, themes, concepts, companies, events, decisions, subs, pro] =
      await Promise.all([
        db.passage.count(), db.source.count(),
        db.person.count({ where: { status: "active" } }),
        db.theme.count(), db.concept.count(), db.company.count(),
        db.event.count(), db.decision.count(),
        db.appConfig.count({ where: { key: { startsWith: "newsletter:" } } }),
        db.subscription.count({ where: { state: "active" } }),
      ]);
    return { passages, sources, investors, themes, concepts, companies, events, decisions };
  } catch {
    return null;
  }
}

export async function getExtras(): Promise<{ newsletterSubs: number; activePro: number; live: boolean }> {
  try {
    const [newsletterSubs, activePro] = await Promise.all([
      db.appConfig.count({ where: { key: { startsWith: "newsletter:" } } }),
      db.subscription.count({ where: { state: "active" } }),
    ]);
    return { newsletterSubs, activePro, live: true };
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
