import { db } from "@/lib/db";
import { getIntegrity } from "@/lib/ops/integrity";
import { AckButton } from "../graph-clients";

export const dynamic = "force-dynamic";

export default async function OpsIssues() {
  let issues: { id: string; priority: string; title: string; count: number; detail: string; sample: string[]; ack: boolean }[] = [];
  let err = false;
  try {
    const results = await getIntegrity();
    const acks = await db.appConfig.findMany({ where: { key: { startsWith: "ops:ack:" } } });
    const ackSet = new Set(acks.map((a) => a.key.slice("ops:ack:".length)));
    issues = results
      .filter((r) => r.status === "ISSUES")
      .map((r) => ({
        id: r.id,
        priority: r.severity === "FAIL" ? "P0" : "P2",
        title: r.title,
        count: r.count,
        detail: r.detail,
        sample: r.sample,
        ack: ackSet.has(r.id),
      }));
  } catch {
    err = true;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Issues — central private feed</h1>
        <p className="ops-kicker mt-1">AUTO-SURFACED FROM INTEGRITY SCANS · P0 = RELEASE-BLOCKER CLASS · ACK IS THE ONLY MUTATION</p>
      </div>
      {err && <p className="ops-fail text-sm">Issue aggregation failed (DB unreachable).</p>}
      {!err && issues.length === 0 && <div className="ops-card ops-pass text-sm">No open integrity issues. §53 checks all PASS.</div>}
      {issues.length > 0 && (
        <div className="space-y-3">
          {issues.map((i) => (
            <div key={i.id} className="ops-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold">
                  <span className={i.priority === "P0" ? "ops-fail" : "ops-warn"}>{i.priority}</span>
                  {" · "}{i.title}
                  <span className="ml-2 ops-blue font-bold">×{i.count}</span>
                </p>
                <AckButton id={i.id} done={i.ack} />
              </div>
              <p className="mt-1 text-xs text-[var(--ops-mute)]">{i.detail}</p>
              {i.sample.length > 0 && (
                <p className="mt-1 text-[0.68rem] text-[var(--ops-mute)]">samples: {i.sample.slice(0, 8).join(" · ")}</p>
              )}
              <p className="mt-1 ops-kicker">area: data-integrity · next step: repair records or merge canonicals, then re-run /ops/integrity</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
