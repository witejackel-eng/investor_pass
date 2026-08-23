import { getIntegrity } from "@/lib/ops/integrity";

export const dynamic = "force-dynamic";

export default async function OpsIntegrity() {
  let results: Awaited<ReturnType<typeof getIntegrity>> = [];
  let err: string | null = null;
  try {
    results = await getIntegrity();
  } catch (e) {
    err = e instanceof Error ? e.message : "run failed";
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Integrity — §53 automated checks</h1>
        <p className="ops-kicker mt-1">RUN AGAINST LIVE DB · CACHED 10 MIN · POST ?force=1 VIA /api/ops/integrity TO RE-RUN</p>
      </div>
      {err && <p className="ops-fail text-sm">Integrity run failed: {err}</p>}
      <div className="ops-card overflow-auto" style={{ maxHeight: 620 }}>
        <table className="ops-table">
          <thead>
            <tr><th>CHECK</th><th>SEVERITY</th><th>STATUS</th><th>COUNT</th><th>DETAIL / SAMPLE</th></tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">{r.title}</td>
                <td className={r.severity === "FAIL" ? "ops-fail" : "ops-warn"}>{r.severity}</td>
                <td>
                  <span className={`ops-dot ${r.status === "PASS" ? "pass" : "fail"}`} aria-hidden />
                  {r.status}
                </td>
                <td className={r.count > 0 ? "font-bold" : ""}>{r.count}</td>
                <td className="text-[var(--ops-mute)]">
                  {r.detail}
                  {r.sample.length > 0 && (
                    <span className="block">samples: {r.sample.slice(0, 6).join(", ")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
