import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// /ops/data — all 31 investors with REAL per-investor counts.
export default async function OpsData() {
  let rows: {
    name: string; slug: string; sources: number; insights: number; themes: number;
    companies: number; events: number; decisions: number; verified: number;
  }[] = [];
  let err = false;
  try {
    const people = await db.person.findMany({ orderBy: { sortOrder: "asc" } });
    rows = await Promise.all(
      people.map(async (p) => {
        const sources = await db.source.count({ where: { personId: p.id } });
        const srcIds = sources;
        const insights = await db.passage.count({ where: { source: { personId: p.id } } });
        const themeRows = await db.passageTheme.findMany({
          where: { passage: { source: { personId: p.id } } },
          select: { themeId: true },
        });
        const compRows = await db.passageCompany.findMany({
          where: { passage: { source: { personId: p.id } } },
          select: { companyId: true },
        });
        const evRows = await db.passageEvent.findMany({
          where: { passage: { source: { personId: p.id } } },
          select: { eventId: true },
        });
        const decisions = await db.decision.count({ where: { personId: p.id } });
        const verified = await db.decision.count({ where: { personId: p.id, verified: true } });
        return {
          name: p.name, slug: p.slug, sources,
          insights,
          themes: new Set(themeRows.map((t) => t.themeId)).size,
          companies: new Set(compRows.map((c) => c.companyId)).size,
          events: new Set(evRows.map((e) => e.eventId)).size,
          decisions, verified,
        };
      })
    );
  } catch {
    err = true;
  }

  const grade = (insights: number) =>
    insights >= 250 ? { g: "CORE", c: "ops-pass" } : insights >= 40 ? { g: "ACTIVE", c: "ops-blue" } : insights >= 10 ? { g: "DEVELOPING", c: "ops-warn" } : { g: "DISCOVERY", c: "ops-warn" };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Data — 31-investor completeness</h1>
        <p className="ops-kicker mt-1">REAL COUNTS · GRADES MEASURE DATA COMPLETENESS, NOT INVESTOR QUALITY (§76)</p>
      </div>
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
