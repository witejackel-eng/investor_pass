import Link from "next/link";
import { LogoutButton } from "../client";

const NAV = [
  ["/ops", "OVERVIEW"],
  ["/ops/architecture", "ARCHITECTURE"],
  ["/ops/evidence-graph", "EVIDENCE GRAPH"],
  ["/ops/data", "DATA"],
  ["/ops/integrity", "INTEGRITY"],
  ["/ops/features", "FEATURES"],
  ["/ops/routes", "ROUTES"],
  ["/ops/agents", "AGENTS"],
  ["/ops/changes", "CHANGES"],
  ["/ops/deployments", "DEPLOYMENTS"],
  ["/ops/external-services", "EXTERNAL SERVICES"],
  ["/ops/issues", "ISSUES"],
  ["/ops/docs", "DOCS"],
] as const;

export default function OpsDashLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-[var(--ops-ink)]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-[0.95rem] font-bold tracking-tight">INVESTOR/PASS <span className="ops-blue">CONTROL ROOM</span></span>
            <span className="ops-kicker">PRIVATE · INTERNAL OPS</span>
          </div>
          <LogoutButton />
        </div>
        <nav className="mx-auto flex max-w-[1400px] flex-wrap gap-x-4 gap-y-1 px-5 pb-2 text-[0.7rem] font-semibold" aria-label="Control Room">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-[var(--ops-blue)]">
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1400px] px-5 py-6">{children}</main>
      <footer className="mx-auto max-w-[1400px] px-5 py-6 ops-kicker">
        READ-ONLY CONTROL ROOM · no destructive actions · live production DB
      </footer>
    </>
  );
}
