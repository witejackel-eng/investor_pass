/**
 * Server-side data access for public SEO routes (Lane B).
 *
 * Rules enforced here:
 *  - Rendered passage content is ALWAYS filtered to `visibility: "public"`.
 *    Pro passages are never selected for anonymous HTML.
 *  - Aggregate counts may include pro records — that is the paywall teaser
 *    ("Showing 5 of 37 references"), per spec §26/§74.
 *  - Investor↔theme/company relationships are derived through passages
 *    (PersonTheme/PersonCompany junctions are sparsely populated in the corpus).
 */
import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const FREE_PASSAGE_LIMIT = 5;

// ── Shared types ────────────────────────────────────────────────────────────

export type RefCounts = { total: number; publicCount: number };

export type EntityCount = {
  slug: string;
  name: string;
  total: number;
  publicCount: number;
};

export type PassageCard = {
  id: string;
  text: string;
  context: string | null;
  source: {
    slug: string;
    title: string;
    sourceType: string;
    year: number | null;
    publisher: string | null;
    url: string | null;
    person: { slug: string; name: string };
  };
};

export type YearSpan = { from: number | null; to: number | null };

export type InvestorPageData = {
  slug: string;
  name: string;
  shortDescription: string | null;
  bio: string | null;
  birthYear: number | null;
  counts: { sources: number } & RefCounts;
  themes: EntityCount[];
  companies: EntityCount[];
  years: YearSpan;
  passages: PassageCard[];
};

export type InvestorTopicData = {
  person: { slug: string; name: string; shortDescription: string | null };
  theme: { slug: string; name: string; description: string | null };
  counts: RefCounts;
  years: YearSpan;
  passages: PassageCard[];
  companies: EntityCount[];
  concepts: EntityCount[];
};

export type ThemePageData = {
  slug: string;
  name: string;
  description: string | null;
  counts: RefCounts;
  investors: EntityCount[];
  years: YearSpan;
};

export type CompanyPageData = {
  slug: string;
  name: string;
  ticker: string | null;
  industry: string | null;
  description: string | null;
  counts: RefCounts;
  investors: EntityCount[];
  themes: EntityCount[];
  years: YearSpan;
  passages: PassageCard[];
};

export type EventPageData = {
  slug: string;
  name: string;
  date: string | null;
  description: string | null;
  counts: RefCounts;
  investors: EntityCount[];
  passages: PassageCard[];
};

export type YearPageData = {
  year: number;
  counts: RefCounts;
  sources: number;
  investors: EntityCount[];
  sourceTypes: EntityCount[];
  passages: PassageCard[];
  prevYear: number | null;
  nextYear: number | null;
};

// ── Internal helpers ────────────────────────────────────────────────────────

const PASSAGE_CARD_SELECT = {
  id: true,
  text: true,
  context: true,
  source: {
    select: {
      slug: true,
      title: true,
      sourceType: true,
      year: true,
      publisher: true,
      url: true,
      person: { select: { slug: true, name: true } },
    },
  },
} satisfies Prisma.PassageSelect;

function mergeWhere(base: Prisma.PassageWhereInput, extra?: Prisma.PassageWhereInput) {
  if (!extra) return base;
  return { AND: [base, extra] };
}

async function refCounts(where: Prisma.PassageWhereInput): Promise<RefCounts> {
  const [total, publicCount] = await Promise.all([
    db.passage.count({ where }),
    db.passage.count({ where: mergeWhere(where, { visibility: "public" }) }),
  ]);
  return { total, publicCount };
}

/** First N public passages for a filter, newest-source-first (timeline feel). */
async function samplePublicPassages(
  where: Prisma.PassageWhereInput,
  take: number = FREE_PASSAGE_LIMIT
): Promise<PassageCard[]> {
  const rows = await db.passage.findMany({
    where: mergeWhere(where, { visibility: "public" }),
    select: PASSAGE_CARD_SELECT,
    orderBy: [{ source: { year: "desc" } }, { sequence: "asc" }],
    take,
  });
  return rows as PassageCard[];
}

async function yearSpan(where: Prisma.PassageWhereInput): Promise<YearSpan> {
  const agg = await db.source.aggregate({
    _min: { year: true },
    _max: { year: true },
    where: { year: { not: null }, passages: { some: where } },
  });
  return { from: agg._min.year, to: agg._max.year };
}

