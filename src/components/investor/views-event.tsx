"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { EntityChips, PremiumGate, ProBadge, SourceTypeBadge } from "@/components/investor/entity-chips";
import { BookmarkButton } from "@/components/investor/bookmark-button";
import { Loading } from "./views-core";
import { ArrowLeft, Calendar, ChevronRight } from "lucide-react";

type EventData = {
  event: { slug: string; name: string; date: string | null; description: string | null };
  stats: { passageCount: number; hiddenPassages: number };
  years: number[];
  themes: { slug: string; name: string }[];
  companies: { slug: string; name: string }[];
  sources: { slug: string; title: string; year: number | null }[];
  decisions: {
    title: string;
    date: string;
    description: string;
    person: { slug: string; name: string } | null;
    company: { slug: string; name: string } | null;
    source: { slug: string; title: string } | null;
  }[];
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

export function EventView({ slug, investor }: { slug: string; investor?: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<EventData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inv = investor || "buffett";

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on slug change so the prior record does not briefly flash while the new fetch resolves
    setData(null);
    setError(null);
    apiGet<EventData>(`/api/events/${slug}?investor=${inv}`)
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
        <p className="kicker text-signal-dark">/ EVENT</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] font-semibold leading-[0.92] tracking-[-0.06em]">{data.event.name}</h1>
            {data.event.date && (
              <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-graphite">
                <Calendar className="h-3 w-3" /> {data.event.date}
              </p>
            )}
          </div>
          <BookmarkButton kind="theme" entityId={slug} label={data.event.name} />
        </div>
        {data.event.description && <p className="mt-3 max-w-[720px] font-reader text-lg text-graphite">{data.event.description}</p>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink pt-4 md:grid-cols-4">
        <Stat n={data.stats.passageCount + data.stats.hiddenPassages} l="References" />
        <Stat n={data.decisions.length} l="Decisions" />
        <Stat n={data.themes.length} l="Themes" />
        <Stat n={data.companies.length} l="Companies" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          {/* Decisions */}
          {data.decisions.length > 0 && (
            <div className="mb-6">
              <p className="kicker mb-3">DECISIONS</p>
              <div className="space-y-3">
                {data.decisions.map((d, i) => (
                  <div key={i} className="border-l-2 border-signal pl-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-display font-semibold tracking-tight">{d.title}</p>
                      {d.date && <span className="font-mono text-xs text-graphite">{d.date}</span>}
                    </div>
                    <p className="mt-1 font-reader text-sm text-graphite">{d.description}</p>
                    {d.source && (
                      <button onClick={() => go("source", { slug: d.source!.slug })} className="mt-1 chip">
                        {d.source.title}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
          <div>
            <p className="kicker mb-2">SOURCES</p>
            <div className="space-y-1">
              {data.sources.map((s) => (
                <button key={s.slug} onClick={() => go("source", { slug: s.slug })} className="flex w-full items-center justify-between border-t border-rule py-1.5 text-left font-reader text-sm hover:text-signal-dark">
                  {s.title} {s.year && <span className="font-mono text-xs text-graphite">· {s.year}</span>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="kicker mb-2">THEMES</p>
            <EntityChips items={data.themes} kind="theme" investorSlug={inv} />
          </div>
          <div>
            <p className="kicker mb-2">COMPANIES</p>
            <EntityChips items={data.companies} kind="company" investorSlug={inv} />
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
