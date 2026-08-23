import { FEATURES } from "@/data/ops/registry";

export const dynamic = "force-dynamic";

const COLOR: Record<string, string> = {
  LIVE: "ops-pass", PARTIAL: "ops-warn", BROKEN: "ops-fail",
  NOT_BUILT: "", DEFERRED: "", UNKNOWN: "",
};

export default function OpsFeatures() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Features — status matrix</h1>
        <p className="ops-kicker mt-1">LIVE CLAIMED ONLY WHERE THE FULL FLOW IS VERIFIED · MIRRORS docs/FEATURE_MATRIX.md</p>
      </div>
      <div className="ops-card overflow-auto" style={{ maxHeight: 640 }}>
        <table className="ops-table">
          <thead>
            <tr><th>FEATURE</th><th>STATUS</th><th>ROUTE</th><th>DATA</th><th>API</th><th>NOTES</th></tr>
          </thead>
          <tbody>
            {FEATURES.map((f) => (
              <tr key={f.name}>
                <td className="font-semibold">{f.name}</td>
                <td className={COLOR[f.status] ?? ""}>{f.status}</td>
                <td className="text-[var(--ops-mute)]">{f.route}</td>
                <td className="text-[var(--ops-mute)]">{f.data}</td>
                <td className="text-[var(--ops-mute)]">{f.api}</td>
                <td className="text-[var(--ops-mute)]">{f.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
