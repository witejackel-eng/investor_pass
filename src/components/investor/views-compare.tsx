"use client";
import { useEffect, useMemo, useState } from "react";
import { apiGet, track } from "@/lib/client";
import { useInvestors } from "@/hooks/use-investors";

type InvestorLite = { slug: string; name: string; shortDescription?: string | null };
type TagRef = { slug: string; name: string };
type CompareColumn = {
  investor: { slug: string; name: string };
  total: number;
  years: number[];
  topTags: { themes: TagRef[]; companies: TagRef[]; concepts: TagRef[]; events: TagRef[] };
  passages: {
    id: string;
    text: string;
    year: number | null;
    section: string | null;
    source: { slug: string; title: string; year: number | null; sourceType: string; publisher: string | null; url: string | null };
  }[];
};
type CompareData = {
  columns: CompareColumn[];
  shared: Record<"themes" | "companies" | "concepts" | "events", TagRef[]>;
};

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

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`chip ${active ? "chip-active" : ""}`}
      style={active ? { borderColor: "var(--signal)", color: "var(--signal)" } : undefined}
    >
      {children}
    </button>
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
  const { data: investors = [], isLoading: investorsLoading, isError: investorsError, refetch: refetchInvestors } = useInvestors();

  useEffect(() => {
    if (investorsError) setError("Could not load investors.");
  }, [investorsError]);

  // Any input change clears stale errors/hints.
  useEffect(() => {
    setError(null);
    setHint(null);
  }, [selected.length, q, themeSlug]);

  const toggleInvestor = (slug: string) =>
    setSelected((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= 4 ? cur : [...cur, slug]
    );

  const canRun = selected.length >= 2 && (q.trim().length > 0 || themeSlug !== null);

  async function run() {
    // Explain instead of silently disabling.
    if (selected.length < 2) {
      setHint(`Pick ${2 - selected.length} more investor${selected.length === 1 ? "" : "s"} to compare.`);
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

  const colsStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${Math.max(data?.columns.length ?? 2, 2)}, minmax(0, 1fr))` }),
    [data]
  );
  const savedLabel = `COMPARE ${selected.join(" × ").toUpperCase()}${q ? ` · ${q.toUpperCase()}` : ""}${themeSlug ? ` · ${themeSlug.toUpperCase()}` : ""}`;

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24">
      <p className="kicker mt-8">COMPARE</p>
      <h1 className="mt-1 text-[clamp(28px,5vw,44px)] font-semibold leading-tight">
        How did different investors think about the same problem?
      </h1>
      <p className="mt-2 max-w-[70ch] text-sm text-[var(--graphite)]">
        Select two to four investors and a topic. Every claim below is an indexed reference — open any source to verify.
      </p>

      <div className="mt-6 border-y border-[var(--rule)] py-5">
        <p className="kicker">STEP 1 · INVESTORS ({selected.length}/4)</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {investors.map((inv) => (
            <Chip key={inv.slug} active={selected.includes(inv.slug)} onClick={() => toggleInvestor(inv.slug)}>
              {inv.name}
            </Chip>
          ))}
          {investorsLoading && <span className="text-xs text-[var(--graphite)]">Loading…</span>}
          {!investorsLoading && investorsError && (
            <button onClick={() => refetchInvestors()} className="chip">RETRY</button>
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
          <p className="mt-2 text-xs text-[var(--graphite)]">Pick at least one more investor.</p>
        )}
        {!loading && selected.length === 0 && !data && (
          <p className="mt-2 text-xs text-[var(--graphite)]">Step 1: pick 2–4 investors · Step 2: add a topic · then run.</p>
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
          <section className="mt-10">
            <p className="kicker">SHARED GROUND</p>
            <div className="mt-3 space-y-2 text-sm">
              {(["themes", "concepts", "companies", "events"] as const).map((kind) =>
                data.shared[kind].length ? (
                  <div key={kind} className="flex flex-wrap items-baseline gap-2">
                    <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-[var(--graphite)]">{kind}</span>
                    {data.shared[kind].map((t) => (
                      <span key={`${kind}-${t.slug}`} className="chip">{t.name}</span>
                    ))}
                  </div>
                ) : null
              )}
              {!data.shared.themes.length && !data.shared.concepts.length && !data.shared.companies.length && (
                <p className="text-[var(--graphite)]">Little overlap in tagged ideas — these investors approached it differently.</p>
              )}
            </div>
          </section>

          <section className="mt-10">
            <p className="kicker">SIDE BY SIDE</p>
            <div className="mt-4 grid gap-6" style={colsStyle}>
              {data.columns.map((col) => (
                <div key={col.investor.slug} className="border-t-2 border-[var(--ink)] pt-3">
                  <a href={`#/view=investor&slug=${col.investor.slug}`} className="text-lg font-semibold hover:underline">
                    {col.investor.name}
                  </a>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[var(--graphite)]">
                    {col.total} indexed references{col.years.length ? ` · ${col.years[0]}–${col.years[col.years.length - 1]}` : ""}
                  </p>
                  {col.years.length > 0 && (
                    <div className="mt-2 flex h-1.5 w-full gap-px overflow-hidden">
                      {col.years.map((y) => (
                        <span key={y} title={String(y)} className="h-full flex-1 bg-[var(--rule)]" />
                      ))}
                    </div>
                  )}
                  <ul className="mt-4 space-y-4">
                    {col.passages.map((ps) => (
                      <li key={ps.id} className="border-b border-[var(--rule)] pb-4">
                        <p className="text-[11px] uppercase tracking-wide text-[var(--graphite)]">
                          {ps.year ?? "undated"} · {ps.source.sourceType.replace(/_/g, " ")}
                        </p>
                        <p className="prose-reader mt-1 line-clamp-4 text-sm">{ps.text}…</p>
                        <div className="mt-2 flex gap-3 text-xs">
                          <a href={`#/view=passage&id=${ps.id}&investor=${col.investor.slug}`} className="underline decoration-[var(--signal)] underline-offset-2">
                            Open passage →
                          </a>
                          <a href={`#/view=source&slug=${ps.source.slug}`} className="text-[var(--graphite)] underline underline-offset-2">
                            Source
                          </a>
                        </div>
                      </li>
                    ))}
                    {!col.passages.length && (
                      <li className="text-sm text-[var(--graphite)]">No public references matched for this investor.</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-8 text-xs text-[var(--graphite)]">
            Comparison reflects only what is indexed here. Investors spoke in different eras under different conditions.
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
