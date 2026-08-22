"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { useInvestors } from "@/hooks/use-investors";
import { PersonalHomeRails } from "@/components/investor/personal-home";
import { FollowButton } from "@/components/investor/follow-button";
import { SearchBar } from "@/components/investor/search-bar";
import { EntityChips, PremiumGate } from "@/components/investor/entity-chips";
import { BookmarkButton } from "@/components/investor/bookmark-button";
import { SourceTypeBadge, ProBadge } from "@/components/investor/entity-chips";
import { PRICING, useCurrency } from "@/lib/pricing";
import { ArrowRight, Clock, Building2, Tag, FileText, ChevronRight } from "lucide-react";

type Investor = {
  slug: string;
  name: string;
  shortDescription: string | null;
  bio: string | null;
  status: string;
  birthYear: number | null;
  sourceCount: number;
  decisionCount: number;
  yearSpan: { from: number; to: number } | null;
};

type Stats = { passages: number; sources: number; investors: number; themes: number; concepts: number; companies: number };

// Module-level cache so home/footer share one request per session.
let statsCache: Stats | null = null;

export function useStats(): Stats | null {
  const [stats, setStats] = useState<Stats | null>(statsCache);
  useEffect(() => {
    if (statsCache) return;
    apiGet<Stats>("/api/stats")
      .then((s) => {
        statsCache = s;
        setStats(s);
      })
      .catch(() => setStats(null)); // hide numbers rather than show stale-wrong ones
  }, []);
  return stats;
}

