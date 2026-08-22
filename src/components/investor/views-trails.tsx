"use client";
import type { ReactNode } from "react";

export type TrailEntityKind = "person" | "theme" | "company" | "concept" | "event" | "source";

export type TrailNode = {
  year: number;
  entityKind: TrailEntityKind;
  entitySlug: string;
  title: string;
  blurb: string;
  link: string;
};

export type TrailExploreNextLink = {
  label: string;
  link: string;
};

export type Trail = {
  slug: string;
  title: string;
  centralQuestion: string;
  intro: string;
  nodes: TrailNode[];
  exploreNext: TrailExploreNextLink[];
};

function navigateToHash(link: string) {
  if (typeof window === "undefined") return;
  if (!link.startsWith("#/")) return;
  window.history.pushState(null, "", link);
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function HashLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        navigateToHash(href);
      }}
    >
      {children}
    </a>
  );
}

function eraSpan(nodes: TrailNode[]): { from: number; to: number } | null {
  if (nodes.length === 0) return null;
  const years = nodes.map((n) => n.year);
  return { from: Math.min(...years), to: Math.max(...years) };
}

const KIND_LABELS: Record<TrailEntityKind, string> = {
  person: "Investor",
  theme: "Theme",
  company: "Company",
  concept: "Concept",
  event: "Event",
  source: "Source",
};

export function TrailsIndex({ trails, onOpen }: { trails: Trail[]; onOpen: (slug: string) => void }) {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ RESEARCH TRAILS</p>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.07em]">
          Curated paths through the record
        </h1>
        <p className="mt-3 max-w-[720px] font-reader text-lg text-graphite">
          A research trail is an editor&apos;s path through the library — each step dated, sourced, and linked, showing how an idea or a philosophy actually developed.
        </p>
      </div>

      {trails.length === 0 ? (
        <div className="mt-10 border-t border-rule py-8">
          <p className="font-reader text-lg text-graphite">No trails have been published yet.</p>
          <p className="mt-1 kicker">CHECK BACK AFTER THE NEXT INDEXING PASS</p>
        </div>
      ) : (
        <div className="mt-8">
          {trails.map((trail) => {
            const span = eraSpan(trail.nodes);
            return (
              <article key={trail.slug} className="border-t border-rule py-7 first:border-t-0 first:pt-2">
                <p className="kicker text-signal-dark">TRAIL · {trail.nodes.length} STEPS{span ? ` · ${span.from}–${span.to}` : ""}</p>
                <h2 className="mt-2 max-w-[860px]">
                  <button
                    type="button"
                    onClick={() => onOpen(trail.slug)}
                    className="font-display text-[clamp(1.5rem,3vw,2.4rem)] font-bold leading-[1.02] tracking-[-0.05em] hover:text-signal-dark transition-colors"
                  >
                    {trail.title}
                  </button>
                </h2>
                <p className="mt-2 max-w-[720px] font-reader text-base italic leading-snug text-graphite">
                  {trail.centralQuestion}
                </p>
                <button
                  type="button"
                  onClick={() => onOpen(trail.slug)}
                  className="mt-3 kicker hover:text-ink"
                >
                  FOLLOW THE TRAIL →
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TrailDetail({ trail, onBack }: { trail: Trail; onBack: () => void }) {
  const span = eraSpan(trail.nodes);
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <button type="button" onClick={onBack} className="kicker hover:text-ink">
        ← ALL TRAILS
      </button>

      <header className="mt-2 border-t-2 border-ink pt-4">
        <p className="kicker text-signal-dark">/ RESEARCH TRAILS</p>
        <h1 className="mt-2 max-w-[900px] font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
          {trail.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="chip chip-ink">{trail.nodes.length} STEPS</span>
          {span && <span className="chip">{span.from}–{span.to}</span>}
        </div>
        <p className="mt-4 max-w-[720px] font-reader text-xl italic leading-snug">{trail.centralQuestion}</p>
        <p className="mt-3 max-w-[720px] font-reader text-lg leading-relaxed text-graphite">{trail.intro}</p>
      </header>

      {trail.nodes.length === 0 ? (
        <section className="mt-10 border-t border-rule py-8">
          <p className="font-reader text-lg text-graphite">This trail has no steps indexed yet.</p>
        </section>
      ) : (
        <ol className="mt-8 mb-4">
          {trail.nodes.map((node, i) => (
            <li key={`${node.entitySlug}-${node.year}-${i}`} className="border-t border-rule">
              <article className="grid gap-x-6 gap-y-1 py-6 sm:grid-cols-[90px_1fr]">
                <p className="font-mono text-sm tracking-wider text-graphite">{node.year}</p>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <HashLink
                      href={node.link}
                      className="font-display text-xl font-semibold tracking-tight hover:text-signal-dark transition-colors"
                    >
                      {node.title}
                    </HashLink>
                    <span className="chip">{KIND_LABELS[node.entityKind]}</span>
                  </div>
                  <p className="mt-2 max-w-[680px] font-reader text-base leading-relaxed text-graphite">{node.blurb}</p>
                  <HashLink
                    href={node.link}
                    className="mt-2 inline-block font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-signal-dark hover:underline"
                    ariaLabel={`Open ${KIND_LABELS[node.entityKind]}: ${node.title}`}
                  >
                    Open →
                  </HashLink>
                </div>
              </article>
              {i < trail.nodes.length - 1 && (
                <div aria-hidden="true" className="pb-5 font-mono text-graphite sm:pl-[90px]">
                  ↓
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {trail.exploreNext.length > 0 && (
        <footer className="border-t-2 border-ink pb-8 pt-4">
          <div className="section-head">
            <h2>Explore next</h2>
            <p className="kicker">WHERE THIS TRAIL LEADS</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {trail.exploreNext.map((l, i) => (
              <HashLink key={`${l.label}-${i}`} href={l.link} className="chip hover:text-signal-dark">
                {l.label} →
              </HashLink>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
