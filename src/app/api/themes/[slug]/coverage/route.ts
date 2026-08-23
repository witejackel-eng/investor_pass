/**
 * GET /api/themes/[slug]/coverage — per-investor indexed coverage for a theme.
 *
 * Powers the homepage cross-investor demo ("Search one idea. See who talks
 * about it."). Returns aggregate counts only — no passage content, so nothing
 * here can leak pro-gated material (counts follow the same rule as
 * /api/stats, which already publishes aggregate corpus totals).
 *
 * Cached at the edge; failures return 503 so the UI hides the demo rather
 * than show wrong numbers (honesty rule).
 */
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const theme = await db.theme.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, description: true },
    });
    if (!theme) return error("Theme not found", 404);

    const rows = await db.passageTheme.findMany({
      where: { themeId: theme.id },
      select: {
        passage: {
          select: {
            source: { select: { person: { select: { slug: true, name: true } } } },
          },
        },
      },
    });

    const byPerson = new Map<string, { slug: string; name: string; count: number }>();
    for (const r of rows) {
      const p = r.passage.source.person;
      if (!p) continue;
      const cur = byPerson.get(p.slug);
      if (cur) cur.count++;
      else byPerson.set(p.slug, { slug: p.slug, name: p.name, count: 1 });
    }

    const investors = [...byPerson.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );

    return json(
      {
        theme: { slug: theme.slug, name: theme.name, description: theme.description },
        total: rows.length,
        investors,
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    return error("Coverage unavailable", 503);
  }
}
