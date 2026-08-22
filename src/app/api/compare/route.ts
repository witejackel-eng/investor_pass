import { db } from "@/lib/db";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

const tokenize = (q: string): string[] =>
  q.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/).filter((t) => t.length > 2);

// GET /api/compare?investors=buffett,marks&theme=moats&q=inflation
export async function GET(req: Request) {
  const url = new URL(req.url);
  const investorSlugs = (url.searchParams.get("investors") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const themeSlug = url.searchParams.get("theme") || undefined;
  const conceptSlug = url.searchParams.get("concept") || undefined;
  const q = (url.searchParams.get("q") || "").trim();

  if (investorSlugs.length < 2 || investorSlugs.length > 4)
    return error("Select between 2 and 4 investors", 400);
  if (!themeSlug && !conceptSlug && !q)
    return error("Provide q, theme, or concept", 400);

  const people = await db.person.findMany({
    where: { slug: { in: investorSlugs } },
    select: { id: true, slug: true, name: true },
  });
  if (people.length !== investorSlugs.length)
    return error("Unknown investor slug in list", 400);

  const tokens = tokenize(q);
  const whereBase: any[] = [];
  if (tokens.length) {
    whereBase.push({
      OR: tokens.flatMap((t) => [
        { text: { contains: t } },
        { source: { title: { contains: t } } },
      ]),
    });
  }
  if (themeSlug) whereBase.push({ passageThemes: { some: { theme: { slug: themeSlug } } } });
  if (conceptSlug) whereBase.push({ passageConcepts: { some: { concept: { slug: conceptSlug } } } });
  const whereAll = whereBase.length ? { AND: whereBase } : {};

  const columns = await Promise.all(
    people.map(async (p) => {
      const rows = await db.passage.findMany({
        where: { ...whereAll, source: { personId: p.id }, visibility: "public" },
        include: {
          source: { select: { slug: true, title: true, year: true, sourceType: true, publisher: true, url: true } },
          passageThemes: { include: { theme: true } },
          passageConcepts: { include: { concept: true } },
          passageCompanies: { include: { company: true } },
          passageEvents: { include: { event: true } },
        },
        orderBy: [{ source: { year: "asc" } }, { sequence: "asc" }],
        take: 40,
      });

      const themes = new Map<string, string>();
      const companies = new Map<string, string>();
      const conceptsM = new Map<string, string>();
      const eventsM = new Map<string, string>();
      for (const r of rows) {
        for (const pt of r.passageThemes) themes.set(pt.theme.slug, pt.theme.name);
        for (const pc of r.passageConcepts) conceptsM.set(pc.concept.slug, pc.concept.name);
        for (const pco of r.passageCompanies) companies.set(pco.company.slug, pco.company.name);
        for (const pe of r.passageEvents) eventsM.set(pe.event.slug, pe.event.name);
        if (!tokens.length && rows.indexOf(r) >= 6) break;
      }

      // spread of years engaged
      const years = [...new Set(rows.map((r) => r.source.year).filter((y): y is number => y != null))].sort();
      // pick up to 5 representative passages spanning time
      const picks: typeof rows = [];
      if (rows.length <= 5) picks.push(...rows);
      else {
        picks.push(rows[0]);
        picks.push(rows[Math.floor(rows.length * 0.33)]);
        picks.push(rows[Math.floor(rows.length * 0.66)]);
        picks.push(rows[rows.length - 1]);
      }
    
      return {
        investor: { slug: p.slug, name: p.name },
        total: rows.length,
        years,
        topTags: {
          themes: [...themes.entries()].slice(0, 8).map(([slug, name]) => ({ slug, name })),
          companies: [...companies.entries()].slice(0, 8).map(([slug, name]) => ({ slug, name })),
          concepts: [...conceptsM.entries()].slice(0, 6).map(([slug, name]) => ({ slug, name })),
          events: [...eventsM.entries()].slice(0, 5).map(([slug, name]) => ({ slug, name })),
        },
        passages: picks.map((r) => ({
          id: r.id,
          text: r.text.slice(0, 420),
          year: r.source.year,
          section: r.section,
          source: r.source,
        })),
      };
    })
  );

  // Shared vs distinct tags across columns
  const shared: Record<string, { slug: string; name: string }[]> = {};
  for (const kind of ["themes", "companies", "concepts", "events"] as const) {
    const key = (t: { slug: string }) => `${kind}:${t.slug}`;
    const counts = new Map<string, { n: number; name: string; slug: string }>();
    for (const col of columns)
      for (const t of col.topTags[kind]) {
        const k = key(t);
        const cur = counts.get(k);
        if (cur) cur.n++;
        else counts.set(k, { n: 1, name: t.name, slug: t.slug });
      }
    shared[kind] = [...counts.values()]
      .filter((v) => v.n >= Math.min(2, columns.length))
      .sort((a, b) => b.n - a.n)
      .map((v) => ({ slug: v.slug, name: v.name }));
  }

  return json({ columns, shared, query: { investors: investorSlugs, theme: themeSlug, concept: conceptSlug, q } });
}
