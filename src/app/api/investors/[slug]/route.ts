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

  // Fetch themes with passage counts for the bar chart
  const themesWithCounts = await db.theme.findMany({
    where: { persons: { some: { personId: person.id } } },
    include: {
      passages: {
        where: { passage: { source: { personId: person.id } } },
      },
    },
  });

  // Fetch companies with passage counts
  const companiesWithCounts = await db.company.findMany({
    where: { persons: { some: { personId: person.id } } },
    include: {
      passages: {
        where: { passage: { source: { personId: person.id } } },
      },
      industry: true,
    },
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
    themes: themesWithCounts
      .map((t) => ({ slug: t.slug, name: t.name, description: t.description, passageCount: t.passages.length }))
      .sort((a, b) => b.passageCount - a.passageCount),
    companies: companiesWithCounts
      .map((c) => ({ slug: c.slug, name: c.name, ticker: c.ticker, description: c.description, passageCount: c.passages.length, industry: c.industry?.name || null }))
      .sort((a, b) => b.passageCount - a.passageCount),
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
