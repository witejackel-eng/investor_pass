import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/passages/[id] — single passage with full context, source, and related passages.
// Replaces the O(n) client-side source-scan in PassageView.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const passage = await db.passage.findUnique({
    where: { id },
    include: {
      source: { include: { person: true } },
      passageThemes: { include: { theme: true } },
      passageConcepts: { include: { concept: true } },
      passageCompanies: { include: { company: true } },
      passageEvents: { include: { event: true } },
    },
  });
  if (!passage) return error("Passage not found", 404);

  const user = await getSessionUser();
  const isPro = user?.entitlement === "pro";

  // Visibility gate — pro passages only for entitled users
  if (passage.visibility === "pro" && !isPro) {
    return error("Pro required to view this passage", 403);
  }

  // Sibling passages in the same source (for prev/next nav)
  const siblings = await db.passage.findMany({
    where: { sourceId: passage.sourceId },
    orderBy: { sequence: "asc" },
    select: { id: true, section: true, visibility: true, sequence: true },
  });
  const visibleSiblings = siblings.filter((s) => isPro || s.visibility === "public");
  const idx = visibleSiblings.findIndex((s) => s.id === id);
  const prev = idx > 0 ? visibleSiblings[idx - 1] : null;
  const next = idx >= 0 && idx < visibleSiblings.length - 1 ? visibleSiblings[idx + 1] : null;

  // Related themes: themes that co-occur with this passage's themes in other passages
  const themeIds = passage.passageThemes.map((pt) => pt.themeId);
  const conceptIds = passage.passageConcepts.map((pc) => pc.conceptId);
  const relatedThemes: { slug: string; name: string; count: number }[] = [];
  if (themeIds.length > 0) {
    const coOccurrences = await db.passageTheme.findMany({
      where: { themeId: { in: themeIds }, passageId: { not: id } },
      include: { theme: true },
    });
    const themeCount = new Map<string, { slug: string; name: string; count: number }>();
    for (const co of coOccurrences) {
      const existing = themeCount.get(co.theme.slug);
      if (existing) existing.count++;
      else themeCount.set(co.theme.slug, { slug: co.theme.slug, name: co.theme.name, count: 1 });
    }
    relatedThemes.push(...[...themeCount.values()].sort((a, b) => b.count - a.count).slice(0, 8));
  }

  // Related thinking rails (spec §12.4): earlier/later same-investor thinking
  // under the anchor theme or company, plus the same idea at other investors.
  const anchorThemeId = passage.passageThemes[0]?.themeId;
  const anchorCompanyId = passage.passageCompanies[0]?.companyId;
  const tagFilter = anchorThemeId
    ? ({ passageThemes: { some: { themeId: anchorThemeId } } } as const)
    : anchorCompanyId
      ? ({ passageCompanies: { some: { companyId: anchorCompanyId } } } as const)
      : null;
  const visibilityClause = isPro ? { in: ["public", "pro"] } : ("public" as const);
  const year = passage.source.year;

  type RailItem = {
    id: string;
    section: string | null;
    title: string;
    year: number | null;
    personSlug: string;
    personName: string;
  };
  type PassageRow = {
    id: string;
    section: string | null;
    source: { title: string; year: number | null; person: { slug: string; name: string } };
  };
  const toRailItem = (p: PassageRow): RailItem => ({
    id: p.id,
    section: p.section,
    title: p.source.title,
    year: p.source.year,
    personSlug: p.source.person.slug,
    personName: p.source.person.name,
  });
  let passageRows: PassageRow[] = [];

  const earlier: RailItem[] = [];
  const later: RailItem[] = [];
  const sameConceptElsewhere: RailItem[] = [];

  if (tagFilter && year != null) {
    passageRows = await db.passage.findMany({
      where: {
        AND: [tagFilter, { visibility: visibilityClause }, { id: { not: id } }, { source: { personId: passage.source.personId, year: { lt: year } } }],
      },
      select: { id: true, section: true, source: { select: { title: true, year: true, person: { select: { slug: true, name: true } } } } },
      orderBy: [{ source: { year: "desc" } }, { sequence: "desc" }],
      take: 4,
    });
    earlier.push(...passageRows.map(toRailItem));

    passageRows = await db.passage.findMany({
      where: {
        AND: [tagFilter, { visibility: visibilityClause }, { id: { not: id } }, { source: { personId: passage.source.personId, year: { gt: year } } }],
      },
      select: { id: true, section: true, source: { select: { title: true, year: true, person: { select: { slug: true, name: true } } } } },
      orderBy: [{ source: { year: "asc" } }, { sequence: "asc" }],
      take: 4,
    });
    later.push(...passageRows.map(toRailItem));
  }

  const sharedIdeaClauses = [
    ...(themeIds.length ? [{ passageThemes: { some: { themeId: { in: themeIds } } } }] : []),
    ...(conceptIds.length ? [{ passageConcepts: { some: { conceptId: { in: conceptIds } } } }] : []),
  ];
  if (sharedIdeaClauses.length > 0) {
    passageRows = await db.passage.findMany({
      where: {
        AND: [
          { visibility: visibilityClause },
          { id: { not: id } },
          { source: { personId: { not: passage.source.personId } } },
          { OR: sharedIdeaClauses },
        ],
      },
      select: { id: true, section: true, source: { select: { title: true, year: true, person: { select: { slug: true, name: true } } } } },
      orderBy: [{ source: { year: "desc" } }, { sequence: "desc" }],
      take: 4,
    });
    sameConceptElsewhere.push(...passageRows.map(toRailItem));
  }

  return json({
    passage: {
      id: passage.id,
      text: passage.text,
      context: passage.context,
      section: passage.section,
      sequence: passage.sequence,
      visibility: passage.visibility,
    },
    source: {
      id: passage.source.id,
      slug: passage.source.slug,
      title: passage.source.title,
      sourceType: passage.source.sourceType,
      year: passage.source.year,
      publicationDate: passage.source.publicationDate,
      publisher: passage.source.publisher,
      url: passage.source.url,
      description: passage.source.description,
      provenanceStatus: passage.source.provenanceStatus,
      retrievalAt: passage.source.retrievalAt,
      person: { slug: passage.source.person.slug, name: passage.source.person.name },
    },
    themes: passage.passageThemes.map((pt) => ({ slug: pt.theme.slug, name: pt.theme.name, description: pt.theme.description })),
    concepts: passage.passageConcepts.map((pc) => ({ slug: pc.concept.slug, name: pc.concept.name })),
    companies: passage.passageCompanies.map((pco) => ({ slug: pco.company.slug, name: pco.company.name, ticker: pco.company.ticker })),
    events: passage.passageEvents.map((pe) => ({ slug: pe.event.slug, name: pe.event.name })),
    relatedThemes,
    rails: { earlier, later, sameConceptElsewhere },
    navigation: {
      index: idx + 1,
      total: visibleSiblings.length,
      prev: prev ? { id: prev.id, section: prev.section } : null,
      next: next ? { id: next.id, section: next.section } : null,
    },
  });
}