type Tally = Map<string, { name: string; total: number; publicCount: number }>;

function tallyAdd(tally: Tally, key: string, name: string, visibility: string | undefined) {
  const entry = tally.get(key) ?? { name, total: 0, publicCount: 0 };
  entry.total += 1;
  if (visibility === "public") entry.publicCount += 1;
  tally.set(key, entry);
}

function toEntityCounts(tally: Tally, limit?: number): EntityCount[] {
  const list = [...tally.entries()].map(([slug, v]) => ({ slug, ...v }));
  list.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  return limit ? list.slice(0, limit) : list;
}

/** Break a passage filter down by theme (derived via PassageTheme). */
async function breakdownByTheme(
  where: Prisma.PassageWhereInput,
  limit?: number
): Promise<EntityCount[]> {
  const rows = await db.passageTheme.findMany({
    where: { passage: where },
    select: {
      theme: { select: { slug: true, name: true } },
      passage: { select: { visibility: true } },
    },
  });
  const tally: Tally = new Map();
  for (const r of rows) tallyAdd(tally, r.theme.slug, r.theme.name, r.passage.visibility);
  return toEntityCounts(tally, limit);
}

/** Break a passage filter down by company (derived via PassageCompany). */
async function breakdownByCompany(
  where: Prisma.PassageWhereInput,
  limit?: number
): Promise<EntityCount[]> {
  const rows = await db.passageCompany.findMany({
    where: { passage: where },
    select: {
      company: { select: { slug: true, name: true } },
      passage: { select: { visibility: true } },
    },
  });
  const tally: Tally = new Map();
  for (const r of rows) tallyAdd(tally, r.company.slug, r.company.name, r.passage.visibility);
  return toEntityCounts(tally, limit);
}

/** Break a passage filter down by investor (via the owning Source.person). */
async function breakdownByInvestor(
  where: Prisma.PassageWhereInput,
  limit?: number
): Promise<EntityCount[]> {
  const rows = await db.passage.findMany({
    where,
    select: {
      visibility: true,
      source: { select: { person: { select: { slug: true, name: true } } } },
    },
  });
  const tally: Tally = new Map();
  for (const r of rows)
    tallyAdd(tally, r.source.person.slug, r.source.person.name, r.visibility);
  return toEntityCounts(tally, limit);
}

/** Break a passage filter down by concept (derived via PassageConcept). */
async function breakdownByConcept(
  where: Prisma.PassageWhereInput,
  limit?: number
): Promise<EntityCount[]> {
  const rows = await db.passageConcept.findMany({
    where: { passage: where },
    select: {
      concept: { select: { slug: true, name: true } },
      passage: { select: { visibility: true } },
    },
  });
  const tally: Tally = new Map();
  for (const r of rows) tallyAdd(tally, r.concept.slug, r.concept.name, r.passage.visibility);
  return toEntityCounts(tally, limit);
}

/** Break a passage filter down by the owning source's type. */
async function breakdownBySourceType(
  where: Prisma.PassageWhereInput,
  limit?: number
): Promise<EntityCount[]> {
  const rows = await db.passage.findMany({
    where,
    select: { visibility: true, source: { select: { sourceType: true } } },
  });
  const tally: Tally = new Map();
  for (const r of rows) tallyAdd(tally, r.source.sourceType, r.source.sourceType, r.visibility);
  return toEntityCounts(tally, limit);
}

// ── B1 page helpers ─────────────────────────────────────────────────────────

/** Investor profile: /investors/[slug] */
export async function getInvestorPage(slug: string): Promise<InvestorPageData | null> {
  const person = await db.person.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDescription: true,
      bio: true,
      birthYear: true,
    },
  });
  if (!person) return null;

  const personScope: Prisma.PassageWhereInput = { source: { personId: person.id } };

  const [sources, counts, themes, companies, years, passages] = await Promise.all([
    db.source.count({ where: { personId: person.id } }),
    refCounts(personScope),
    breakdownByTheme(personScope),
    breakdownByCompany(personScope, 8),
    yearSpan(personScope),
    samplePublicPassages(personScope),
  ]);

  return {
    slug: person.slug,
    name: person.name,
    shortDescription: person.shortDescription,
    bio: person.bio,
    birthYear: person.birthYear,
    counts: { sources, ...counts },
    themes,
    companies,
    years,
    passages,
  };
}

