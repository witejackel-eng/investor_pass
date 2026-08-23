"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { EntityChips, PremiumGate, SourceTypeBadge, ProBadge, FictionalAttributionBanner, isFictionalisedAttribution } from "@/components/investor/entity-chips";
import { BookmarkButton } from "@/components/investor/bookmark-button";
import { ReportCorrection } from "@/components/investor/report-correction";
import { Loading } from "./views-core";
import { ArrowLeft, ExternalLink, Sparkles, Link2, ChevronRight, ArrowRight } from "lucide-react";

type RailItem = {
  id: string;
  section: string | null;
  title: string;
  year: number | null;
  personSlug: string;
  personName: string;
};

type PassageDetail = {
  passage: {
    id: string;
    text: string;
    context: string | null;
    section: string | null;
    sequence: number;
    visibility: string;
    verificationState?: string;
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
  rails?: {
    earlier: RailItem[];
    later: RailItem[];
    sameConceptElsewhere: RailItem[];
  };
  navigation: {
    index: number;
    total: number;
    prev: { id: string; section: string | null } | null;
    next: { id: string; section: string | null } | null;
  };
};

type WhyInfo = { c: string[][]; t: string[] };

// Linked chips for the matched tags — each routes to its entity view
function WhyTagChips({ tags, investorSlug }: { tags: string[][]; investorSlug: string }) {
  const go = useStore((s) => s.go);
  const kindLabels: Record<string, string> = {
    person: "Investor", theme: "Theme", company: "Company", concept: "Concept", event: "Event", years: "Years",
  };
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map(([kind, slug, label], i) => (
        <button
          key={`${kind}-${slug}-${i}`}
          onClick={() => {
            if (kind === "person") go("investor", { slug });
            else if (kind === "theme") go("topic", { slug, investor: investorSlug });
            else if (kind === "company") go("company", { slug, investor: investorSlug });
            else if (kind === "concept") go("concept", { slug, investor: investorSlug });
            else if (kind === "event") go("event", { slug, investor: investorSlug });
            else if (kind === "years") {
              const [yf, yt] = label.split("–");
              go("year", { year: yf || label, investor: investorSlug });
            }
          }}
          className="chip chip-signal"
        >
          {kindLabels[kind] || kind}: {label}
        </button>
      ))}
    </div>
  );
}

// One rail of the related-thinking loop (earlier / later / same idea elsewhere)
function RailColumn({ label, items, onOpen }: { label: string; items: RailItem[]; onOpen: (item: RailItem) => void }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="kicker mb-1">{label}</p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <button key={item.id} onClick={() => onOpen(item)} className="block w-full border-t border-rule py-2 text-left hover:text-signal-dark transition-colors">
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-graphite">
              {item.year ?? "N.D."} · {item.personName}
            </p>
            <p className="mt-0.5 font-display text-sm font-semibold leading-tight">{item.section || item.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Match provenance passed through navigation state from search results
function parseWhy(raw?: string): WhyInfo | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v !== "object") return null;
    const c = Array.isArray(v.c) ? v.c : [];
    const t = Array.isArray(v.t) ? v.t : [];
    if (c.length === 0 && t.length === 0) return null;
    return { c, t };
  } catch {
    return null;
  }
}

