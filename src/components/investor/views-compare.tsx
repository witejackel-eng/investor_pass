"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, track } from "@/lib/client";
import { useInvestors } from "@/hooks/use-investors";

type InvestorLite = { slug: string; name: string; shortDescription?: string | null };
type TagRef = { slug: string; name: string; count?: number };
type CompareColumn = {
  investor: { slug: string; name: string; kind: string; region: string | null };
  total: number;
  years: number[];
  yearCounts: { year: number; count: number }[];
  topTags: { themes: TagRef[]; companies: TagRef[]; concepts: TagRef[]; events: TagRef[] };
  passages: {
    id: string;
    text: string;
    year: number | null;
    section: string | null;
    source: { slug: string; title: string; year: number | null; sourceType: string; publisher: string | null; url: string | null };
  }[];
  decisions: {
    id: string;
    title: string;
    date: string | null;
    action: string | null;
    outcome: string | null;
    confidence: string | null;
    verified: boolean;
    company: { slug: string; name: string } | null;
  }[];
};
type CompareData = {
  columns: CompareColumn[];
  shared: Record<"themes" | "companies" | "concepts" | "events", TagRef[]>;
  distinct: Record<"themes" | "companies" | "concepts" | "events", { slug: string; name: string; owners: string[] }[]>;
};

const MAX_PEOPLE = 6;
const SUGGESTED_THEMES = [
  { slug: "moats", name: "Economic Moats" },
  { slug: "margin-of-safety", name: "Margin of Safety" },
  { slug: "market-psychology", name: "Market Psychology" },
  { slug: "risk-management", name: "Risk Management" },
  { slug: "inflation", name: "Inflation" },
  { slug: "capital-allocation", name: "Capital Allocation" },
  { slug: "valuation", name: "Valuation" },
  { slug: "index-investing", name: "Index Investing" },
];
type ViewMode = "side" | "stacked" | "differences" | "timeline";
const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "side", label: "SIDE BY SIDE" },
  { id: "stacked", label: "STACKED" },
  { id: "differences", label: "HIGHLIGHT DIFFERENCES" },
  { id: "timeline", label: "TIMELINE" },
];
const KIND_GROUP: Record<string, { label: string; test: (p: { kind?: string; region?: string | null }) => boolean }> = {
  investors: { label: "INVESTORS", test: (p) => p.kind === "investor" },
  us: { label: "US FOUNDERS", test: (p) => p.kind === "founder" && p.region === "us" },
  china: { label: "CHINA", test: (p) => p.kind === "founder" && p.region === "china" },
  india: { label: "INDIA", test: (p) => p.kind === "founder" && p.region === "india" },
};

function Chip({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`chip ${active ? "chip-active" : ""}`}
      style={active ? { borderColor: "var(--signal)", color: "var(--signal)" } : undefined}
    >
      {children}
    </button>
  );
}

function YearBar({ years }: { years: number[] }) {
  if (!years.length) return null;
  return (
    <div className="mt-2 flex h-1.5 w-full gap-px overflow-hidden" aria-hidden="true">
      {years.map((y) => (
        <span key={y} title={String(y)} className="h-full flex-1 bg-[var(--rule)]" />
      ))}
    </div>
  );
}

function DecisionCard({ d }: { d: CompareColumn["decisions"][number] }) {
  const actionColor = (a?: string | null) =>
    a === "acquired" || a === "invested" ? "chip chip-signal" : "chip";
  return (
    <li className="border-b border-[var(--rule)] pb-2.5 last:border-b-0">
      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--graphite)]">
        {d.date ?? "undated"}
        {d.company ? ` · ${d.company.name}` : ""}
        {d.verified ? " · verified" : ""}
        {d.confidence ? ` · ${d.confidence}` : ""}
      </span>
      <p className="font-medium leading-snug">{d.title}</p>
      {d.outcome && (
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--graphite)]">{d.outcome}</p>
      )}
      {d.action && <span className={`${actionColor(d.action)} mt-1 inline-block text-[0.6rem]`}>{d.action.toUpperCase()}</span>}
    </li>
  );
}

