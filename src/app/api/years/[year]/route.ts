import { isAllAccess } from "@/lib/promo";
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/years/[year] — year detail for an investor
export async function GET(req: Request, { params }: { params: Promise<{ year: string }> }) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (isNaN(year)) return error("Invalid year", 400);
  const url = new URL(req.url);
  const personSlug = url.searchParams.get("investor") || "buffett";

  const person = await db.person.findUnique({ where: { slug: personSlug } });
  if (!person) return error("Investor not found", 404);

  const sources = await db.source.findMany({
    where: { personId: person.id, year },
    include: {
      passages: {
        orderBy: { sequence: "asc" },
        include: {
          passageThemes: { include: { theme: true } },
          passageCompanies: { include: { company: true } },
          passageConcepts: { include: { concept: true } },
        },
      },
    },
  });

  const decisions = await db.decision.findMany({
    where: { personId: person.id, date: { startsWith: String(year) } },
    include: { company: true, source: true },
  });

  const user = await getSessionUser();
  const isPro = (user?.entitlement === "pro" || isAllAccess());

  const themes = new Map<string, { slug: string; name: string }>();
  const companies = new Map<string, { slug: string; name: string }>();
  const result = sources.map((s) => {
    const visible = s.passages.filter((sp) => isPro || sp.visibility === "public");
    for (const sp of visible) {
      for (const pt of sp.passageThemes) themes.set(pt.theme.slug, { slug: pt.theme.slug, name: pt.theme.name });
      for (const pco of sp.passageCompanies) companies.set(pco.company.slug, { slug: pco.company.slug, name: pco.company.name });
    }
    return {
      slug: s.slug,
      title: s.title,
      sourceType: s.sourceType,
      publicationDate: s.publicationDate,
      publisher: s.publisher,
      url: s.url,
      description: s.description,
      passageCount: visible.length,
      hiddenPassages: s.passages.length - visible.length,
      passages: visible.map((sp) => ({
        id: sp.id,
        text: sp.text,
        context: sp.context,
        section: sp.section,
        visibility: sp.visibility,
        themes: sp.passageThemes.map((t) => ({ slug: t.theme.slug, name: t.theme.name })),
        companies: sp.passageCompanies.map((c) => ({ slug: c.company.slug, name: c.company.name })),
      })),
    };
  });

  return json({
    year,
    investor: { slug: person.slug, name: person.name },
    sourceCount: result.length,
    passageCount: result.reduce((sum, s) => sum + s.passageCount, 0),
    themes: [...themes.values()],
    companies: [...companies.values()],
    decisions: decisions.map((d) => ({
      title: d.title,
      date: d.date,
      description: d.description,
      company: d.company ? { slug: d.company.slug, name: d.company.name } : null,
      source: d.source ? { slug: d.source.slug, title: d.source.title } : null,
    })),
    sources: result,
  });
}
