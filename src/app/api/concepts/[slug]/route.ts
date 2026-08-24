import { isAllAccess } from "@/lib/promo";
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/concepts/[slug] — concept detail with related passages, themes, companies
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url);
  const personSlug = url.searchParams.get("investor") || "buffett";

  const concept = await db.concept.findUnique({
    where: { slug },
    include: {
      passages: {
        include: {
          passage: {
            include: {
              source: { include: { person: true } },
              passageThemes: { include: { theme: true } },
              passageCompanies: { include: { company: true } },
              passageConcepts: { include: { concept: true } },
            },
          },
        },
      },
    },
  });
  if (!concept) return error("Concept not found", 404);

  const user = await getSessionUser();
  const isPro = (user?.entitlement === "pro" || isAllAccess());

  const filtered = concept.passages.filter(
    (pc) =>
      pc.passage.source.person.slug === personSlug &&
      (isPro || pc.passage.visibility === "public")
  );

  const years = [...new Set(filtered.map((pc) => pc.passage.source.year).filter(Boolean))] as number[];
  const themes = new Map<string, { slug: string; name: string }>();
  const companies = new Map<string, { slug: string; name: string }>();
  const sources = new Map<string, { slug: string; title: string; year: number | null }>();
  const relatedConceptsMap = new Map<string, { slug: string; name: string; count: number }>();

  for (const pc of filtered) {
    for (const pt of pc.passage.passageThemes) themes.set(pt.theme.slug, { slug: pt.theme.slug, name: pt.theme.name });
    for (const pco of pc.passage.passageCompanies) companies.set(pco.company.slug, { slug: pco.company.slug, name: pco.company.name });
    sources.set(pc.passage.source.slug, { slug: pc.passage.source.slug, title: pc.passage.source.title, year: pc.passage.source.year });
    // Co-occurring concepts
    for (const c of pc.passage.passageConcepts) {
      if (c.concept.slug === slug) continue;
      const existing = relatedConceptsMap.get(c.concept.slug);
      if (existing) existing.count++;
      else relatedConceptsMap.set(c.concept.slug, { slug: c.concept.slug, name: c.concept.name, count: 1 });
    }
  }

  return json({
    concept: {
      slug: concept.slug,
      name: concept.name,
      description: concept.description,
    },
    stats: {
      passageCount: filtered.length,
      hiddenPassages: concept.passages.filter((pc) => pc.passage.source.person.slug === personSlug).length - filtered.length,
    },
    years: years.sort((a, b) => a - b),
    themes: [...themes.values()],
    companies: [...companies.values()],
    sources: [...sources.values()].sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
    relatedConcepts: [...relatedConceptsMap.values()].sort((a, b) => b.count - a.count).slice(0, 8),
    passages: filtered.map((pc) => ({
      id: pc.passage.id,
      text: pc.passage.text,
      context: pc.passage.context,
      section: pc.passage.section,
      visibility: pc.passage.visibility,
      source: { slug: pc.passage.source.slug, title: pc.passage.source.title, year: pc.passage.source.year, sourceType: pc.passage.source.sourceType },
      themes: pc.passage.passageThemes.map((t) => ({ slug: t.theme.slug, name: t.theme.name })),
      companies: pc.passage.passageCompanies.map((c) => ({ slug: c.company.slug, name: c.company.name })),
    })),
  });
}
