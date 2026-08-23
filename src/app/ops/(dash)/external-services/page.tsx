export const dynamic = "force-dynamic";

type Svc = { name: string; status: "HEALTHY" | "WARNING" | "FAILED" | "UNKNOWN"; detail: string };

function envStatus(keys: string[]): { present: string[]; missing: string[] } {
  const present = keys.filter((k) => Boolean(process.env[k]));
  return { present, missing: keys.filter((k) => !process.env[k]) };
}

export default async function OpsExternalServices() {
  const services: Svc[] = [];

  // Database (live ping)
  try {
    const { db } = await import("@/lib/db");
    const n = await db.person.count();
    services.push({ name: "DATABASE (Supabase Postgres)", status: n >= 0 ? "HEALTHY" : "UNKNOWN", detail: "live query OK" });
  } catch (e) {
    services.push({ name: "DATABASE (Supabase Postgres)", status: "FAILED", detail: e instanceof Error ? e.message.slice(0, 100) : "unreachable" });
  }

  // Payments (config presence only — never values)
  const pay = envStatus(["RAZORPAY_KEY_ID", "RAZORPAY_PLAN_MONTHLY", "RAZORPAY_PLAN_ANNUAL", "PAYPAL_CLIENT_ID"]);
  services.push({
    name: "PAYMENTS (Razorpay / PayPal)",
    status: pay.present.length === 0 ? "WARNING" : pay.missing.length ? "WARNING" : "HEALTHY",
    detail: pay.present.length === 0
      ? "mock mode — plan dashboards pending $9/$79 setup (runbook: docs/payments-spec.md)"
      : `configured: ${pay.present.join(", ")}${pay.missing.length ? ` · missing: ${pay.missing.join(", ")}` : ""}`,
  });

  // Newsletter ESP
  const nl = envStatus(["NEWSLETTER_API_KEY"]);
  services.push({
    name: "NEWSLETTER ESP",
    status: nl.present.length === 0 ? "WARNING" : "HEALTHY",
    detail: nl.present.length === 0
      ? "subscribers captured in AppConfig KV — connect an ESP (Buttondown/Resend) to send"
      : "configured",
  });

  // GitHub
  try {
    const r = await fetch("https://api.github.com/repos/witejackel-eng/investor_pass", { next: { revalidate: 300 } });
    services.push({ name: "GITHUB (repo API)", status: r.ok ? "HEALTHY" : "WARNING", detail: `HTTP ${r.status}` });
  } catch {
    services.push({ name: "GITHUB (repo API)", status: "UNKNOWN", detail: "fetch failed" });
  }

  // Public site
  try {
    const r = await fetch("https://investorpass.vercel.app/api/stats", { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    services.push({ name: "PUBLIC SITE (vercel)", status: r.ok ? "HEALTHY" : "FAILED", detail: `/api/stats → ${r.status}` });
  } catch {
    services.push({ name: "PUBLIC SITE (vercel)", status: "UNKNOWN", detail: "probe failed" });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">External services — health only</h1>
        <p className="ops-kicker mt-1">CONFIG PRESENCE, NEVER VALUES · NO SECRETS RENDERED · CACHED PROBES</p>
      </div>
      <div className="ops-card">
        <table className="ops-table">
          <thead><tr><th>SERVICE</th><th>STATUS</th><th>DETAIL</th></tr></thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.name}>
                <td className="font-semibold">{s.name}</td>
                <td className={s.status === "HEALTHY" ? "ops-pass" : s.status === "WARNING" ? "ops-warn" : s.status === "FAILED" ? "ops-fail" : ""}>
                  <span className={`ops-dot ${s.status === "HEALTHY" ? "pass" : s.status === "WARNING" ? "warn" : s.status === "FAILED" ? "fail" : "unknown"}`} aria-hidden />
                  {s.status}
                </td>
                <td className="text-[var(--ops-mute)]">{s.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