export function PassageView({ id, investor }: { id: string; investor?: string }) {
  const go = useStore((s) => s.go);
  const params = useStore((s) => s.params);
  const [data, setData] = useState<PassageDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inv = investor || "buffett";
  const why = parseWhy(params.why);

  useEffect(() => {
    let active = true;
    apiGet<PassageDetail>(`/api/passages/${id}`)
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) { setError(e.message); setData(null); } });
    return () => { active = false; };
  }, [id]);

  // Reading progress: after 5s dwell, mark read (fire-and-forget; guests ignored server-side).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        navigator.sendBeacon("/api/progress", new Blob([JSON.stringify({ passageId: id })], { type: "application/json" }));
      } catch {}
    }, 5000);
    return () => clearTimeout(t);
  }, [id]);

  // Backfill a human label for this passage in the recents list (the store
  // records ids at navigation time; labels can only be known after load).
  // Release blocker: never let a raw passage id render as visible text.
  const loaded = data?.passage;
  useEffect(() => {
    if (!loaded || !data) return;
    try {
      const raw = localStorage.getItem("ip_recently_viewed");
      const prev: { view: string; slug?: string; label?: string; ts: number }[] = raw ? JSON.parse(raw) : [];
      const label = `${data.source.title}${data.source.year ? ` (${data.source.year})` : ""} — research unit ${data.passage.sequence}`;
      const next = prev.map((i) => (i.view === "passage" && i.slug === id ? { ...i, label } : i));
      if (JSON.stringify(next) !== JSON.stringify(prev)) {
        localStorage.setItem("ip_recently_viewed", JSON.stringify(next));
      }
    } catch {}
  }, [id, loaded, data]);

  if (error) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-24 text-center">
        <p className="font-display text-2xl font-bold">{error}</p>
        {error.includes("Pro") && (
          <button onClick={() => go("upgrade")} className="mt-4 bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-signal-dark">
            START PRO — $9/MONTH
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

          {/* "Why you're seeing this" — exact match provenance (spec §12.3) */}
          {why && (
            <div className="mt-8 border-t-2 border-ink pt-4">
              <p className="kicker flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-signal-dark" /> WHY YOU&apos;RE SEEING THIS
              </p>
              <div className="mt-3 space-y-3">
                {why.c.length > 0 && (
                  <div>
                    <p className="font-reader text-base">
                      Matched because this passage is indexed under{" "}
                      {why.c.map(([, , label], i) => (
                        <span key={`${label}-${i}`}>
                          {i > 0 && ", "}
                          <strong className="font-display font-semibold">{label}</strong>
                        </span>
                      ))}
                      .
                    </p>
                    <WhyTagChips tags={why.c} investorSlug={inv} />
                  </div>
                )}
                {why.t.length > 0 && (
                  <p className="font-reader text-base">
                    Matched{" "}
                    {why.t.map((tok, i) => (
                      <span key={tok}>
                        {i > 0 && ", "}
                        <strong className="font-display font-semibold">&ldquo;{tok}&rdquo;</strong>
                      </span>
                    ))}{" "}
                    in passage text.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Full tag inventory when opened directly (not from search) */}
          {!why && (data.themes.length > 0 || data.companies.length > 0 || data.concepts.length > 0) && (
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

          {/* Related thinking rails — temporal + cross-investor loop (spec §12.4) */}
          {data.rails && (data.rails.earlier.length > 0 || data.rails.later.length > 0 || data.rails.sameConceptElsewhere.length > 0) && (
            <div className="mt-6 border-t border-rule pt-4">
              <p className="kicker flex items-center gap-1.5 mb-3">
                <Link2 className="h-3 w-3" /> RELATED THINKING
              </p>
              <div className="grid gap-5 sm:grid-cols-3">
                <RailColumn label="EARLIER" items={data.rails.earlier} onOpen={(item) => go("passage", { id: item.id, investor: item.personSlug })} />
                <RailColumn label="LATER" items={data.rails.later} onOpen={(item) => go("passage", { id: item.id, investor: item.personSlug })} />
                <RailColumn label="SAME IDEA ELSEWHERE" items={data.rails.sameConceptElsewhere} onOpen={(item) => go("passage", { id: item.id, investor: item.personSlug })} />
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
          {isFictionalisedAttribution(source) && <FictionalAttributionBanner />}
          <div className="border border-rule bg-paper-2 p-4">
            <p className="kicker mb-2">SOURCE</p>
            <button onClick={() => go("source", { slug: source.slug })} className="font-display text-base font-bold tracking-tight hover:text-signal-dark text-left">
              {source.title}
            </button>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <SourceTypeBadge type={source.sourceType} />
              {source.year && <span className="font-mono text-xs text-graphite">{source.year}</span>}
              {passage.visibility === "pro" && <ProBadge />}
              {passage.verificationState === "verified" && (
                <span className="inline-flex items-center gap-1 border border-signal-dark px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wider text-signal-dark" title="Editorially verified against the original source">
                  Verified
                </span>
              )}
            </div>
            {source.url && (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-signal-dark hover:underline">
                View original <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="border border-rule p-4">
            <ReportCorrection entityKind="passage" entityId={passage.id} entityLabel="Passage" />
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
