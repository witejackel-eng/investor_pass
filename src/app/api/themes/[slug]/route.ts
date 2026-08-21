import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/themes/[slug] — theme detail with related entities
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url);
  const personSlug = url.searchParams.get("investor") || "buffett";

  const theme = await db.theme.findUnique({
    where: { slug },
    include: {
      passages: {
        include: {
          passage: {
            include: {
              source: { include: { person: true } },
              passageThemes: { include: { theme: true } },
              passageConcepts: { include: { concept: true } },
              passageCompanies: { include: { company: true } },
            },
          },
        },
      },
      persons: { include: { person: true } },
    },
  });
  if (!theme) return error("Theme not found", 404);

  const user = await getSessionUser();
  const isPro = user?.entitlement === "pro";

  const filtered = theme.passages.filter(
    (pt) =>
      pt.passage.source.person.slug === personSlug &&
      (isPro || pt.passage.visibility === "public")
  );

  const years = [...new Set(filtered.map((pt) => pt.passage.source.year).filter(Boolean))] as number[];
  const companies = new Map<string, { slug: string; name: string }>();
  const concepts = new Map<string, { slug: string; name: string }>();
  const sources = new Map<string, { slug: string; title: string; year: number | null }>();
  for (const pt of filtered) {
    for (const pco of pt.passage.passageCompanies) companies.set(pco.company.slug, { slug: pco.company.slug, name: pco.company.name });
    for (const pc of pt.passage.passageConcepts) concepts.set(pc.concept.slug, { slug: pc.concept.slug, name: pc.concept.name });
    sources.set(pt.passage.source.slug, { slug: pt.passage.source.slug, title: pt.passage.source.title, year: pt.passage.source.year });
  }

  // Related themes: themes that co-occur with this theme in the same passages
  const relatedThemesMap = new Map<string, { slug: string; name: string; count: number }>();
  for (const pt of filtered) {
    for (const t of pt.passage.passageThemes) {
      if (t.theme.slug === slug) continue;
      const existing = relatedThemesMap.get(t.theme.slug);
      if (existing) existing.count++;
      else relatedThemesMap.set(t.theme.slug, { slug: t.theme.slug, name: t.theme.name, count: 1 });
    }
  }
  const relatedThemes = [...relatedThemesMap.values()].sort((a, b) => b.count - a.count).slice(0, 10);

  return json({
    theme: {
      slug: theme.slug,
      name: theme.name,
      description: theme.description,
    },
    stats: {
      passageCount: filtered.length,
      hiddenPassages: theme.passages.filter((pt) => pt.passage.source.person.slug === personSlug).length - filtered.length,
    },
    years: years.sort((a, b) => a - b),
    companies: [...companies.values()].sort((a, b) => a.name.localeCompare(b.name)),
    concepts: [...concepts.values()].sort((a, b) => a.name.localeCompare(b.name)),
    sources: [...sources.values()].sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
    relatedThemes,
    passages: filtered.map((pt) => ({
      id: pt.passage.id,
      text: pt.passage.text,
      context: pt.passage.context,
      section: pt.passage.section,
      visibility: pt.passage.visibility,
      source: {
        slug: pt.passage.source.slug,
        title: pt.passage.source.title,
        year: pt.passage.source.year,
        sourceType: pt.passage.source.sourceType,
      },
      themes: pt.passage.passageThemes.map((t) => ({ slug: t.theme.slug, name: t.theme.name })),
      companies: pt.passage.passageCompanies.map((c) => ({ slug: c.company.slug, name: c.company.name })),
    })),
  });
}
