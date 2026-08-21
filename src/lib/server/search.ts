/**
 * Server-side search — deterministic token-based matching with weighted ranking.
 *
 * SQLite has no native FTS in this build, so we implement app-layer ranking:
 *  - title/source metadata: highest weight
 *  - theme/concept/company tags: very high
 *  - passage text: lower
 *
 * Premium (pro) passages are NEVER sent to anonymous clients. The server
 * resolves entitlement first and queries only permitted records.
 */
import "server-only";
import { db } from "../db";

export type SearchFilters = {
  person?: string;
  yearFrom?: number;
  yearTo?: number;
  sourceType?: string;
  theme?: string;
  concept?: string;
  company?: string;
  event?: string;
  decade?: number;
};

export type SearchHit = {
  passageId: string;
  text: string;
  context: string | null;
  section: string | null;
  visibility: string;
  score: number;
  source: {
    id: string;
    slug: string;
    title: string;
    sourceType: string;
    year: number | null;
    publisher: string | null;
    url: string | null;
  };
  themes: { slug: string; name: string }[];
  concepts: { slug: string; name: string }[];
  companies: { slug: string; name: string }[];
  events: { slug: string; name: string }[];
};

const tokenize = (q: string): string[] =>
  q
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

export async function searchPassages(
  query: string,
  filters: SearchFilters,
  isPro: boolean,
  page = 1,
  pageSize = 20
): Promise<{ hits: SearchHit[]; total: number; page: number; pageSize: number }> {
  const tokens = tokenize(query);
  // Determine person
  let personId: string | undefined = filters.person;
  if (!personId && filters.person !== "all") {
    const p = await db.person.findUnique({ where: { slug: "buffett" } });
    personId = p?.id;
  }
  if (filters.person && filters.person !== "all") {
    const p = await db.person.findUnique({ where: { slug: filters.person } });
    personId = p?.id;
  }

  // Build where clause
  const where: any = { AND: [] };
  // visibility gate — anonymous users only see public passages
  where.visibility = isPro ? { in: ["public", "pro"] } : "public";

  if (personId) {
    where.AND.push({ source: { personId } });
  }
  if (filters.sourceType) {
    where.AND.push({ source: { sourceType: filters.sourceType } });
  }
  if (filters.yearFrom || filters.yearTo) {
    where.AND.push({
      source: {
        year: {
          gte: filters.yearFrom ?? undefined,
          lte: filters.yearTo ?? undefined,
        },
      },
    });
  }
  if (filters.decade) {
    where.AND.push({
      source: {
        year: { gte: filters.decade, lte: filters.decade + 9 },
      },
    });
  }
  if (filters.theme) {
    where.AND.push({ passageThemes: { some: { theme: { slug: filters.theme } } } });
  }
  if (filters.concept) {
    where.AND.push({ passageConcepts: { some: { concept: { slug: filters.concept } } } });
  }
  if (filters.company) {
    where.AND.push({ passageCompanies: { some: { company: { slug: filters.company } } } });
  }
  if (filters.event) {
    where.AND.push({ passageEvents: { some: { event: { slug: filters.event } } } });
  }

  // Token-based text match (LIKE OR). If no tokens, return all filtered.
  if (tokens.length) {
    const orClauses: any[] = [];
    for (const t of tokens) {
      orClauses.push({ text: { contains: t } });
      orClauses.push({ source: { title: { contains: t } } });
    }
    where.AND.push({ OR: orClauses });
  }

  if (where.AND.length === 0) delete where.AND;

  const [total, rows] = await Promise.all([
    db.passage.count({ where }),
    db.passage.findMany({
      where,
      include: {
        source: true,
        passageThemes: { include: { theme: true } },
        passageConcepts: { include: { concept: true } },
        passageCompanies: { include: { company: true } },
        passageEvents: { include: { event: true } },
      },
      orderBy: { sequence: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // Score
  const hits: SearchHit[] = rows.map((p) => {
    let score = 0;
    const titleLower = p.source.title.toLowerCase();
    for (const t of tokens) {
      if (titleLower.includes(t)) score += 50;
      if (p.text.toLowerCase().includes(t)) score += 10;
      // tag matches
      for (const pt of p.passageThemes) if (pt.theme.name.toLowerCase().includes(t)) score += 30;
      for (const pc of p.passageConcepts) if (pc.concept.name.toLowerCase().includes(t)) score += 30;
      for (const pco of p.passageCompanies) if (pco.company.name.toLowerCase().includes(t)) score += 30;
    }
    if (!tokens.length) score = 100 - p.sequence; // deterministic default order
    return {
      passageId: p.id,
      text: p.text,
      context: p.context,
      section: p.section,
      visibility: p.visibility,
      score,
      source: {
        id: p.source.id,
        slug: p.source.slug,
        title: p.source.title,
        sourceType: p.source.sourceType,
        year: p.source.year,
        publisher: p.source.publisher,
        url: p.source.url,
      },
      themes: p.passageThemes.map((pt) => ({ slug: pt.theme.slug, name: pt.theme.name })),
      concepts: p.passageConcepts.map((pc) => ({ slug: pc.concept.slug, name: pc.concept.name })),
      companies: p.passageCompanies.map((pco) => ({ slug: pco.company.slug, name: pco.company.name })),
      events: p.passageEvents.map((pe) => ({ slug: pe.event.slug, name: pe.event.name })),
    };
  });

  hits.sort((a, b) => b.score - a.score);

  return { hits, total, page, pageSize };
}
