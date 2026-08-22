/**
 * Deterministic query-intent parsing. No AI/LLM — alias tables + token matching.
 *
 * Raw query strings are parsed into structured filters (person/theme/concept/
 * company/event/years) plus leftover free-text tokens. Alias tables are built
 * from the canonical entity tables at first use and cached for the process.
 */
import "server-only";
import { db } from "../db";

export type ParsedFilterChip = {
  kind: "person" | "theme" | "concept" | "company" | "event" | "years";
  label: string;
  value: string;
};

export type ParsedQuery = {
  person?: string;
  theme?: string;
  concept?: string;
  company?: string;
  event?: string;
  yearFrom?: number;
  yearTo?: number;
  freeText: string[];
  chips: ParsedFilterChip[];
};

type EntityRef = { kind: "person" | "theme" | "concept" | "company" | "event"; slug: string; name: string };

// Priority when one span matches entities of multiple kinds.
const KIND_PRIORITY: EntityRef["kind"][] = ["person", "event", "company", "theme", "concept"];

// Words separated by single spaces — matching preserves boundaries ("ko"
// never fires inside "tokyo"; "goldman sachs" matches across the space).
const normKey = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

const STOPWORDS = new Set([
  "on", "of", "in", "the", "and", "for", "to", "at", "by", "with", "vs", "about", "from", "an", "as", "is", "was", "what",
]);

type AliasIndex = {
  phrases: { key: string; ref: EntityRef }[];
  tokens: Map<string, EntityRef[]>;
};

let aliasCache: AliasIndex | null = null;

function addAlias(index: AliasIndex, raw: string, ref: EntityRef) {
  const key = normKey(raw);
  if (!key || key.length < 2 || /^\d+$/.test(key)) return;
  if (!index.phrases.some((p) => p.key === key && p.ref.slug === ref.slug)) {
    index.phrases.push({ key, ref });
  }
  // Single-word aliases also feed the token index
  if (!key.includes(" ")) {
    const list = index.tokens.get(key) || [];
    if (!list.some((r) => r.kind === ref.kind && r.slug === ref.slug)) list.push(ref);
    index.tokens.set(key, list);
  }
}

// "moats"/"moat"-style variants applied to names and slugs
function pluralVariants(raw: string): string[] {
  const base = raw.trim();
  if (!base) return [];
  return base.toLowerCase().endsWith("s") ? [base, base.slice(0, -1)] : [base, `${base}s`];
}

async function buildAliasIndex(): Promise<AliasIndex> {
  const [persons, themes, concepts, companies, events] = await Promise.all([
    db.person.findMany({ select: { slug: true, name: true } }),
    db.theme.findMany({ select: { slug: true, name: true } }),
    db.concept.findMany({ select: { slug: true, name: true } }),
    db.company.findMany({ select: { slug: true, name: true, canonicalName: true, ticker: true } }),
    db.event.findMany({ select: { slug: true, name: true } }),
  ]);

  const index: AliasIndex = { phrases: [], tokens: new Map() };

  for (const p of persons) {
    const ref: EntityRef = { kind: "person", slug: p.slug, name: p.name };
    addAlias(index, p.name, ref);
    addAlias(index, p.slug.replace(/-/g, " "), ref);
    const words = p.name.toLowerCase().split(/\s+/);
    // Only include first/last-name tokens that uniquely identify one person
    // ("john" is ambiguous across Bogle/Templeton — full phrases still match).
    for (const w of words) {
      const others = persons.filter((o) => o.name.toLowerCase().split(/\s+/).includes(w));
      if (others.length === 1) addAlias(index, w, ref);
    }
  }

  const themeDefs = themes.map((t) => ({ kind: "theme" as const, slug: t.slug, name: t.name }));
  for (const t of themeDefs) {
    for (const v of pluralVariants(t.name)) addAlias(index, v, t);
    for (const v of pluralVariants(t.slug.replace(/-/g, " "))) addAlias(index, v, t);
  }
  for (const c of concepts.map((c) => ({ kind: "concept" as const, slug: c.slug, name: c.name }))) {
    addAlias(index, c.name, c);
    addAlias(index, c.slug.replace(/-/g, " "), c);
  }
  for (const c of companies.map((c) => ({ kind: "company" as const, slug: c.slug, name: c.name, canonicalName: c.canonicalName, ticker: c.ticker }))) {
    const ref: EntityRef = { kind: "company", slug: c.slug, name: c.name };
    addAlias(index, c.name, ref);
    if (c.canonicalName) addAlias(index, c.canonicalName, ref);
    if (c.ticker) addAlias(index, c.ticker, ref);
    addAlias(index, c.slug.replace(/-/g, " "), ref);
  }
  for (const e of events.map((e) => ({ kind: "event" as const, slug: e.slug, name: e.name }))) {
    addAlias(index, e.name, e);
    addAlias(index, e.slug.replace(/-/g, " "), e);
  }

  index.phrases.sort((a, b) => b.key.length - a.key.length);
  return index;
}

