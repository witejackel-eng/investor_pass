"use client";
import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet, apiPost, apiDelete } from "@/lib/client";
import { SearchBar } from "@/components/investor/search-bar";
import { EntityChips, PremiumGate, ProBadge } from "@/components/investor/entity-chips";
import { Loading } from "./views-core";
import { Bookmark, Save, Trash2, FolderPlus, Lock, Search as SearchIcon, ChevronRight, SlidersHorizontal, Download, Share2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { HighlightedText } from "@/components/investor/highlighted-text";

// ── Search view ────────────────────────────────────────────────────────────
type SearchHit = {
  passageId: string;
  text: string;
  context: string | null;
  section: string | null;
  visibility: string;
  score: number;
  source: {
    id: string; slug: string; title: string; sourceType: string; year: number | null; publisher: string | null; url: string | null;
    person: { slug: string; name: string };
  };
  themes: { slug: string; name: string }[];
  concepts: { slug: string; name: string }[];
  companies: { slug: string; name: string }[];
  events: { slug: string; name: string }[];
};

type ParsedChip = {
  kind: "person" | "theme" | "concept" | "company" | "event" | "years";
  label: string;
  value: string;
};

type SearchResponse = {
  hits: SearchHit[];
  total: number;
  isPro: boolean;
  parsed: {
    person?: string; theme?: string; concept?: string; company?: string; event?: string;
    yearFrom?: number; yearTo?: number; freeText: string[]; chips: ParsedChip[];
  };
  exploration: null | {
    term: string;
    references: number;
    investors: number;
    sources: number;
    byInvestor: { slug: string; name: string; count: number }[];
  };
  proTotal: number | null;
  suggestions: string[];
};

const FILTER_KEYS = ["person", "theme", "company", "concept", "event", "yearFrom", "yearTo", "sourceType", "decade"] as const;
type Filters = Record<(typeof FILTER_KEYS)[number], string>;

const EMPTY_FILTERS: Filters = {
  person: "", theme: "", company: "", concept: "", event: "", yearFrom: "", yearTo: "", sourceType: "", decade: "",
};

const filtersFromParams = (params: Record<string, string | undefined>): Filters => {
  const f = { ...EMPTY_FILTERS };
  for (const k of FILTER_KEYS) f[k] = params[k] || "";
  return f;
};

const PAGE_SIZE = 20;

const SOURCE_TYPE_LABELS: Record<string, string> = {
  shareholder_letter: "Shareholder Letter",
  annual_report: "Annual Report",
  speech: "Speech",
  interview: "Interview",
  meeting_transcript: "Meeting Transcript",
  article: "Article",
  book: "Book",
  news: "News",
};

export function SearchView(_props: { initialQuery?: string; person?: string; theme?: string; company?: string; concept?: string; event?: string }) {
  const go = useStore((s) => s.go);
  const params = useStore((s) => s.params);
  const user = useStore((s) => s.user);
  const isPro = user?.entitlement === "pro";

  // Hash URL state is the single source of truth — back/forward and shared
  // URLs restore the full session (spec §6.10).
  const q = params.q || "";
  const filters = filtersFromParams(params);
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown option lists
  const [investorsList, setInvestorsList] = useState<{ slug: string; name: string }[]>([]);
  const [themesList, setThemesList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [conceptsList, setConceptsList] = useState<any[]>([]);
  useEffect(() => {
    apiGet<{ investors: any[] }>("/api/investors").then(async (d) => {
      setInvestorsList(d.investors.filter((i) => i.status === "active"));
      if (d.investors.some((i) => i.slug === "buffett")) {
        const [t, c, cc] = await Promise.all([
          apiGet<{ themes: any[] }>("/api/investors/buffett/themes"),
          apiGet<{ companies: any[] }>("/api/investors/buffett/companies"),
          apiGet<{ concepts: any[] }>("/api/concepts"),
        ]);
        setThemesList(t.themes);
        setCompaniesList(c.companies);
        setConceptsList(cc.concepts || []);
      }
    }).catch(() => {});
  }, []);

  const searchKey = JSON.stringify({ q, ...filters, page });

  useEffect(() => {
    let active = true;
    (async () => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      for (const k of FILTER_KEYS) if (filters[k]) p.set(k, filters[k]);
      p.set("page", String(page));
      p.set("pageSize", String(PAGE_SIZE));
      try {
        const d = await apiGet<SearchResponse>(`/api/search?${p.toString()}`);
        if (active) setData(d);
      } catch (e: any) {
        if (active) setError(e.message || "Search failed");
      } finally {
        if (active) setLoading(false);
      }
    })();
    setLoading(true);
    setError(null);
    return () => { active = false; };
  }, [searchKey, retryNonce]);

  // Every mutation pushes a new hash entry so browser back restores results
  const navigateSearch = (nextQ: string, nextFilters: Filters, nextPage?: number) => {
    const state: Record<string, string> = {};
    if (nextQ.trim()) state.q = nextQ.trim();
    for (const k of FILTER_KEYS) if (nextFilters[k]) state[k] = nextFilters[k];
    if (nextPage && nextPage > 1) state.page = String(nextPage);
    go("search", state);
  };

  const setFilter = (key: keyof Filters, value: string) => navigateSearch(q, { ...filters, [key]: value });
  const toggleFilter = (key: keyof Filters, value: string) =>
    navigateSearch(q, { ...filters, [key]: filters[key] === value ? "" : value });
  const clearFilters = () => navigateSearch(q, EMPTY_FILTERS);

  // Chip removal clears the structured filter AND strips the matched words
  // from the query text so intent parsing does not re-add them.
  const removeChip = (chip: ParsedChip) => {
    let nextQ = q;
    if (chip.kind === "years") {
      nextQ = nextQ.replace(/\b(?:19|20)\d{2}\s*(?:[-–—]|to)?\s*(?:(?:19|20)?\d{2})?\b/gi, " ");
    } else {
      for (const w of chip.label.toLowerCase().split(/[^a-z0-9]+/)) {
        if (w.length < 2) continue;
        nextQ = nextQ.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ");
      }
    }
    const nextFilters = { ...filters };
    if (chip.kind === "years") { nextFilters.yearFrom = ""; nextFilters.yearTo = ""; }
    else if (chip.kind in nextFilters) nextFilters[chip.kind as keyof Filters] = "";
    navigateSearch(nextQ.replace(/\s+/g, " ").replace(/^[-\s]+|[-\s]+$/g, ""), nextFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Tokens used for result highlighting
  const highlightTokens = [
    ...new Set([
      ...(data?.parsed?.freeText || []),
      ...q.toLowerCase().split(/\s+/).filter((t) => t.length > 1),
    ]),
  ];

  // Match provenance passed through navigation state (spec §12.3)
  const buildWhy = (hit: SearchHit): string | undefined => {
    const parsed = data?.parsed;
    if (!parsed) return undefined;
    const c: string[][] = [];
    for (const chip of parsed.chips) {
      if (chip.kind === "person") {
        if (hit.source.person.slug === chip.value) c.push(["person", chip.value, chip.label]);
      } else if (chip.kind === "years") {
        const yf = parsed.yearFrom ?? null;
        const yt = parsed.yearTo ?? yf;
        if (yf !== null && yt !== null && hit.source.year !== null && hit.source.year >= yf && hit.source.year <= yt) {
          c.push(["years", chip.value, chip.label]);
        }
      } else {
        const tags =
          chip.kind === "theme" ? hit.themes :
          chip.kind === "company" ? hit.companies :
          chip.kind === "concept" ? hit.concepts : hit.events;
        if (tags.some((t) => t.slug === chip.value)) c.push([chip.kind, chip.value, chip.label]);
      }
    }
    const t = [...new Set(
      [...(parsed.freeText || []), ...q.toLowerCase().split(/\s+/)]
        .filter((tok) => tok.length > 1 && hit.text.toLowerCase().includes(tok))
    )];
    if (c.length === 0 && t.length === 0) return undefined;
    return JSON.stringify({ c, t });
  };

  const openPassage = (hit: SearchHit) => {
    const why = buildWhy(hit);
    go("passage", why ? { id: hit.passageId, investor: hit.source.person.slug, why } : { id: hit.passageId, investor: hit.source.person.slug });
  };

  // Upgrade path preserves the exact research context (spec §28)
  const upgradeCtx: Record<string, string> = {};
  if (q) upgradeCtx.q = q;
  for (const k of FILTER_KEYS) if (filters[k]) upgradeCtx[k] = filters[k];

  const saveSearch = async () => {
    if (user?.entitlement !== "pro") { go("upgrade", upgradeCtx); return; }
    try {
      await apiPost("/api/saved-searches", {
        title: q || `${investorsList.find((i) => i.slug === filters.person)?.name || "Library"} search`,
        query: q,
        filters,
      });
      toast.success("Search saved");
    } catch (e: any) { toast.error(e.message); }
  };

  const hits = data?.hits || [];
  const total = data?.total ?? 0;
  const morePro = !isPro && data && data.proTotal != null ? Math.max(0, data.proTotal - total) : 0;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ SEARCH THE LIBRARY</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] font-semibold leading-[0.92] tracking-[-0.07em]">
          {loading ? "Searching…" : total > 0 ? `${total.toLocaleString()} result${total !== 1 ? "s" : ""}` : "No results"}
        </h1>
      </div>

      <div className="mt-4">
        <SearchBar key={`sb-${q}`} initialQuery={q} />
      </div>

      {/* Parsed filter chips — current state is always visible (spec §6.9) */}
      {(data?.parsed?.chips?.length || filters.sourceType || filters.decade) ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {(data?.parsed?.chips || []).map((chip) => (
            <button key={`${chip.kind}:${chip.value}`} onClick={() => removeChip(chip)} className="chip chip-signal" title="Remove filter">
              {chip.label.toUpperCase()} <span className="ml-0.5 opacity-60">×</span>
            </button>
          ))}
          {filters.sourceType && (
            <button onClick={() => setFilter("sourceType", "")} className="chip chip-signal" title="Remove filter">
              {(SOURCE_TYPE_LABELS[filters.sourceType] || filters.sourceType).toUpperCase()} <span className="ml-0.5 opacity-60">×</span>
            </button>
          )}
          {filters.decade && (
            <button onClick={() => setFilter("decade", "")} className="chip chip-signal" title="Remove filter">
              {filters.decade}S <span className="ml-0.5 opacity-60">×</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Filter toggle */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setShowFilters(!showFilters)} className="chip chip-ink">
          {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
          {activeFilterCount > 0 && <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-signal text-[0.55rem] text-white">{activeFilterCount}</span>}
        </button>
        <button onClick={saveSearch} className="chip">
          <Save className="h-3 w-3" /> SAVE SEARCH
        </button>
      </div>

      {/* Desktop inline filters */}
      {showFilters && (
        <div className="mt-4 hidden border border-ink bg-paper-2 p-4 sm:block">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Investor" value={filters.person} onChange={(v) => setFilter("person", v)} options={investorsList.map((i) => ({ value: i.slug, label: i.name }))} />
            <FilterSelect label="Theme" value={filters.theme} onChange={(v) => setFilter("theme", v)} options={themesList.map((t) => ({ value: t.slug, label: t.name, count: t.passageCount }))} />
            <FilterSelect label="Company" value={filters.company} onChange={(v) => setFilter("company", v)} options={companiesList.map((c) => ({ value: c.slug, label: c.name, count: c.passageCount }))} />
            <FilterSelect label="Concept" value={filters.concept} onChange={(v) => setFilter("concept", v)} options={conceptsList.map((c) => ({ value: c.slug, label: c.name }))} />
            <FilterSelect label="Source type" value={filters.sourceType} onChange={(v) => setFilter("sourceType", v)} options={[
              { value: "shareholder_letter", label: "Shareholder Letter" },
              { value: "annual_report", label: "Annual Report" },
              { value: "speech", label: "Speech" },
              { value: "interview", label: "Interview" },
              { value: "meeting_transcript", label: "Meeting Transcript" },
              { value: "article", label: "Article" },
              { value: "book", label: "Book" },
            ]} />
            <YearCommitInput label="Year from" value={filters.yearFrom} onCommit={(v) => setFilter("yearFrom", v)} />
            <YearCommitInput label="Year to" value={filters.yearTo} onCommit={(v) => setFilter("yearTo", v)} />
            <FilterSelect label="Decade" value={filters.decade} onChange={(v) => setFilter("decade", v)} options={[
              { value: "1920", label: "1920s" },
              { value: "1970", label: "1970s" }, { value: "1980", label: "1980s" }, { value: "1990", label: "1990s" },
              { value: "2000", label: "2000s" }, { value: "2010", label: "2010s" }, { value: "2020", label: "2020s" },
            ]} />
            <button onClick={clearFilters} className="chip self-end">
              <Trash2 className="h-3 w-3" /> CLEAR
            </button>
          </div>
        </div>
      )}

      {/* Mobile filter drawer (Sheet) */}
      <FilterSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        setFilter={setFilter}
        investorsList={investorsList}
        themesList={themesList}
        companiesList={companiesList}
        conceptsList={conceptsList}
        onClearAll={clearFilters}
      />

      {/* Exploration summary header (spec §6.4 / §67) */}
      {!loading && !error && data?.exploration && (
        <section className="mt-6 border border-ink bg-paper-2 p-4">
          <p className="kicker">EXPLORATION</p>
          <p className="mt-1 font-display text-2xl font-bold tracking-tight">{data.exploration.term || "THE LIBRARY"}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-graphite">
            {data.exploration.references.toLocaleString()} references · {data.exploration.investors} investor{data.exploration.investors !== 1 ? "s" : ""} · {data.exploration.sources.toLocaleString()} sources
          </p>
          {data.exploration.byInvestor.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="kicker mr-1">INVESTORS:</span>
              {data.exploration.byInvestor.map((inv) => (
                <button key={inv.slug} onClick={() => toggleFilter("person", inv.slug)} title={`${inv.count} references`} className={filters.person === inv.slug ? "chip chip-ink" : "chip"}>
                  {inv.name} <span className="opacity-60">{inv.count}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Results + Facets */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_220px]">
        <div>
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="border-l-4 border-signal bg-paper-2 p-4">
              <p className="kicker flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> SEARCH UNAVAILABLE</p>
              <p className="mt-1 font-reader text-graphite">Something went wrong on our side — this is not an empty result.</p>
              <button onClick={() => setRetryNonce((n) => n + 1)} className="chip chip-ink mt-3">TRY AGAIN</button>
            </div>
          ) : hits.length === 0 ? (
            /* Empty state — never a dead end (spec §6.11) */
            <div className="border-t-2 border-ink pt-6">
              <p className="font-display text-2xl font-bold tracking-tight">Nothing matched &ldquo;{q || "this query"}&rdquo;.</p>
              {(data?.suggestions?.length || 0) > 0 && (
                <>
                  <p className="mt-2 font-reader text-graphite">Try one of these searches:</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data!.suggestions.map((s) => (
                      <button key={s} onClick={() => navigateSearch(s, EMPTY_FILTERS)} className="chip chip-signal">{s}</button>
                    ))}
                  </div>
                </>
              )}
              {(q || activeFilterCount > 0) && (
                <button onClick={() => navigateSearch("", EMPTY_FILTERS)} className="chip mt-5">
                  <Trash2 className="h-3 w-3" /> CLEAR FILTERS
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {hits.map((hit) => (
                <div key={hit.passageId} className="group border-t border-rule pt-4 transition-colors hover:bg-paper-2/50 -mx-2 px-2 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => go("investor", { slug: hit.source.person.slug })} className="font-mono text-xs uppercase tracking-wider text-signal-dark hover:underline">
                      {hit.source.person.name}
                    </button>
                    {hit.source.year && <span className="font-mono text-xs text-graphite">· {hit.source.year}</span>}
                    {hit.visibility === "pro" && <ProBadge />}
                    <button
                      onClick={() => openPassage(hit)}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity chip"
                      title="View passage context"
                    >
                      CONTEXT →
                    </button>
                  </div>
                  <button onClick={() => go("source", { slug: hit.source.slug })} className="block w-full text-left">
                    <p className="mt-1 font-display text-sm font-semibold tracking-tight hover:text-signal-dark">{hit.source.title}</p>
                  </button>
                  <button onClick={() => openPassage(hit)} className="block w-full text-left">
                    <p className="mt-2 max-w-[820px] font-reader text-base leading-relaxed group-hover:text-ink">
                      <HighlightedText text={hit.text} tokens={highlightTokens} />
                    </p>
                  </button>
                  {hit.context && <p className="mt-1 max-w-[820px] font-reader text-sm italic text-graphite">{hit.context}</p>}
                  <div className="mt-2 flex flex-wrap gap-3">
                    {hit.themes.length > 0 && <EntityChips items={hit.themes} kind="theme" investorSlug={hit.source.person.slug} />}
                    {hit.companies.length > 0 && <EntityChips items={hit.companies} kind="company" investorSlug={hit.source.person.slug} />}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {total > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-4 border-t border-rule pt-4">
                  <button disabled={page <= 1} onClick={() => navigateSearch(q, filters, page - 1)} className="chip disabled:opacity-40">← PREV</button>
                  <span className="kicker">PAGE {page} OF {Math.ceil(total / PAGE_SIZE)}</span>
                  <button disabled={page * PAGE_SIZE >= total} onClick={() => navigateSearch(q, filters, page + 1)} className="chip disabled:opacity-40">NEXT →</button>
                </div>
              )}

              {/* Conversion moment — exact counts, context preserved (spec §6.15/§26) */}
              {!isPro && morePro > 0 && (
                <div className="gate mt-6">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-signal-dark" />
                    <div className="flex-1">
                      <p className="kicker">PRO CONTENT</p>
                      <p className="mt-1 font-reader text-base">
                        Showing <strong className="font-display font-semibold">{total.toLocaleString()} free result{total !== 1 ? "s" : ""}</strong>.
                        {" "}{morePro.toLocaleString()} more reference{morePro !== 1 ? "s" : ""} are available in Pro.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button onClick={() => go("upgrade", upgradeCtx)} className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal-dark transition-colors">
                          START PRO — $19/MONTH
                        </button>
                        <span className="kicker">$149/YEAR · ₹7,999/YEAR · ≈ 8 MONTHS</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Facets sidebar — theme/company/year distribution from current results */}
        {!loading && !error && hits.length > 0 && (
          <aside className="hidden lg:block">
            <SearchFacets hits={hits} filters={filters} onToggle={toggleFilter} />
          </aside>
        )}
      </div>
    </div>
  );
}

// Search facets sidebar — theme/company/year distribution from current results
function SearchFacets({ hits, filters, onToggle }: { hits: SearchHit[]; filters: Filters; onToggle: (key: keyof Filters, value: string) => void }) {
  const go = useStore((s) => s.go);

  const themeCounts = new Map<string, { slug: string; name: string; count: number }>();
  const companyCounts = new Map<string, { slug: string; name: string; count: number }>();
  const yearCounts = new Map<number, number>();
  const sourceTypeCounts = new Map<string, number>();

  for (const h of hits) {
    for (const t of h.themes) {
      const e = themeCounts.get(t.slug);
      if (e) e.count++;
      else themeCounts.set(t.slug, { slug: t.slug, name: t.name, count: 1 });
    }
    for (const c of h.companies) {
      const e = companyCounts.get(c.slug);
      if (e) e.count++;
      else companyCounts.set(c.slug, { slug: c.slug, name: c.name, count: 1 });
    }
    if (h.source.year) yearCounts.set(h.source.year, (yearCounts.get(h.source.year) || 0) + 1);
    sourceTypeCounts.set(h.source.sourceType, (sourceTypeCounts.get(h.source.sourceType) || 0) + 1);
  }

  const topThemes = [...themeCounts.values()].sort((a, b) => b.count - a.count).slice(0, 8);
  const topCompanies = [...companyCounts.values()].sort((a, b) => b.count - a.count).slice(0, 8);
  const topYears = [...yearCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topSourceTypes = [...sourceTypeCounts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="sticky top-20 space-y-6">
      <div>
        <p className="kicker mb-2 border-t border-ink pt-2">THEMES</p>
        <div className="space-y-1">
          {topThemes.map((t) => (
            <button
              key={t.slug}
              onClick={() => onToggle("theme", t.slug)}
              className={`flex w-full items-center justify-between py-0.5 text-left font-reader text-sm hover:text-signal-dark ${filters.theme === t.slug ? "font-semibold text-signal-dark" : "text-graphite"}`}
            >
              <span className="truncate">{t.name}</span>
              <span className="font-mono text-xs">{t.count}</span>
            </button>
          ))}
        </div>
      </div>
      {topCompanies.length > 0 && (
        <div>
          <p className="kicker mb-2 border-t border-ink pt-2">COMPANIES</p>
          <div className="space-y-1">
            {topCompanies.map((c) => (
              <button
                key={c.slug}
                onClick={() => onToggle("company", c.slug)}
                className={`flex w-full items-center justify-between py-0.5 text-left font-reader text-sm hover:text-signal-dark ${filters.company === c.slug ? "font-semibold text-signal-dark" : "text-graphite"}`}
              >
                <span className="truncate">{c.name}</span>
                <span className="font-mono text-xs">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {topYears.length > 0 && (
        <div>
          <p className="kicker mb-2 border-t border-ink pt-2">YEARS</p>
          <div className="flex flex-wrap gap-1">
            {topYears.map(([y, c]) => (
              <button
                key={y}
                onClick={() => go("year", { year: String(y), investor: hits.find((h) => h.source.year === y)?.source.person.slug || "buffett" })}
                className="chip"
              >
                {y} <span className="opacity-60">{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="kicker mb-2 border-t border-ink pt-2">SOURCE TYPES</p>
        <div className="space-y-1">
          {topSourceTypes.map(([st, c]) => (
            <button
              key={st}
              onClick={() => onToggle("sourceType", st)}
              className={`flex w-full items-center justify-between py-0.5 text-left font-reader text-sm hover:text-signal-dark ${filters.sourceType === st ? "font-semibold text-signal-dark" : "text-graphite"}`}
            >
              <span>{SOURCE_TYPE_LABELS[st] || st}</span>
              <span className="font-mono text-xs">{c}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string; count?: number }[] }) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border border-rule bg-paper px-2 py-1.5 font-reader text-sm">
        <option value="">Any</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}{o.count !== undefined ? ` (${o.count})` : ""}</option>)}
      </select>
    </label>
  );
}
function FilterInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border border-rule bg-paper px-2 py-1.5 font-reader text-sm" />
    </label>
  );
}

// Year input that commits on blur/Enter — avoids a history entry per keystroke.
// Remounted via `key` when the committed URL value changes, so no sync effect needed.
function YearCommitInput({ label, value, onCommit }: { label: string; value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onCommit(draft.trim())}
        onKeyDown={(e) => e.key === "Enter" && onCommit(draft.trim())}
        placeholder="Any"
        className="mt-1 w-full border border-rule bg-paper px-2 py-1.5 font-reader text-sm"
      />
    </label>
  );
}

// Mobile filter drawer (Sheet) — master prompt §36
function FilterSheet({
  open,
  onOpenChange,
  filters,
  setFilter,
  investorsList,
  themesList,
  companiesList,
  conceptsList,
  onClearAll,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  investorsList: { slug: string; name: string }[];
  themesList: any[];
  companiesList: any[];
  conceptsList: any[];
  onClearAll: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:hidden max-h-[85vh] overflow-y-auto scroll-thin">
        <SheetHeader>
          <SheetTitle className="font-display text-lg font-bold tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-6">
          <FilterSelect label="Investor" value={filters.person} onChange={(v) => setFilter("person", v)} options={investorsList.map((i) => ({ value: i.slug, label: i.name }))} />
          <FilterSelect label="Theme" value={filters.theme} onChange={(v) => setFilter("theme", v)} options={themesList.map((t: any) => ({ value: t.slug, label: t.name, count: t.passageCount }))} />
          <FilterSelect label="Company" value={filters.company} onChange={(v) => setFilter("company", v)} options={companiesList.map((c: any) => ({ value: c.slug, label: c.name, count: c.passageCount }))} />
          <FilterSelect label="Concept" value={filters.concept} onChange={(v) => setFilter("concept", v)} options={conceptsList.map((c: any) => ({ value: c.slug, label: c.name }))} />
          <FilterSelect label="Source type" value={filters.sourceType} onChange={(v) => setFilter("sourceType", v)} options={[
            { value: "shareholder_letter", label: "Shareholder Letter" },
            { value: "speech", label: "Speech" },
            { value: "article", label: "Article" },
          ]} />
          <div className="grid grid-cols-2 gap-3">
            <YearCommitInput key={`m-yf-${filters.yearFrom}`} label="Year from" value={filters.yearFrom} onCommit={(v) => setFilter("yearFrom", v)} />
            <YearCommitInput key={`m-yt-${filters.yearTo}`} label="Year to" value={filters.yearTo} onCommit={(v) => setFilter("yearTo", v)} />
          </div>
          <FilterSelect label="Decade" value={filters.decade} onChange={(v) => setFilter("decade", v)} options={[
            { value: "1920", label: "1920s" },
            { value: "1970", label: "1970s" }, { value: "1980", label: "1980s" }, { value: "1990", label: "1990s" },
            { value: "2000", label: "2000s" }, { value: "2010", label: "2010s" }, { value: "2020", label: "2020s" },
          ]} />
        </div>
        <SheetFooter className="flex-row gap-2 border-t border-rule pt-4">
          <button onClick={onClearAll} className="chip flex-1 justify-center">
            <Trash2 className="h-3 w-3" /> CLEAR ALL
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-ink py-2 text-sm font-semibold text-paper hover:bg-signal-dark"
          >
            APPLY
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ── Library hub ────────────────────────────────────────────────────────────
export function LibraryView() {
  const go = useStore((s) => s.go);
  const { user } = useStore();
  const items = [
    { label: "Bookmarks", view: "bookmarks" as const, icon: Bookmark, desc: "Saved sources, passages, companies, themes" },
    { label: "Saved Searches", view: "searches" as const, icon: SearchIcon, desc: "Stored queries with filters" },
    { label: "Collections", view: "collections" as const, icon: FolderPlus, desc: "Personal research collections" },
  ];
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ LIBRARY</p>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.07em]">Your research</h1>
        {user?.entitlement !== "pro" ? (
          <div className="mt-4">
            <PremiumGate hiddenCount={0} onUpgrade={() => go("upgrade")} label="" />
          </div>
        ) : (
          <p className="mt-3 font-reader text-lg text-graphite">Bookmarks, saved searches, and collections — your Pro research workspace.</p>
        )}
      </div>
      {user?.entitlement === "pro" && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((it) => (
            <button key={it.view} onClick={() => go(it.view)} className="border border-ink p-5 text-left transition-shadow hover:shadow-[3px_3px_0_0_var(--ink)]">
              <it.icon className="h-5 w-5 text-signal-dark" />
              <p className="mt-3 font-display text-xl font-bold tracking-tight">{it.label}</p>
              <p className="mt-1 font-reader text-sm text-graphite">{it.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bookmarks view ─────────────────────────────────────────────────────────
export function BookmarksView() {
  const go = useStore((s) => s.go);
  const { user } = useStore();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiGet<{ bookmarks: any[] }>("/api/bookmarks");
      setBookmarks(d.bookmarks);
    } catch { setBookmarks([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (user?.entitlement === "pro") load(); }, [user, load]);

  if (!user) return <AuthRequired onLogin={() => go("login")} />;
  if (user.entitlement !== "pro") return <ProRequired onUpgrade={() => go("upgrade")} />;

  const remove = async (kind: string, entityId: string) => {
    try {
      await apiDelete(`/api/bookmarks?kind=${kind}&entityId=${encodeURIComponent(entityId)}`);
      setBookmarks(bookmarks.filter((b) => !(b.kind === kind && b.entityId === entityId)));
      toast.success("Removed");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("library")} className="kicker hover:text-ink">← LIBRARY</button>
      <div className="mt-2 flex items-start justify-between gap-4 border-t-2 border-ink pt-4">
        <div>
          <p className="kicker text-signal-dark">/ BOOKMARKS</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] font-semibold tracking-tight">Saved items</h1>
        </div>
        {bookmarks.length > 0 && (
          <button onClick={() => exportBookmarksMd(bookmarks)} className="chip chip-ink" title="Export as Markdown">
            <Download className="h-3 w-3" /> EXPORT MD
          </button>
        )}
      </div>
      {loading ? <Loading /> : bookmarks.length === 0 ? (
        <p className="mt-8 border-t border-rule py-12 text-center font-reader text-graphite">No bookmarks yet. Save sources, passages, companies, or themes as you explore.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {bookmarks.map((b) => (
            <div key={`${b.kind}-${b.entityId}`} className="flex items-center justify-between border-t border-rule py-3">
              <button onClick={() => {
                if (b.kind === "source") go("source", { slug: b.entityId });
                else if (b.kind === "theme") go("topic", { slug: b.entityId });
                else if (b.kind === "company") go("company", { slug: b.entityId });
                else if (b.kind === "search") go("search", { q: b.entityId });
              }} className="flex flex-1 items-center gap-3 text-left hover:text-signal-dark">
                <span className="chip chip-ink w-20 justify-center">{b.kind.toUpperCase()}</span>
                <span className="font-display font-semibold tracking-tight">{b.label}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => remove(b.kind, b.entityId)} className="chip hover:chip-signal"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Saved Searches view ────────────────────────────────────────────────────
export function SavedSearchesView() {
  const go = useStore((s) => s.go);
  const { user } = useStore();
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiGet<{ searches: any[] }>("/api/saved-searches");
      setSearches(d.searches);
    } catch { setSearches([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (user?.entitlement === "pro") load(); }, [user, load]);

  if (!user) return <AuthRequired onLogin={() => go("login")} />;
  if (user.entitlement !== "pro") return <ProRequired onUpgrade={() => go("upgrade")} />;

  const remove = async (id: string) => {
    try { await apiDelete(`/api/saved-searches?id=${id}`); setSearches(searches.filter((s) => s.id !== id)); toast.success("Deleted"); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("library")} className="kicker hover:text-ink">← LIBRARY</button>
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ SAVED SEARCHES</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] font-semibold tracking-tight">Stored queries</h1>
      </div>
      {loading ? <Loading /> : searches.length === 0 ? (
        <p className="mt-8 border-t border-rule py-12 text-center font-reader text-graphite">No saved searches. Run a search and click SAVE SEARCH to store it here.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {searches.map((s) => (
            <div key={s.id} className="flex items-center justify-between border-t border-rule py-3">
              <button onClick={() => go("search", { q: s.query, ...Object.fromEntries(Object.entries(s.filters || {}).filter(([, v]) => v).map(([k, v]) => [k, String(v)])) })} className="flex-1 text-left hover:text-signal-dark">
                <p className="font-display font-semibold tracking-tight">{s.title}</p>
                <p className="font-mono text-xs text-graphite">{s.query || "(no query)"} · {Object.entries(s.filters || {}).filter(([, v]) => v).length} filters</p>
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (s.query) params.set("q", s.query);
                    for (const [k, v] of Object.entries(s.filters || {})) { if (v) params.set(k, String(v)); }
                    const url = `${window.location.origin}/#/view=search&${params.toString()}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Search URL copied to clipboard");
                  }}
                  className="chip"
                  title="Copy shareable URL"
                >
                  <Share2 className="h-3 w-3" /> SHARE
                </button>
                <button onClick={() => remove(s.id)} className="chip hover:chip-signal"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Collections view ───────────────────────────────────────────────────────
export function CollectionsView() {
  const go = useStore((s) => s.go);
  const { user } = useStore();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiGet<{ collections: any[] }>("/api/collections");
      setCollections(d.collections);
    } catch { setCollections([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (user?.entitlement === "pro") load(); }, [user, load]);

  if (!user) return <AuthRequired onLogin={() => go("login")} />;
  if (user.entitlement !== "pro") return <ProRequired onUpgrade={() => go("upgrade")} />;

  const create = async () => {
    if (!newTitle.trim()) return;
    try {
      const d = await apiPost<{ collection: any }>("/api/collections", { title: newTitle });
      setCollections([d.collection, ...collections]);
      setNewTitle("");
      setShowForm(false);
      toast.success("Collection created");
    } catch (e: any) { toast.error(e.message); }
  };
  const remove = async (id: string) => {
    try { await apiDelete(`/api/collections?id=${id}`); setCollections(collections.filter((c) => c.id !== id)); toast.success("Deleted"); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("library")} className="kicker hover:text-ink">← LIBRARY</button>
      <div className="mt-2 flex items-start justify-between gap-4 border-t-2 border-ink pt-4">
        <div>
          <p className="kicker text-signal-dark">/ COLLECTIONS</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] font-semibold tracking-tight">Research collections</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="chip chip-ink"><FolderPlus className="h-3 w-3" /> NEW</button>
      </div>
      {showForm && (
        <div className="mt-4 flex gap-2 border border-ink bg-paper-2 p-3">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Collection title (e.g. 'Buffett on Risk')" className="flex-1 bg-transparent px-2 py-1.5 font-reader text-sm outline-none" onKeyDown={(e) => e.key === "Enter" && create()} />
          <button onClick={create} className="bg-ink px-4 text-sm font-semibold text-paper hover:bg-signal-dark">CREATE</button>
        </div>
      )}
      {loading ? <Loading /> : collections.length === 0 ? (
        <p className="mt-8 border-t border-rule py-12 text-center font-reader text-graphite">No collections. Create one to group passages, sources, and themes by topic.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {collections.map((c) => (
            <div key={c.id} className="border border-rule p-4">
              <div className="flex items-start justify-between">
                <p className="font-display text-lg font-bold tracking-tight">{c.title}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => exportCollectionMd(c)} className="chip" title="Export as Markdown">
                    <Download className="h-3 w-3" />
                  </button>
                  <button onClick={() => remove(c.id)} className="chip hover:chip-signal"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
              {c.description && <p className="mt-1 font-reader text-sm text-graphite">{c.description}</p>}
              <p className="mt-2 font-mono text-xs text-graphite">{c.items?.length || 0} items</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuthRequired({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-24 text-center">
      <Lock className="mx-auto h-8 w-8 text-signal-dark" />
      <p className="mt-4 font-display text-2xl font-bold">Log in required</p>
      <p className="mt-2 font-reader text-graphite">This area is for registered users.</p>
      <button onClick={onLogin} className="mt-4 bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-signal-dark">LOG IN</button>
    </div>
  );
}
function ProRequired({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-24 text-center">
      <Lock className="mx-auto h-8 w-8 text-signal-dark" />
      <p className="mt-4 font-display text-2xl font-bold">Investor/Pass Pro required</p>
      <p className="mt-2 font-reader text-graphite">Bookmarks, saved searches, and collections are Pro features.</p>
      <button onClick={onUpgrade} className="mt-4 bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-signal-dark">START PRO — $19/MONTH</button>
    </div>
  );
}

// Export bookmarks as Markdown
function exportBookmarksMd(bookmarks: any[]) {
  const grouped: Record<string, any[]> = {};
  for (const b of bookmarks) {
    if (!grouped[b.kind]) grouped[b.kind] = [];
    grouped[b.kind].push(b);
  }
  const kindLabels: Record<string, string> = {
    source: "Sources", passage: "Passages", company: "Companies", theme: "Themes", search: "Searches",
  };
  let md = `# Investor/Pass — Bookmarks\n\nExported ${new Date().toISOString().slice(0, 10)}\n\n`;
  for (const [kind, items] of Object.entries(grouped)) {
    md += `## ${kindLabels[kind] || kind}\n\n`;
    for (const b of items) {
      md += `- [${b.label}](https://investor-pass.vercel.app/#/view=${b.kind === "search" ? "search" : b.kind === "theme" ? "topic" : b.kind}&slug=${b.entityId})\n`;
    }
    md += "\n";
  }
  downloadFile(md, "investor-pass-bookmarks.md", "text/markdown");
  toast.success("Bookmarks exported as Markdown");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export a single collection as Markdown
function exportCollectionMd(c: any) {
  let md = `# ${c.title}\n\n`;
  if (c.description) md += `${c.description}\n\n`;
  md += `Exported ${new Date().toISOString().slice(0, 10)} · ${c.items?.length || 0} items\n\n`;
  const kindLabels: Record<string, string> = {
    passage: "Passages", source: "Sources", company: "Companies", theme: "Themes",
  };
  const grouped: Record<string, any[]> = {};
  for (const item of c.items || []) {
    if (!grouped[item.kind]) grouped[item.kind] = [];
    grouped[item.kind].push(item);
  }
  for (const [kind, items] of Object.entries(grouped)) {
    md += `## ${kindLabels[kind] || kind}\n\n`;
    for (const item of items) {
      md += `- ${item.label}\n`;
    }
    md += "\n";
  }
  downloadFile(md, `${c.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`, "text/markdown");
  toast.success("Collection exported as Markdown");
}
