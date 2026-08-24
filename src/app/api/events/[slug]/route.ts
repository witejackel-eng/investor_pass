import { isAllAccess } from "@/lib/promo";
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/events/[slug] — event detail with related passages, themes, companies, decisions
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url);
  const personSlug = url.searchParams.get("investor") || "buffett";

  const event = await db.event.findUnique({
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
      decisions: { include: { person: true, company: true, source: true } },
    },
  });
  if (!event) return error("Event not found", 404);

  const user = await getSessionUser();
  const isPro = (user?.entitlement === "pro" || isAllAccess());

  const filtered = event.passages.filter(
    (pe) =>
      pe.passage.source.person.slug === personSlug &&
      (isPro || pe.passage.visibility === "public")
  );

  const years = [...new Set(filtered.map((pe) => pe.passage.source.year).filter(Boolean))] as number[];
  const themes = new Map<string, { slug: string; name: string }>();
  const companies = new Map<string, { slug: string; name: string }>();
  const sources = new Map<string, { slug: string; title: string; year: number | null }>();
  for (const pe of filtered) {
    for (const pt of pe.passage.passageThemes) themes.set(pt.theme.slug, { slug: pt.theme.slug, name: pt.theme.name });
    for (const pco of pe.passage.passageCompanies) companies.set(pco.company.slug, { slug: pco.company.slug, name: pco.company.name });
    sources.set(pe.passage.source.slug, { slug: pe.passage.source.slug, title: pe.passage.source.title, year: pe.passage.source.year });
  }

  return json({
    event: {
      slug: event.slug,
      name: event.name,
      date: event.date,
      description: event.description,
    },
    stats: {
      passageCount: filtered.length,
      hiddenPassages: event.passages.filter((pe) => pe.passage.source.person.slug === personSlug).length - filtered.length,
    },
    years: years.sort((a, b) => a - b),
    themes: [...themes.values()],
    companies: [...companies.values()],
    sources: [...sources.values()].sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
    decisions: event.decisions.map((d) => ({
      title: d.title,
      date: d.date,
      description: d.description,
      person: d.person ? { slug: d.person.slug, name: d.person.name } : null,
      company: d.company ? { slug: d.company.slug, name: d.company.name } : null,
      source: d.source ? { slug: d.source.slug, title: d.source.title } : null,
    })),
    passages: filtered.map((pe) => ({
      id: pe.passage.id,
      text: pe.passage.text,
      context: pe.passage.context,
      section: pe.passage.section,
      visibility: pe.passage.visibility,
      source: { slug: pe.passage.source.slug, title: pe.passage.source.title, year: pe.passage.source.year, sourceType: pe.passage.source.sourceType },
      themes: pe.passage.passageThemes.map((t) => ({ slug: t.theme.slug, name: t.theme.name })),
      companies: pe.passage.passageCompanies.map((c) => ({ slug: c.company.slug, name: c.company.name })),
    })),
  });
}
