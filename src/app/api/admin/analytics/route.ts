import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/admin/analytics — admin-only product analytics derived from the
// append-only SearchEvent table. Same guard style as /api/admin/import.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);
  if (user.role !== "admin") return error("Admin access required", 403);

  const now = Date.now();
  const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const since14 = new Date(now - 13 * 24 * 60 * 60 * 1000);

  try {
    // One scan covers totals, top queries, zero-result rate, and daily counts.
    const [grouped, searchRows, errors] = await Promise.all([
      db.searchEvent.groupBy({
        by: ["name"],
        _count: { _all: true },
        where: { createdAt: { gte: since30 } },
        orderBy: { _count: { name: "desc" } },
      }),
      db.searchEvent.findMany({
        where: { createdAt: { gte: since30 }, name: { startsWith: "search" }, NOT: { props: null } },
        select: { props: true, createdAt: true },
      }),
      db.searchEvent.findMany({
        where: { name: "client_error" },
        orderBy: { createdAt: "desc" },
        take: 25,
        select: { props: true, createdAt: true },
      }),
    ]);

    const totals = grouped.map((g) => ({ name: g.name, count: g._count._all }));

    // Top search queries — props carry { q, filters } (see views-product.tsx).
    const queryCounts = new Map<string, number>();
    let withResults = 0;
    let zeroResults = 0;
    const daily = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(since14.getTime() + i * 24 * 60 * 60 * 1000);
      daily.set(d.toISOString().slice(0, 10), 0);
    }

    for (const row of searchRows) {
      if (row.createdAt >= since14) {
        const key = row.createdAt.toISOString().slice(0, 10);
        daily.set(key, (daily.get(key) || 0) + 1);
      }
      let q = "";
      let results: unknown;
      try {
        const p = JSON.parse(row.props as string) as { q?: unknown; results?: unknown; resultCount?: unknown };
        q = typeof p.q === "string" ? p.q.trim() : "";
        results = p.results ?? p.resultCount;
      } catch {
        continue;
      }
      if (q) queryCounts.set(q, (queryCounts.get(q) || 0) + 1);
      if (typeof results === "number" && Number.isFinite(results)) {
        withResults++;
        if (results === 0) zeroResults++;
      }
    }

    const topQueries = [...queryCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));

    const dailySearches = [...daily.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    const clientErrors = errors.map((e) => {
      let message = "[unparsed]";
      let stack: string | undefined;
      let url: string | undefined;
      try {
        const p = JSON.parse(e.props as string) as { message?: string; stack?: string; url?: string };
        message = p.message ?? message;
        stack = p.stack;
        url = p.url;
      } catch {}
      return { createdAt: e.createdAt.toISOString(), message, stack, url };
    });

    return json({
      totals,
      topQueries,
      zeroResults: {
        total: searchRows.length,
        measured: withResults,
        zero: zeroResults,
        // Honest null when no event carries a result count yet.
        rate: withResults > 0 ? zeroResults / withResults : null,
      },
      dailySearches,
      clientErrors,
    });
  } catch {
    return error("Analytics unavailable", 500);
  }
}
