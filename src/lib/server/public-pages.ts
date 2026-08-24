/**
 * Server-side data access for public SEO routes (Lane B).
 *
 * PAYWALL DORMANT — the whole library is free to every visitor.
 *  - Rendered passage content is NO LONGER filtered by visibility. All
 *    passages (formerly public + pro) are selected for anonymous HTML.
 *  - FREE_PASSAGE_LIMIT cap removed — every referenced passage renders.
 *  - To re-enable the paywall: restore the `visibility: "public"` filter
 *    in refCounts/samplePublicPassages/sitemap, re-cap samplePublicPassages,
 *    and run UPDATE "Passage" SET visibility='pro' WHERE ... .
 *  - Investor↔theme/company relationships are derived through passages
 *    (PersonTheme/PersonCompany junctions are sparsely populated in the corpus).
 */
import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// PAYWALL DORMANT: no cap on rendered passages — the whole record shows.
export const FREE_PASSAGE_LIMIT = 9999;

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
  region: string | null;
  counts: { sources: number } & RefCounts;
  themes: EntityCount[];
  companies: EntityCount[];
  years: YearSpan;
  passages: PassageCard[];
};

// Founder pages share the exact same shape as investor pages — they live at
// /founders/[slug] instead of /investors/[slug] and use "founder" branding, but
// the underlying record (sources, passages, themes, companies, years) is the
// same. Alias the type so the founder server code reads cleanly.
export type FounderPageData = InvestorPageData;

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
  // PAYWALL DORMANT: total === publicCount (all passages render).
  const total = await db.passage.count({ where });
  return { total, publicCount: total };
}

