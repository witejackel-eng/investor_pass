import { RefreshChecks } from "../graph-clients";
import qa from "@/data/ops/qa-snapshot.json";

export const dynamic = "force-dynamic";

export default function OpsDeployments() {
  const snap = qa as Record<string, { status: string; at: string; detail: string }>;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Deployments & health</h1>
        <p className="ops-kicker mt-1">VERCEL AUTO-DEPLOYS main · LIVE ROUTE PROBES + COMMITTED QA SNAPSHOT</p>
      </div>
      <div className="ops-card text-xs">
        <p><b>Production origin:</b> https://investorpass.vercel.app (Vercel, ISR/SSG)</p>
        <p className="mt-1"><b>Control Room origin:</b> ops.investorpass.com → same deployment (CNAME; see docs/OPS_DASHBOARD.md)</p>
        <p className="mt-1"><b>QA snapshot:</b> build {snap.build?.status} · typecheck {snap.typecheck?.status} · tests {snap.tests?.status} · lint {snap.lint?.status} @ {String(snap.build?.at).slice(0, 19)}Z</p>
        <p className="mt-1 text-[var(--ops-mute)]">Serverless cannot run builds per-request — RUN CHECK below probes live routes; the snapshot records the last local gate.</p>
      </div>
      <RefreshChecks />
    </div>
  );
}
