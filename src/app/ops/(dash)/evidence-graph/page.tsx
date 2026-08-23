import { EvidenceGraphBrowser } from "../graph-clients";

export const dynamic = "force-dynamic";

export default function OpsEvidenceGraph() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Evidence graph — the research data</h1>
        <p className="ops-kicker mt-1">
          LIVE DOMAIN GRAPH: INVESTOR → SOURCE → INSIGHT → THEME/COMPANY/EVENT → POSITION ACTION → OUTCOME
        </p>
        <p className="mt-2 text-xs text-[var(--ops-mute)]">
          This is the PRODUCTION research graph (Postgres), not the software graph. Internal ids are shown here
          because this dashboard is private. Example: search <b>buffett</b> or <b>coca-cola</b> — the 1988 chain
          renders as DOCUMENTED → TARGETS → RESULTED_IN.
        </p>
      </div>
      <EvidenceGraphBrowser />
    </div>
  );
}