/** THE money page: /investors/[slug]/topics/[theme] */
export async function getInvestorTopic(
  personSlug: string,
  themeSlug: string
): Promise<InvestorTopicData | null> {
  const found = await db.person.findUnique({
    where: { slug: personSlug },
    select: { id: true, slug: true, name: true, shortDescription: true },
  });
  if (!found) return null;
  const theme = await db.theme.findUnique({
    where: { slug: themeSlug },
    select: { slug: true, name: true, description: true },
  });
  if (!theme) return null;

  const scope: Prisma.PassageWhereInput = {
    source: { personId: found.id },
    passageThemes: { some: { theme: { slug: themeSlug } } },
  };

  const [counts, years, passages, companies, concepts] = await Promise.all([
    refCounts(scope),
    yearSpan(scope),
    samplePublicPassages(scope),
    breakdownByCompany(scope, 6),
    breakdownByConcept(scope, 6),
  ]);

  return {
    person: { slug: found.slug, name: found.name, shortDescription: found.shortDescription },
    theme: { slug: theme.slug, name: theme.name, description: theme.description },
    counts,
    years,
    passages,
    companies,
    concepts,
  };
}

/** Theme hub: /themes/[slug] */
export async function getThemePage(slug: string): Promise<ThemePageData | null> {
  const theme = await db.theme.findUnique({
    where: { slug },
    select: { slug: true, name: true, description: true },
  });
  if (!theme) return null;

  const scope: Prisma.PassageWhereInput = {
    passageThemes: { some: { theme: { slug } } },
  };
  const [counts, investors, years] = await Promise.all([
    refCounts(scope),
    breakdownByInvestor(scope),
    yearSpan(scope),
  ]);

  return { slug: theme.slug, name: theme.name, description: theme.description, counts, investors, years };
}

/** Company hub: /companies/[slug] */
export async function getCompanyPage(slug: string): Promise<CompanyPageData | null> {
  const company = await db.company.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      ticker: true,
      description: true,
      industry: { select: { name: true } },
    },
  });
  if (!company) return null;

  const scope: Prisma.PassageWhereInput = {
    passageCompanies: { some: { company: { slug } } },
  };
  const [counts, investors, themes, years, passages] = await Promise.all([
    refCounts(scope),
    breakdownByInvestor(scope),
    breakdownByTheme(scope, 8),
    yearSpan(scope),
    samplePublicPassages(scope),
  ]);

  return {
    slug: company.slug,
    name: company.name,
    ticker: company.ticker,
    industry: company.industry?.name ?? null,
    description: company.description,
    counts,
    investors,
    themes,
    years,
    passages,
  };
}

/** Event hub: /events/[slug] — passages grouped by investor */
export async function getEventPage(slug: string): Promise<EventPageData | null> {
  const event = await db.event.findUnique({
    where: { slug },
    select: { slug: true, name: true, date: true, description: true },
  });
  if (!event) return null;

  const scope: Prisma.PassageWhereInput = {
    passageEvents: { some: { event: { slug } } },
  };
  const [counts, investors, passages] = await Promise.all([
    refCounts(scope),
    breakdownByInvestor(scope),
    samplePublicPassages(scope),
  ]);

  return {
    slug: event.slug,
    name: event.name,
    date: event.date,
    description: event.description,
    counts,
    investors,
    passages,
  };
}

/** Year page: /years/[year] */
export async function getYearPage(yearParam: string): Promise<YearPageData | null> {
  if (!/^\d{4}$/.test(yearParam)) return null;
  const year = Number(yearParam);

  const distinctYears = await db.source.findMany({
    where: { year: { not: null } },
    distinct: ["year"],
    select: { year: true },
    orderBy: { year: "asc" },
  });

  const scope: Prisma.PassageWhereInput = { source: { year } };
  const [counts, sources, investors, sourceTypes, passages] = await Promise.all([
    refCounts(scope),
    db.source.count({ where: { year } }),
    breakdownByInvestor(scope),
    breakdownBySourceType(scope),
    samplePublicPassages(scope),
  ]);

  const yearsAsc = distinctYears.map((r) => r.year!).filter((y) => y !== null);
  const idx = yearsAsc.indexOf(year);

  return {
    year,
    counts,
    sources,
    investors,
    sourceTypes,
    passages,
    prevYear: idx > 0 ? yearsAsc[idx - 1] : null,
    nextYear: idx >= 0 && idx < yearsAsc.length - 1 ? yearsAsc[idx + 1] : null,
  };
}

