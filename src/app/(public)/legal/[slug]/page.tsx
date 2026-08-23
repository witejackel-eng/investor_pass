import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEGAL_DOCS, getLegalDoc } from "@/lib/legal";
import { breadcrumbLd, serializeJsonLd } from "@/lib/server/jsonld";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) return {};

  const title = `${doc.title} — Investor/Pass`;
  return {
    title,
    description: doc.description,
    robots: { index: true, follow: true },
    alternates: { canonical: `/legal/${doc.slug}` },
    openGraph: {
      title,
      description: doc.description,
      type: "article",
      url: `/legal/${doc.slug}`,
    },
    twitter: { card: "summary", title, description: doc.description },
  };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) notFound();

  const jsonldHtml = serializeJsonLd([
    breadcrumbLd([
      { label: "LEGAL", href: "/legal" },
      { label: doc.slug },
    ]),
  ]);

  return (
    <div className="mx-auto max-w-3xl py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonldHtml }} />
      <nav className="font-mono text-[0.62rem] uppercase tracking-wider text-graphite" aria-label="Breadcrumb">
        <Link href="/legal" className="hover:text-ink">
          LEGAL
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{doc.slug}</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">{doc.title}</h1>
      <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
        LAST UPDATED {doc.updated}
      </p>

      <div className="mt-10 space-y-10 border-t border-ink pt-8">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="kicker">{section.heading.toUpperCase()}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p.slice(0, 48)} className="prose-reader mt-3">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="prose-reader mt-3 list-disc space-y-1.5 pl-5">
                {section.bullets.map((b) => (
                  <li key={b.slice(0, 48)}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-1.5 border-t border-rule pt-6">
        <Link href="/legal" className="chip chip-signal">
          ALL LEGAL DOCUMENTS →
        </Link>
        {LEGAL_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
          <Link key={d.slug} href={`/legal/${d.slug}`} className="chip">
            {d.title} →
          </Link>
        ))}
      </div>
    </div>
  );
}
