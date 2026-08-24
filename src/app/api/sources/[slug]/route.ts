import { isAllAccess } from "@/lib/promo";
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/sources/[slug] — source detail with passages (entitlement-gated)
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const source = await db.source.findUnique({
    where: { slug },
    include: {
      person: true,
      passages: {
        orderBy: { sequence: "asc" },
        include: {
          passageThemes: { include: { theme: true } },
          passageConcepts: { include: { concept: true } },
          passageCompanies: { include: { company: true } },
          passageEvents: { include: { event: true } },
        },
      },
      decisions: { include: { company: true, event: true } },
      relatedSourcesA: { include: { sourceB: { select: { slug: true, title: true, year: true, sourceType: true } } } },
      relatedSourcesB: { include: { sourceA: { select: { slug: true, title: true, year: true, sourceType: true } } } },
    },
  });
  if (!source) return error("Source not found", 404);

  const user = await getSessionUser();
  const isPro = (user?.entitlement === "pro" || isAllAccess());

  const visiblePassages = source.passages.filter((p) => isPro || p.visibility === "public");

  // Dynamically compute related sources: other sources by the same person that
  // share themes or companies with this source. Ranked by overlap count.
  const themeIds = new Set(source.passages.flatMap((p) => p.passageThemes.map((pt) => pt.themeId)));
  const companyIds = new Set(source.passages.flatMap((p) => p.passageCompanies.map((pc) => pc.companyId)));
  const relatedSources: { slug: string; title: string; year: number | null; sourceType: string; overlap: number }[] = [];

  if (themeIds.size > 0 || companyIds.size > 0) {
    const otherSources = await db.source.findMany({
      where: {
        personId: source.personId,
        id: { not: source.id },
      },
      include: {
        passages: {
          include: {
            passageThemes: { select: { themeId: true } },
            passageCompanies: { select: { companyId: true } },
          },
        },
      },
    });
    for (const os of otherSources) {
      let overlap = 0;
      for (const p of os.passages) {
        for (const pt of p.passageThemes) if (themeIds.has(pt.themeId)) overlap++;
        for (const pc of p.passageCompanies) if (companyIds.has(pc.companyId)) overlap++;
      }
      if (overlap > 0) {
        relatedSources.push({ slug: os.slug, title: os.title, year: os.year, sourceType: os.sourceType, overlap });
      }
    }
    relatedSources.sort((a, b) => b.overlap - a.overlap);
  }
  // Merge with any explicitly curated related sources (deduped)
  const seenSlugs = new Set(relatedSources.map((r) => r.slug));
  for (const r of [...source.relatedSourcesA.map((r) => r.sourceB), ...source.relatedSourcesB.map((r) => r.sourceA)]) {
    if (!seenSlugs.has(r.slug)) {
      relatedSources.push({ ...r, overlap: 0 });
      seenSlugs.add(r.slug);
    }
  }

  // Related thinking rails at source level (spec §12.4): earlier/later sources
  // by the same investor, plus other investors' sources under the same themes.
  const visibilityClause = isPro ? { in: ["public", "pro"] } : ("public" as const);
  const srcYear = source.year;

  const earlierSources = srcYear != null
    ? await db.source.findMany({
        where: { personId: source.personId, id: { not: source.id }, year: { lt: srcYear } },
        select: { slug: true, title: true, year: true, sourceType: true },
        orderBy: { year: "desc" },
        take: 4,
      })
    : [];
  const laterSources = srcYear != null
    ? await db.source.findMany({
        where: { personId: source.personId, id: { not: source.id }, year: { gt: srcYear } },
        select: { slug: true, title: true, year: true, sourceType: true },
        orderBy: { year: "asc" },
        take: 4,
      })
    : [];

  const topThemeIds = [...themeIds].slice(0, 5);
  let sameThemeElsewhere: { slug: string; title: string; year: number | null; personName: string }[] = [];
  if (topThemeIds.length > 0) {
    const rows = await db.passageTheme.findMany({
      where: {
        themeId: { in: topThemeIds },
        passage: { visibility: visibilityClause, source: { personId: { not: source.personId } } },
      },
      include: { passage: { include: { source: { include: { person: { select: { name: true, slug: true } } } } } } },
      take: 60,
    });
    const bySource = new Map<string, { slug: string; title: string; year: number | null; personName: string }>();
    for (const row of rows) {
      const s = row.passage.source;
      if (!bySource.has(s.slug)) {
        bySource.set(s.slug, { slug: s.slug, title: s.title, year: s.year, personName: s.person.name });
      }
    }
    sameThemeElsewhere = [...bySource.values()]
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .slice(0, 4);
  }

  return json({
    source: {
      id: source.id,
      slug: source.slug,
      title: source.title,
      sourceType: source.sourceType,
      year: source.year,
      publicationDate: source.publicationDate,
      publisher: source.publisher,
      url: source.url,
      description: source.description,
      provenanceStatus: source.provenanceStatus,
      retrievalAt: source.retrievalAt,
      person: { slug: source.person.slug, name: source.person.name },
    },
    passages: visiblePassages.map((p) => ({
      id: p.id,
      text: p.text,
      context: p.context,
      section: p.section,
      sequence: p.sequence,
      visibility: p.visibility,
      themes: p.passageThemes.map((pt) => ({ slug: pt.theme.slug, name: pt.theme.name })),
      concepts: p.passageConcepts.map((pc) => ({ slug: pc.concept.slug, name: pc.concept.name })),
      companies: p.passageCompanies.map((pco) => ({ slug: pco.company.slug, name: pco.company.name })),
      events: p.passageEvents.map((pe) => ({ slug: pe.event.slug, name: pe.event.name })),
    })),
    hiddenPassageCount: source.passages.length - visiblePassages.length,
    decisions: source.decisions.map((d) => ({
      title: d.title,
      date: d.date,
      description: d.description,
      company: d.company ? { slug: d.company.slug, name: d.company.name } : null,
    })),
    relatedSources: relatedSources.slice(0, 8).map((r) => ({
      slug: r.slug,
      title: r.title,
      year: r.year,
      sourceType: r.sourceType,
      overlap: r.overlap,
    })),
    rails: {
      earlier: earlierSources,
      later: laterSources,
      sameThemeElsewhere,
    },
  });
}
