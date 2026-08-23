import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// /ops/data — 31 investors × real counts, computed with FOUR grouped queries
// total (pooler-safe: Supabase session mode caps at 15 clients).
export default async function OpsData() {
  let rows: {
    name: string; slug: string; sources: number; insights: number; themes: number;
    companies: number; events: number; decisions: number; verified: number;
  }[] = [];
  let err = false;
  try {
    const people = await db.person.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, slug: true } });
    const idBy = new Map(people.map((p) => [p.id, p]));

    // Sequential on purpose (Supabase session-mode pool cap = 15).
    const srcBy = await db.source.groupBy({ by: ["personId"], _count: { _all: true } });
    const passageRows = await db.passage.groupBy({ by: ["sourceId"], _count: { _all: true } });
    const srcs = await db.source.findMany({ select: { id: true, personId: true } });
    const s2p = new Map(srcs.map((x) => [x.id, x.personId]));
    const insBy = new Map<string, number>();
    for (const r of passageRows) {
      const pid = s2p.get(r.sourceId);
      if (pid) insBy.set(pid, (insBy.get(pid) ?? 0) + r._count._all);
    }
    const decBy = await db.decision.groupBy({ by: ["personId"], _count: { _all: true } });
    const verBy = await db.decision.groupBy({ by: ["personId"], where: { verified: true }, _count: { _all: true } });

    // Distinct-entity coverage via three grouped raw queries (one per junction)
    const q = async (table: string, col: string) => {
      const r = await db.$queryRawUnsafe<{ personId: string; n: number }[]>(
        `SELECT s."personId" AS "personId", COUNT(DISTINCT t."${col}")::int AS n
         FROM "${table}" t JOIN "Passage" p ON t."passageId" = p."id"
         JOIN "Source" s ON p."sourceId" = s."id"
         GROUP BY s."personId"`
      );
      return new Map(r.map((x) => [x.personId, Number(x.n)]));
    };
    const themes = await q("PassageTheme", "themeId");
    const comps = await q("PassageCompany", "companyId");
    const evs = await q("PassageEvent", "eventId");

    rows = people.map((p) => ({
      name: p.name, slug: p.slug,
      sources: srcBy.find((r) => r.personId === p.id)?._count._all ?? 0,
      insights: insBy.get(p.id) ?? 0,
      themes: themes.get(p.id) ?? 0,
      companies: comps.get(p.id) ?? 0,
      events: evs.get(p.id) ?? 0,
      decisions: decBy.find((r) => r.personId === p.id)?._count._all ?? 0,
      verified: verBy.find((r) => r.personId === p.id)?._count._all ?? 0,
    }));
  } catch {
    err = true;
  }

  // Paraphrase-length profile (single round-trip; pooler discipline)
  let lengthStats: { total: number; avg: number; p50: number; thin: number } | null = null;
  try {
    const r = await db.$queryRawUnsafe<Record<string, unknown>[]>(`
      SELECT COUNT(*)::int AS total,
             ROUND(AVG(LENGTH(text))::numeric)::int AS avg,
             PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY LENGTH(text))::int AS p50,
             COUNT(*) FILTER (WHERE LENGTH(text) < 240)::int AS thin
      FROM "Passage" WHERE "verificationState" NOT IN ('needs_review','rejected')
    `);
    const row = r[0] as Record<string, number>;
    lengthStats = { total: Number(row.total), avg: Number(row.avg), p50: Number(row.p50), thin: Number(row.thin) };
  } catch (e) { lengthStats = null; console.error("[ops] length stats failed:", e instanceof Error ? e.message : e); }

  const grade = (insights: number) =>
    insights >= 250 ? { g: "CORE", c: "ops-pass" } : insights >= 40 ? { g: "ACTIVE", c: "ops-blue" } : insights >= 10 ? { g: "DEVELOPING", c: "ops-warn" } : { g: "DISCOVERY", c: "ops-warn" };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Data — 31-investor completeness</h1>
        <p className="ops-kicker mt-1">REAL COUNTS · GRADES MEASURE DATA COMPLETENESS, NOT INVESTOR QUALITY (§76)</p>
      </div>

      {lengthStats && (
        <div className="ops-card">
          <p className="ops-kicker mb-2">PARAPHRASE DEPTH — research-unit length profile</p>
          <p className="text-xs">
            {lengthStats.total.toLocaleString()} units · avg <b>{lengthStats.avg}</b> chars · median <b>{lengthStats.p50}</b> chars ·
            thin (&lt;240) <b className="ops-warn">{lengthStats.thin.toLocaleString()}</b> ({Math.round((lengthStats.thin / Math.max(1, lengthStats.total)) * 100)}%)
          </p>
          <p className="mt-1 text-[0.68rem] text-[var(--ops-mute)]">
            Expand via scripts/expand-paraphrases.ts (adjacent-unit merges, review-gated) · compress losslessly via scripts/db/compress-text.ts
          </p>
        </div>
      )}
      {err && <p className="ops-fail text-sm">Database unreachable.</p>}
      {!err && (
        <div className="ops-card overflow-auto" style={{ maxHeight: 640 }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th>INVESTOR</th><th>GRADE</th><th>SOURCES</th><th>INSIGHTS</th><th>THEMES</th>
                <th>COMPANIES</th><th>EVENTS</th><th>POSITION ACTIONS</th><th>VERIFIED</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const { g, c } = grade(r.insights);
                return (
                  <tr key={r.slug}>
                    <td className="font-semibold">{r.name}</td>
                    <td className={c}>{g}</td>
                    <td>{r.sources}</td><td>{r.insights.toLocaleString()}</td><td>{r.themes}</td>
                    <td>{r.companies}</td><td>{r.events}</td><td>{r.decisions}</td><td>{r.verified}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
