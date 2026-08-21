import { db } from "@/lib/db";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await db.person.findUnique({
    where: { slug },
    include: {
      sources: { orderBy: { year: "asc" }, include: { _count: { select: { passages: true } } } },
      decisions: { include: { company: true, event: true, source: true } },
      personThemes: { include: { theme: true } },
      personCompanies: { include: { company: true } },
      _count: { select: { sources: true, decisions: true } },
    },
  });
  if (!person) return error("Investor not found", 404);

  // aggregate counts
  const passageCount = await db.passage.count({
    where: { source: { personId: person.id } },
  });
  const publicPassageCount = await db.passage.count({
    where: { source: { personId: person.id }, visibility: "public" },
  });

  return json({
    investor: {
      slug: person.slug,
      name: person.name,
      shortDescription: person.shortDescription,
      bio: person.bio,
      status: person.status,
      birthYear: person.birthYear,
      stats: {
        sources: person._count.sources,
        passages: passageCount,
        publicPassages: publicPassageCount,
        decisions: person._count.decisions,
        themes: person.personThemes.length,
        companies: person.personCompanies.length,
      },
    },
    sources: person.sources.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      sourceType: s.sourceType,
      year: s.year,
      publicationDate: s.publicationDate,
      publisher: s.publisher,
      url: s.url,
      description: s.description,
      passageCount: s._count.passages,
    })),
    themes: person.personThemes.map((pt) => ({ slug: pt.theme.slug, name: pt.theme.name, description: pt.theme.description })),
    companies: person.personCompanies.map((pc) => ({ slug: pc.company.slug, name: pc.company.name, ticker: pc.company.ticker, description: pc.company.description })),
    decisions: person.decisions.map((d) => ({
      id: d.id,
      title: d.title,
      date: d.date,
      description: d.description,
      company: d.company ? { slug: d.company.slug, name: d.company.name } : null,
      event: d.event ? { slug: d.event.slug, name: d.event.name } : null,
      source: d.source ? { slug: d.source.slug, title: d.source.title } : null,
    })),
  });
}
