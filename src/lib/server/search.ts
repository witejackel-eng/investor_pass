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
  // Matches passage text, source title, AND tag names (themes, concepts,
  // companies, events) so searching "moats" or "Coca-Cola" finds tagged passages.
  if (tokens.length) {
    const orClauses: any[] = [];
    for (const t of tokens) {
      orClauses.push({ text: { contains: t } });
      orClauses.push({ source: { title: { contains: t } } });
      orClauses.push({ source: { publisher: { contains: t } } });
      orClauses.push({ passageThemes: { some: { theme: { name: { contains: t } } } } });
      orClauses.push({ passageThemes: { some: { theme: { slug: { contains: t } } } } });
      orClauses.push({ passageConcepts: { some: { concept: { name: { contains: t } } } } });
      orClauses.push({ passageCompanies: { some: { company: { name: { contains: t } } } } });
      orClauses.push({ passageCompanies: { some: { company: { canonicalName: { contains: t } } } } });
      orClauses.push({ passageEvents: { some: { event: { name: { contains: t } } } } });
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

<<<<<<< HEAD
  return { hits, total, page, pageSize };
=======
  // Exploration summary for broad queries (few tokens / entity-only match).
  // Counts come from one batched roundtrip — no N+1 loops.
  const structuredCount = [personId, parsed.theme, parsed.concept, parsed.company, parsed.event].filter(Boolean).length;
  const hasRangeOrMeta = Boolean(parsed.yearFrom || parsed.yearTo || filters.decade || filters.sourceType);
  const isBroad = tokens.length <= 1 && structuredCount <= 1 && !hasRangeOrMeta && (query.trim() !== "" || structuredCount === 1);
  let exploration: Exploration | null = null;
  if (isBroad) {
    const lightRows = await db.passage.findMany({
      where,
      select: { source: { select: { slug: true, person: { select: { slug: true, name: true } } } } },
    });
    const perPerson = new Map<string, { slug: string; name: string; count: number }>();
    const sourceSet = new Set<string>();
    for (const r of lightRows) {
      sourceSet.add(r.source.slug);
      const entry = perPerson.get(r.source.person.slug);
      if (entry) entry.count++;
      else perPerson.set(r.source.person.slug, { slug: r.source.person.slug, name: r.source.person.name, count: 1 });
    }
    exploration = {
      term: (query.trim() || "").toUpperCase(),
      references: total,
      investors: perPerson.size,
      sources: sourceSet.size,
      byInvestor: [...perPerson.values()].sort((a, b) => b.count - a.count).slice(0, 8),
    };
  }

  // Free-tier value signal: how many references exist behind Pro (count only).
  // Same filters, without the visibility restriction — never exposes content.
  let proTotal: number | null = null;
  if (!isPro) {
    const unrestricted: any = { ...where };
    delete unrestricted.visibility;
    proTotal = await db.passage.count({ where: unrestricted });
  }

  // Never dead-end: suggestions drawn from nearest theme/concept names
  const suggestions = total === 0 ? await suggestQueries(query, tokens) : [];

  return {
    hits,
    total,
    page,
    pageSize,
    parsed: {
      person: parsed.person,
      theme: parsed.theme,
      concept: parsed.concept,
      company: parsed.company,
      event: parsed.event,
      yearFrom: parsed.yearFrom,
      yearTo: parsed.yearTo,
      freeText: parsed.freeText,
      chips: parsed.chips,
    },
    exploration,
    proTotal,
    suggestions,
  };
}

async function resolvePersonId(slug?: string): Promise<string | undefined> {
  if (!slug) return undefined;
  const p = await db.person.findUnique({ where: { slug }, select: { id: true } });
  return p?.id;
}

// Nearest theme/concept names by shared word prefixes; falls back to the most
// referenced themes so the user always has a next step.
async function suggestQueries(query: string, tokens: string[]): Promise<string[]> {
  const [themes, concepts] = await Promise.all([
    db.theme.findMany({ select: { slug: true, name: true } }),
    db.concept.findMany({ select: { slug: true, name: true } }),
  ]);
  const scored: { label: string; score: number }[] = [];
  const qTokens = [...new Set([...tokens, ...query.toLowerCase().split(/\s+/)])]
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 3);
  const candidates = [
    ...themes.map((t) => ({ label: t.name, words: normWords(`${t.name} ${t.slug}`) })),
    ...concepts.map((c) => ({ label: c.name, words: normWords(`${c.name} ${c.slug}`) })),
  ];
  for (const c of candidates) {
    let score = 0;
    for (const t of qTokens) {
      for (const w of c.words) {
        if (w === t) score += 2;
        else if (w.startsWith(t) || t.startsWith(w)) score += 1;
      }
    }
    if (score > 0) scored.push({ label: c.label, score });
  }
  if (scored.length > 0) {
    return scored
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .slice(0, 5)
      .map((s) => s.label);
  }
  // Fallback: most-referenced themes in the whole library
  const top = await db.passageTheme.groupBy({
    by: ["themeId"],
    _count: { themeId: true },
    orderBy: { _count: { themeId: "desc" } },
    take: 5,
  });
  const ids = top.map((t) => t.themeId);
  const recs = await db.theme.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  const order = new Map(ids.map((id, i) => [id, i]));
  return recs.sort((a, b) => order.get(a.id)! - order.get(b.id)!).map((t) => t.name);
}

function normWords(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((w) => w.length >= 3);
>>>>>>> 4c40e29 (A1/A2: universal search across all investors with deterministic intent parsing)
}
