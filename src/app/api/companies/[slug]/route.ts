import { isAllAccess } from "@/lib/promo";
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url);
  const personSlug = url.searchParams.get("investor") || "buffett";

  const company = await db.company.findUnique({
    where: { slug },
    include: {
      industry: true,
      passages: {
        include: {
          passage: {
            include: {
              source: { include: { person: true } },
              passageThemes: { include: { theme: true } },
              passageConcepts: { include: { concept: true } },
            },
          },
        },
      },
      decisions: { include: { person: true, source: true } },
      persons: { include: { person: true } },
    },
  });
  if (!company) return error("Company not found", 404);

  const user = await getSessionUser();
  const isPro = (user?.entitlement === "pro" || isAllAccess());

  const filtered = company.passages.filter(
    (pc) =>
      pc.passage.source.person.slug === personSlug &&
      (isPro || pc.passage.visibility === "public")
  );

  const years = [...new Set(filtered.map((pc) => pc.passage.source.year).filter(Boolean))] as number[];
  const themes = new Map<string, { slug: string; name: string }>();
  const concepts = new Map<string, { slug: string; name: string }>();
  const sources = new Map<string, { slug: string; title: string; year: number | null }>();
  for (const pc of filtered) {
    for (const pt of pc.passage.passageThemes) themes.set(pt.theme.slug, { slug: pt.theme.slug, name: pt.theme.name });
    for (const c of pc.passage.passageConcepts) concepts.set(c.concept.slug, { slug: c.concept.slug, name: c.concept.name });
    sources.set(pc.passage.source.slug, { slug: pc.passage.source.slug, title: pc.passage.source.title, year: pc.passage.source.year });
  }

  return json({
    company: {
      slug: company.slug,
      name: company.name,
      canonicalName: company.canonicalName,
      ticker: company.ticker,
      description: company.description,
      industry: company.industry ? { slug: company.industry.slug, name: company.industry.name } : null,
    },
    stats: {
      passageCount: filtered.length,
      hiddenPassages: company.passages.filter((pc) => pc.passage.source.person.slug === personSlug).length - filtered.length,
    },
    years: years.sort((a, b) => a - b),
    themes: [...themes.values()],
    concepts: [...concepts.values()],
    sources: [...sources.values()].sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
    passages: filtered.map((pc) => ({
      id: pc.passage.id,
      text: pc.passage.text,
      context: pc.passage.context,
      section: pc.passage.section,
      visibility: pc.passage.visibility,
      source: { slug: pc.passage.source.slug, title: pc.passage.source.title, year: pc.passage.source.year, sourceType: pc.passage.source.sourceType },
    })),
    decisions: company.decisions.map((d) => ({
      title: d.title,
      date: d.date,
      description: d.description,
      person: d.person ? { slug: d.person.slug, name: d.person.name } : null,
      source: d.source ? { slug: d.source.slug, title: d.source.title } : null,
    })),
  });
}
