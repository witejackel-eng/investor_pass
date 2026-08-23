import { ROUTES } from "@/data/ops/registry";

export const dynamic = "force-dynamic";

export default function OpsRoutes() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Routes — connection inventory</h1>
        <p className="ops-kicker mt-1">URL → PAGE → COMPONENT → DATA → API CHAINS · MIRRORS docs/ROUTES.md</p>
      </div>
      <div className="ops-card overflow-auto" style={{ maxHeight: 640 }}>
        <table className="ops-table">
          <thead>
            <tr><th>URL</th><th>PAGE</th><th>AUTH</th><th>COMPONENT</th><th>DATA → API CHAIN</th></tr>
          </thead>
          <tbody>
            {ROUTES.map((r) => (
              <tr key={r.url}>
                <td className="font-semibold">{r.url}</td>
                <td>{r.page}</td>
                <td className={r.auth === "public" ? "ops-pass" : "ops-blue"}>{r.auth}</td>
                <td className="text-[var(--ops-mute)]">{r.component}</td>
                <td className="text-[var(--ops-mute)]">{r.data} → {r.api}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
