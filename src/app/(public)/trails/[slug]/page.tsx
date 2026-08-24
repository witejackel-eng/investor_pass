import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import trailsJson from "@/data/trails/trails.json";
import type { Trail } from "@/components/investor/views-trails";
import { ShareButton, PrintButton, ExportTrailButton } from "@/components/public/page-actions";

const trails = trailsJson as Trail[];
import { breadcrumbLd, serializeJsonLd } from "@/lib/server/jsonld";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return trails.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const trail = trails.find((t) => t.slug === slug);
  if (!trail) return { title: "Trail not found" };

  const title = `${trail.title} — a research trail`;
  const description = `${trail.centralQuestion} A curated path through the indexed public record — every step dated, sourced, and linked.`;

  return {
    title,
    description,
    alternates: { canonical: `/trails/${slug}` },
    openGraph: { title, description, type: "article", url: `/trails/${slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

const KIND_LABEL: Record<string, string> = {
  company: "COMPANY",
  source: "SOURCE",
  investor: "INVESTOR",
  theme: "THEME",
  decision: "DECISION",
  compare: "COMPARE",
  event: "EVENT",
  year: "YEAR",
};

export default async function TrailPage({ params }: Params) {
  const { slug } = await params;
  const trail = trails.find((t) => t.slug === slug);
  if (!trail) notFound();

  const crumbs: { label: string; href?: string }[] = [
    { label: "INVESTOR/PASS", href: "/" },
    { label: "TRAILS", href: "/trails" },
    { label: trail.title.toUpperCase() },
  ];
  const jsonldHtml = serializeJsonLd([
    breadcrumbLd(crumbs),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: trail.title,
      description: trail.centralQuestion,
      about: "Investment research",
    },
  ]);

  const years = trail.nodes.map((n) => n.year).filter(Boolean);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonldHtml }} />

      <nav className="kicker mb-6 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
        {crumbs.map((c, i) =>
          i < crumbs.length - 1 ? (
            <span key={c.label}>
              <Link href={c.href ?? "/"} className="hover:text-[var(--signal-dark)] hover:underline">
                {c.label}
              </Link>
              <span className="mx-2 text-[var(--graphite)]">/</span>
            </span>
          ) : (
            <span key={c.label} className="text-[var(--graphite)]">{c.label}</span>
          )
        )}
      </nav>

      <header>
        <p className="kicker text-[var(--signal-dark)]">RESEARCH TRAIL</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {trail.title}
        </h1>
        <p className="prose-reader mt-4 max-w-2xl text-lg italic text-[var(--graphite)]">
          {trail.centralQuestion}
        </p>
        <p className="kicker mt-4">
          {trail.nodes.length} STEPS · {years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "THE RECORD"} ·
          EVERY STEP SOURCED
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5 print:hidden">
          <ShareButton title={trail.title} />
          <PrintButton />
          <ExportTrailButton
            data={{
              title: trail.title,
              centralQuestion: trail.centralQuestion,
              intro: trail.intro,
              steps: trail.nodes.map((n) => ({
                title: n.title,
                kind: n.entityKind,
                year: n.year ?? null,
                blurb: n.blurb,
              })),
            }}
          />
        </div>
      </header>

      <section className="prose-reader mt-8 max-w-3xl border-t-2 border-[var(--ink)] pt-6">
        <p>{trail.intro}</p>
      </section>

      <ol className="mt-10 max-w-3xl">
        {trail.nodes.map((node, i) => (
          <li key={i} className="border-t border-[var(--rule)] py-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs font-bold text-[var(--signal-dark)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="kicker">{KIND_LABEL[node.entityKind] ?? "STEP"}</span>
              {node.year ? (
                <span className="kicker text-[var(--graphite)]">{node.year}</span>
              ) : null}
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
              {node.title}
            </h2>
            <p className="prose-reader mt-2">{node.blurb}</p>
            {node.link ? (
              <a
                href={node.link.startsWith("#") ? `/${node.link}` : node.link}
                className="chip chip-signal mt-3 inline-block"
              >
                OPEN IN THE LIBRARY →
              </a>
            ) : null}
          </li>
        ))}
      </ol>

      {trail.exploreNext?.length ? (
        <section className="mt-12 max-w-3xl border-t-2 border-[var(--ink)] pt-6">
          <p className="kicker mb-3">CONTINUE THE RESEARCH</p>
          <div className="flex flex-wrap gap-1.5">
            {trail.exploreNext.map((next: { label?: string; title?: string; href?: string }, i: number) => (
              <a
                key={i}
                href={next.href || "/search"}
                className="chip"
              >
                {(next.label ?? next.title ?? "EXPLORE").toUpperCase()} →
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="gate mt-12 max-w-2xl">
        <p className="font-display text-lg font-semibold tracking-tight">
          This is one path through the graph.
        </p>
        <p className="prose-reader mt-2">
          The full library cross-links {`every`} investor by shared themes, companies and decisions —
          searchable, comparable, and source-backed end to end.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="/signup"
            className="bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]"
          >
            CREATE YOUR RESEARCH LIBRARY
          </a>
          <Link href="/trails" className="chip">
            MORE TRAILS →
          </Link>
        </div>
      </section>
    </div>
  );
}
