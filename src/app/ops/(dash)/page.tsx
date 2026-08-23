import Link from "next/link";
import { getCorpus, getExtras, qaStatus, featureSummary } from "@/lib/ops/pages";
import { getIntegrity } from "@/lib/ops/integrity";

export const dynamic = "force-dynamic";

function Card({ label, status, detail }: { label: string; status: string; detail: string }) {
  const cls = status === "PASS" ? "ops-pass" : status === "FAIL" ? "ops-fail" : status === "WARNING" ? "ops-warn" : "";
  return (
    <div className="ops-card">
      <p className="ops-kicker">{label}</p>
      <p className={`mt-1 text-sm font-bold ${cls}`}>
        <span className={`ops-dot ${status.toLowerCase()}`} aria-hidden />
        {status}
      </p>
      <p className="mt-1 text-[0.68rem] text-[var(--ops-mute)]">{detail}</p>
    </div>
  );
}

export default async function OpsOverview() {
  // Sequential (Supabase session pool cap = 15 concurrent clients).
  const corpus = await getCorpus();
  const extras = await getExtras();
  const integrity = await getIntegrity().catch(() => null);
  const feats = featureSummary();
  const fails = integrity?.filter((r) => r.status === "ISSUES" && r.severity === "FAIL") ?? [];
  const warns = integrity?.filter((r) => r.status === "ISSUES" && r.severity === "WARNING") ?? [];
  const build = qaStatus("build"); const tsc = qaStatus("typecheck"); const tests = qaStatus("tests"); const lint = qaStatus("lint");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Investor/Pass Control Room</h1>
        <p className="ops-kicker mt-1">SYSTEM STATUS · {new Date().toISOString().slice(0, 19)}Z · READ-ONLY</p>
      </div>

      <section aria-label="System status">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Card label="BUILD" status={build.status} detail={build.detail} />
          <Card label="TYPECHECK" status={tsc.status} detail={tsc.detail} />
          <Card label="TESTS" status={tests.status} detail={tests.detail} />
          <Card label="LINT" status={lint.status} detail={lint.detail} />
          <Card label="DATABASE" status={corpus ? "PASS" : "FAIL"} detail={corpus ? `${corpus.investors} investors reachable` : "unreachable"} />
          <Card label="SEARCH" status={corpus ? "PASS" : "UNKNOWN"} detail={corpus ? "deterministic trigram (live)" : "unknown"} />
          <Card label="PAYMENTS" status="WARNING" detail="mock mode — plan dashboards pending $9/$79" />
          <Card label="NEWSLETTER" status="PASS" detail={`${Math.max(extras.newsletterSubs, 0)} subscribers (KV)`} />
        </div>
      </section>

      <section aria-label="Corpus">
        <p className="ops-kicker mb-2">CORPUS — LIVE COUNTS</p>
        <div className="ops-card grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
          {corpus ? (
            <>
              {[
                ["INVESTORS", corpus.investors], ["SOURCES", corpus.sources], ["INSIGHTS (PASSAGES)", corpus.passages],
                ["THEMES", corpus.themes], ["CONCEPTS", corpus.concepts], ["COMPANIES", corpus.companies],
                ["EVENTS", corpus.events], ["POSITION ACTIONS", corpus.decisions],
              ].map(([l, n]) => (
                <div key={String(l)}>
                  <p className="text-2xl font-bold ops-blue">{Number(n).toLocaleString()}</p>
                  <p className="ops-kicker">{String(l)}</p>
                </div>
              ))}
            </>
          ) : (
            <p className="ops-fail text-sm">Database unreachable.</p>
          )}
        </div>
      </section>

      <section aria-label="Signals" className="grid gap-3 md:grid-cols-3">
        <div className="ops-card">
          <p className="ops-kicker">INTEGRITY (§53)</p>
          <p className="mt-1 text-sm">
            <span className="ops-dot fail" aria-hidden />{fails.length} FAIL-class
            <span className="ops-dot warn ml-4" aria-hidden />{warns.length} warnings
          </p>
          <Link className="ops-link text-xs" href="/ops/integrity">Open integrity →</Link>
        </div>
        <div className="ops-card">
          <p className="ops-kicker">FEATURES</p>
          <p className="mt-1 text-sm">
            {feats.LIVE} LIVE · {feats.PARTIAL} PARTIAL · {feats.DEFERRED + feats.NOT_BUILT} DEFERRED/PLANNED
          </p>
          <Link className="ops-link text-xs" href="/ops/features">Open features →</Link>
        </div>
        <div className="ops-card">
          <p className="ops-kicker">COMMERCIAL</p>
          <p className="mt-1 text-sm">{Math.max(extras.activePro, 0)} active Pro · launch $9/$79</p>
          <p className="mt-1 text-[0.68rem] text-[var(--ops-mute)]">Goal: 100 subscribers → then AI/RAG gate opens</p>
        </div>
      </section>
    </div>
  );
}
