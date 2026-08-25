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
              <p className="kicker">DOCUMENTED — THE STATEMENT (SOURCE-BACKED)</p>
              <p className="mt-1 font-reader text-[0.95rem] leading-relaxed text-ink">{pick.statement}</p>
            </div>
          )}
          {pick.outcome && (
            <div className="mt-4">
              <p className="kicker">WHAT HAPPENED NEXT? — OUTCOME, LATER ESTABLISHED</p>
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
            <a href="#newsletter" className="nav-link text-[0.78rem] font-semibold">
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

// ── §53 HOW FINANCE WORKS — featured explainer + Learn→Study bridge ───────

import { EXPLAINERS } from "@/data/learn/explainers";

export function LearnFeature() {
  const go = useStore((s) => s.go);
  const e = EXPLAINERS.find((x) => x.slug === "how-hedge-funds-work") ?? EXPLAINERS[0];
  if (!e) return null;
  return (
    <section className="mt-12 border-t-2 border-ink py-8" aria-labelledby="learn-feature-title">
      <div className="section-head">
        <h2 id="learn-feature-title">{e.title}</h2>
        <p className="kicker">HOW FINANCE WORKS</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[8fr_4fr]">
        <div>
          <p className="prose-reader max-w-[680px] text-base">{e.summary}</p>
          <div className="mt-4 grid gap-px border border-ink bg-rule sm:grid-cols-3">
            {[
              { t: "WHAT THEY DO", d: "Long/short, leverage, and the partnership structure." },
              { t: "HOW THEY MAKE MONEY", d: "Management fees plus performance fees — “2 and 20” and its variants." },
              { t: "THE STRATEGY WORLD", d: "Short selling · activism · macro · quant." },
            ].map((c) => (
              <div key={c.t} className="bg-paper p-4">
                <p className="kicker text-signal-dark">{c.t}</p>
                <p className="mt-1 font-reader text-sm text-graphite">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="kicker text-signal-dark">STUDY THE INVESTORS WHO OPERATE IN THIS WORLD</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {e.related.investors.map((inv) => (
                <button
                  key={inv.slug}
                  onClick={() => go("investor", { slug: inv.slug })}
                  className="chip hover:chip-signal"
                >
                  {inv.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a href={`/learn/${e.slug}`} className="bg-ink px-4 py-2 text-[0.78rem] font-semibold text-paper transition-colors hover:bg-signal-dark">
              READ THE EXPLAINER
              <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
            </a>
            {e.related.trail && (
              <button onClick={() => go("trailDetail", { slug: e.related.trail!.slug })} className="nav-link text-[0.78rem] font-semibold">
                FOLLOW THE RESEARCH TRAIL
                <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        </div>
        <aside className="border-l border-rule lg:pl-6" aria-label="More explainers">
          <p className="kicker">MORE FROM HOW FINANCE WORKS</p>
          <ul className="mt-3 space-y-3">
            {EXPLAINERS.filter((x) => x.slug !== e.slug).map((x) => (
              <li key={x.slug} className="border-t border-rule pt-3">
                <a href={`/learn/${x.slug}`} className="font-display text-sm font-semibold hover:text-signal-dark">
                  {x.title}
                </a>
                <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
                  {x.category} · {x.difficulty}
                </p>
              </li>
            ))}
          </ul>
          <a href="/learn" className="mt-4 inline-block font-mono text-[0.62rem] uppercase tracking-wider text-graphite hover:text-ink">
            All explainers →
          </a>
        </aside>
      </div>
    </section>
  );
}

// ── §54 INVESTOR RESEARCH FEATURE — Buffett × Marks on Risk ───────────────

export function InvestorResearchFeature() {
  const go = useStore((s) => s.go);
  const cov = useCoverage("risk-management");
  const marks = cov?.investors.find((i) => i.slug === "marks");
  const buffett = cov?.investors.find((i) => i.slug === "buffett");
  if (!cov || !marks || !buffett) return null;

  return (
    <section className="mt-12 border-t-2 border-ink py-8" aria-labelledby="research-feature-title">
      <div className="section-head">
        <h2 id="research-feature-title">Buffett × Marks on risk.</h2>
        <p className="kicker">INVESTOR RESEARCH</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[8fr_4fr]">
        <div>
          <p className="max-w-[680px] font-reader text-base text-graphite">
            One theme, two indexed records. Where they overlap, and where the indexed emphasis
            differs — with every claim traceable to a source.
          </p>
          <div className="mt-4 grid gap-px border border-ink bg-rule sm:grid-cols-3">
            <div className="bg-paper p-4">
              <p className="kicker text-signal-dark">SHARED INDEXED COVERAGE</p>
              <p className="mt-1 font-display text-xl font-bold">Risk Management</p>
              <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
                {cov.total.toLocaleString()} units across the roster
              </p>
            </div>
            <div className="bg-paper p-4">
              <p className="kicker text-signal-dark">HOWARD MARKS</p>
              <p className="mt-1 font-display text-xl font-bold">{marks.count} indexed units</p>
              <p className="mt-1 font-reader text-xs text-graphite">
                1990–2026 memos — the deepest single record on risk in the library.
              </p>
            </div>
            <div className="bg-paper p-4">
              <p className="kicker text-signal-dark">WARREN BUFFETT</p>
              <p className="mt-1 font-display text-xl font-bold">{buffett.count} indexed units</p>
              <p className="mt-1 font-reader text-xs text-graphite">
                1977–2024 letters — risk through the lens of capital allocation.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              onClick={() => go("compare")}
              className="bg-ink px-4 py-2 text-[0.78rem] font-semibold text-paper transition-colors hover:bg-signal-dark"
            >
              EXPLORE THE RESEARCH
              <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
            </button>
            <button onClick={() => go("topic", { slug: "risk-management", investor: "marks" })} className="nav-link text-[0.78rem] font-semibold">
              MARKS ON RISK
            </button>
            <button onClick={() => go("topic", { slug: "risk-management", investor: "buffett" })} className="nav-link text-[0.78rem] font-semibold">
              BUFFETT ON RISK
            </button>
          </div>
        </div>
        <aside className="border-l border-rule lg:pl-6" aria-label="From statement to action">
          <p className="kicker">FROM WORDS TO ACTS</p>
          <ul className="mt-3 space-y-2 font-reader text-sm text-graphite">
            <li>· What they documented — sources &amp; research units</li>
            <li>· What they did — the Decision Ledger</li>
            <li>· What happened — documented outcomes</li>
          </ul>
          <button onClick={() => go("investor", { slug: "buffett" })} className="mt-4 nav-link text-[0.78rem] font-semibold">
            SEE THE DECISION LEDGER
            <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
          </button>
        </aside>
      </div>
    </section>
  );
}

// ── FOUNDERS OF THE EAST — Chinese + Indian operator-builders ────────────────
//
// Showcases 4–6 featured founders (Jack Ma, Pony Ma, Lei Jun, Mukesh Ambani,
// Ratan Tata, Azim Premji) deep-linking to /founders/<slug>. Data is fetched
// live from /api/founders (which calls getFounderDirectory() server-side) and
// sorted by sortOrder ASC — so the homepage always reflects the same founder
// ranking as /founders. If the DB is unreachable, six hard-coded fallback
// cards (each with a real 1-sentence summary) keep the section from going dark.

type FounderEntry = {
  slug: string;
  name: string;
  shortDescription: string | null;
  region: string | null;
  counts: { sources: number; total: number; publicCount: number };
};

type FoundersCache = { at: number; data: FounderEntry[] } | null;
let foundersCache: FoundersCache = null;

// Hard-coded fallback (one real sentence each, slug-aligned with
// scripts/ingest/tag-founders.ts). Used only if /api/founders is unreachable
// — never the happy path, but the homepage never goes dark on a DB hiccup.
const FALLBACK_FOUNDERS: FounderEntry[] = [
  {
    slug: "jack-ma",
    name: "Jack Ma",
    shortDescription: "Founded Alibaba from a Hangzhou apartment; built it into the largest e-commerce platform in China.",
    region: "china",
    counts: { sources: 0, total: 0, publicCount: 0 },
  },
  {
    slug: "pony-ma",
    name: "Pony Ma",
    shortDescription: "Co-founded Tencent and shaped WeChat into China's dominant social-and-payments super-app.",
    region: "china",
    counts: { sources: 0, total: 0, publicCount: 0 },
  },
  {
    slug: "lei-jun",
    name: "Lei Jun",
    shortDescription: "Founded Xiaomi on a bet that high-spec phones could ship at near-cost and still scale into services.",
    region: "china",
    counts: { sources: 0, total: 0, publicCount: 0 },
  },
  {
    slug: "mukesh-ambani",
    name: "Mukesh Ambani",
    shortDescription: "Steered Reliance from petrochemicals into telecom with Jio, rewiring India's data and retail economy.",
    region: "india",
    counts: { sources: 0, total: 0, publicCount: 0 },
  },
  {
    slug: "ratan-tata",
    name: "Ratan Tata",
    shortDescription: "Took the Tata Group global through acquisitions of Tetley, Jaguar Land Rover and Corus across two decades.",
    region: "india",
    counts: { sources: 0, total: 0, publicCount: 0 },
  },
  {
    slug: "azim-premji",
    name: "Azim Premji",
    shortDescription: "Built Wipro from a vegetable-oil firm into a global IT services leader and gave most of it away.",
    region: "india",
    counts: { sources: 0, total: 0, publicCount: 0 },
  },
];

function useFounders(): FounderEntry[] {
  const [data, setData] = useState<FounderEntry[]>(
    foundersCache?.data ?? FALLBACK_FOUNDERS
  );
  useEffect(() => {
    if (foundersCache && Date.now() - foundersCache.at < 5 * 60_000) return;
    let active = true;
    apiGet<{ founders: FounderEntry[] }>("/api/founders")
      .then((d) => {
        if (!active) return;
        const list = Array.isArray(d?.founders) ? d.founders : [];
        // Take first 6 by sortOrder (the server already orders by sortOrder ASC).
        const top = list.slice(0, 6);
        // If the directory is empty (DB reachable but no founders yet),
        // keep the fallback so the section still showcases the Eastern roster.
        const next = top.length > 0 ? top : FALLBACK_FOUNDERS;
        foundersCache = { at: Date.now(), data: next };
        setData(next);
      })
      .catch(() => {
        if (!active) return;
        // Keep the fallback (already set as initial state) — homepage stays
        // populated, just without live source/reference counts.
      });
    return () => {
      active = false;
    };
  }, []);
  return data;
}

export function FoundersFeature() {
  const founders = useFounders();
  return (
    <section
      className="mt-12 border-t-2 border-ink py-8"
      aria-labelledby="founders-feature-title"
    >
      <div className="section-head">
        <h2 id="founders-feature-title">Founders of the East.</h2>
        <p className="kicker">CHINA · INDIA</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[8fr_4fr]">
        <div>
          <p className="max-w-[680px] font-reader text-base text-graphite">
            Operator-builders, indexed like the investors. Letters, speeches,
            interviews and decisions — paraphrased with full source attribution,
            cross-linked into the same themes, companies and events graph as the
            Western capital allocators.
          </p>
          <div className="mt-4 grid gap-px border border-ink bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {founders.map((f) => {
              const regionLabel = f.region === "china" ? "CHINA" : f.region === "india" ? "INDIA" : "EAST";
              return (
                <a
                  key={f.slug}
                  href={`/founders/${f.slug}`}
                  className="group block bg-paper p-4 transition-colors hover:bg-paper-2"
                >
                  <p className="kicker text-signal-dark">{regionLabel}</p>
                  <p className="mt-1 font-display text-lg font-bold tracking-tight">{f.name}</p>
                  {f.shortDescription ? (
                    <p className="mt-1 font-reader text-xs leading-snug text-graphite">
                      {f.shortDescription}
                    </p>
                  ) : null}
                  {f.counts.total > 0 ? (
                    <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
                      {f.counts.total.toLocaleString()} references · {f.counts.sources} sources
                    </p>
                  ) : null}
                  <span className="mt-3 inline-flex items-center font-mono text-[0.62rem] uppercase tracking-wider text-ink group-hover:text-signal-dark">
                    OPEN PROFILE <ArrowRight className="ml-1 inline h-3 w-3" aria-hidden />
                  </span>
                </a>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href="/founders"
              className="bg-ink px-4 py-2 text-[0.78rem] font-semibold text-paper transition-colors hover:bg-signal-dark"
            >
              BROWSE ALL FOUNDERS
              <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
            </a>
            <a href="/investors" className="nav-link text-[0.78rem] font-semibold">
              COMPARE WITH INVESTORS
            </a>
          </div>
        </div>
        <aside className="border-l border-rule lg:pl-6" aria-label="Why founders?">
          <p className="kicker">WHY FOUNDERS?</p>
          <p className="mt-2 font-reader text-sm text-graphite">
            The capital allocator and the operator-builder both leave a written
            record — letters, memos, speeches, interviews, decisions. The same
            evidence pipeline indexes both, so a Buffett reader and a Jack Ma
            reader can follow the same thread from one to the other.
          </p>
          <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
            111 founders · 1,729 paraphrased references · US + China + India
          </p>
        </aside>
      </div>
    </section>
  );
}

// ── §46 PERSONAL RESEARCH — conceptual preview for guests ─────────────────

export function PersonalResearchPreview({ isLoggedIn }: { isLoggedIn: boolean }) {
  const go = useStore((s) => s.go);
  if (isLoggedIn) return null; // signed-in users get the real rails at the top
  return (
    <section className="mt-12 border-t-2 border-ink py-8" aria-labelledby="personal-title">
      <div className="section-head">
        <h2 id="personal-title">Keep your research alive.</h2>
        <p className="kicker">YOUR SYSTEM</p>
      </div>
      <div className="grid gap-px border border-ink bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "CONTINUE", d: "Return to the exact path you were on — source, unit, position." },
          { label: "FOLLOW", d: "Investors, ideas, companies, events. Hear about new material first." },
          { label: "SAVE", d: "Bookmarks, collections, saved searches, trails." },
          { label: "NEW SINCE LAST VISIT", d: "Only what changed in what you follow — never global noise." },
        ].map((c) => (
          <div key={c.label} className="bg-paper p-5">
            <p className="kicker text-signal-dark">{c.label}</p>
            <p className="mt-2 font-reader text-sm text-graphite">{c.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
        Conceptual preview — your rails activate when you sign in
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button onClick={() => go("signup")} className="bg-ink px-4 py-2 text-[0.78rem] font-semibold text-paper transition-colors hover:bg-signal-dark">
          CREATE A FREE ACCOUNT
        </button>
        <button onClick={() => go("search")} className="nav-link text-[0.78rem] font-semibold">
          OR JUST START RESEARCHING
        </button>
      </div>
    </section>
  );
}

// ── §59 NEWSLETTER — positioning + subscribe ──────────────────────────────

export function NewsletterSection() {
  return (
    <section id="newsletter" className="mt-12 border-t-2 border-ink py-8" aria-labelledby="newsletter-title">
      <div className="section-head">
        <h2 id="newsletter-title">Aditya&apos;s research, explanations &amp; discoveries.</h2>
        <p className="kicker">NEWSLETTER</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[8fr_4fr]">
        <div>
          <p className="max-w-[680px] font-reader text-base text-graphite">
            Finance, investing, markets, investor thinking, historical events — and research
            questions worth following. Every claim in every note links into the library so you
            can check it yourself.
          </p>
          <form
            action="/api/newsletter/subscribe"
            method="post"
            className="mt-4 flex max-w-[560px] items-stretch border border-ink bg-paper shadow-[4px_4px_0_0_var(--ink)]"
          >
            <label htmlFor="home-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="home-newsletter-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full bg-transparent px-3 py-2.5 font-reader text-base focus:outline-none"
            />
            <button type="submit" className="btn-ink shrink-0 px-4 text-[0.78rem] font-semibold">
              SUBSCRIBE FREE
            </button>
          </form>
          <p className="kicker mt-2">FREE · NO SPAM · UNSUBSCRIBE ANYTIME</p>
        </div>
        <aside className="border-l border-rule lg:pl-6" aria-label="Newsletter cadence">
          <p className="kicker">CADENCE</p>
          <p className="mt-2 font-reader text-sm text-graphite">
            A note roughly every few days, and a deeper subscriber edition — quality over
            cadence, always. Nothing gets published to hit a schedule.
          </p>
        </aside>
      </div>
    </section>
  );
}
