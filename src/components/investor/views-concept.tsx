"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { EntityChips, PremiumGate, ProBadge } from "@/components/investor/entity-chips";
import { BookmarkButton } from "@/components/investor/bookmark-button";
import { Loading } from "./views-core";
import { ArrowLeft, Link2 } from "lucide-react";

type ConceptData = {
  concept: { slug: string; name: string; description: string | null };
  stats: { passageCount: number; hiddenPassages: number };
  years: number[];
  themes: { slug: string; name: string }[];
  companies: { slug: string; name: string }[];
  sources: { slug: string; title: string; year: number | null }[];
  relatedConcepts: { slug: string; name: string; count: number }[];
  passages: {
    id: string;
    text: string;
    context: string | null;
    section: string | null;
    visibility: string;
    source: { slug: string; title: string; year: number | null; sourceType: string };
    themes: { slug: string; name: string }[];
    companies: { slug: string; name: string }[];
  }[];
};

export function ConceptView({ slug, investor }: { slug: string; investor?: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<ConceptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inv = investor || "buffett";

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on slug change so the prior record does not briefly flash while the new fetch resolves
    setData(null);
    setError(null);
    apiGet<ConceptData>(`/api/concepts/${slug}?investor=${inv}`)
      .then((d) => { if (active) setData(d); })
      .catch(() => { if (active) setError("This record could not be loaded. It may not exist in the index, or the connection was lost."); });
    return () => { active = false; };
  }, [slug, inv]);

  if (error) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
        <p className="kicker text-signal-dark">/ NOT AVAILABLE</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Unable to load this view</h2>
        <p className="mt-3 font-reader text-base text-graphite">{error}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => go("home")} className="chip chip-signal">RETURN HOME →</button>
          <button onClick={() => go("search")} className="chip">SEARCH THE RECORD →</button>
        </div>
      </div>
    );
  }
  if (!data) return <Loading />;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("investor", { slug: inv })} className="kicker hover:text-ink">
        <ArrowLeft className="mr-1 inline h-3 w-3" /> {inv.toUpperCase()}
      </button>
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ CONCEPT</p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.07em]">{data.concept.name}</h1>
          <BookmarkButton kind="theme" entityId={slug} label={data.concept.name} />
        </div>
        {data.concept.description && <p className="mt-3 max-w-[720px] font-reader text-lg text-graphite">{data.concept.description}</p>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink pt-4 md:grid-cols-4">
        <Stat n={data.stats.passageCount + data.stats.hiddenPassages} l="References" />
        <Stat n={data.years.length} l="Years" />
        <Stat n={data.themes.length} l="Themes" />
        <Stat n={data.companies.length} l="Companies" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="kicker mb-3">REFERENCES</p>
          {data.passages.length === 0 && data.stats.hiddenPassages > 0 ? (
            <PremiumGate hiddenCount={data.stats.hiddenPassages} onUpgrade={() => go("upgrade")} />
          ) : (
            <>
              <div className="space-y-4">
                {data.passages.map((p) => (
                  <div key={p.id} className="group border-t border-rule pt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => go("source", { slug: p.source.slug })} className="font-mono text-xs uppercase tracking-wider text-signal-dark hover:underline">
                        {p.source.title}
                      </button>
                      {p.source.year && <span className="font-mono text-xs text-graphite">· {p.source.year}</span>}
                      {p.visibility === "pro" && <ProBadge />}
                      <button onClick={() => go("passage", { id: p.id, investor: inv })} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity chip">CONTEXT →</button>
                    </div>
                    <button onClick={() => go("passage", { id: p.id, investor: inv })} className="block w-full text-left">
                      <p className="mt-2 font-reader text-base leading-relaxed">{p.text}</p>
                    </button>
                    <div className="mt-2"><EntityChips items={p.themes} kind="theme" investorSlug={inv} /></div>
                  </div>
                ))}
              </div>
              {data.stats.hiddenPassages > 0 && <PremiumGate hiddenCount={data.stats.hiddenPassages} onUpgrade={() => go("upgrade")} />}
            </>
          )}
        </div>
        <aside className="space-y-6">
          {data.relatedConcepts.length > 0 && (
            <div>
              <p className="kicker mb-2 flex items-center gap-1.5"><Link2 className="h-3 w-3" /> RELATED CONCEPTS</p>
              <div className="flex flex-wrap gap-1.5">
                {data.relatedConcepts.map((rc) => (
                  <button key={rc.slug} onClick={() => go("concept", { slug: rc.slug, investor: inv })} className="chip chip-signal group" title={`${rc.count} co-occurrences`}>
                    {rc.name} <span className="ml-1 opacity-60">{rc.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="kicker mb-2">THEMES</p>
            <EntityChips items={data.themes} kind="theme" investorSlug={inv} />
          </div>
          <div>
            <p className="kicker mb-2">COMPANIES</p>
            <EntityChips items={data.companies} kind="company" investorSlug={inv} />
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

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold tracking-tight text-signal-dark">{n}</p>
      <p className="kicker">{l}</p>
    </div>
  );
}