/** Investor directory: /investors */
export type DirectoryEntry = {
  slug: string;
  name: string;
  shortDescription: string | null;
  counts: { sources: number } & RefCounts;
  topTheme: string | null;
};

export async function getInvestorDirectory(): Promise<DirectoryEntry[]> {
  const people = await db.person.findMany({
    where: { status: "active" },
    select: { id: true, slug: true, name: true, shortDescription: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });

  return Promise.all(
    people.map(async (p) => {
      const scope: Prisma.PassageWhereInput = { source: { personId: p.id } };
      const [sources, byVis, topThemes] = await Promise.all([
        db.source.count({ where: { personId: p.id } }),
        db.passage.groupBy({ by: ["visibility"], _count: { _all: true }, where: scope }),
        breakdownByTheme(scope, 1),
      ]);
      const total = byVis.reduce((sum, g) => sum + g._count._all, 0);
      const pub = byVis.find((g) => g.visibility === "public")?._count._all ?? 0;
      return {
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        counts: { sources, total, publicCount: pub },
        topTheme: topThemes[0]?.name ?? null,
      };
    })
  );
}

// ── Sitemap enumeration ─────────────────────────────────────────────────────

export type SitemapData = {
  investors: { slug: string }[];
  topicPairs: { personSlug: string; themeSlug: string }[];
  themes: { slug: string }[];
  companies: { slug: string }[];
  events: { slug: string }[];
  years: number[];
};

/**
 * Enumerate every indexable public URL class.
 * Index only meaningful pages: topic pairs need ≥3 total references AND ≥1
 * public passage; entity pages need ≥1 public passage (spec §43).
 */

export async function getSitemapData(): Promise<SitemapData> {
  const MIN_TOPIC_REFS = 3;

  const investors = await db.person.findMany({
    where: { status: "active" },
    select: { slug: true },
  });

  // SQL-side aggregation: ~500 result rows instead of pulling every junction row.
  const pairs = await db.$queryRaw<{ person_slug: string; theme_slug: string }[]>`
    SELECT p.slug AS person_slug, t.slug AS theme_slug
    FROM "PassageTheme" pt
    JOIN "Passage" pa ON pa.id = pt."passageId"
    JOIN "Source" s ON s.id = pa."sourceId"
    JOIN "Person" p ON p.id = s."personId"
    JOIN "Theme" t ON t.id = pt."themeId"
    WHERE p.status = 'active'
    GROUP BY p.slug, t.slug
    HAVING COUNT(*) >= ${MIN_TOPIC_REFS}
       AND SUM(CASE WHEN pa.visibility = 'public' THEN 1 ELSE 0 END) >= 1`;
  const topicPairs = pairs
    .map((r) => ({ personSlug: r.person_slug, themeSlug: r.theme_slug }))
    .sort(
      (a, b) =>
        a.personSlug === b.personSlug
          ? a.themeSlug.localeCompare(b.themeSlug)
          : a.personSlug.localeCompare(b.personSlug)
    );

  const [themeRows, companyRows, eventRows, yearRows] = await Promise.all([
    db.passageTheme.findMany({
      where: { passage: { visibility: "public" } },
      select: { theme: { select: { slug: true } } },
      distinct: ["themeId"],
    }),
    db.passageCompany.findMany({
      where: { passage: { visibility: "public" } },
      select: { company: { select: { slug: true } } },
      distinct: ["companyId"],
    }),
    db.passageEvent.findMany({
      where: { passage: { visibility: "public" } },
      select: { event: { select: { slug: true } } },
      distinct: ["eventId"],
    }),
    db.source.findMany({
      where: { year: { not: null }, passages: { some: { visibility: "public" } } },
      distinct: ["year"],
      select: { year: true },
      orderBy: { year: "asc" },
    }),
  ]);

  return {
    investors,
    topicPairs,
    themes: themeRows.map((r) => ({ slug: r.theme.slug })),
    companies: companyRows.map((r) => ({ slug: r.company.slug })),
    events: eventRows.map((r) => ({ slug: r.event.slug })),
    years: yearRows.map((r) => r.year!).filter((y) => y !== null),
  };
}
