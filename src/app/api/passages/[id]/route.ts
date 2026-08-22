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
    navigation: {
      index: idx + 1,
      total: visibleSiblings.length,
      prev: prev ? { id: prev.id, section: prev.section } : null,
      next: next ? { id: next.id, section: next.section } : null,
    },
  });
}
