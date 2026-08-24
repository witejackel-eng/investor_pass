"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { Loading } from "./views-core";
import { SourceTypeBadge } from "@/components/investor/entity-chips";
import { ArrowLeft, ChevronRight } from "lucide-react";

type TimelineEntry = {
  year: number;
  sources: { slug: string; title: string; sourceType: string; passageCount: number }[];
  themes: string[];
  companies: string[];
  decisions: { title: string; date: string; description: string; company: { slug: string; name: string } | null; source: { slug: string; title: string } | null }[];
};

export function TimelineView({ slug }: { slug: string }) {
  const go = useStore((s) => s.go);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on slug change so the prior record does not briefly flash while the new fetch resolves
    setLoading(true);
    setError(null);
    apiGet<{ timeline: TimelineEntry[] }>(`/api/investors/${slug}/timeline`)
      .then((d) => { if (active) setTimeline(d.timeline); })
      .catch(() => { if (active) setError("This record could not be loaded. It may not exist in the index, or the connection was lost."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) return <Loading />;
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

  const decades = [...new Set(timeline.map((t) => Math.floor(t.year / 10) * 10))].sort((a, b) => a - b);
  const filtered = selectedDecade !== null
    ? timeline.filter((t) => Math.floor(t.year / 10) * 10 === selectedDecade)
    : timeline;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("investor", { slug })} className="kicker hover:text-ink">
        <ArrowLeft className="mr-1 inline h-3 w-3" /> {slug.toUpperCase()}
      </button>
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ TIMELINE</p>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.07em]">By year</h1>
        <p className="mt-3 max-w-[680px] font-reader text-lg text-graphite">
          Navigate the public record chronologically. Each year surfaces sources, decisions, themes, and companies discussed.
        </p>
      </div>

      {/* Decade filter */}
      {decades.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink pt-4">
          <span className="kicker mr-2">DECADE:</span>
          <button
            onClick={() => setSelectedDecade(null)}
            className={selectedDecade === null ? "chip chip-ink" : "chip"}
          >
            ALL
          </button>
          {decades.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDecade(d)}
              className={selectedDecade === d ? "chip chip-ink" : "chip"}
            >
              {d}s
            </button>
          ))}
        </div>
      )}

      {/* Timeline rail */}
      <div className="mt-8">
        {filtered.length === 0 ? (
          <p className="border-t border-rule py-12 text-center font-reader text-graphite">
            No timeline entries{selectedDecade !== null ? ` for the ${selectedDecade}s` : ""}.
          </p>
        ) : (
          <div className="timeline-rail space-y-8">
            {filtered.map((entry) => (
              <div key={entry.year} className="relative">
                <div className="timeline-dot" />
                <div className="mb-3 flex items-baseline gap-3">
                  <button
                    onClick={() => go("year", { year: String(entry.year), investor: slug })}
                    className="font-display text-3xl font-bold tracking-tight hover:text-signal-dark"
                  >
                    {entry.year}
                  </button>
                  <span className="kicker">
                    {entry.sources.length} source{entry.sources.length !== 1 ? "s" : ""}
                    {entry.decisions.length > 0 && ` · ${entry.decisions.length} decision${entry.decisions.length !== 1 ? "s" : ""}`}
                  </span>
                </div>

                {/* Decisions */}
                {entry.decisions.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {entry.decisions.map((d, i) => (
                      <div key={i} className="border-l-2 border-signal pl-3">
                        <p className="font-display text-sm font-semibold">{d.title}</p>
                        <p className="font-reader text-xs text-graphite">{d.description}</p>
                        {d.source && (
                          <button onClick={() => go("source", { slug: d.source!.slug })} className="mt-1 chip">
                            {d.source.title}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Sources */}
                <div className="space-y-1.5">
                  {entry.sources.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => go("source", { slug: s.slug })}
                      className="flex w-full items-center justify-between gap-3 border-t border-rule py-1.5 text-left hover:bg-paper-2"
                    >
                      <span className="flex items-center gap-2">
                        <SourceTypeBadge type={s.sourceType} />
                        <span className="font-display text-sm font-medium">{s.title}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs text-graphite">{s.passageCount}p</span>
                        <ChevronRight className="h-3.5 w-3.5 text-graphite" />
                      </span>
                    </button>
                  ))}
                </div>

                {/* Themes + Companies chips */}
                {(entry.themes.length > 0 || entry.companies.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {entry.themes.map((t) => (
                      <span key={t} className="chip chip-signal">{t}</span>
                    ))}
                    {entry.companies.map((c) => (
                      <span key={c} className="chip">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
