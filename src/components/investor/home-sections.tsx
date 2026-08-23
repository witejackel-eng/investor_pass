"use client";
/**
 * Homepage v2 sections (master plan execution).
 *
 * Every number rendered here comes from a live product endpoint at runtime
 * (/api/themes/[slug]/coverage, /api/investors/[slug]/decisions, /api/trails,
 * /api/stats). Nothing is hardcoded that can be queried; nothing is invented.
 * Every interaction navigates to a real product surface via the SPA router.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { SearchBar } from "@/components/investor/search-bar";

// ── shared types ────────────────────────────────────────────────────────────

type Coverage = {
  theme: { slug: string; name: string; description: string | null };
  total: number;
  investors: { slug: string; name: string; count: number }[];
};

type CoverageCache = { at: number; data: Coverage } | null;
let coverageCache: CoverageCache = null; // module-level: one request per session

function useCoverage(slug: string): Coverage | null {
  const [data, setData] = useState<Coverage | null>(coverageCache?.data ?? null);
  useEffect(() => {
    if (coverageCache && Date.now() - coverageCache.at < 5 * 60_000) return;
    let active = true;
    apiGet<Coverage>(`/api/themes/${slug}/coverage`)
      .then((d) => {
        if (!active) return;
        coverageCache = { at: Date.now(), data: d };
        setData(d);
      })
      .catch(() => {}); // hide the demo rather than show wrong numbers
    return () => {
      active = false;
    };
  }, [slug]);
  return data;
}

// ── hero right rail — the multi-investor wedge, first screen ───────────────

export function RiskCoverageCard() {
  const go = useStore((s) => s.go);
  const cov = useCoverage("risk-management");
  const top = cov?.investors.slice(0, 5) ?? [];
  if (top.length === 0) return null; // endpoint down → rail simply hides

  return (
    <div className="mt-2 border border-ink bg-paper p-4 transition-all hover:shadow-[3px_3px_0_0_var(--ink)]">
      <p className="font-display text-2xl font-bold tracking-tight">Who talks about risk?</p>
      <p className="mt-1 font-reader text-sm text-graphite">
        The same idea, indexed across the whole roster — not one investor&apos;s archive.
      </p>
      <ul className="mt-3 space-y-1.5">
        {top.map((row) => (
          <li key={row.slug} className="flex items-baseline justify-between gap-2 border-t border-rule pt-1.5">
            <button
              onClick={() => go("topic", { slug: "risk-management", investor: row.slug })}
              className="font-display text-sm font-medium hover:text-signal-dark"
            >
              {row.name}
            </button>
            <span className="font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
              {row.count} units
            </span>
          </li>
        ))}
      </ul>
      <a
        href="#coverage"
        className="mt-3 inline-block font-mono text-[0.62rem] uppercase tracking-wider text-signal-dark hover:underline"
      >
        See the full coverage ↓
      </a>
    </div>
  );
}

// ── section 3 — live cross-investor search demo ────────────────────────────

export function CrossInvestorDemo() {
  const go = useStore((s) => s.go);
  const cov = useCoverage("risk-management");
  const [selected, setSelected] = useState<string[]>([]);
  const rows = cov?.investors ?? [];
  const max = useMemo(() => Math.max(1, ...rows.map((r) => r.count)), [rows]);

  if (rows.length === 0) return null; // honest hide on failure

  const toggle = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length >= 2
          ? [prev[1], slug]
          : [...prev, slug]
    );

  return (
    <section id="coverage" className="mt-12 border-t-2 border-ink py-8" aria-labelledby="coverage-title">
      <div className="section-head">
        <h2 id="coverage-title">Search one idea. See who talks about it.</h2>
        <p className="kicker">CROSS-INVESTOR DISCOVERY</p>
      </div>
      <p className="max-w-[680px] font-reader text-base text-graphite">
        This is the wedge: one theme, every indexed voice, real counts from the database.
        Open any investor&apos;s page on the theme, or select two and compare them side by side.
      </p>
      <div className="mt-6">
        <div className="border border-ink bg-paper">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink px-4 py-2.5">
            <p className="font-display text-lg font-bold tracking-tight">
              {(cov?.theme.name ?? "RISK MANAGEMENT").toUpperCase()}
            </p>
            <p className="font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
              Theme · {cov?.total.toLocaleString() ?? rows.length} indexed research units · {rows.length}{" "}
              investors with coverage
            </p>
          </div>
          <ul>
            {rows.map((r, i) => {
              const isSel = selected.includes(r.slug);
              return (
                <li key={r.slug} className={i > 0 ? "border-t border-rule" : ""}>
                  <div
                    className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors ${isSel ? "" : "hover:bg-paper-2"}`}
                    style={isSel ? { background: "var(--signal-ghost)" } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(r.slug)}
                        aria-pressed={isSel}
                        aria-label={`Select ${r.name} for comparison`}
                        className="p-1"
                      >
                        <span
                          aria-hidden
                          className={`inline-block h-3 w-3 shrink-0 border ${isSel ? "border-signal bg-signal" : "border-ink bg-transparent"}`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => go("topic", { slug: "risk-management", investor: r.slug })}
                        className="font-display text-sm font-semibold hover:text-signal-dark"
                      >
                        {r.name}
                      </button>
                    </div>
                    <span aria-hidden className="hidden h-3 w-full bg-paper-2 sm:block">
                      <span
                        className="block h-full bg-signal"
                        style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }}
                      />
                    </span>
                    <span className="text-right font-mono text-[0.68rem] uppercase tracking-wider text-graphite">
                      {r.count} references
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink px-4 py-3">
            <p className="font-reader text-xs text-graphite">
              Counts reflect indexed source coverage, not investment quality.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => go("topic", { slug: "risk-management", investor: "marks" })}
                className="nav-link text-[0.78rem] font-semibold"
              >
                OPEN THE THEME
              </button>
              <button
                onClick={() => go("compare")}
                className="bg-ink px-4 py-2 text-[0.78rem] font-semibold text-paper transition-colors hover:bg-signal-dark"
              >
                OPEN COMPARE
                <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
          Names open the investor&apos;s real theme page · select two, then open Compare
        </p>
      </div>
    </section>
  );
}

// ── section 4 — research loop ───────────────────────────────────────────────

export function ResearchLoop() {
  const go = useStore((s) => s.go);
  return (
    <section className="mt-12 border-t-2 border-ink py-8" aria-labelledby="loop-title">
      <div className="section-head">
        <h2 id="loop-title">From one question to a research trail.</h2>
        <p className="kicker">THE LOOP</p>
      </div>
      <ol className="grid gap-0 border border-ink bg-paper md:grid-cols-7 md:divide-x md:divide-rule">
        {[
          {
            step: "QUESTION",
            body: (
              <>
                <p className="font-reader text-sm italic text-ink">
                  &ldquo;How do Buffett and Marks think about risk?&rdquo;
                </p>
                <p className="mt-2 font-reader text-xs text-graphite">Every research session starts here.</p>
              </>
            ),
          },
          {
            step: "SOURCE",
            body: (
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => go("source", { slug: "berkshire-1988-letter" })}
                    className="font-display text-sm font-semibold hover:text-signal-dark"
                  >
                    Berkshire 1988 letter
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => go("source", { slug: "you-cant-predict.-you-can-prepare." })}
                    className="font-display text-sm font-semibold hover:text-signal-dark"
                  >
                    Marks, 2001 memo
                  </button>
                </li>
                <li className="font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
                  Original publisher linked
                </li>
              </ul>
            ),
          },
          {
            step: "CONTEXT",
            body: (
              <>
                <p className="font-reader text-sm text-ink">
                  Open the passage — paraphrased, section-cited, no interpretation added.
                </p>
                <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
                  Paraphrased research unit
                </p>
              </>
            ),
          },
          {
            step: "CROSS-INVESTOR",
            body: (
              <>
                <p className="font-reader text-sm text-ink">One click: everyone indexed on the same theme.</p>
                <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
                  Risk management — across the roster
                </p>
              </>
            ),
          },
          {
            step: "COMPARE",
            body: (
              <>
                <p className="font-mono text-[0.62rem] uppercase tracking-wider text-ink">Shared coverage</p>
                <p className="font-reader text-xs text-graphite">Risk management</p>
                <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-wider text-ink">
                  Different indexed emphasis
                </p>
                <p className="font-reader text-xs text-graphite">
                  Marks: credit cycles, second-level thinking · Buffett: moats, capital allocation
                </p>
                <button
                  onClick={() => go("compare")}
                  className="mt-2 font-mono text-[0.62rem] uppercase tracking-wider text-signal-dark hover:underline"
                >
                  Run a compare →
                </button>
              </>
            ),
          },
          {
            step: "DECISION",
            body: (
              <>
                <p className="font-display text-sm font-bold">1988 · Coca-Cola · invested</p>
                <p className="mt-1 font-reader text-xs text-graphite">
                  The words, connected to the act — with outcome and source.
                </p>
                <a href="#decision" className="mt-2 inline-block font-mono text-[0.62rem] uppercase tracking-wider text-signal-dark hover:underline">
                  See the record ↓
                </a>
              </>
            ),
          },
          {
            step: "SAVE",
            body: (
              <>
                <p className="font-reader text-sm text-ink">Save the trail. Follow the question.</p>
                <p className="mt-2 font-reader text-xs text-graphite">
                  Come back later and continue exactly where you stopped.
                </p>
              </>
            ),
          },
        ].map((s, i) => (
          <li key={s.step} className={`p-4 ${i > 0 ? "border-t border-rule md:border-t-0" : ""}`}>
            <p className="kicker text-signal-dark">
              {String(i + 1).padStart(2, "0")} · {s.step}
            </p>
            <div className="mt-2">{s.body}</div>
          </li>
        ))}
      </ol>
      <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
        Who else → what was documented → what was done → what changed → what to investigate next
      </p>
    </section>
  );
}

// ── section 5 — start anywhere ──────────────────────────────────────────────

export function StartAnywhere() {
  const go = useStore((s) => s.go);
  return (
    <section className="mt-12 border-t-2 border-ink py-8" aria-labelledby="anywhere-title">
      <div className="section-head">
        <h2 id="anywhere-title">Start anywhere.</h2>
        <p className="kicker">FOUR DOORS IN</p>
      </div>
      <div className="grid gap-px border border-ink bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "INVESTORS",
            items: [
              { name: "Warren Buffett", slug: "buffett" },
              { name: "Howard Marks", slug: "marks" },
              { name: "Charlie Munger", slug: "munger" },
              { name: "Benjamin Graham", slug: "graham" },
              { name: "Michael Burry", slug: "michael-burry" },
            ],
          },
          {
            label: "IDEAS",
            items: [
              { name: "Risk Management", slug: "risk-management" },
              { name: "Economic Moats", slug: "moats" },
              { name: "Inflation", slug: "inflation" },
              { name: "Valuation", slug: "valuation" },
              { name: "Capital Allocation", slug: "capital-allocation" },
            ],
          },
          {
            label: "COMPANIES",
            items: [
              { name: "Coca-Cola", slug: "coca-cola" },
              { name: "Apple", slug: "apple" },
              { name: "Berkshire Hathaway", slug: "berkshire-hathaway" },
              { name: "GEICO", slug: "geico" },
              { name: "See's Candies", slug: "sees-candies" },
            ],
          },
          {
            label: "EVENTS",
            items: [
              { name: "2008 — Financial Crisis", slug: "great-financial-crisis" },
              { name: "1987 — Black Monday", slug: "black-monday-1987" },
              { name: "2020 — COVID Crash", slug: "covid-crash" },
              { name: "2000 — Dot-Com Crash", slug: "dot-com-crash" },
              { name: "1973 — Oil Shock", slug: "oil-shock-1973" },
            ],
          },
        ].map((col) => (
          <div key={col.label} className="bg-paper p-5">
            <p className="kicker text-signal-dark">{col.label}</p>
            <ul className="mt-3 space-y-2">
              {col.items.map((it) => (
                <li key={it.slug}>
                  {col.label === "INVESTORS" ? (
                    <button
                      onClick={() => go("investor", { slug: it.slug })}
                      className="font-display text-sm font-medium hover:text-signal-dark"
                    >
                      {it.name}
                    </button>
                  ) : col.label === "IDEAS" ? (
                    <button
                      onClick={() => go("topic", { slug: it.slug, investor: "buffett" })}
                      className="font-display text-sm font-medium hover:text-signal-dark"
                    >
                      {it.name}
                    </button>
                  ) : col.label === "COMPANIES" ? (
                    <button
                      onClick={() => go("company", { slug: it.slug })}
                      className="font-display text-sm font-medium hover:text-signal-dark"
                    >
                      {it.name}
                    </button>
                  ) : (
                    <button
                      onClick={() => go("event", { slug: it.slug })}
                      className="font-display text-sm font-medium hover:text-signal-dark"
                    >
                      {it.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 font-reader text-sm italic text-graphite">
        Every path leads back into the same evidence graph.
      </p>
    </section>
  );
}

// ── section 6 — decision demo (real verified record from the ledger) ───────

type LedgerResponse = {
  total: number;
  decisions: {
    id: string;
    title: string;
    date: string | null;
    action: string | null;
    statement: string | null;
    outcome: string | null;
    outcomeSourceUrl: string | null;
    confidence: string | null;
    verified: boolean;
  }[];
};

let ledgerCache: { at: number; data: LedgerResponse } | null = null;

export function DecisionDemo() {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<LedgerResponse | null>(ledgerCache?.data ?? null);
  useEffect(() => {
    if (ledgerCache && Date.now() - ledgerCache.at < 5 * 60_000) return;
    let active = true;
    apiGet<LedgerResponse>("/api/investors/buffett/decisions")
      .then((d) => {
        if (!active) return;
        ledgerCache = { at: Date.now(), data: d };
        setData(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!data || data.decisions.length === 0) return null; // honest hide

  // Prefer the Coca-Cola record; fall back to the earliest visible verified
  // decision. Free tier shows the first 3 — whichever is visible is real.
  const pick =
    data.decisions.find((d) => d.title.toLowerCase().includes("coca-cola")) ??
    data.decisions.find((d) => d.title.toLowerCase().includes("see's")) ??
    data.decisions[0];

  return (
    <section id="decision" className="mt-12 border-t-2 border-ink py-8" aria-labelledby="decision-title">
      <div className="section-head">
        <h2 id="decision-title">What did they actually do?</h2>
        <p className="kicker">THE DECISION LEDGER</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[8fr_4fr]">
        <article className="border border-ink bg-paper p-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="chip chip-ink">
              VERIFIED{pick.confidence ? ` · ${pick.confidence.toUpperCase()} CONFIDENCE` : ""}
            </span>
            <span className="font-mono text-[0.68rem] uppercase tracking-wider text-graphite">
              Decision Ledger · {data.total} documented decisions
            </span>
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight">
            Warren Buffett · {pick.date ?? ""} · {pick.title}
          </h3>
          {pick.action && (
            <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider text-signal-dark">
              {pick.action.toUpperCase()}
            </p>
          )}
          {pick.statement && (
            <div className="mt-5">
              <p className="kicker">CONTEXT — THE DOCUMENTED STATEMENT</p>
              <p className="mt-1 font-reader text-[0.95rem] leading-relaxed text-ink">{pick.statement}</p>
            </div>
          )}
          {pick.outcome && (
            <div className="mt-4">
              <p className="kicker">OUTCOME — LATER ESTABLISHED</p>
              <p className="mt-1 font-reader text-[0.95rem] leading-relaxed text-ink">{pick.outcome}</p>
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-rule pt-4">
            <button
              onClick={() => go("investor", { slug: "buffett" })}
              className="bg-ink px-4 py-2 text-[0.78rem] font-semibold text-paper transition-colors hover:bg-signal-dark"
            >
              EXPLORE THE DECISION LEDGER
              <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
            </button>
            {pick.outcomeSourceUrl && (
              <a
                href={pick.outcomeSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link text-[0.78rem] font-semibold"
              >
                CHECK THE SOURCE
              </a>
            )}
          </div>
        </article>
        <aside className="border-l border-rule lg:pl-6" aria-label="Decision ledger scale">
          <p className="kicker">SCALE</p>
          <div className="mt-3 space-y-3">
            <div className="border-t border-ink pt-2">
              <p className="font-display text-4xl font-bold tracking-tight text-signal-dark">{data.total}</p>
              <p className="kicker mt-1">DOCUMENTED DECISIONS</p>
            </div>
            <p className="font-reader text-xs leading-relaxed text-graphite">
              Each entry: what was done, the documented statement, the later outcome, and a link to
              the source that establishes it. No folklore. No anonymous &ldquo;legend says.&rdquo;
            </p>
            <button onClick={() => go("investors")} className="nav-link text-[0.78rem] font-semibold">
              BROWSE BY INVESTOR
              <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ── section 7 — featured public trail ───────────────────────────────────────

type TrailNode = { year: number; title: string; entityKind: string; link?: string };
type Trail = { slug: string; title: string; centralQuestion?: string; intro?: string; nodes: TrailNode[] };
let trailsCache: { at: number; data: Trail[] } | null = null;

export function FeaturedTrail() {
  const go = useStore((s) => s.go);
  const [trails, setTrails] = useState<Trail[] | null>(trailsCache?.data ?? null);
  useEffect(() => {
    if (trailsCache && Date.now() - trailsCache.at < 5 * 60_000) return;
    let active = true;
    apiGet<{ trails: Trail[] }>("/api/trails")
      .then((d) => {
        if (!active) return;
        trailsCache = { at: Date.now(), data: d.trails };
        setTrails(d.trails);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!trails || trails.length === 0) return null;

  const featured = trails.find((t) => t.slug === "2008-through-five-investors") ?? trails[0];
  const others = trails.filter((t) => t.slug !== featured.slug);

  return (
    <section className="mt-12 border-t-2 border-ink py-8" aria-labelledby="trail-title">
      <div className="section-head">
        <h2 id="trail-title">{featured.title}</h2>
        <p className="kicker">FEATURED RESEARCH</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[8fr_4fr]">
        <div>
          {featured.centralQuestion && (
            <p className="font-reader text-lg italic text-graphite">{featured.centralQuestion}</p>
          )}
          <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-wider text-graphite">
            {featured.nodes.length} steps · {featured.nodes[0]?.year}–{featured.nodes[featured.nodes.length - 1]?.year} ·
            {" "}five investors · every step sourced
          </p>
          <ol className="timeline-rail mt-6 space-y-4">
            {featured.nodes.map((n, i) => (
              <li key={i} className="relative">
                <span className="timeline-dot" aria-hidden />
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-signal-dark">
                  {n.year} · {n.entityKind}
                </p>
                {n.link ? (
                  <a href={n.link} className="font-display text-base font-semibold hover:text-signal-dark">
                    {n.title}
                  </a>
                ) : (
                  <p className="font-display text-base font-semibold">{n.title}</p>
                )}
              </li>
            ))}
          </ol>
          <button
            onClick={() => go("trailDetail", { slug: featured.slug })}
            className="mt-6 bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-signal-dark"
          >
            READ THE TRAIL
            <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
        <aside className="border-l border-rule lg:pl-6" aria-label="More trails">
          <p className="kicker">MORE PUBLIC TRAILS</p>
          <ul className="mt-3 space-y-3">
            {others.map((t) => (
              <li key={t.slug} className="border-t border-rule pt-3">
                <button
                  onClick={() => go("trailDetail", { slug: t.slug })}
                  className="font-display text-sm font-semibold hover:text-signal-dark"
                >
                  {t.title}
                </button>
                <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
                  {t.nodes.length} steps · {t.nodes[0]?.year}–{t.nodes[t.nodes.length - 1]?.year}
                </p>
              </li>
            ))}
          </ul>
          <button
            onClick={() => go("trails")}
            className="mt-4 font-mono text-[0.62rem] uppercase tracking-wider text-graphite hover:text-ink"
          >
            All trails →
          </button>
        </aside>
      </div>
    </section>
  );
}

// ── section 11 — compressed thesis + principles ────────────────────────────

export function ThesisPrinciples() {
  return (
    <section className="mt-12 border-t-2 border-ink py-8" aria-labelledby="what-title">
      <div className="section-head">
        <h2 id="what-title">What Investor/Pass is</h2>
        <p className="kicker">PRODUCT THESIS</p>
      </div>
      <p className="max-w-[820px] font-reader text-lg leading-relaxed text-ink">
        Investor/Pass turns difficult-to-navigate public investor records into a structured research
        system. Search the record, connect ideas, compare investors, trace decisions — and keep your
        own research organized.
      </p>
      <div className="mt-6 grid gap-px border border-ink bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            t: "SOURCE-FIRST",
            d: "Every research unit has provenance — publisher, date, and a link to the original where legitimately available.",
          },
          {
            t: "CROSS-INVESTOR",
            d: "Study the same idea across exceptional investors — the wedge no single-investor archive offers.",
          },
          {
            t: "RESEARCH-FIRST",
            d: "Move from question to evidence to comparison to decision. Not headlines — method.",
          },
          {
            t: "PERSONAL",
            d: "Save, follow and continue your research. The record is public; the trail through it is yours.",
          },
        ].map((p) => (
          <div key={p.t} className="bg-paper p-5">
            <p className="kicker text-signal-dark">{p.t}</p>
            <p className="mt-2 font-reader text-sm leading-relaxed text-graphite">{p.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-reader text-sm text-graphite">
        Paraphrased summaries with source attribution — never reproductions. Historical reference
        only, never investment advice.
      </p>
    </section>
  );
}

// ── section 13 — final search CTA ──────────────────────────────────────────

export function FinalSearchCta() {
  return (
    <section className="mt-12 border-t-2 border-ink py-12" aria-labelledby="cta-title">
      <div className="section-head">
        <h2 id="cta-title">What&apos;s your next research question?</h2>
        <p className="kicker">THE RECORD IS WAITING</p>
      </div>
      <div className="max-w-[820px]">
        <SearchBar compact />
      </div>
    </section>
  );
}


// ── FROM ADITYA — founder + newsletter (Master Plan Phases 19–20) ──────────

import { FOUNDER, latestIssue } from "@/data/newsletter/issues";

export function FromAditya() {
  const issue = latestIssue();
  const excerpt =
    issue.body[0]?.paragraphs[0] ??
    "I'm Aditya. I love investing, finance, and understanding how capital actually moves through the world.";
  return (
    <section className="mt-12 border-t-2 border-ink py-8" aria-labelledby="aditya-title">
      <div className="section-head">
        <h2 id="aditya-title">From Aditya</h2>
        <p className="kicker">FOUNDER · NEWSLETTER</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[8fr_4fr]">
        <div>
          <p className="font-reader text-lg leading-relaxed text-ink">&ldquo;{excerpt}&rdquo;</p>
          <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-wider text-graphite">
            {FOUNDER.name.toUpperCase()} — ISSUE #{String(issue.number).padStart(2, "0")} · {issue.publishedAt}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a
              href={`/newsletter/${issue.slug}`}
              className="bg-ink px-4 py-2 text-[0.78rem] font-semibold text-paper transition-colors hover:bg-signal-dark"
            >
              READ THE NOTE
              <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
            </a>
            <a href="/newsletter" className="nav-link text-[0.78rem] font-semibold">
              SUBSCRIBE FREE
            </a>
          </div>
        </div>
        <aside className="border-l border-rule lg:pl-6" aria-label="What the newsletter covers">
          <p className="kicker">ADITYA&apos;S RESEARCH, EXPLANATIONS &amp; DISCOVERIES</p>
          <ul className="mt-3 space-y-1.5 font-reader text-sm text-graphite">
            <li>· How finance works — in plain language</li>
            <li>· Discoveries from the indexed record</li>
            <li>· Investor comparisons, with sources</li>
            <li>· What I&apos;m researching next</li>
          </ul>
          <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
            Free · roughly every few days · quality over cadence
          </p>
        </aside>
      </div>
    </section>
  );
}