export async function getAliasIndex(): Promise<AliasIndex> {
  if (!aliasCache) aliasCache = await buildAliasIndex();
  return aliasCache;
}

/**
 * Parse a raw query into structured filters + leftover free text.
 * `explicit` filters set via UI params win over parsed ones; a parsed entity
 * that collides with a different explicit filter stays in free text instead
 * of being consumed.
 */
export async function parseQuery(
  query: string,
  explicit: { person?: string; theme?: string; concept?: string; company?: string; event?: string; yearFrom?: number; yearTo?: number } = {}
): Promise<ParsedQuery> {
  const result: ParsedQuery = {
    freeText: [],
    chips: [],
    person: explicit.person,
    theme: explicit.theme,
    concept: explicit.concept,
    company: explicit.company,
    event: explicit.event,
  };
  const working = ` ${query.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
  const n = working.length;

  type Span = { start: number; end: number };
  const spans: Span[] = [];
  const hits = (start: number, end: number) => spans.some((s) => start < s.end && end > s.start);
  const take = (start: number, end: number) => spans.push({ start, end });

  // ── Years ──────────────────────────────────────────────────────────────────
  const rangeRe = /((?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:19|20)\d{2})/g;
  let m: RegExpExecArray | null;
  while ((m = rangeRe.exec(working)) !== null) {
    const from = parseInt(m[1], 10);
    const to = parseInt(m[2], 10);
    if (to >= from && !hits(m.index, m.index + m[0].length)) {
      if (result.yearFrom === undefined) result.yearFrom = from;
      if (result.yearTo === undefined) result.yearTo = to;
      take(m.index, m.index + m[0].length);
    }
  }
  const singles: { year: number; start: number; end: number }[] = [];
  const yearRe = /(?:19|20)\d{2}/g;
  while ((m = yearRe.exec(working)) !== null) {
    const span = { start: m.index, end: m.index + 4 };
    if (!hits(span.start, span.end)) {
      singles.push({ year: parseInt(m[0], 10), ...span });
      take(span.start, span.end);
    }
  }
  if (singles.length > 0 && explicit.yearFrom === undefined && explicit.yearTo === undefined && result.yearFrom === undefined) {
    result.yearFrom = Math.min(...singles.map((y) => y.year));
    result.yearTo = Math.max(...singles.map((y) => y.year));
  }

  // ── Entity phrases (longest first) ─────────────────────────────────────────
  const index = await getAliasIndex();
  const matched: Span[] = [];
  const refsOf = new Map<Span, EntityRef>();
  for (const phrase of index.phrases) {
    const needle = ` ${phrase.key} `;
    let pos = working.indexOf(needle);
    while (pos !== -1) {
      const start = pos + 1;
      const end = start + phrase.key.length;
      if (!hits(start, end) && !matched.some((r) => start < r.end && end > r.start)) {
        const span = { start, end };
        matched.push(span);
        refsOf.set(span, phrase.ref);
      }
      pos = working.indexOf(needle, pos + 1);
    }
  }
  matched.sort((a, b) => a.start - b.start);
  for (const span of matched) take(span.start, span.end);

  const applyRef = (ref: EntityRef): boolean => {
    const current =
      ref.kind === "person" ? result.person :
      ref.kind === "theme" ? result.theme :
      ref.kind === "concept" ? result.concept :
      ref.kind === "company" ? result.company : result.event;
    if (current === ref.slug) return true;
    if (current) return false;
    if (ref.kind === "person") result.person = ref.slug;
    else if (ref.kind === "theme") result.theme = ref.slug;
    else if (ref.kind === "concept") result.concept = ref.slug;
    else if (ref.kind === "company") result.company = ref.slug;
    else result.event = ref.slug;
    return true;
  };

  const leftovers: string[] = [];
  for (const span of matched) {
    const ref = refsOf.get(span)!;
    if (!applyRef(ref)) leftovers.push(ref.name.toLowerCase());
  }

  // ── Remaining tokens ───────────────────────────────────────────────────────
  let cursor = 0;
  for (const span of [...spans].sort((a, b) => a.start - b.start)) {
    if (span.start > cursor) extractTokens(working.slice(cursor, span.start), index, result, applyRef, leftovers);
    cursor = Math.max(cursor, span.end);
  }
  if (cursor < n) extractTokens(working.slice(cursor), index, result, applyRef, leftovers);
  result.freeText = [...new Set(leftovers)];

  // ── Chips (stable order) ───────────────────────────────────────────────────
  if (result.person) result.chips.push({ kind: "person", label: await personName(result.person), value: result.person });
  if (result.company) result.chips.push({ kind: "company", label: await companyLabel(result.company), value: result.company });
  if (result.theme) result.chips.push({ kind: "theme", label: await themeLabel(result.theme), value: result.theme });
  if (result.concept) result.chips.push({ kind: "concept", label: await conceptLabel(result.concept), value: result.concept });
  if (result.event) result.chips.push({ kind: "event", label: await eventLabel(result.event), value: result.event });
  if (result.yearFrom !== undefined) {
    const yf = result.yearFrom!;
    const yt = result.yearTo ?? yf;
    result.chips.push({ kind: "years", label: yf === yt ? `${yf}` : `${yf}–${yt}`, value: "years" });
  }

  return result;
}

function extractTokens(
  text: string,
  index: AliasIndex,
  result: ParsedQuery,
  applyRef: (ref: EntityRef) => boolean,
  leftovers: string[]
) {
  for (const raw of text.split(/\s+/)) {
    const clean = raw.replace(/^-+|-+$/g, "");
    if (!clean || clean.length < 2 || STOPWORDS.has(clean) || /^\d+$/.test(clean)) continue;
    const candidates = index.tokens.get(normKey(clean));
    if (candidates && candidates.length > 0) {
      const distinctSlugs = new Set(candidates.map((c) => `${c.kind}:${c.slug}`));
      // Ambiguous token (several entities share this alias) stays free text
      if (distinctSlugs.size === 1 && applyRef(candidates[0])) continue;
    }
    leftovers.push(clean);
  }
}

function pickByPriority(candidates: EntityRef[]): EntityRef {
  for (const kind of KIND_PRIORITY) {
    const hit = candidates.find((c) => c.kind === kind);
    if (hit) return hit;
  }
  return candidates[0];
}
void pickByPriority;

async function lookup(kind: EntityRef["kind"], slug?: string): Promise<string> {
  if (!slug) return "";
  if (kind === "person") {
    const p = await db.person.findUnique({ where: { slug }, select: { name: true } });
    if (p) return p.name;
  } else if (kind === "company") {
    const c = await db.company.findUnique({ where: { slug }, select: { name: true, ticker: true } });
    if (c) return c.ticker ? `${c.name} (${c.ticker})` : c.name;
  } else if (kind === "theme") {
    const t = await db.theme.findUnique({ where: { slug }, select: { name: true } });
    if (t) return t.name;
  } else if (kind === "concept") {
    const c = await db.concept.findUnique({ where: { slug }, select: { name: true } });
    if (c) return c.name;
  } else if (kind === "event") {
    const e = await db.event.findUnique({ where: { slug }, select: { name: true } });
    if (e) return e.name;
  }
  return slug;
}

export const personName = (slug?: string) => lookup("person", slug);
export const themeLabel = (slug?: string) => lookup("theme", slug);
export const companyLabel = (slug?: string) => lookup("company", slug);
export const conceptLabel = (slug?: string) => lookup("concept", slug);
export const eventLabel = (slug?: string) => lookup("event", slug);