/** First N passages for a filter, newest-source-first (timeline feel). */
async function samplePublicPassages(
  where: Prisma.PassageWhereInput,
  take: number = FREE_PASSAGE_LIMIT
): Promise<PassageCard[]> {
  const rows = await db.passage.findMany({
    where: mergeWhere(where, {
      // Evidence rule §9: HTML only ever renders reviewed material.
      verificationState: { notIn: ["needs_review", "rejected"] },
    }),
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

/**
 * Person profile: /investors/[slug] (kind="investor") or
 * /founders/[slug] (kind="founder"). Both surfaces share the same record
 * shape; only the URL prefix and "founder" vs "investor" branding differ.
 *
 * The `kind` filter is enforced at the SQL layer (findFirst by slug+kind) so
 * a founder slug like `jack-ma` returns null at /investors/jack-ma (rendering
 * the Refreshing fallback or 404) and resolves correctly at /founders/jack-ma.
 */
async function _getPersonPage(
  slug: string,
  kind: "investor" | "founder"
): Promise<InvestorPageData | null> {
  const person = await db.person.findFirst({
    where: { slug, kind },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDescription: true,
      bio: true,
      birthYear: true,
      region: true,
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
    region: person.region,
    counts: { sources, ...counts },
    themes,
    companies,
    years,
    passages,
  };
}

/** THE money page: /investors/[slug]/topics/[theme] */
async function _getInvestorTopic(
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
async function _getThemePage(slug: string): Promise<ThemePageData | null> {
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
async function _getCompanyPage(slug: string): Promise<CompanyPageData | null> {
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
async function _getEventPage(slug: string): Promise<EventPageData | null> {
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
async function _getYearPage(yearParam: string): Promise<YearPageData | null> {
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
  // Geographic region for founders: "china" | "india" | null. Investors are
  // always null (the US/Western roster is implicit / the default surface).
  region: string | null;
  counts: { sources: number } & RefCounts;
  topTheme: string | null;
};

async function _getInvestorDirectory(): Promise<DirectoryEntry[]> {
  // One SQL roundtrip: per-person source counts, passage totals, public-passage
  // counts, and the year span — instead of 3 queries per person plus a full
  // junction scan each (the old N+1 made this page the slowest on the site).
  type Row = {
    slug: string;
    name: string;
    short_description: string | null;
    region: string | null;
    sort_order: number;
    source_count: bigint;
    passage_count: bigint;
    public_count: bigint;
  };
  const rows = await db.$queryRaw<Row[]>`
    SELECT p.slug,
           p.name,
           p."shortDescription" AS short_description,
           p.region,
           p."sortOrder" AS sort_order,
           COUNT(DISTINCT s.id) AS source_count,
           COUNT(pa.id) AS passage_count,
           COUNT(pa.id) FILTER (WHERE pa.visibility = 'public') AS public_count
    FROM "Person" p
    LEFT JOIN "Source" s ON s."personId" = p.id
    LEFT JOIN "Passage" pa ON pa."sourceId" = s.id
    WHERE p.status = 'active'
      AND p.kind = 'investor'
    GROUP BY p.id, p.slug, p.name, p."shortDescription", p.region, p."sortOrder"
    ORDER BY p."sortOrder" ASC`;

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    shortDescription: r.short_description,
    region: r.region,
    counts: {
      sources: Number(r.source_count),
      total: Number(r.passage_count),
      publicCount: Number(r.public_count),
    },
    topTheme: null,
  }));
}

/**
 * Founder directory: /founders. Mirrors `_getInvestorDirectory` but filters
 * `kind='founder'` so the Chinese (52) + Indian (51) corpora surface here,
 * not on /investors. Returns `region` ("china" | "india") so the page can
 * render a region filter via searchParams.
 */
async function _getFounderDirectory(): Promise<DirectoryEntry[]> {
  type Row = {
    slug: string;
    name: string;
    short_description: string | null;
    region: string | null;
    sort_order: number;
    source_count: bigint;
    passage_count: bigint;
    public_count: bigint;
  };
  const rows = await db.$queryRaw<Row[]>`
    SELECT p.slug,
           p.name,
           p."shortDescription" AS short_description,
           p.region,
           p."sortOrder" AS sort_order,
           COUNT(DISTINCT s.id) AS source_count,
           COUNT(pa.id) AS passage_count,
           COUNT(pa.id) FILTER (WHERE pa.visibility = 'public') AS public_count
    FROM "Person" p
    LEFT JOIN "Source" s ON s."personId" = p.id
    LEFT JOIN "Passage" pa ON pa."sourceId" = s.id
    WHERE p.status = 'active'
      AND p.kind = 'founder'
    GROUP BY p.id, p.slug, p.name, p."shortDescription", p.region, p."sortOrder"
    ORDER BY p."sortOrder" ASC`;

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    shortDescription: r.short_description,
    region: r.region,
    counts: {
      sources: Number(r.source_count),
      total: Number(r.passage_count),
      publicCount: Number(r.public_count),
    },
    topTheme: null,
  }));
}

// ── Sitemap enumeration ─────────────────────────────────────────────────────

export type SitemapData = {
  investors: { slug: string; lastModified: Date }[];
  founders: { slug: string; lastModified: Date }[];
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

async function _getSitemapData(): Promise<SitemapData> {
  const MIN_TOPIC_REFS = 3;

  // Investors — people whose `kind` is "investor" (Buffett/Munger/Marks/…).
  const investorsRaw = await db.$queryRaw<{ slug: string; last_modified: Date }[]>`
    SELECT p.slug,
           MAX(s."updatedAt") AS last_modified
    FROM "Person" p
    JOIN "Source" s ON s."personId" = p.id
    JOIN "Passage" pa ON pa."sourceId" = s.id
    WHERE p.status = 'active'
      AND p.kind = 'investor'
    GROUP BY p.slug`;
  const investors = investorsRaw.map((r) => ({ slug: r.slug, lastModified: new Date(r.last_modified) }));

  // Founders — Chinese (52) + Indian (51) operators. Same shape as investors
  // but filtered by `kind='founder'` so /founders/<slug> gets its own URLs.
  const foundersRaw = await db.$queryRaw<{ slug: string; last_modified: Date }[]>`
    SELECT p.slug,
           MAX(s."updatedAt") AS last_modified
    FROM "Person" p
    JOIN "Source" s ON s."personId" = p.id
    JOIN "Passage" pa ON pa."sourceId" = s.id
    WHERE p.status = 'active'
      AND p.kind = 'founder'
    GROUP BY p.slug`;
  const founders = foundersRaw.map((r) => ({ slug: r.slug, lastModified: new Date(r.last_modified) }));

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
    HAVING COUNT(*) >= ${MIN_TOPIC_REFS}`;
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
      select: { theme: { select: { slug: true } } },
      distinct: ["themeId"],
    }),
    db.passageCompany.findMany({
      select: { company: { select: { slug: true } } },
      distinct: ["companyId"],
    }),
    db.passageEvent.findMany({
      select: { event: { select: { slug: true } } },
      distinct: ["eventId"],
    }),
    db.source.findMany({
      where: { year: { not: null } },
      distinct: ["year"],
      select: { year: true },
      orderBy: { year: "asc" },
    }),
  ]);

  return {
    investors,
    founders,
    topicPairs,
    themes: themeRows.map((r) => ({ slug: r.theme.slug })),
    companies: companyRows.map((r) => ({ slug: r.company.slug })),
    events: eventRows.map((r) => ({ slug: r.event.slug })),
    years: yearRows.map((r) => r.year!).filter((y) => y !== null),
  };
}

// ── Cached public API ─────────────────────────────────────────────────────────
// React cache(): generateMetadata and the page body call the same loader; the
// wrapper dedupes them into one DB roundtrip per request (per render pass).
//
// Every wrapper is also failure-proof: a transient database error returns
// null instead of throwing, so prerendering degrades to a "refreshing" page
// (noindex) that ISR replaces within the hour — a deploy never fails on a
// database hiccup. Pages distinguish "never existed" (404) from "failed to
// load" (fallback) with a lightweight existence check.

async function safe<T>(label: string, fn: () => Promise<T | null>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[public-pages] ${label} failed:`, e instanceof Error ? e.message : e);
    return null;
  }
}

export const getInvestorPage = cache((slug: string) =>
  safe("getInvestorPage", () => _getPersonPage(slug, "investor"))
);
export const getFounderPage = cache((slug: string) =>
  safe("getFounderPage", () => _getPersonPage(slug, "founder"))
);
export const getInvestorTopic = cache((slug: string, theme: string) =>
  safe("getInvestorTopic", () => _getInvestorTopic(slug, theme))
);
export const getThemePage = cache((slug: string) =>
  safe("getThemePage", () => _getThemePage(slug))
);
export const getCompanyPage = cache((slug: string) =>
  safe("getCompanyPage", () => _getCompanyPage(slug))
);
export const getEventPage = cache((slug: string) =>
  safe("getEventPage", () => _getEventPage(slug))
);
export const getYearPage = cache((year: string) =>
  safe("getYearPage", () => _getYearPage(year))
);
export const getInvestorDirectory = cache(() =>
  safe("getInvestorDirectory", () => _getInvestorDirectory())
);
export const getFounderDirectory = cache(() =>
  safe("getFounderDirectory", () => _getFounderDirectory())
);
export const getSitemapData = cache(() =>
  safe("getSitemapData", () => _getSitemapData())
);

/**
 * Existence check that confirms a Person row with `kind="founder"` exists.
 * Lets the /founders/[slug] route distinguish a true 404 (slug never seen)
 * from a transient DB failure (render Refreshing fallback so ISR can heal).
 */
export const founderExists = cache(async (slug: string): Promise<boolean> => {
  try {
    return Boolean(
      await db.person.findFirst({
        where: { slug, kind: "founder" },
        select: { id: true },
      })
    );
  } catch {
    return true; // if the check itself fails, assume it exists (render fallback)
  }
});

/** Existence checks — let pages distinguish 404 from a failed load. */
export const personExists = cache(async (slug: string): Promise<boolean> => {
  try {
    return Boolean(await db.person.findUnique({ where: { slug }, select: { id: true } }));
  } catch {
    return true; // if the check itself fails, assume it exists (render fallback)
  }
});
export const themeExists = cache(async (slug: string): Promise<boolean> => {
  try {
    return Boolean(await db.theme.findUnique({ where: { slug }, select: { id: true } }));
  } catch {
    return true;
  }
});
export const companyExists = cache(async (slug: string): Promise<boolean> => {
  try {
    return Boolean(await db.company.findUnique({ where: { slug }, select: { id: true } }));
  } catch {
    return true;
  }
});
export const eventExists = cache(async (slug: string): Promise<boolean> => {
  try {
    return Boolean(await db.event.findUnique({ where: { slug }, select: { id: true } }));
  } catch {
    return true;
  }
});
