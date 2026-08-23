import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Agent-run registry: AppConfig keys `ops:agent:<ts>` hold JSON run records.
// Register runs via scripts/ops-log-agent.ts (or POST from CI).
type AgentRun = {
  agent: string; task: string; startedAt: string; endedAt?: string;
  commit?: string; files?: number; added?: number; removed?: number;
  tests?: string; build?: string; typecheck?: string; summary?: string;
};

export default async function OpsAgents() {
  let runs: AgentRun[] = [];
  let err = false;
  try {
    const rows = await db.appConfig.findMany({
      where: { key: { startsWith: "ops:agent:" } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    runs = rows.map((r) => {
      try { return JSON.parse(r.value) as AgentRun; } catch { return { agent: "unknown", task: r.key, startedAt: r.createdAt.toISOString() }; }
    });
  } catch {
    err = true;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Agents — Z.ai run history</h1>
        <p className="ops-kicker mt-1">
          REGISTERED VIA AppConfig KV (ops:agent:*) · scripts/ops-log-agent.ts · lightweight, no telemetry platform
        </p>
      </div>
      {err && <p className="ops-fail text-sm">Database unreachable.</p>}
      {!err && runs.length === 0 && (
        <div className="ops-card text-xs text-[var(--ops-mute)]">
          No agent runs registered yet. Register with:
          <code className="ml-1">bun scripts/ops-log-agent.ts '{"{"}agent:"...", task:"...", commit:"..."{"}"}'</code>
        </div>
      )}
      {runs.length > 0 && (
        <div className="ops-card overflow-auto" style={{ maxHeight: 640 }}>
          <table className="ops-table">
            <thead>
              <tr><th>AGENT</th><th>TASK</th><th>START</th><th>COMMIT</th><th>FILES ±</th><th>TESTS</th><th>BUILD</th><th>SUMMARY</th></tr>
            </thead>
            <tbody>
              {runs.map((r, i) => (
                <tr key={i}>
                  <td className="font-semibold">{r.agent}</td>
                  <td>{r.task}</td>
                  <td className="text-[var(--ops-mute)]">{String(r.startedAt).slice(0, 19)}</td>
                  <td className="text-[var(--ops-mute)]">{r.commit ?? "—"}</td>
                  <td>{r.files ?? "—"} <span className="text-[var(--ops-mute)]">(+{r.added ?? 0}/−{r.removed ?? 0})</span></td>
                  <td className={r.tests === "PASS" ? "ops-pass" : ""}>{r.tests ?? "—"}</td>
                  <td className={r.build === "PASS" ? "ops-pass" : ""}>{r.build ?? "—"}</td>
                  <td className="text-[var(--ops-mute)]">{r.summary ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
