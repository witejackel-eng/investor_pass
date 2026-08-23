/**
 * Server-side search — deterministic token-based intent parsing + weighted ranking.
 *
 * Queries are parsed into structured filters (person/theme/company/concept/
 * event/years) plus leftover free-text tokens (see ./intent). Search spans ALL
 * investors unless a person filter is set.
 *
 * Premium (pro) passages are NEVER sent to anonymous clients. The server
 * resolves entitlement first and queries only permitted records.
 */
import "server-only";
import { db } from "../db";
import { parseQuery, type ParsedQuery } from "./intent";

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
    person: { slug: string; name: string };
  };
  themes: { slug: string; name: string }[];
  concepts: { slug: string; name: string }[];
  companies: { slug: string; name: string }[];
  events: { slug: string; name: string }[];
};

export type Exploration = {
  term: string;
  references: number;
  investors: number;
  sources: number;
  byInvestor: { slug: string; name: string; count: number }[];
};

export type SearchResult = {
  hits: SearchHit[];
  total: number;
  page: number;
  pageSize: number;
  parsed: Pick<ParsedQuery, "person" | "theme" | "concept" | "company" | "event" | "yearFrom" | "yearTo" | "freeText" | "chips">;
  exploration: Exploration | null;
  /** Total references including pro-only ones — exposed to free users as a count only */
  proTotal: number | null;
  /** Suggested queries when nothing matched */
  suggestions: string[];
};

const tokenizeFreeText = (q: string): string[] =>
  q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((t) => t.length > 1);

export async function searchPassages(
  query: string,
  filters: SearchFilters,
  isPro: boolean,
  page = 1,
  pageSize = 20
): Promise<SearchResult> {
  // Deterministic intent parsing — explicit UI params win over parsed entities
  const parsed = await parseQuery(query, {
    person: filters.person,
    theme: filters.theme,
    concept: filters.concept,
    company: filters.company,
    event: filters.event,
    yearFrom: filters.yearFrom,
    yearTo: filters.yearTo,
  });

  const personId = await resolvePersonId(parsed.person);
  const tokens = [...new Set([...parsed.freeText, ...tokenizeFreeText(query)])].filter(Boolean);

  const where: any = { AND: [] };
  // visibility gate — anonymous users only see public passages
  where.visibility = isPro ? { in: ["public", "pro"] } : "public";

  if (personId) {
    where.AND.push({ source: { personId } });
  }
  if (filters.sourceType) {
    where.AND.push({ source: { sourceType: filters.sourceType } });
  }
  if (filters.decade) {
    where.AND.push({
      source: { year: { gte: filters.decade, lte: filters.decade + 9 } },
    });
  } else if (parsed.yearFrom || parsed.yearTo) {
    where.AND.push({
      source: {
        year: {
          gte: parsed.yearFrom ?? undefined,
          lte: parsed.yearTo ?? undefined,
        },
      },
    });
  }
  if (parsed.theme) {
    where.AND.push({ passageThemes: { some: { theme: { slug: parsed.theme } } } });
  }
  if (parsed.concept) {
    where.AND.push({ passageConcepts: { some: { concept: { slug: parsed.concept } } } });
  }
  if (parsed.company) {
    where.AND.push({ passageCompanies: { some: { company: { slug: parsed.company } } } });
  }
  if (parsed.event) {
    where.AND.push({ passageEvents: { some: { event: { slug: parsed.event } } } });
  }

  // Token-based text match (ILIKE OR). Matches passage text, source title/
  // publisher, and tag names so searching "moats" or "Coca-Cola" finds tagged
  // passages. mode: "insensitive" is REQUIRED on Postgres — tokens are
  // lowercased, and a case-sensitive LIKE would silently miss "Coca-Cola".
  if (tokens.length) {
    const orClauses: any[] = [];
    for (const t of tokens) {
      orClauses.push({ text: { contains: t, mode: "insensitive" } });
      orClauses.push({ source: { title: { contains: t, mode: "insensitive" } } });
      orClauses.push({ source: { publisher: { contains: t, mode: "insensitive" } } });
      orClauses.push({ passageThemes: { some: { theme: { name: { contains: t, mode: "insensitive" } } } } });
      orClauses.push({ passageThemes: { some: { theme: { slug: { contains: t, mode: "insensitive" } } } } });
      orClauses.push({ passageConcepts: { some: { concept: { name: { contains: t, mode: "insensitive" } } } } });
      orClauses.push({ passageCompanies: { some: { company: { name: { contains: t, mode: "insensitive" } } } } });
      orClauses.push({ passageCompanies: { some: { company: { canonicalName: { contains: t, mode: "insensitive" } } } } });
      orClauses.push({ passageCompanies: { some: { company: { ticker: { contains: t, mode: "insensitive" } } } } });
      orClauses.push({ passageEvents: { some: { event: { name: { contains: t, mode: "insensitive" } } } } });
    }
    where.AND.push({ OR: orClauses });
  }

  if (where.AND.length === 0) delete where.AND;

  const [total, rows] = await Promise.all([
    db.passage.count({ where }),
    db.passage.findMany({
      where,
      include: {
        source: { include: { person: true } },
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
      for (const pt of p.passageThemes) if (pt.theme.name.toLowerCase().includes(t)) score += 30;
      for (const pc of p.passageConcepts) if (pc.concept.name.toLowerCase().includes(t)) score += 30;
      for (const pco of p.passageCompanies) if (pco.company.name.toLowerCase().includes(t)) score += 30;
    }
    if (!tokens.length) score = 100 - p.sequence;
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
        person: { slug: p.source.person.slug, name: p.source.person.name },
      },
      themes: p.passageThemes.map((pt) => ({ slug: pt.theme.slug, name: pt.theme.name })),
      concepts: p.passageConcepts.map((pc) => ({ slug: pc.concept.slug, name: pc.concept.name })),
      companies: p.passageCompanies.map((pco) => ({ slug: pco.company.slug, name: pco.company.name })),
      events: p.passageEvents.map((pe) => ({ slug: pe.event.slug, name: pe.event.name })),
    };
  });

  hits.sort((a, b) => b.score - a.score);

  // Exploration summary for broad queries (few tokens / entity-only match).
  // Counts come from one batched roundtrip — no N+1 loops.
  const structuredCount = [personId, parsed.theme, parsed.concept, parsed.company, parsed.event].filter(Boolean).length;
  const hasRangeOrMeta = Boolean(parsed.yearFrom || parsed.yearTo || filters.decade || filters.sourceType);
  const isBroad = tokens.length <= 1 && structuredCount <= 1 && !hasRangeOrMeta && (query.trim() !== "" || structuredCount === 1);
  let exploration: Exploration | null = null;
  if (isBroad) {
    // SQL-side aggregation: one query over sources with passage counts —
    // no full result sets pulled into memory.
    const sources = await db.source.findMany({
      where: { passages: { some: where } },
      select: {
        slug: true,
        person: { select: { slug: true, name: true } },
        _count: { select: { passages: { where } } },
      },
      take: 2000,
    });
    const perPerson = new Map<string, { slug: string; name: string; count: number }>();
    for (const s of sources) {
      const count = s._count.passages;
      const entry = perPerson.get(s.person.slug);
      if (entry) entry.count += count;
      else perPerson.set(s.person.slug, { slug: s.person.slug, name: s.person.name, count });
    }
    exploration = {
      term: (query.trim() || "").toUpperCase(),
      references: total,
      investors: perPerson.size,
      sources: sources.length,
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
}
