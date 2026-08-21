import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/investors/[slug]/timeline — year-by-year timeline
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await db.person.findUnique({ where: { slug } });
  if (!person) return error("Investor not found", 404);

  const user = await getSessionUser();
  const isPro = user?.entitlement === "pro";

  const sources = await db.source.findMany({
    where: { personId: person.id, year: { not: null } },
    orderBy: { year: "asc" },
    include: {
      passages: isPro
        ? {
            include: {
              passageThemes: { include: { theme: true } },
              passageCompanies: { include: { company: true } },
            },
          }
        : {
            where: { visibility: "public" },
            include: {
              passageThemes: { include: { theme: true } },
              passageCompanies: { include: { company: true } },
            },
          },
    },
  });

  const decisions = await db.decision.findMany({
    where: { personId: person.id },
    include: { company: true, event: true, source: true },
  });

  // Build timeline by year
  const yearMap = new Map<number, { year: number; sources: any[]; themes: string[]; companies: string[]; decisions: any[] }>();
  const ensure = (y: number) => {
    if (!yearMap.has(y)) yearMap.set(y, { year: y, sources: [], themes: [], companies: [], decisions: [] });
    return yearMap.get(y)!;
  };

  for (const s of sources) {
    if (s.year == null) continue;
    const entry = ensure(s.year);
    entry.sources.push({
      slug: s.slug,
      title: s.title,
      sourceType: s.sourceType,
      passageCount: s.passages.length,
    });
    for (const sp of s.passages) {
      for (const pt of sp.passageThemes) entry.themes.push(pt.theme.name);
      for (const pco of sp.passageCompanies) entry.companies.push(pco.company.name);
    }
  }
  for (const d of decisions) {
    if (!d.date) continue;
    const y = parseInt(d.date.slice(0, 4), 10);
    if (isNaN(y)) continue;
    ensure(y).decisions.push({
      title: d.title,
      date: d.date,
      description: d.description,
      company: d.company ? { slug: d.company.slug, name: d.company.name } : null,
      source: d.source ? { slug: d.source.slug, title: d.source.title } : null,
    });
  }

  const timeline = [...yearMap.values()]
    .map((e) => ({
      ...e,
      themes: [...new Set(e.themes)].slice(0, 8),
      companies: [...new Set(e.companies)].slice(0, 8),
    }))
    .sort((a, b) => a.year - b.year);

  return json({ timeline });
}