function PassageItem({ ps, who }: { ps: CompareColumn["passages"][number]; who?: string }) {
  return (
    <li className="border-b border-[var(--rule)] pb-4 last:border-b-0">
      <p className="text-[11px] uppercase tracking-wide text-[var(--graphite)]">
        {who ? <span className="font-semibold text-[var(--ink)]">{who} · </span> : null}
        {ps.year ?? "undated"} · {ps.source.sourceType.replace(/_/g, " ")}
      </p>
      <p className="prose-reader mt-1 line-clamp-4 text-sm">{ps.text}…</p>
      <div className="mt-2 flex gap-3 text-xs">
        <Link href={`/passages/${ps.id}`} className="underline decoration-[var(--signal)] underline-offset-2">
          Open passage →
        </Link>
        <Link href={`/sources/${ps.source.slug}`} className="text-[var(--graphite)] underline underline-offset-2">
          Source
        </Link>
      </div>
    </li>
  );
}

export function CompareView() {
  const [selected, setSelected] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [themeSlug, setThemeSlug] = useState<string | null>(null);
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("side");
  const [peopleFilter, setPeopleFilter] = useState("");
  const [group, setGroup] = useState<string>("investors");
  const { data: investors = [], isLoading: investorsLoading, isError: investorsError, refetch: refetchInvestors } = useInvestors();

  useEffect(() => {
    if (investorsError) setError("Could not load people.");
  }, [investorsError]);

  // Any input change clears stale errors/hints.
  useEffect(() => {
    setError(null);
    setHint(null);
  }, [selected.length, q, themeSlug]);

  const toggleInvestor = (slug: string) =>
    setSelected((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= MAX_PEOPLE ? cur : [...cur, slug]
    );

  const canRun = selected.length >= 2 && (q.trim().length > 0 || themeSlug !== null);

  async function run() {
    if (selected.length < 2) {
      setHint(`Pick ${2 - selected.length} more person${selected.length === 1 ? "" : "s"} to compare.`);
      return;
    }
    if (!q.trim() && !themeSlug) {
      setHint("Now add a topic — type a phrase above or tap a theme chip.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams({ investors: selected.join(",") });
      if (q.trim()) p.set("q", q.trim());
      if (themeSlug) p.set("theme", themeSlug);
      track("comparison_started", { investors: selected, q: q.trim(), theme: themeSlug });
      const d = await apiGet<CompareData>(`/api/compare?${p.toString()}`);
      setData(d);
      if (d.columns.every((c) => c.total === 0)) {
        setHint("No indexed references matched that topic — try a broader word like “risk”, “value”, or “debt”.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const visiblePeople = useMemo(() => {
    const g = KIND_GROUP[group];
    return investors.filter(
      (inv) => (!g || g.test(inv)) && (!peopleFilter.trim() || inv.name.toLowerCase().includes(peopleFilter.trim().toLowerCase()))
    );
  }, [investors, group, peopleFilter]);

  const colsStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${Math.max(data?.columns.length ?? 2, 2)}, minmax(240px, 1fr))` }),
    [data]
  );

  const stats = useMemo(() => {
    if (!data) return null;
    const totalRefs = data.columns.reduce((s, c) => s + c.total, 0);
    const allYears = data.columns.flatMap((c) => c.years);
    const span = allYears.length ? `${Math.min(...allYears)}–${Math.max(...allYears)}` : "";
    return { totalRefs, span, sharedThemes: data.shared.themes.length, people: data.columns.length };
  }, [data]);

  const timeline = useMemo(() => {
    if (!data) return [];
    return data.columns
      .flatMap((c) => c.passages.map((ps) => ({ ...ps, who: c.investor.name, whoSlug: c.investor.slug })))
      .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
  }, [data]);

  const savedLabel = `COMPARE ${selected.join(" × ").toUpperCase()}${q ? ` · ${q.toUpperCase()}` : ""}${themeSlug ? ` · ${themeSlug.toUpperCase()}` : ""}`;

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24">
      <p className="kicker mt-8">COMPARE</p>
      <h1 className="mt-1 text-[clamp(28px,5vw,44px)] font-semibold leading-tight">
        How did different minds think about the same problem?
      </h1>
      <p className="mt-2 max-w-[70ch] text-sm text-[var(--graphite)]">
        Select two to six investors or founders and a topic. Compare side by side, stacked, by what makes
        each one different, or on a timeline. Every claim is an indexed reference — open any source to verify.
      </p>

      <div className="mt-6 border-y border-[var(--rule)] py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="kicker">STEP 1 · PEOPLE ({selected.length}/{MAX_PEOPLE})</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              value={peopleFilter}
              onChange={(e) => setPeopleFilter(e.target.value)}
              placeholder="Filter people…"
              className="w-36 border border-[var(--rule)] bg-transparent px-2 py-1 text-xs outline-none focus:border-[var(--signal)]"
              aria-label="Filter people"
            />
            {Object.entries(KIND_GROUP).map(([id, g]) => (
              <Chip key={id} active={group === id} onClick={() => setGroup(id)}>
                {g.label}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {visiblePeople.map((inv) => (
            <Chip key={inv.slug} active={selected.includes(inv.slug)} onClick={() => toggleInvestor(inv.slug)}>
              {inv.name}
            </Chip>
          ))}
          {investorsLoading && <span className="text-xs text-[var(--graphite)]">Loading…</span>}
          {!investorsLoading && investorsError && (
            <button onClick={() => refetchInvestors()} className="chip">RETRY</button>
          )}
          {!investorsLoading && !visiblePeople.length && (
            <span className="text-xs text-[var(--graphite)]">No one matches that filter.</span>
          )}
        </div>

        <p className="kicker mt-6">STEP 2 · TOPIC</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder='e.g. "risk", "2008 crisis", "pricing power"'
            className="w-full max-w-md border border-[var(--rule)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--signal)]"
            aria-label="Comparison topic"
          />
          <span className="text-xs uppercase tracking-wide text-[var(--graphite)]">or a theme:</span>
          {SUGGESTED_THEMES.map((t) => (
            <Chip key={t.slug} active={themeSlug === t.slug} onClick={() => setThemeSlug(themeSlug === t.slug ? null : t.slug)}>
              {t.name}
            </Chip>
          ))}
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="mt-5 border border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium text-[var(--paper)] disabled:opacity-40"
        >
          {loading ? "COMPARING…" : "RUN COMPARISON"}
        </button>
        {hint && <p className="mt-2 text-xs text-signal-dark">{hint}</p>}
        {selected.length > 0 && selected.length < 2 && (
          <p className="mt-2 text-xs text-[var(--graphite)]">Pick at least one more person.</p>
        )}
        {!loading && selected.length === 0 && !data && (
          <p className="mt-2 text-xs text-[var(--graphite)]">
            Step 1: pick 2–{MAX_PEOPLE} people · Step 2: add a topic · then run.
          </p>
        )}
      </div>

      {error && (
        <div className="mt-8 border border-red-700/40 p-4 text-sm">
          <p className="font-medium">{error}</p>
          <button onClick={run} className="mt-2 underline">Try again</button>
        </div>
      )}

      {data && !loading && (
        <>
          {/* ── Summary stats ─────────────────────────────────────────── */}
          {stats && (
            <section className="mt-8 grid grid-cols-2 gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-4">
              <div className="bg-[var(--paper)] p-4">
                <p className="font-display text-2xl font-bold">{stats.people}</p>
                <p className="kicker mt-1">PEOPLE COMPARED</p>
              </div>
              <div className="bg-[var(--paper)] p-4">
                <p className="font-display text-2xl font-bold">{stats.totalRefs.toLocaleString()}</p>
                <p className="kicker mt-1">MATCHING REFERENCES</p>
              </div>
              <div className="bg-[var(--paper)] p-4">
                <p className="font-display text-2xl font-bold">{stats.sharedThemes}</p>
                <p className="kicker mt-1">SHARED THEMES</p>
              </div>
              <div className="bg-[var(--paper)] p-4">
                <p className="font-display text-2xl font-bold">{stats.span || "—"}</p>
                <p className="kicker mt-1">YEARS COVERED</p>
              </div>
            </section>
          )}

          {/* ── Shared ground ──────────────────────────────────────────── */}
          <section className="mt-10">
            <p className="kicker">SHARED GROUND</p>
            <div className="mt-3 space-y-2 text-sm">
              {(["themes", "concepts", "companies", "events"] as const).map((kind) =>
                data.shared[kind].length ? (
                  <div key={kind} className="flex flex-wrap items-baseline gap-2">
                    <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-[var(--graphite)]">{kind}</span>
                    {data.shared[kind].map((t) => (
                      <span key={`${kind}-${t.slug}`} className="chip" title={t.count ? `in ${t.count} of ${data.columns.length} records` : undefined}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : null
              )}
              {!data.shared.themes.length && !data.shared.concepts.length && !data.shared.companies.length && (
                <p className="text-[var(--graphite)]">Little overlap in tagged ideas — these people approached it differently.</p>
              )}
            </div>
          </section>

          {/* ── View mode tabs ─────────────────────────────────────────── */}
          <section className="mt-10 border-y border-[var(--rule)] py-3" role="tablist" aria-label="Comparison views">
            <div className="flex flex-wrap gap-1.5">
              {VIEW_MODES.map((m) => (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={view === m.id}
                  onClick={() => setView(m.id)}
                  className={`chip ${view === m.id ? "chip-ink" : ""}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── SIDE BY SIDE ───────────────────────────────────────────── */}
          {view === "side" && (
            <section className="mt-6 overflow-x-auto" aria-label="Side by side comparison">
              <div className="mt-4 grid gap-6" style={colsStyle}>
                {data.columns.map((col) => (
                  <div key={col.investor.slug} className="min-w-0 border-t-2 border-[var(--ink)] pt-3">
                    <Link href={col.investor.kind === "founder" ? `/founders/${col.investor.slug}` : `/investors/${col.investor.slug}`} className="text-lg font-semibold hover:underline">
                      {col.investor.name}
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-wide text-[var(--graphite)]">
                      {col.total.toLocaleString()} indexed references{col.years.length ? ` · ${col.years[0]}–${col.years[col.years.length - 1]}` : ""}
                    </p>
                    <YearBar years={col.years} />
                    {col.topTags.themes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {col.topTags.themes.slice(0, 4).map((t) => (
                          <span key={t.slug} className="chip text-[0.6rem]">{t.name}</span>
                        ))}
                      </div>
                    )}
                    <ul className="mt-4 space-y-4">
                      {col.passages.map((ps) => (
                        <PassageItem key={ps.id} ps={ps} />
                      ))}
                      {!col.passages.length && (
                        <li className="text-sm text-[var(--graphite)]">No references matched for this person.</li>
                      )}
                    </ul>
                    {col.decisions.length > 0 && (
                      <div className="mt-5 border-t border-[var(--rule)] pt-3">
                        <p className="kicker mb-2">DOCUMENTED DECISIONS</p>
                        <ul className="space-y-2">
                          {col.decisions.slice(0, 6).map((d) => (
                            <DecisionCard key={d.id} d={d} />
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── STACKED ────────────────────────────────────────────────── */}
          {view === "stacked" && (
            <section className="mt-6" aria-label="Stacked comparison">
              {data.columns.map((col) => (
                <article key={col.investor.slug} className="mt-8 border-t-2 border-[var(--ink)] pt-4 first:mt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <Link href={col.investor.kind === "founder" ? `/founders/${col.investor.slug}` : `/investors/${col.investor.slug}`} className="font-display text-2xl font-semibold hover:underline">
                      {col.investor.name}
                    </Link>
                    <p className="kicker">
                      {col.total.toLocaleString()} REFERENCES{col.years.length ? ` · ${col.years[0]}–${col.years[col.years.length - 1]}` : ""}
                    </p>
                  </div>
                  <div className="mt-3 grid gap-8 md:grid-cols-2">
                    <div>
                      <p className="kicker mb-2">ON THIS TOPIC</p>
                      <ul className="space-y-4">
                        {col.passages.slice(0, 4).map((ps) => (
                          <PassageItem key={ps.id} ps={ps} />
                        ))}
                        {!col.passages.length && <li className="text-sm text-[var(--graphite)]">No references matched.</li>}
                      </ul>
                    </div>
                    <div>
                      {col.topTags.themes.length > 0 && (
                        <>
                          <p className="kicker mb-2">THEMES THEY USE</p>
                          <div className="flex flex-wrap gap-1.5">
                            {col.topTags.themes.slice(0, 10).map((t) => (
                              <span key={t.slug} className="chip">{t.name}{t.count ? ` (${t.count})` : ""}</span>
                            ))}
                          </div>
                        </>
                      )}
                      {col.decisions.length > 0 && (
                        <>
                          <p className="kicker mb-2 mt-5">DOCUMENTED DECISIONS</p>
                          <ul className="space-y-2">
                            {col.decisions.slice(0, 6).map((d) => (
                              <DecisionCard key={d.id} d={d} />
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* ── HIGHLIGHT DIFFERENCES ──────────────────────────────────── */}
          {view === "differences" && (
            <section className="mt-6" aria-label="Differences highlighted">
              <p className="max-w-[70ch] text-sm text-[var(--graphite)]">
                Where these {data.columns.length} records part ways: the themes, companies and events only one
                person touches on this topic.
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {data.columns.map((col) => {
                  const uniqThemes = col.topTags.themes.filter((t) =>
                    !data.columns.some((o) => o.investor.slug !== col.investor.slug && o.topTags.themes.some((ot) => ot.slug === t.slug))
                  );
                  const uniqCompanies = col.topTags.companies.filter((t) =>
                    !data.columns.some((o) => o.investor.slug !== col.investor.slug && o.topTags.companies.some((ot) => ot.slug === t.slug))
                  );
                  return (
                    <article key={col.investor.slug} className="border-t-2 border-[var(--ink)] pt-3">
                      <Link href={col.investor.kind === "founder" ? `/founders/${col.investor.slug}` : `/investors/${col.investor.slug}`} className="font-display text-xl font-semibold hover:underline">
                        {col.investor.name}
                      </Link>
                      <p className="kicker mt-1">ONLY THEM</p>
                      {uniqThemes.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {uniqThemes.slice(0, 8).map((t) => (
                            <span key={t.slug} className="chip chip-signal text-[0.65rem]">{t.name}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-[var(--graphite)]">No unique themes on this topic — fully overlapping ground.</p>
                      )}
                      {uniqCompanies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {uniqCompanies.slice(0, 6).map((t) => (
                            <span key={t.slug} className="chip text-[0.65rem]">{t.name}</span>
                          ))}
                        </div>
                      )}
                      {col.passages[0] && (
                        <ul className="mt-3 space-y-3">
                          <PassageItem key={col.passages[0].id} ps={col.passages[0]} />
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── TIMELINE ───────────────────────────────────────────────── */}
          {view === "timeline" && (
            <section className="mt-6" aria-label="Timeline view">
              <p className="max-w-[70ch] text-sm text-[var(--graphite)]">
                Every selected passage in chronological order — watch the same topic move through time
                and through different hands.
              </p>
              <ol className="mt-6">
                {timeline.map((ps, i) => {
                  const prev = timeline[i - 1];
                  const showYear = !prev || prev.year !== ps.year;
                  return (
                    <li key={ps.id}>
                      {showYear && (
                        <p className="mt-6 border-t-2 border-[var(--ink)] pt-2 font-mono text-sm font-bold tracking-wider">
                          {ps.year ?? "UNDATED"}
                        </p>
                      )}
                      <ul className="mt-1">
                        <PassageItem ps={ps} who={ps.who} />
                      </ul>
                    </li>
                  );
                })}
                {!timeline.length && (
                  <li className="mt-4 text-sm text-[var(--graphite)]">No dated references matched.</li>
                )}
              </ol>
            </section>
          )}

          <p className="mt-8 text-xs text-[var(--graphite)]">
            Comparison reflects only what is indexed here. These people spoke in different eras under different conditions.
          </p>
          <SaveComparison label={savedLabel} />
        </>
      )}
    </div>
  );
}

function SaveComparison({ label }: { label: string }) {
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  async function save() {
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "search", entityId: `compare:${label}`, label }),
      });
      setState("saved");
    } catch {
      setState("error");
    }
  }
  if (state === "saved") return <p className="mt-4 text-sm">Saved to My Library.</p>;
  return (
    <div className="mt-4">
      <button onClick={save} disabled={state === "error"} className="border border-[var(--rule)] px-4 py-2 text-sm hover:border-[var(--ink)] disabled:opacity-50">
        {state === "error" ? "Sign in to save comparisons" : "☆ Save this comparison"}
      </button>
    </div>
  );
}
