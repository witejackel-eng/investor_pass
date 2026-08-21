"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { EntityChips, PremiumGate, SourceTypeBadge, ProBadge } from "@/components/investor/entity-chips";
import { BookmarkButton } from "@/components/investor/bookmark-button";
import { Loading } from "./views-core";
import { ArrowLeft, ExternalLink, Lock, ChevronRight, Link2 } from "lucide-react";

// ── Topic (theme) view ─────────────────────────────────────────────────────
type TopicData = {
  theme: { slug: string; name: string; description: string | null };
  stats: { passageCount: number; hiddenPassages: number };
  years: number[];
  companies: { slug: string; name: string }[];
  concepts: { slug: string; name: string }[];
  sources: { slug: string; title: string; year: number | null }[];
  relatedThemes: { slug: string; name: string; count: number }[];
  passages: any[];
};

export function TopicView({ slug, investor }: { slug: string; investor?: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<TopicData | null>(null);
  const inv = investor || "buffett";
  useEffect(() => {
    apiGet<TopicData>(`/api/themes/${slug}?investor=${inv}`).then(setData);
  }, [slug, inv]);
  if (!data) return <Loading />;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("investor", { slug: inv })} className="kicker hover:text-ink">
        <ArrowLeft className="mr-1 inline h-3 w-3" /> {inv.toUpperCase()}
      </button>
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ TOPIC</p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.07em]">{data.theme.name}</h1>
          <BookmarkButton kind="theme" entityId={slug} label={data.theme.name} />
        </div>
        {data.theme.description && <p className="mt-3 max-w-[720px] font-reader text-lg text-graphite">{data.theme.description}</p>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink pt-4 md:grid-cols-3">
        <Stat n={data.stats.passageCount + data.stats.hiddenPassages} l="Indexed references" />
        <Stat n={data.years.length} l="Years covered" />
        <Stat n={data.companies.length} l="Companies linked" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="kicker mb-3">SELECTED REFERENCES</p>
          {data.passages.length === 0 && data.stats.hiddenPassages > 0 ? (
            <PremiumGate hiddenCount={data.stats.hiddenPassages} onUpgrade={() => go("upgrade")} />
          ) : (
            <>
              <div className="space-y-4">
                {data.passages.slice(0, 5).map((p) => (
                  <div key={p.id} className="border-t border-rule pt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => go("source", { slug: p.source.slug })} className="font-mono text-xs uppercase tracking-wider text-signal-dark hover:underline">
                        {p.source.title}
                      </button>
                      {p.source.year && <span className="font-mono text-xs text-graphite">· {p.source.year}</span>}
                      {p.visibility === "pro" && <ProBadge />}
                    </div>
                    <p className="mt-2 font-reader text-base leading-relaxed">{p.text}</p>
                    {p.context && <p className="mt-1 font-reader text-sm italic text-graphite">{p.context}</p>}
                    <div className="mt-2">
                      <EntityChips items={p.companies} kind="company" investorSlug={inv} />
                    </div>
                  </div>
                ))}
              </div>
              {data.stats.hiddenPassages > 0 && (
                <PremiumGate hiddenCount={data.stats.hiddenPassages} onUpgrade={() => go("upgrade")} />
              )}
            </>
          )}
        </div>
        <aside className="space-y-6">
          {data.relatedThemes.length > 0 && (
            <div>
              <p className="kicker mb-2 flex items-center gap-1.5"><Link2 className="h-3 w-3" /> RELATED THEMES</p>
              <p className="font-reader text-xs text-graphite mb-2">Themes that co-occur with this one:</p>
              <div className="flex flex-wrap gap-1.5">
                {data.relatedThemes.map((rt) => (
                  <button key={rt.slug} onClick={() => go("topic", { slug: rt.slug, investor: inv })} className="chip chip-signal group" title={`${rt.count} co-occurrences`}>
                    {rt.name} <span className="ml-1 opacity-60">{rt.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="kicker mb-2">YEARS</p>
            <div className="flex flex-wrap gap-1.5">
              {data.years.map((y) => (
                <button key={y} onClick={() => go("year", { year: String(y), investor: inv })} className="chip">
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="kicker mb-2">COMPANIES</p>
            <EntityChips items={data.companies} kind="company" investorSlug={inv} />
          </div>
          <div>
            <p className="kicker mb-2">CONCEPTS</p>
            <EntityChips items={data.concepts} kind="concept" investorSlug={inv} />
          </div>
          <div>
            <p className="kicker mb-2">SOURCES</p>
            <div className="space-y-1">
              {data.sources.map((s) => (
                <button key={s.slug} onClick={() => go("source", { slug: s.slug })} className="block w-full border-t border-rule py-1.5 text-left font-reader text-sm hover:text-signal-dark">
                  {s.title} {s.year && <span className="font-mono text-xs text-graphite">· {s.year}</span>}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Company view ───────────────────────────────────────────────────────────
type CompanyData = {
  company: { slug: string; name: string; canonicalName: string | null; ticker: string | null; description: string | null; industry: { slug: string; name: string } | null };
  stats: { passageCount: number; hiddenPassages: number };
  years: number[];
  themes: { slug: string; name: string }[];
  concepts: { slug: string; name: string }[];
  sources: { slug: string; title: string; year: number | null }[];
  passages: any[];
  decisions: any[];
};

export function CompanyView({ slug, investor }: { slug: string; investor?: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<CompanyData | null>(null);
  const inv = investor || "buffett";
  useEffect(() => {
    apiGet<CompanyData>(`/api/companies/${slug}?investor=${inv}`).then(setData);
  }, [slug, inv]);
  if (!data) return <Loading />;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("investor", { slug: inv })} className="kicker hover:text-ink">
        <ArrowLeft className="mr-1 inline h-3 w-3" /> {inv.toUpperCase()}
      </button>
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ COMPANY</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.07em]">{data.company.name}</h1>
            {data.company.canonicalName && data.company.canonicalName !== data.company.name && (
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-graphite">{data.company.canonicalName}{data.company.ticker && ` · ${data.company.ticker}`}</p>
            )}
          </div>
          <BookmarkButton kind="company" entityId={slug} label={data.company.name} />
        </div>
        {data.company.description && <p className="mt-3 max-w-[720px] font-reader text-lg text-graphite">{data.company.description}</p>}
        {data.company.industry && <p className="mt-2 chip">{data.company.industry.name}</p>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink pt-4 md:grid-cols-4">
        <Stat n={data.stats.passageCount + data.stats.hiddenPassages} l="References" />
        <Stat n={data.years.length} l="Years" />
        <Stat n={data.themes.length} l="Themes" />
        <Stat n={data.decisions.length} l="Decisions" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="kicker mb-3">REFERENCES</p>
          {data.passages.length === 0 && data.stats.hiddenPassages > 0 ? (
            <PremiumGate hiddenCount={data.stats.hiddenPassages} onUpgrade={() => go("upgrade")} />
          ) : (
            <>
              <div className="space-y-4">
                {data.passages.slice(0, 6).map((p) => (
                  <div key={p.id} className="border-t border-rule pt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => go("source", { slug: p.source.slug })} className="font-mono text-xs uppercase tracking-wider text-signal-dark hover:underline">
                        {p.source.title}
                      </button>
                      {p.source.year && <span className="font-mono text-xs text-graphite">· {p.source.year}</span>}
                      {p.visibility === "pro" && <ProBadge />}
                    </div>
                    <p className="mt-2 font-reader text-base leading-relaxed">{p.text}</p>
                    <div className="mt-2"><EntityChips items={p.themes} kind="theme" investorSlug={inv} /></div>
                  </div>
                ))}
              </div>
              {data.stats.hiddenPassages > 0 && <PremiumGate hiddenCount={data.stats.hiddenPassages} onUpgrade={() => go("upgrade")} />}
            </>
          )}
        </div>
        <aside className="space-y-6">
          {data.decisions.length > 0 && (
            <div>
              <p className="kicker mb-2">DECISIONS</p>
              <div className="space-y-2">
                {data.decisions.map((d, i) => (
                  <div key={i} className="border-t border-rule py-2">
                    <p className="font-display text-sm font-semibold">{d.title}</p>
                    {d.date && <p className="font-mono text-xs text-graphite">{d.date}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="kicker mb-2">THEMES</p>
            <EntityChips items={data.themes} kind="theme" investorSlug={inv} />
          </div>
          <div>
            <p className="kicker mb-2">YEARS</p>
            <div className="flex flex-wrap gap-1.5">
              {data.years.map((y) => <button key={y} onClick={() => go("year", { year: String(y), investor: inv })} className="chip">{y}</button>)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Year view ──────────────────────────────────────────────────────────────
type YearData = {
  year: number;
  investor: { slug: string; name: string };
  sourceCount: number;
  passageCount: number;
  themes: { slug: string; name: string }[];
  companies: { slug: string; name: string }[];
  decisions: any[];
  sources: any[];
};

export function YearView({ year, investor }: { year: string; investor?: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<YearData | null>(null);
  const inv = investor || "buffett";
  useEffect(() => {
    apiGet<YearData>(`/api/years/${year}?investor=${inv}`).then(setData);
  }, [year, inv]);
  if (!data) return <Loading />;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("investor", { slug: inv })} className="kicker hover:text-ink">
        <ArrowLeft className="mr-1 inline h-3 w-3" /> {inv.toUpperCase()}
      </button>
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ YEAR</p>
        <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.88] tracking-[-0.075em]">{data.year}</h1>
        <p className="mt-2 font-reader text-lg text-graphite">{data.investor.name} · {data.sourceCount} sources · {data.passageCount} passages</p>
      </div>

      {data.decisions.length > 0 && (
        <section className="mt-8 border-t-2 border-ink pt-4">
          <p className="kicker mb-3">DECISIONS THIS YEAR</p>
          <div className="space-y-3">
            {data.decisions.map((d, i) => (
              <div key={i} className="border-t border-rule py-3">
                <p className="font-display font-semibold tracking-tight">{d.title}</p>
                <p className="mt-1 font-reader text-sm text-graphite">{d.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 border-t-2 border-ink pt-4">
        <p className="kicker mb-3">SOURCES</p>
        <div className="space-y-4">
          {data.sources.map((s) => (
            <div key={s.slug} className="border-t border-rule pt-3">
              <button onClick={() => go("source", { slug: s.slug })} className="flex items-center justify-between gap-4 text-left hover:text-signal-dark">
                <span className="font-display text-xl font-bold tracking-tight">{s.title}</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
              <div className="mt-1 flex items-center gap-2">
                <SourceTypeBadge type={s.sourceType} />
                {s.publisher && <span className="font-mono text-xs text-graphite">{s.publisher}</span>}
              </div>
              {s.description && <p className="mt-2 font-reader text-sm text-graphite">{s.description}</p>}
              <p className="mt-1 font-mono text-xs text-graphite">{s.passageCount} passages{s.hiddenPassages > 0 && ` · ${s.hiddenPassages} pro-only`}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="kicker mb-2">THEMES</p>
          <EntityChips items={data.themes} kind="theme" investorSlug={inv} />
        </div>
        <div>
          <p className="kicker mb-2">COMPANIES</p>
          <EntityChips items={data.companies} kind="company" investorSlug={inv} />
        </div>
      </div>
    </div>
  );
}

// ── Source view ────────────────────────────────────────────────────────────
type SourceData = {
  source: {
    id: string; slug: string; title: string; sourceType: string; year: number | null;
    publicationDate: string | null; publisher: string | null; url: string | null;
    description: string | null; provenanceStatus: string; retrievalAt: string;
    person: { slug: string; name: string };
  };
  passages: any[];
  hiddenPassageCount: number;
  decisions: any[];
  relatedSources: any[];
};

export function SourceView({ slug }: { slug: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<SourceData | null>(null);
  useEffect(() => {
    apiGet<SourceData>(`/api/sources/${slug}`).then(setData);
  }, [slug]);
  if (!data) return <Loading />;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("investor", { slug: data.source.person.slug })} className="kicker hover:text-ink">
        <ArrowLeft className="mr-1 inline h-3 w-3" /> {data.source.person.name.toUpperCase()}
      </button>
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ SOURCE</p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[0.95] tracking-[-0.06em]">{data.source.title}</h1>
          <BookmarkButton kind="source" entityId={data.source.id} label={data.source.title} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SourceTypeBadge type={data.source.sourceType} />
          {data.source.year && <span className="font-mono text-xs text-graphite">{data.source.year}</span>}
          {data.source.publisher && <span className="font-mono text-xs text-graphite">· {data.source.publisher}</span>}
          {data.source.publicationDate && <span className="font-mono text-xs text-graphite">· {data.source.publicationDate}</span>}
        </div>
        {data.source.description && <p className="mt-4 max-w-[760px] font-reader text-lg text-graphite">{data.source.description}</p>}
      </div>

      {/* Provenance */}
      <section className="mt-6 border border-rule bg-paper-2 p-4">
        <p className="kicker">PROVENANCE</p>
        <div className="mt-2 grid gap-2 font-mono text-xs text-graphite sm:grid-cols-2">
          <div>Publisher: <span className="text-ink">{data.source.publisher || "—"}</span></div>
          <div>Published: <span className="text-ink">{data.source.publicationDate || data.source.year || "—"}</span></div>
          <div>Type: <span className="text-ink">{data.source.sourceType}</span></div>
          <div>Status: <span className="text-ink">{data.source.provenanceStatus}</span></div>
          <div>Retrieved: <span className="text-ink">{new Date(data.source.retrievalAt).toISOString().slice(0, 10)}</span></div>
        </div>
        {data.source.url && (
          <a href={data.source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-signal-dark hover:underline">
            View original source <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </section>

      {/* Passages */}
      <section className="mt-8 border-t-2 border-ink pt-4">
        <p className="kicker mb-3">INDEXED PASSAGES · {data.passages.length}</p>
        <div className="space-y-6">
          {data.passages.map((p) => (
            <article key={p.id} className="group border-t border-rule pt-4">
              <div className="flex items-center gap-2">
                {p.section && <span className="chip chip-ink">{p.section}</span>}
                {p.visibility === "pro" && <ProBadge />}
                <button
                  onClick={() => go("passage", { id: p.id, investor: data.source.person.slug })}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity chip"
                >
                  CONTEXT →
                </button>
              </div>
              <p className="mt-3 max-w-[760px] font-reader text-lg leading-relaxed">{p.text}</p>
              {p.context && <p className="mt-2 max-w-[760px] font-reader text-sm italic text-graphite">{p.context}</p>}
              <div className="mt-3 space-y-2">
                {p.themes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="kicker w-16">Themes</span>
                    <EntityChips items={p.themes} kind="theme" investorSlug={data.source.person.slug} />
                  </div>
                )}
                {p.companies.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="kicker w-16">Companies</span>
                    <EntityChips items={p.companies} kind="company" investorSlug={data.source.person.slug} />
                  </div>
                )}
                {p.concepts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="kicker w-16">Concepts</span>
                    <EntityChips items={p.concepts} kind="concept" investorSlug={data.source.person.slug} />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        {data.hiddenPassageCount > 0 && <PremiumGate hiddenCount={data.hiddenPassageCount} onUpgrade={() => go("upgrade")} />}
      </section>

      {/* Related sources — master prompt §14 */}
      {data.relatedSources.length > 0 && (
        <section className="mt-8 border-t-2 border-ink pt-4">
          <p className="kicker mb-3">RELATED SOURCES</p>
          <div className="space-y-2">
            {data.relatedSources.map((rs: any, i: number) => (
              <button key={i} onClick={() => go("source", { slug: rs.slug })} className="flex w-full items-center justify-between gap-4 border-t border-rule py-2 text-left hover:bg-paper-2 -mx-2 px-2 transition-colors">
                <div>
                  <p className="font-display text-sm font-semibold tracking-tight">{rs.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <SourceTypeBadge type={rs.sourceType} />
                    {rs.year && <span className="font-mono text-xs text-graphite">{rs.year}</span>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-graphite" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <p className="mt-8 border-t border-rule pt-4 font-reader text-sm italic text-graphite">
        Passages are paraphrased contextual summaries with source attribution, not verbatim reproductions. No claim of fair use by word count is made. Follow the link above to read the original source in full.
      </p>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold tracking-tight text-signal-dark">{n}</p>
      <p className="kicker">{l}</p>
    </div>
  );
}
