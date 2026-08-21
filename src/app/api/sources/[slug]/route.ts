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
  const isPro = user?.entitlement === "pro";

  const visiblePassages = source.passages.filter((p) => isPro || p.visibility === "public");

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
    relatedSources: [
      ...source.relatedSourcesA.map((r) => r.sourceB),
      ...source.relatedSourcesB.map((r) => r.sourceA),
    ],
  });
}
