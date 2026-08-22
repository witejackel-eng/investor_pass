"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { EntityChips, PremiumGate, SourceTypeBadge, ProBadge } from "@/components/investor/entity-chips";
import { BookmarkButton } from "@/components/investor/bookmark-button";
import { Loading } from "./views-core";
import { ArrowLeft, ExternalLink, Sparkles, Link2, ChevronRight, ArrowRight } from "lucide-react";

type PassageDetail = {
  passage: {
    id: string;
    text: string;
    context: string | null;
    section: string | null;
    sequence: number;
    visibility: string;
  };
  source: {
    id: string;
    slug: string;
    title: string;
    sourceType: string;
    year: number | null;
    publicationDate: string | null;
    publisher: string | null;
    url: string | null;
    description: string | null;
    provenanceStatus: string;
    retrievalAt: string;
    person: { slug: string; name: string };
  };
  themes: { slug: string; name: string; description: string | null }[];
  concepts: { slug: string; name: string }[];
  companies: { slug: string; name: string; ticker: string | null }[];
  events: { slug: string; name: string }[];
  relatedThemes: { slug: string; name: string; count: number }[];
  navigation: {
    index: number;
    total: number;
    prev: { id: string; section: string | null } | null;
    next: { id: string; section: string | null } | null;
  };
};

export function PassageView({ id, investor }: { id: string; investor?: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<PassageDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inv = investor || "buffett";

  useEffect(() => {
    let active = true;
    apiGet<PassageDetail>(`/api/passages/${id}`)
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) { setError(e.message); setData(null); } });
    return () => { active = false; };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-24 text-center">
        <p className="font-display text-2xl font-bold">{error}</p>
        {error.includes("Pro") && (
          <button onClick={() => go("upgrade")} className="mt-4 bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-signal-dark">
            START PRO — $19/MONTH
          </button>
        )}
      </div>
    );
  }
  if (!data) return <Loading />;

  const { passage, source } = data;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("source", { slug: source.slug })} className="kicker hover:text-ink">
        <ArrowLeft className="mr-1 inline h-3 w-3" /> {source.title.toUpperCase()}
      </button>

      {/* Passage context header */}
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ PASSAGE CONTEXT</p>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-mono text-xs text-graphite">
              {source.person.name.toUpperCase()} · {source.year} · {source.title}
            </p>
            {passage.section && <p className="mt-1 chip chip-ink inline-block">{passage.section}</p>}
          </div>
          <BookmarkButton kind="passage" entityId={passage.id} label={`${source.title} — ${passage.section || "passage"}`} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main passage */}
        <div className="reading">
          <p className="kicker mb-3">CONTEXTUAL SUMMARY</p>
          <p className="font-reader text-xl leading-relaxed">{passage.text}</p>
          {passage.context && (
            <div className="mt-6 border-l-2 border-signal pl-4">
              <p className="kicker mb-1">CONTEXT</p>
              <p className="font-reader text-base italic text-graphite">{passage.context}</p>
            </div>
          )}

          {/* "Why this result matched" — master prompt §15 */}
          {(data.themes.length > 0 || data.companies.length > 0 || data.concepts.length > 0) && (
            <div className="mt-8 border-t-2 border-ink pt-4">
              <p className="kicker flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-signal-dark" /> WHY THIS MATCHED
              </p>
              <div className="mt-3 space-y-3">
                {data.themes.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="kicker w-20">Themes</span>
                    <EntityChips items={data.themes} kind="theme" investorSlug={inv} />
                  </div>
                )}
                {data.companies.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="kicker w-20">Companies</span>
                    <EntityChips items={data.companies} kind="company" investorSlug={inv} />
                  </div>
                )}
                {data.concepts.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="kicker w-20">Concepts</span>
                    <EntityChips items={data.concepts} kind="concept" investorSlug={inv} />
                  </div>
                )}
                {data.events.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="kicker w-20">Events</span>
                    <EntityChips items={data.events} kind="event" investorSlug={inv} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related themes — co-occurring themes from other passages */}
          {data.relatedThemes.length > 0 && (
            <div className="mt-6 border-t border-rule pt-4">
              <p className="kicker flex items-center gap-1.5 mb-3">
                <Link2 className="h-3 w-3" /> RELATED THEMES
              </p>
              <p className="font-reader text-sm text-graphite mb-3">Themes that appear alongside this one in other passages:</p>
              <div className="flex flex-wrap gap-2">
                {data.relatedThemes.map((rt) => (
                  <button
                    key={rt.slug}
                    onClick={() => go("topic", { slug: rt.slug, investor: inv })}
                    className="chip chip-signal group"
                    title={`${rt.count} co-occurrences`}
                  >
                    {rt.name}
                    <span className="ml-1 opacity-60 group-hover:opacity-100">{rt.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Passage navigation */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-rule pt-4">
            {data.navigation.prev ? (
              <button
                onClick={() => go("passage", { id: data.navigation.prev!.id, investor: inv })}
                className="flex items-center gap-2 text-left hover:text-signal-dark transition-colors"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <div>
                  <p className="kicker">PREVIOUS</p>
                  <p className="font-display text-sm font-semibold">{data.navigation.prev.section || "Passage"}</p>
                </div>
              </button>
            ) : <span className="kicker text-graphite/50">START</span>}
            <span className="kicker">{data.navigation.index} / {data.navigation.total}</span>
            {data.navigation.next ? (
              <button
                onClick={() => go("passage", { id: data.navigation.next!.id, investor: inv })}
                className="flex items-center gap-2 text-right hover:text-signal-dark transition-colors"
              >
                <div>
                  <p className="kicker">NEXT</p>
                  <p className="font-display text-sm font-semibold">{data.navigation.next.section || "Passage"}</p>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : <span className="kicker text-graphite/50">END</span>}
          </div>

          {/* Disclaimer */}
          <p className="mt-8 border-t border-rule pt-4 font-reader text-sm italic text-graphite">
            This is a paraphrased contextual summary with source attribution, not a verbatim reproduction. No claim of fair use by word count is made. Follow the link above to read the original source in full.
          </p>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="border border-rule bg-paper-2 p-4">
            <p className="kicker mb-2">SOURCE</p>
            <button onClick={() => go("source", { slug: source.slug })} className="font-display text-base font-bold tracking-tight hover:text-signal-dark text-left">
              {source.title}
            </button>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <SourceTypeBadge type={source.sourceType} />
              {source.year && <span className="font-mono text-xs text-graphite">{source.year}</span>}
              {passage.visibility === "pro" && <ProBadge />}
            </div>
            {source.url && (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-signal-dark hover:underline">
                View original <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="border border-rule p-4">
            <p className="kicker mb-2 flex items-center gap-1.5"><Link2 className="h-3 w-3" /> RELATED</p>
            <div className="space-y-2">
              {source.year && (
                <button onClick={() => go("year", { year: String(source.year!), investor: inv })} className="flex w-full items-center justify-between text-sm hover:text-signal-dark">
                  <span className="font-reader">Year {source.year}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
              <button onClick={() => go("investor", { slug: source.person.slug })} className="flex w-full items-center justify-between text-sm hover:text-signal-dark">
                <span className="font-reader">{source.person.name}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button onClick={() => go("source", { slug: source.slug })} className="flex w-full items-center justify-between text-sm hover:text-signal-dark">
                <span className="font-reader">All passages</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
