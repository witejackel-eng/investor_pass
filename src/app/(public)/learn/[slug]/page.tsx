import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EXPLAINERS, explainerBySlug } from "@/data/learn/explainers";
import { TrackView } from "@/components/public/track-view";
import { PageHead } from "../../ui";
import { breadcrumbLd, serializeJsonLd } from "@/lib/server/jsonld";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EXPLAINERS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const e = explainerBySlug(slug);
  if (!e) return { title: "Explainer not found" };
  const title = `${e.title} — How Finance Works`;
  return {
    title,
    description: e.summary,
    alternates: { canonical: `/learn/${slug}` },
    openGraph: { title, description: e.summary, type: "article", url: `/learn/${slug}` },
    twitter: { card: "summary_large_image", title, description: e.summary },
  };
}

export default async function ExplainerPage({ params }: Params) {
  const { slug } = await params;
  const e = explainerBySlug(slug);
  if (!e) notFound();

  return (
    <div>
      <TrackView name="learn_page_view" props={{ page: "explainer", slug }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            breadcrumbLd([
              { label: "INVESTOR/PASS", href: "/" },
              { label: "LEARN", href: "/learn" },
              { label: e.title },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: e.title,
              description: e.summary,
              dateModified: e.updatedAt,
              articleSection: e.category,
              isAccessibleForFree: true,
              mainEntityOfPage: { "@type": "WebPage", "@id": `/learn/${e.slug}` },
            },
          ]),
        }}
      />
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "LEARN", href: "/learn" }, { label: e.category }]}
        title={e.title}
        meta={[e.category, e.difficulty, `UPDATED ${e.updatedAt}`]}
        lede={e.summary}
      />

      <article className="reading mt-10">
        {e.sections.map((s) => (
          <section key={s.heading} className="border-t border-border py-6">
            <h2 className="font-display text-xl font-bold tracking-tight">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="prose-reader mt-3">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>

      {/* The LEARN → STUDY bridge: real graph links, never a dead end */}
      <aside className="mt-10 border-t-2 border-[var(--ink)] pt-6" aria-label="Connected to the evidence graph">
        <p className="kicker text-[var(--signal-dark)]">STUDY THE RECORD — WHERE THESE IDEAS LIVE</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="kicker mb-2">INVESTORS IN THIS WORLD</p>
            <ul className="space-y-1.5">
              {e.related.investors.map((i) => (
                <li key={i.slug}>
                  <Link href={`/investors/${i.slug}`} className="font-display text-sm font-semibold hover:text-[var(--signal-dark)]">
                    {i.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker mb-2">IDEAS</p>
            <ul className="space-y-1.5">
              {e.related.themes.map((t) => (
                <li key={t.slug}>
                  <Link href={`/themes/${t.slug}`} className="font-display text-sm font-semibold hover:text-[var(--signal-dark)]">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
            {e.related.companies && e.related.companies.length > 0 && (
              <>
                <p className="kicker mb-2 mt-4">COMPANIES</p>
                <ul className="space-y-1.5">
                  {e.related.companies.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/companies/${c.slug}`} className="font-display text-sm font-semibold hover:text-[var(--signal-dark)]">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {e.related.events && e.related.events.length > 0 && (
              <>
                <p className="kicker mb-2 mt-4">EVENTS</p>
                <ul className="space-y-1.5">
                  {e.related.events.map((ev) => (
                    <li key={ev.slug}>
                      <Link href={`/events/${ev.slug}`} className="font-display text-sm font-semibold hover:text-[var(--signal-dark)]">
                        {ev.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        {e.related.trail && (
          <div className="mt-6 border border-[var(--ink)] bg-[var(--paper)] p-4">
            <p className="kicker">RESEARCH TRAIL</p>
            <Link
              href={`/trails/${e.related.trail.slug}`}
              className="mt-1 block font-display text-lg font-bold tracking-tight hover:text-[var(--signal-dark)]"
            >
              {e.related.trail.title} →
            </Link>
          </div>
        )}
      </aside>

      {e.furtherReading.length > 0 && (
        <section className="mt-10 border-t border-border py-6" aria-label="Further reading">
          <p className="kicker mb-3">FURTHER READING</p>
          <ul className="space-y-2">
            {e.furtherReading.map((f) => (
              <li key={f.href} className="flex flex-wrap items-baseline gap-x-2">
                <Link href={f.href} className="font-display text-sm font-semibold hover:text-[var(--signal-dark)]">
                  {f.label}
                </Link>
                <span className="font-reader text-sm text-[var(--graphite)]">— {f.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="mt-10 flex flex-wrap justify-between gap-4 border-t border-border pt-6" aria-label="More explainers">
        {EXPLAINERS.filter((x) => x.slug !== e.slug).map((x) => (
          <Link key={x.slug} href={`/learn/${x.slug}`} className="nav-link font-display text-sm font-semibold">
            {x.title} →
          </Link>
        ))}
      </nav>
    </div>
  );
}
