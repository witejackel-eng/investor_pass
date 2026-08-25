import { db } from "@/lib/db";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

const tokenize = (q: string): string[] =>
  q.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/).filter((t) => t.length > 2);

// GET /api/compare?investors=buffett,marks&theme=moats&q=inflation
// Compare 2-6 people (investors AND founders) on a topic: shared ground,
// per-person columns with passages + decisions, unique-vs-shared tag split,
// and year-by-year coverage for the timeline view.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const investorSlugs = (url.searchParams.get("investors") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const themeSlug = url.searchParams.get("theme") || undefined;
  const conceptSlug = url.searchParams.get("concept") || undefined;
  const q = (url.searchParams.get("q") || "").trim();

  if (investorSlugs.length < 2 || investorSlugs.length > 6)
    return error("Select between 2 and 6 people", 400);
  if (!themeSlug && !conceptSlug && !q)
    return error("Provide q, theme, or concept", 400);

  const people = await db.person.findMany({
    where: { slug: { in: investorSlugs } },
    select: { id: true, slug: true, name: true, kind: true, region: true },
  });
  if (people.length !== investorSlugs.length)
    return error("Unknown person slug in list", 400);

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
      const personScope = { ...whereAll, source: { personId: p.id }, visibility: "public" } as any;

      // True matching total (rows below are capped for payload size).
      const total = await db.passage.count({ where: personScope });

      const rows = await db.passage.findMany({
        where: personScope,
        include: {
          source: { select: { slug: true, title: true, year: true, sourceType: true, publisher: true, url: true } },
          passageThemes: { include: { theme: true } },
          passageConcepts: { include: { concept: true } },
          passageCompanies: { include: { company: true } },
          passageEvents: { include: { event: true } },
        },
        orderBy: [{ source: { year: "asc" } }, { sequence: "asc" }],
        take: 120,
      });

      const themes = new Map<string, number>();
      const companies = new Map<string, number>();
      const conceptsM = new Map<string, number>();
      const eventsM = new Map<string, number>();
      for (const r of rows) {
        for (const pt of r.passageThemes) themes.set(pt.theme.slug, (themes.get(pt.theme.slug) ?? 0) + 1);
        for (const pc of r.passageConcepts) conceptsM.set(pc.concept.slug, (conceptsM.get(pc.concept.slug) ?? 0) + 1);
        for (const pco of r.passageCompanies) companies.set(pco.company.slug, (companies.get(pco.company.slug) ?? 0) + 1);
        for (const pe of r.passageEvents) eventsM.set(pe.event.slug, (eventsM.get(pe.event.slug) ?? 0) + 1);
      }

      // Year coverage with per-year density (for the timeline view).
      const yearCounts = new Map<number, number>();
      for (const r of rows) {
        if (r.source.year != null) yearCounts.set(r.source.year, (yearCounts.get(r.source.year) ?? 0) + 1);
      }
      const years = [...yearCounts.keys()].sort((a, b) => a - b);

      // Pick up to 8 representative passages spanning the full time range.
      const picks: typeof rows = [];
      if (rows.length <= 8) picks.push(...rows);
      else {
        const idx = [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1].map((f) =>
          Math.min(rows.length - 1, Math.round(f * (rows.length - 1)))
        );
        for (const i of [...new Set(idx)]) picks.push(rows[i]);
      }

      // Decision Ledger overlap: this person's documented decisions.
      // NOTE: seeded decisions carry decisionDate but no sourceId — the old
      // `source: { isNot: null }` filter hid every seeded decision.
      const decisionsRaw = await db.decision.findMany({
        where: { personId: p.id },
        select: {
          id: true, title: true, date: true, decisionDate: true, action: true,
          outcome: true, confidence: true, verified: true,
          company: { select: { slug: true, name: true } },
        },
        orderBy: [{ decisionDate: "asc" }, { createdAt: "asc" }],
        take: 60,
      });
      // Prefer dated decisions; keep the newest-first slice for display.
      const decisions = decisionsRaw
        .filter((d) => d.decisionDate || d.date)
        .slice(-10)
        .reverse();

      const rank = (m: Map<string, number>, names: Map<string, string>) =>
        [...m.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([slug, n]) => ({ slug, name: names.get(slug) ?? slug, count: n }));

      const themeNames = new Map(rows.flatMap((r) => r.passageThemes.map((pt) => [pt.theme.slug, pt.theme.name] as const)));
      const companyNames = new Map(rows.flatMap((r) => r.passageCompanies.map((pc) => [pc.company.slug, pc.company.name] as const)));
      const conceptNames = new Map(rows.flatMap((r) => r.passageConcepts.map((pc) => [pc.concept.slug, pc.concept.name] as const)));
      const eventNames = new Map(rows.flatMap((r) => r.passageEvents.map((pe) => [pe.event.slug, pe.event.name] as const)));

      return {
        investor: { slug: p.slug, name: p.name, kind: p.kind, region: p.region },
        total,
        years,
        yearCounts: years.map((y) => ({ year: y, count: yearCounts.get(y) ?? 0 })),
        decisions: decisions.map((d) => ({
          id: d.id,
          title: d.title,
          date: d.decisionDate || d.date,
          action: d.action,
          outcome: d.outcome,
          confidence: d.confidence,
          verified: d.verified,
          company: d.company ? { slug: d.company.slug, name: d.company.name } : null,
        })),
        topTags: {
          themes: rank(themes, themeNames),
          companies: rank(companies, companyNames),
          concepts: rank(conceptsM, conceptNames),
          events: rank(eventsM, eventNames),
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
  const shared: Record<string, { slug: string; name: string; count?: number }[]> = {};
  const distinct: Record<string, { slug: string; name: string; owners: string[] }[]> = {};
  for (const kind of ["themes", "companies", "concepts", "events"] as const) {
    const counts = new Map<string, { n: number; name: string; slug: string }>();
    for (const col of columns)
      for (const t of col.topTags[kind]) {
        const k = `${kind}:${t.slug}`;
        const cur = counts.get(k);
        if (cur) cur.n++;
        else counts.set(k, { n: 1, name: t.name, slug: t.slug });
      }
    shared[kind] = [...counts.values()]
      .filter((v) => v.n >= Math.min(2, columns.length))
      .sort((a, b) => b.n - a.n)
      .map((v) => ({ slug: v.slug, name: v.name, count: v.n }));

    // Tags each person owns ALONE (no other selected person has them).
    const perPerson = new Map<string, Set<string>>();
    for (const col of columns)
      perPerson.set(col.investor.slug, new Set(col.topTags[kind].map((t) => t.slug)));
    const uniq: { slug: string; name: string; owners: string[] }[] = [];
    for (const col of columns)
      for (const t of col.topTags[kind].slice(0, 12)) {
        const othersHave = [...perPerson.entries()].some(
          ([slug, set]) => slug !== col.investor.slug && set.has(t.slug)
        );
        if (!othersHave) uniq.push({ slug: t.slug, name: t.name, owners: [col.investor.name] });
      }
    distinct[kind] = uniq.slice(0, 24);
  }

  return json({ columns, shared, distinct, query: { investors: investorSlugs, theme: themeSlug, concept: conceptSlug, q } });
}
