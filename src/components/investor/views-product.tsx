"use client";
import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet, apiPost, apiDelete } from "@/lib/client";
import { SearchBar } from "@/components/investor/search-bar";
import { EntityChips, PremiumGate, ProBadge } from "@/components/investor/entity-chips";
import { Loading } from "./views-core";
import { Bookmark, Save, Trash2, FolderPlus, Lock, Search as SearchIcon, ChevronRight, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

// ── Search view ────────────────────────────────────────────────────────────
type SearchHit = {
  passageId: string;
  text: string;
  context: string | null;
  section: string | null;
  visibility: string;
  score: number;
  source: { id: string; slug: string; title: string; sourceType: string; year: number | null; publisher: string | null; url: string | null };
  themes: { slug: string; name: string }[];
  concepts: { slug: string; name: string }[];
  companies: { slug: string; name: string }[];
  events: { slug: string; name: string }[];
};

export function SearchView({ initialQuery, person, theme, company, concept, event }: {
  initialQuery?: string; person?: string; theme?: string; company?: string; concept?: string; event?: string;
}) {
  const go = useStore((s) => s.go);
  const { user } = useStore();
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    person: person || "",
    theme: theme || "",
    company: company || "",
    concept: concept || "",
    event: event || "",
    yearFrom: "",
    yearTo: "",
    sourceType: "",
    decade: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount = [filters.person, filters.theme, filters.company, filters.sourceType, filters.yearFrom, filters.yearTo, filters.decade].filter(Boolean).length;
  const [themesList, setThemesList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const pageSize = 20;

  useEffect(() => {
    apiGet<{ investors: any[] }>("/api/investors").then(async (d) => {
      const buffett = d.investors.find((i) => i.slug === "buffett");
      if (buffett) {
        const [t, c] = await Promise.all([
          apiGet<{ themes: any[] }>(`/api/investors/buffett/themes`),
          apiGet<{ companies: any[] }>(`/api/investors/buffett/companies`),
        ]);
        setThemesList(t.themes);
        setCompaniesList(c.companies);
      }
    });
  }, []);

  const doSearch = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (initialQuery) params.set("q", initialQuery);
      if (filters.person) params.set("person", filters.person);
      if (filters.theme) params.set("theme", filters.theme);
      if (filters.company) params.set("company", filters.company);
      if (filters.concept) params.set("concept", filters.concept);
      if (filters.event) params.set("event", filters.event);
      if (filters.yearFrom) params.set("yearFrom", filters.yearFrom);
      if (filters.yearTo) params.set("yearTo", filters.yearTo);
      if (filters.sourceType) params.set("sourceType", filters.sourceType);
      if (filters.decade) params.set("decade", filters.decade);
      params.set("page", String(p));
      params.set("pageSize", String(pageSize));
      const data = await apiGet<{ hits: SearchHit[]; total: number; isPro: boolean }>(`/api/search?${params}`);
      setHits(data.hits);
      setTotal(data.total);
      setPage(p);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [initialQuery, filters]);

  useEffect(() => { doSearch(1); }, [doSearch]);

  const saveSearch = async () => {
    if (user?.entitlement !== "pro") { go("upgrade"); return; }
    try {
      await apiPost("/api/saved-searches", { title: initialQuery || "Buffett search", query: initialQuery || "", filters });
      toast.success("Search saved");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ SEARCH THE LIBRARY</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] font-semibold leading-[0.92] tracking-[-0.07em]">
          {total > 0 ? `${total} result${total !== 1 ? "s" : ""}` : "Search"}
        </h1>
      </div>

      <div className="mt-4">
        <SearchBar initialQuery={initialQuery || ""} />
      </div>

      {/* Filter toggle */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setShowFilters(!showFilters)} className="chip chip-ink">
          {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
          {activeFilterCount > 0 && <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-signal text-[0.55rem] text-white">{activeFilterCount}</span>}
        </button>
        <button onClick={saveSearch} className="chip">
          <Save className="h-3 w-3" /> SAVE SEARCH
        </button>
        {(filters.theme || filters.company || filters.yearFrom) && (
          <span className="kicker hidden sm:inline">{[filters.theme, filters.company, filters.yearFrom && `from ${filters.yearFrom}`].filter(Boolean).join(" · ")}</span>
        )}
      </div>

      {/* Desktop inline filters */}
      {showFilters && (
        <div className="mt-4 hidden border border-ink bg-paper-2 p-4 sm:block">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Investor" value={filters.person} onChange={(v) => setFilters({ ...filters, person: v })} options={[{ value: "buffett", label: "Warren Buffett" }]} />
            <FilterSelect label="Theme" value={filters.theme} onChange={(v) => setFilters({ ...filters, theme: v })} options={themesList.map((t) => ({ value: t.slug, label: t.name }))} />
            <FilterSelect label="Company" value={filters.company} onChange={(v) => setFilters({ ...filters, company: v })} options={companiesList.map((c) => ({ value: c.slug, label: c.name }))} />
            <FilterSelect label="Source type" value={filters.sourceType} onChange={(v) => setFilters({ ...filters, sourceType: v })} options={[
              { value: "shareholder_letter", label: "Shareholder Letter" },
              { value: "speech", label: "Speech" },
              { value: "article", label: "Article" },
            ]} />
            <FilterInput label="Year from" value={filters.yearFrom} onChange={(v) => setFilters({ ...filters, yearFrom: v })} type="number" />
            <FilterInput label="Year to" value={filters.yearTo} onChange={(v) => setFilters({ ...filters, yearTo: v })} type="number" />
            <FilterSelect label="Decade" value={filters.decade} onChange={(v) => setFilters({ ...filters, decade: v })} options={[
              { value: "1970", label: "1970s" }, { value: "1980", label: "1980s" }, { value: "1990", label: "1990s" },
              { value: "2000", label: "2000s" }, { value: "2010", label: "2010s" }, { value: "2020", label: "2020s" },
            ]} />
            <button onClick={() => { setFilters({ person: "", theme: "", company: "", concept: "", event: "", yearFrom: "", yearTo: "", sourceType: "", decade: "" }); }} className="chip self-end">
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
        setFilters={setFilters}
        themesList={themesList}
        companiesList={companiesList}
      />

      {/* Active filter chips (mobile) */}
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:hidden">
          <span className="kicker">ACTIVE:</span>
          {filters.theme && <span className="chip chip-signal">{themesList.find((t) => t.slug === filters.theme)?.name || filters.theme} <button onClick={() => setFilters({ ...filters, theme: "" })} className="ml-1 opacity-60">×</button></span>}
          {filters.company && <span className="chip chip-signal">{companiesList.find((c) => c.slug === filters.company)?.name || filters.company} <button onClick={() => setFilters({ ...filters, company: "" })} className="ml-1 opacity-60">×</button></span>}
          {filters.yearFrom && <span className="chip chip-signal">from {filters.yearFrom} <button onClick={() => setFilters({ ...filters, yearFrom: "" })} className="ml-1 opacity-60">×</button></span>}
          {filters.decade && <span className="chip chip-signal">{filters.decade}s <button onClick={() => setFilters({ ...filters, decade: "" })} className="ml-1 opacity-60">×</button></span>}
        </div>
      )}

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <Loading />
        ) : hits.length === 0 ? (
          <div className="border-t border-rule py-12 text-center font-reader text-graphite">
            No results. Try a broader query, or remove filters.
          </div>
        ) : (
          <div className="space-y-4">
            {hits.map((hit) => (
              <div key={hit.passageId} className="group border-t border-rule pt-4 transition-colors hover:bg-paper-2/50 -mx-2 px-2 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => go("source", { slug: hit.source.slug })} className="font-mono text-xs uppercase tracking-wider text-signal-dark hover:underline">
                    {hit.source.title}
                  </button>
                  {hit.source.year && <span className="font-mono text-xs text-graphite">· {hit.source.year}</span>}
                  {hit.visibility === "pro" && <ProBadge />}
                  <button
                    onClick={() => go("passage", { id: hit.passageId, investor: "buffett" })}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity chip"
                    title="View passage context"
                  >
                    CONTEXT →
                  </button>
                </div>
                <button onClick={() => go("passage", { id: hit.passageId, investor: "buffett" })} className="block w-full text-left">
                  <p className="mt-2 max-w-[820px] font-reader text-base leading-relaxed group-hover:text-ink">{hit.text}</p>
                </button>
                {hit.context && <p className="mt-1 font-reader text-sm italic text-graphite">{hit.context}</p>}
                <div className="mt-2 flex flex-wrap gap-3">
                  {hit.themes.length > 0 && <EntityChips items={hit.themes} kind="theme" investorSlug="buffett" />}
                  {hit.companies.length > 0 && <EntityChips items={hit.companies} kind="company" investorSlug="buffett" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-rule pt-4">
          <button disabled={page <= 1} onClick={() => doSearch(page - 1)} className="chip disabled:opacity-40">← PREV</button>
          <span className="kicker">PAGE {page} OF {Math.ceil(total / pageSize)}</span>
          <button disabled={page * pageSize >= total} onClick={() => doSearch(page + 1)} className="chip disabled:opacity-40">NEXT →</button>
        </div>
      )}

      {user?.entitlement !== "pro" && total > 0 && (
        <PremiumGate hiddenCount={0} onUpgrade={() => go("upgrade")} label="" />
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border border-rule bg-paper px-2 py-1.5 font-reader text-sm">
        <option value="">Any</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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

// Mobile filter drawer (Sheet) — master prompt §36
function FilterSheet({
  open,
  onOpenChange,
  filters,
  setFilters,
  themesList,
  companiesList,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filters: any;
  setFilters: (f: any) => void;
  themesList: any[];
  companiesList: any[];
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
          <FilterSelect label="Investor" value={filters.person} onChange={(v) => setFilters({ ...filters, person: v })} options={[{ value: "buffett", label: "Warren Buffett" }]} />
          <FilterSelect label="Theme" value={filters.theme} onChange={(v) => setFilters({ ...filters, theme: v })} options={themesList.map((t: any) => ({ value: t.slug, label: t.name }))} />
          <FilterSelect label="Company" value={filters.company} onChange={(v) => setFilters({ ...filters, company: v })} options={companiesList.map((c: any) => ({ value: c.slug, label: c.name }))} />
          <FilterSelect label="Source type" value={filters.sourceType} onChange={(v) => setFilters({ ...filters, sourceType: v })} options={[
            { value: "shareholder_letter", label: "Shareholder Letter" },
            { value: "speech", label: "Speech" },
            { value: "article", label: "Article" },
          ]} />
          <div className="grid grid-cols-2 gap-3">
            <FilterInput label="Year from" value={filters.yearFrom} onChange={(v) => setFilters({ ...filters, yearFrom: v })} type="number" />
            <FilterInput label="Year to" value={filters.yearTo} onChange={(v) => setFilters({ ...filters, yearTo: v })} type="number" />
          </div>
          <FilterSelect label="Decade" value={filters.decade} onChange={(v) => setFilters({ ...filters, decade: v })} options={[
            { value: "1970", label: "1970s" }, { value: "1980", label: "1980s" }, { value: "1990", label: "1990s" },
            { value: "2000", label: "2000s" }, { value: "2010", label: "2010s" }, { value: "2020", label: "2020s" },
          ]} />
        </div>
        <SheetFooter className="flex-row gap-2 border-t border-rule pt-4">
          <button
            onClick={() => { setFilters({ person: "", theme: "", company: "", concept: "", event: "", yearFrom: "", yearTo: "", sourceType: "", decade: "" }); }}
            className="chip flex-1 justify-center"
          >
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
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ BOOKMARKS</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] font-semibold tracking-tight">Saved items</h1>
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
              <button onClick={() => remove(s.id)} className="chip hover:chip-signal"><Trash2 className="h-3 w-3" /></button>
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
                <button onClick={() => remove(c.id)} className="chip hover:chip-signal"><Trash2 className="h-3 w-3" /></button>
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
      <button onClick={onUpgrade} className="mt-4 bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-signal-dark">START PRO — $9/MONTH</button>
    </div>
  );
}