export function HomeView() {
  const go = useStore((s) => s.go);
  const isPro = useStore((s) => s.user?.entitlement === "pro");
  const [currency] = useCurrency();
  const { data: investors = [] } = useInvestors();
  const stats = useStats();
  const buffett = investors.find((i) => i.slug === "buffett");
  const future = investors.filter((i) => i.status === "coming_later");
  const user = useStore((s) => s.user);

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      {user && <PersonalHomeRails />}
      {/* Hero */}
      <section className="relative overflow-hidden border-t-2 border-ink py-8">
        {/* Grid paper texture */}
        <div className="grid-paper pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative grid gap-6 lg:grid-cols-[8fr_4fr]">
          <div>
            <p className="kicker">INVESTOR / PASS — V1</p>
            <h1 className="mt-3 font-display text-[clamp(2.8rem,7vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.07em]">
              The public record,
              <br />
              <span className="text-signal-dark">properly indexed.</span>
            </h1>
            <p className="mt-4 max-w-[680px] font-reader text-lg leading-snug text-graphite">
              Public information that is technically available but practically difficult to navigate — shareholder letters, speeches, decisions, themes, companies — becomes searchable, structured, connected, and exceptionally easy to explore.
            </p>
            <div className="mt-6">
              <SearchBar />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={() => go("investors")} className="bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark transition-colors">
                EXPLORE INVESTORS
              </button>
              {!isPro && (
                <button onClick={() => go("upgrade")} className="nav-link text-sm font-semibold">
                  START PRO — {PRICING[currency].monthly}/MO <ArrowRight className="inline h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="border-l border-rule lg:pl-6">
            <p className="kicker text-signal-dark">LAUNCH COLLECTION</p>
            {buffett && (
              <button onClick={() => go("investor", { slug: "buffett" })} className="mt-2 block w-full text-left">
                <div className="border border-ink bg-paper p-4 transition-all hover:shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-0.5">
                  <p className="font-display text-2xl font-bold tracking-tight">{buffett.name}</p>
                  <p className="mt-1 font-reader text-sm text-graphite">{buffett.shortDescription}</p>
                  {buffett.yearSpan && (
                    <p className="mt-3 font-mono text-xs uppercase tracking-wider text-graphite">
                      {buffett.yearSpan.from}–{buffett.yearSpan.to} · {buffett.sourceCount} sources
                    </p>
                  )}
                </div>
              </button>
            )}
            {future.length > 0 && (
              <>
                <p className="kicker mt-5">MORE INVESTORS — COMING LATER</p>
                <div className="mt-2 space-y-1">
                  {future.map((inv) => (
                    <div key={inv.slug} className="flex items-center justify-between border-t border-rule py-2 text-graphite">
                      <span className="font-display text-sm font-medium">{inv.name}</span>
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider">SOON</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats band — live counts; hidden entirely on failure (never show stale numbers) */}
      {stats && (
        <section className="mt-12 border-t-2 border-ink py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { n: stats.sources.toLocaleString(), l: "Sources indexed" },
              { n: stats.passages.toLocaleString(), l: "Passages, paraphrased" },
              { n: stats.themes.toLocaleString(), l: "Themes tagged" },
              { n: stats.companies.toLocaleString(), l: "Companies mapped" },
            ].map((s) => (
              <div key={s.l} className="border-t border-ink pt-3">
                <p className="font-display text-4xl font-bold tracking-tight text-signal-dark">{s.n}</p>
                <p className="kicker mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewed />

      {/* What is it */}
      <section className="mt-12 border-t-2 border-ink py-8">
        <div className="section-head">
          <h2>What Investor/Pass is</h2>
          <p className="kicker">PRODUCT THESIS</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="prose-reader">
            <p>
              Investor/Pass is <strong>not</strong> a research newsletter, an investment-advice product, or simply an archive. It is a premium information-access product built around the public record of exceptional investors.
            </p>
            <p>
              The core promise: public information that is technically available but practically difficult to navigate becomes <em>searchable, structured, connected, and exceptionally easy to explore</em>.
            </p>
          </div>
          <div className="prose-reader">
            <p>
              Every record carries provenance — original publisher, publication date, source type, and a link to the original where one is legitimately available. Passages are paraphrased contextual summaries, never verbatim copyrighted quotes and never bulk reproduction.
            </p>
            <p>
              The first collection is <strong>Warren Buffett</strong>: 50+ years of letters, decisions, ideas, and companies, indexed and cross-linked.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mt-12 border-t-2 border-ink py-8">
        <div className="section-head">
          <h2>Two ways in</h2>
          <p className="kicker">FREE + PRO</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-ink p-6">
            <p className="kicker">FREE</p>
            <p className="mt-2 font-display text-3xl font-bold">$0</p>
            <ul className="mt-4 space-y-2 font-reader text-graphite">
              <li>· Public investor pages</li>
              <li>· Topic, company, year, source pages</li>
              <li>· Public preview passages</li>
              <li>· Timeline navigation</li>
            </ul>
          </div>
          <div className="border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--ink)]">
            <div className="flex items-center justify-between">
              <p className="kicker text-signal-dark">PRO</p>
              <ProBadge />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{PRICING[currency].monthly}<span className="text-base font-normal text-graphite">/month</span></p>
            <p className="mt-1 font-mono text-xs text-graphite">or {PRICING[currency].annual}/year — ≈ 8 months{currency === "INR" ? " · ₹7,999 ≈ 8 × ₹999" : " · $149 < 8 × $19"}</p>
            <ul className="mt-4 space-y-2 font-reader text-graphite">
              <li>· Full search across every passage</li>
              <li>· All premium passages unlocked</li>
              <li>· Bookmarks, saved searches, collections</li>
              <li>· Every connection, fully navigable</li>
            </ul>
            {isPro ? (
              <div className="mt-5 w-full border border-ink bg-paper-2 py-2.5 text-center text-sm font-semibold text-signal-dark">
                ✓ YOU'RE ON PRO — EVERYTHING UNLOCKED
              </div>
            ) : (
              <button onClick={() => go("upgrade")} className="mt-5 w-full bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark transition-colors">
                START PRO
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function InvestorsView() {
  const go = useStore((s) => s.go);
  const { data: investors = [] } = useInvestors();
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ INVESTORS</p>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.07em]">The collection</h1>
        <p className="mt-3 max-w-[680px] font-reader text-lg text-graphite">
          Exceptional investors, each with their own indexed public record. Buffett is the launch wedge, not the limit.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {investors.map((inv) => (
          <div
            key={inv.slug}
            className={
              inv.status === "active"
                ? "border border-ink bg-paper p-5 transition-shadow hover:shadow-[3px_3px_0_0_var(--ink)] cursor-pointer"
                : "border border-rule bg-paper-2 p-5 opacity-70"
            }
            onClick={() => inv.status === "active" && go("investor", { slug: inv.slug })}
          >
            <div className="flex items-start justify-between">
              <p className="font-display text-2xl font-bold tracking-tight">{inv.name}</p>
              {inv.status === "coming_later" && <span className="chip">SOON</span>}
              {inv.status === "active" && <span className="chip chip-signal">ACTIVE</span>}
            </div>
            <p className="mt-2 font-reader text-sm text-graphite">{inv.shortDescription}</p>
            {inv.status === "active" && inv.yearSpan && (
              <div className="mt-4 border-t border-rule pt-3">
                <p className="font-mono text-xs uppercase tracking-wider text-graphite">
                  {inv.yearSpan.from}–{inv.yearSpan.to}
                </p>
                <p className="mt-1 font-mono text-xs text-graphite">{inv.sourceCount} sources · {inv.decisionCount} decisions</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type InvestorDetail = {
  investor: {
    slug: string;
    name: string;
    shortDescription: string | null;
    bio: string | null;
    status: string;
    birthYear: number | null;
    stats: { sources: number; passages: number; publicPassages: number; decisions: number; themes: number; companies: number };
  };
  sources: any[];
  themes: any[];
  companies: any[];
  decisions: any[];
};

export function InvestorView({ slug }: { slug: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<InvestorDetail | null>(null);
  const [years, setYears] = useState<{ year: number; sources: number; passages: number }[]>([]);
  useEffect(() => {
    apiGet<InvestorDetail>(`/api/investors/${slug}`).then(setData);
    apiGet<{ years: { year: number; sources: number; passages: number }[] }>(`/api/investors/${slug}/years`).then((d) => setYears(d.years));
  }, [slug]);
  if (!data) return <Loading />;
  const { investor } = data;
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-t-2 border-ink pt-4">
        <button onClick={() => go("investors")} className="kicker hover:text-ink">← INVESTORS</button>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.88] tracking-[-0.075em]">{investor.name}</h1>
          {investor.status === "active" && <div className="pb-3"><FollowButton entityType="person" entityId={slug} /></div>}
        </div>
        <p className="mt-3 max-w-[760px] font-reader text-xl text-graphite">{investor.shortDescription}</p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-ink pt-4 md:grid-cols-6">
        {[
          { n: investor.stats.sources, l: "Sources" },
          { n: investor.stats.passages, l: "Passages" },
          { n: investor.stats.decisions, l: "Decisions" },
          { n: investor.stats.themes, l: "Themes" },
          { n: investor.stats.companies, l: "Companies" },
          { n: investor.birthYear, l: "Born" },
        ].map((s) => (
          <div key={s.l}>
            <p className="font-display text-2xl font-bold tracking-tight">{s.n ?? "—"}</p>
            <p className="kicker">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Bio */}
      <section className="mt-10 border-t border-rule pt-6">
        <p className="kicker">/ ABOUT</p>
        <div className="prose-reader mt-2 max-w-[720px]">
          <p>{investor.bio}</p>
        </div>
      </section>

      {/* Browse by Year — visual grid */}
      {years.length > 0 && (
        <section className="mt-10 border-t-2 border-ink pt-4">
          <div className="section-head">
            <h2>Browse by year</h2>
            <p className="kicker">{years.length} YEARS INDEXED</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {years.map((y) => {
              const intensity = Math.min(1, y.passages / 6);
              return (
                <button
                  key={y.year}
                  onClick={() => go("year", { year: String(y.year), investor: slug })}
                  className="group relative border border-rule p-3 text-center transition-all hover:border-ink hover:-translate-y-0.5"
                  style={{ background: intensity > 0 ? `rgba(47, 91, 255, ${0.04 + intensity * 0.16})` : undefined }}
                >
                  <p className="font-display text-lg font-bold tracking-tight">{y.year}</p>
                  <p className="font-mono text-[0.55rem] uppercase tracking-wider text-graphite">{y.passages}p · {y.sources}s</p>
                  {intensity > 0.5 && <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-signal" />}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Themes */}
      <section className="mt-10 border-t-2 border-ink pt-4">
        <div className="section-head">
          <h2>Themes</h2>
          <p className="kicker">{investor.stats.themes} INDEXED</p>
        </div>
        {/* Top themes bar chart — visual heatmap */}
        <TopThemesBarChart themes={data.themes} onSelect={(s) => go("topic", { slug: s, investor: slug })} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.themes.slice(0, 12).map((t) => (
            <button key={t.slug} onClick={() => go("topic", { slug: t.slug, investor: slug })} className="border border-rule p-3 text-left hover:border-ink hover:bg-paper-2 transition-colors">
              <p className="font-display font-semibold tracking-tight">{t.name}</p>
              <p className="mt-1 font-reader text-xs text-graphite line-clamp-2">{t.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section className="mt-10 border-t-2 border-ink pt-4">
        <div className="section-head">
          <h2>Companies</h2>
          <p className="kicker">{investor.stats.companies} INDEXED</p>
        </div>
        {/* Companies heatmap — sized by passage count */}
        <div className="mb-6 flex flex-wrap gap-2">
          {data.companies.filter((c: any) => c.passageCount > 0).slice(0, 14).map((c: any) => {
            const size = Math.max(0.75, Math.min(1.6, 0.75 + c.passageCount * 0.15));
            return (
              <button
                key={c.slug}
                onClick={() => go("company", { slug: c.slug, investor: slug })}
                className="group border border-rule bg-paper px-3 py-1.5 hover:border-ink hover:bg-paper-2 transition-all"
                style={{ fontSize: `${size}rem` }}
                title={`${c.name} — ${c.passageCount} passages${c.industry ? ` · ${c.industry}` : ""}`}
              >
                <span className="font-display font-semibold tracking-tight">{c.name}</span>
                <span className="ml-1.5 font-mono text-[0.6rem] text-graphite">{c.passageCount}</span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.companies.slice(0, 12).map((c: any) => (
            <button key={c.slug} onClick={() => go("company", { slug: c.slug, investor: slug })} className="border border-rule p-3 text-left hover:border-ink hover:bg-paper-2 transition-colors">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold tracking-tight">{c.name}</p>
                {c.ticker && <span className="font-mono text-[0.6rem] text-graphite">{c.ticker}</span>}
              </div>
              <p className="mt-1 font-reader text-xs text-graphite line-clamp-2">{c.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Timeline link */}
      <section className="mt-10 border-t-2 border-ink pt-4">
        <button onClick={() => go("timeline", { slug })} className="flex w-full items-center justify-between border border-ink p-4 text-left hover:bg-paper-2 transition-colors group">
          <div>
            <p className="kicker text-signal-dark">/ TIMELINE</p>
            <p className="mt-1 font-display text-xl font-bold">Browse by year and source</p>
            <p className="mt-1 font-reader text-sm text-graphite">A chronological view of sources, decisions, themes, and companies across the full record.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* Decisions */}
      {data.decisions.length > 0 && (
        <section className="mt-10 border-t-2 border-ink pt-4">
          <div className="section-head">
            <h2>Decisions</h2>
            <p className="kicker">{investor.stats.decisions} INDEXED</p>
          </div>
          <div className="space-y-3">
            {data.decisions.map((d, i) => (
              <div key={i} className="border-t border-rule py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display font-semibold tracking-tight">{d.title}</p>
                  {d.date && <span className="font-mono text-xs text-graphite">{d.date}</span>}
                </div>
                <p className="mt-1 font-reader text-sm text-graphite">{d.description}</p>
                {d.source && (
                  <button onClick={() => go("source", { slug: d.source.slug })} className="mt-1 chip">
                    <FileText className="h-2.5 w-2.5" /> {d.source.title}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function Loading() {
  return (
    <div className="mx-auto flex max-w-[1320px] items-center justify-center px-4 py-24">
      <div className="font-mono text-sm text-graphite">Loading…</div>
    </div>
  );
}

// ── Continue exploring (home page) ─────────────────────────────────────────
// Logged-in: server-backed next-unread feed (never repeats read passages).
// Guests: localStorage recents, unchanged.
function RecentlyViewed() {
  const go = useStore((s) => s.go);
  const user = useStore((s) => s.user);
  const [items, setItems] = useState<{ view: string; slug: string; label?: string; excerpt?: string; meta?: string; ts?: number }[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("ip_recently_viewed") : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [serverItems, setServerItems] = useState<typeof items | null>(null);

  useEffect(() => {
    if (!user || serverItems) return;
    let active = true;
    apiGet<{ items: typeof items }>(`/api/continue?person=buffett`)
      .then((d) => { if (active) setServerItems(d.items); })
      .catch(() => { if (active) setServerItems([]); });
    return () => { active = false; };
  }, [user, serverItems]);

  if (!user && items.length === 0) return null;

  const viewLabels: Record<string, string> = {
    investor: "Investor", topic: "Topic", company: "Company", year: "Year",
    source: "Source", passage: "Passage", concept: "Concept", event: "Event",
  };

  // Server-backed mode
  if (user) {
    const serverLoading = serverItems === null;
    return (
      <section className="mt-8 border-t-2 border-ink py-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-signal-dark" />
          <p className="kicker text-signal-dark">CONTINUE READING</p>
        </div>
        {serverLoading && <div className="mt-4 h-[72px] border border-rule bg-paper-2 animate-pulse" />}
        {!serverLoading && serverItems && serverItems.length === 0 && (
          <p className="mt-3 font-reader text-sm text-graphite">
            Nothing queued yet — open any passage and this becomes your resume point.
          </p>
        )}
        {!serverLoading && serverItems && serverItems.length > 0 && (
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {serverItems.map((item) => (
              <button
                key={item.slug}
                onClick={() => go(item.view as any, item.view === "year" ? { year: item.slug, investor: "buffett" } : { slug: item.slug, investor: "buffett" })}
                className="group border border-rule bg-paper-2 p-3 text-left transition-colors hover:border-ink"
              >
                <p className="font-mono text-[0.62rem] uppercase tracking-wider text-graphite">{item.meta}</p>
                <p className="mt-1 font-display text-sm font-semibold leading-tight">{item.label}</p>
                <p className="mt-1 line-clamp-2 font-reader text-xs text-graphite">{item.excerpt}…</p>
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mt-8 border-t-2 border-ink py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-signal-dark" />
          <p className="kicker text-signal-dark">CONTINUE EXPLORING</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem("ip_recently_viewed"); setItems([]); }}
          className="chip hover:chip-signal"
        >
          CLEAR
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => go(item.view as any, item.view === "year" ? { year: item.slug, investor: "buffett" } : { slug: item.slug, investor: "buffett" })}
            className="group flex items-center gap-2 border border-rule bg-paper-2 px-3 py-2 hover:border-ink transition-colors"
          >
            <span className="chip chip-ink">{viewLabels[item.view] || item.view}</span>
            <span className="font-display text-sm font-medium capitalize">{item.slug.replace(/-/g, " ")}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Top themes bar chart (investor profile) ────────────────────────────────
function TopThemesBarChart({ themes, onSelect }: { themes: { slug: string; name: string; passageCount: number }[]; onSelect: (slug: string) => void }) {
  const top = themes.filter((t) => t.passageCount > 0).slice(0, 10);
  if (top.length === 0) return null;
  const max = Math.max(...top.map((t) => t.passageCount));

  return (
    <div className="mt-4 space-y-1.5">
      <p className="kicker mb-2">TOP THEMES BY REFERENCE COUNT</p>
      {top.map((t) => {
        const pct = (t.passageCount / max) * 100;
        return (
          <button
            key={t.slug}
            onClick={() => onSelect(t.slug)}
            className="group flex w-full items-center gap-3 py-1 hover:bg-paper-2 -mx-2 px-2 transition-colors"
          >
            <span className="w-32 truncate text-right font-display text-sm font-medium">{t.name}</span>
            <div className="relative h-5 flex-1 border-l border-rule">
              <div
                className="absolute left-0 top-0 h-full bg-signal/20 group-hover:bg-signal/30 transition-colors"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute left-0 top-0 h-full border-r-2 border-signal"
                style={{ width: `${pct}%` }}
              />
              <span className="absolute left-2 top-0 flex h-full items-center font-mono text-xs text-ink">{t.passageCount}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
