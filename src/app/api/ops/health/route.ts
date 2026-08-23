/**
 * GET /api/ops/health?run=<id> — health-check engine. Live checks are
 * cached 5 minutes; run=1 forces re-run of a specific check. Build/
 * typecheck/tests read the committed QA snapshot (.ops-qa.json), since
 * serverless cannot compile the app per-request.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import qa from "@/data/ops/qa-snapshot.json";

export const dynamic = "force-dynamic";

type Status = "PASS" | "WARNING" | "FAIL" | "UNKNOWN";
type Check = { id: string; label: string; status: Status; detail: string; at: string };

const cache = new Map<string, { at: number; check: Check }>();
const TTL = 5 * 60_000;

async function database(): Promise<Check> {
  const at = new Date().toISOString();
  try {
    const n = await db.person.count();
    return { id: "database", label: "DATABASE", status: n > 0 ? "PASS" : "FAIL", detail: `${n} persons reachable`, at };
  } catch (e) {
    return { id: "database", label: "DATABASE", status: "FAIL", detail: e instanceof Error ? e.message.slice(0, 120) : "unreachable", at };
  }
}

async function apiRoute(path: string, label: string): Promise<Check> {
  const at = new Date().toISOString();
  try {
    const base = process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app";
    const r = await fetch(`${base}${path}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    return { id: label.toLowerCase().replace(/\s+/g, "-"), label, status: r.ok ? "PASS" : "FAIL", detail: `${path} → ${r.status}`, at };
  } catch (e) {
    return { id: label.toLowerCase().replace(/\s+/g, "-"), label, status: "UNKNOWN", detail: e instanceof Error ? e.message.slice(0, 120) : "fetch failed", at };
  }
}

async function searchCheck(): Promise<Check> {
  const c = await apiRoute("/api/search?q=risk", "SEARCH");
  try {
    const base = process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app";
    const r = await fetch(`${base}/api/search?q=risk`, { cache: "no-store" });
    const d = (await r.json()) as { total?: number };
    return { ...c, detail: `q=risk → ${r.status}, total=${d.total ?? "?"}` };
  } catch {
    return c;
  }
}

function snapshotCheck(key: "build" | "typecheck" | "tests" | "lint"): Check {
  const s = (qa as Record<string, { status: string; at: string; detail: string }>)[key];
  return {
    id: key,
    label: key.toUpperCase(),
    status: s?.status === "PASS" ? "PASS" : s?.status ? (s.status as Status) : "UNKNOWN",
    detail: s?.detail ?? "no snapshot — run scripts/ops-qa-snapshot.ts",
    at: s?.at ?? "never",
  };
}

function envCheck(id: string, label: string, keys: string[]): Check {
  const present = keys.filter((k) => Boolean(process.env[k]));
  const at = new Date().toISOString();
  if (present.length === keys.length) return { id, label, status: "PASS", detail: "configured", at };
  if (present.length === 0)
    return { id, label, status: "WARNING", detail: `not configured (${keys.join(", ")}) — mock/deferred mode`, at };
  return { id, label, status: "WARNING", detail: `partially configured: ${present.join(", ")}`, at };
}

export async function GET(req: Request) {
  const run = new URL(req.url).searchParams.get("run");
  const makers: Record<string, () => Promise<Check> | Check> = {
    build: () => snapshotCheck("build"),
    typecheck: () => snapshotCheck("typecheck"),
    tests: () => snapshotCheck("tests"),
    lint: () => snapshotCheck("lint"),
    database,
    search: searchCheck,
    search_route: () => apiRoute("/#/view=search", "SEARCH ROUTE"),
    stats: () => apiRoute("/api/stats", "STATS API"),
    coverage: () => apiRoute("/api/themes/risk-management/coverage", "COVERAGE API"),
    trails: () => apiRoute("/api/trails", "TRAILS API"),
    auth: () => apiRoute("/api/me", "AUTH API"),
    payments: () => envCheck("payments", "PAYMENTS", ["RAZORPAY_KEY_ID", "RAZORPAY_PLAN_MONTHLY"]),
    newsletter: () => envCheck("newsletter", "NEWSLETTER ESP", ["NEWSLETTER_API_KEY"]),
  };

  const ids = run ? [run] : Object.keys(makers);
  const out: Check[] = [];
  for (const id of ids) {
    if (!makers[id]) continue;
    const hit = cache.get(id);
    if (!run && hit && Date.now() - hit.at < TTL) {
      out.push(hit.check);
      continue;
    }
    try {
      const check = await makers[id]();
      cache.set(id, { at: Date.now(), check });
      out.push(check);
    } catch {
      out.push({ id, label: id.toUpperCase(), status: "UNKNOWN", detail: "check threw", at: new Date().toISOString() });
    }
  }
  return NextResponse.json({ checks: out }, { headers: { "Cache-Control": "no-store" } });
}
