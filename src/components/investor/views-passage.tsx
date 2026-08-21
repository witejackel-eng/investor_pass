"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { EntityChips, PremiumGate, SourceTypeBadge, ProBadge } from "@/components/investor/entity-chips";
import { BookmarkButton } from "@/components/investor/bookmark-button";
import { Loading } from "./views-core";
import { ArrowLeft, ExternalLink, Sparkles, Link2, ChevronRight } from "lucide-react";

type PassageData = {
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
  passages: {
    id: string;
    text: string;
    context: string | null;
    section: string | null;
    sequence: number;
    visibility: string;
    themes: { slug: string; name: string }[];
    concepts: { slug: string; name: string }[];
    companies: { slug: string; name: string }[];
    events: { slug: string; name: string }[];
  }[];
};

export function PassageView({ id, investor }: { id: string; investor?: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<PassageData | null>(null);
  const [activeId, setActiveId] = useState(id);
  const inv = investor || "buffett";

  useEffect(() => {
    // The source slug isn't known from the passage id alone; we fetch the
    // source by finding which source contains this passage. For simplicity,
    // we accept a source slug via the hash and load it, then highlight the
    // matching passage.
  }, []);

  // This view is reached via search-result click with source slug + passage id.
  // We load the source and find the passage.
  useEffect(() => {
    // If we have a source slug, load it; otherwise we can't resolve.
    if (!investor) return;
  }, [investor]);

  // Actually, the passage view needs the source slug. Let's accept it via params.
  // The store passes id (passageId) and we need source slug.
  // We'll fetch the source list to find the right one if not provided.
  // Simpler: the search result already has source.slug; the router should pass it.
  // For now, show a passage-focused view that loads by source slug from params.
  return <PassageBySource passageId={id} investor={inv} />;
}

function PassageBySource({ passageId, investor }: { passageId: string; investor: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<PassageData | null>(null);
  const [sourceSlug, setSourceSlug] = useState<string | null>(null);

  useEffect(() => {
    // Try to find the source that contains this passage by searching all buffett sources
    apiGet<{ sources: { slug: string }[] }>("/api/investors/buffett").then(async (d) => {
      for (const s of d.sources) {
        try {
          const sd = await apiGet<PassageData>(`/api/sources/${s.slug}`);
          if (sd.passages.some((p) => p.id === passageId)) {
            setData(sd);
            setSourceSlug(s.slug);
            return;
          }
        } catch {}
      }
    });
  }, [passageId]);

  if (!data || !sourceSlug) return <Loading />;

  const passage = data.passages.find((p) => p.id === passageId) || data.passages[0];
  const idx = data.passages.findIndex((p) => p.id === passage.id);
  const prev = idx > 0 ? data.passages[idx - 1] : null;
  const next = idx < data.passages.length - 1 ? data.passages[idx + 1] : null;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => go("source", { slug: sourceSlug })} className="kicker hover:text-ink">
        <ArrowLeft className="mr-1 inline h-3 w-3" /> {data.source.title.toUpperCase()}
      </button>

      {/* Passage context header */}
      <div className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ PASSAGE CONTEXT</p>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-mono text-xs text-graphite">
              {data.source.person.name.toUpperCase()} · {data.source.year} · {data.source.title}
            </p>
            {passage.section && <p className="mt-1 chip chip-ink inline-block">{passage.section}</p>}
          </div>
          <BookmarkButton kind="passage" entityId={passage.id} label={`${data.source.title} — ${passage.section || "passage"}`} />
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
          {(passage.themes.length > 0 || passage.companies.length > 0 || passage.concepts.length > 0) && (
            <div className="mt-8 border-t-2 border-ink pt-4">
              <p className="kicker flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-signal-dark" /> WHY THIS MATCHED
              </p>
              <div className="mt-3 space-y-3">
                {passage.themes.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="kicker w-20">Themes</span>
                    <EntityChips items={passage.themes} kind="theme" investorSlug={investor} />
                  </div>
                )}
                {passage.companies.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="kicker w-20">Companies</span>
                    <EntityChips items={passage.companies} kind="company" investorSlug={investor} />
                  </div>
                )}
                {passage.concepts.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="kicker w-20">Concepts</span>
                    <EntityChips items={passage.concepts} kind="concept" investorSlug={investor} />
                  </div>
                )}
                {passage.events.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="kicker w-20">Events</span>
                    <EntityChips items={passage.events} kind="event" investorSlug={investor} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passage navigation */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-rule pt-4">
            {prev ? (
              <button onClick={() => go("passage", { id: prev.id, investor })} className="flex items-center gap-2 text-left hover:text-signal-dark">
                <ChevronRight className="h-4 w-4 rotate-180" />
                <div>
                  <p className="kicker">PREVIOUS</p>
                  <p className="font-display text-sm font-semibold">{prev.section || "Passage"}</p>
                </div>
              </button>
            ) : <span />}
            <span className="kicker">{idx + 1} / {data.passages.length}</span>
            {next ? (
              <button onClick={() => go("passage", { id: next.id, investor })} className="flex items-center gap-2 text-right hover:text-signal-dark">
                <div>
                  <p className="kicker">NEXT</p>
                  <p className="font-display text-sm font-semibold">{next.section || "Passage"}</p>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : <span />}
          </div>

          {/* Disclaimer */}
          <p className="mt-8 border-t border-rule pt-4 font-reader text-sm italic text-graphite">
            This is a paraphrased contextual summary with source attribution, not a verbatim reproduction. No claim of fair use by word count is made.
          </p>
        </div>

        {/* Sidebar: source info + provenance */}
        <aside className="space-y-6">
          <div className="border border-rule bg-paper-2 p-4">
            <p className="kicker mb-2">SOURCE</p>
            <button onClick={() => go("source", { slug: sourceSlug })} className="font-display text-base font-bold tracking-tight hover:text-signal-dark">
              {data.source.title}
            </button>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <SourceTypeBadge type={data.source.sourceType} />
              {data.source.year && <span className="font-mono text-xs text-graphite">{data.source.year}</span>}
            </div>
            {data.source.url && (
              <a href={data.source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-signal-dark hover:underline">
                View original <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="border border-rule p-4">
            <p className="kicker mb-2 flex items-center gap-1.5"><Link2 className="h-3 w-3" /> RELATED YEARS</p>
            {data.source.year && (
              <button onClick={() => go("year", { year: String(data.source.year!), investor })} className="chip chip-signal">
                {data.source.year}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
