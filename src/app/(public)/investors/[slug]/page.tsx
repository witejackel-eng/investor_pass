import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvestorPage } from "@/lib/server/public-pages";
import { breadcrumbLd, entityJsonld, serializeJsonLd } from "@/lib/server/jsonld";
import {
  ChipRow,
  EmptyNote,
  ExploreNext,
  PageHead,
  PassageBoundary,
  PassageItem,
  SectionLabel,
  fmt,
  spaSearch,
} from "../../ui";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getInvestorPage(slug);
  if (!data) return { title: "Investor not found" };

  const hasPublicContent = data.counts.publicCount > 0;
  const title = hasPublicContent
    ? `${data.name} — ${fmt(data.counts.total)} indexed references`
    : `${data.name} — collection in preparation`;
  const description =
    data.shortDescription ||
    `The public record of ${data.name}: ${fmt(data.counts.sources)} sources and ${fmt(
      data.counts.total
    )} indexed references${data.years.from ? ` (${data.years.from}–${data.years.to})` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: `/investors/${slug}` },
    // Thin pages (no public passages yet) stay out of the index until the
    // collection is real — they would otherwise rank as empty duplicates.
    robots: { index: hasPublicContent, follow: true },
    openGraph: { title, description, type: "profile", url: `/investors/${slug}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function InvestorPage({ params }: Params) {
  const { slug } = await params;
  const data = await getInvestorPage(slug);
  if (!data) notFound();

  const hasPublicContent = data.counts.publicCount > 0;
  const span =
    data.years.from && data.years.to
      ? `${data.years.from}–${data.years.to}`
      : hasPublicContent
        ? "date range pending"
        : "COLLECTION IN PREPARATION";

  const crumbs = [
    { label: "INVESTOR/PASS", href: "/" },
    { label: "INVESTORS", href: "/investors" },
    { label: data.name.toUpperCase() },
  ];
  const jsonldHtml = serializeJsonLd([
    breadcrumbLd(crumbs),
    entityJsonld("Person", {
      name: data.name,
      description: data.shortDescription ?? data.bio,
      path: `/investors/${data.slug}`,
    }),
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonldHtml }} />
      <PageHead
        crumb={crumbs}
        title={data.name}
        meta={
          hasPublicContent
            ? [
                `${fmt(data.counts.sources)} SOURCES`,
                `${fmt(data.counts.total)} INDEXED REFERENCES`,
                span,
              ]
            : ["COLLECTION IN PREPARATION"]
        }
        lede={data.shortDescription}
      />

      {data.bio ? (
        <section className="mt-10 max-w-3xl">
          <SectionLabel>THE RECORD</SectionLabel>
          <p className="prose-reader">{data.bio}</p>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <SectionLabel>SELECTED PUBLIC REFERENCES</SectionLabel>
        </div>
        <div className="max-w-3xl">
          {data.passages.length > 0 ? (
            <>
              {data.passages.map((p) => (
                <PassageItem key={p.id} p={p} showInvestor={false} />
              ))}
              {data.counts.total > data.passages.length ? (
                <PassageBoundary total={data.counts.total} />
              ) : null}
            </>
          ) : (
            <EmptyNote>
              The {data.name} collection is being indexed — letters, speeches and
              decisions, paraphrased with full source attribution. Explore the
              active collections in the meantime.
            </EmptyNote>
          )}
        </div>
      </section>

      <ExploreNext
        groups={[
          {
            label: "TOP THEMES",
            links:
              data.themes.length > 0 ? (
                <ChipRow items={data.themes.slice(0, 8)} kind="theme" />
              ) : (
                <EmptyNote>Themes appear once the collection lands.</EmptyNote>
              ),
          },
          {
            label: "TOP COMPANIES",
            links:
              data.companies.length > 0 ? (
                <ChipRow items={data.companies.slice(0, 8)} kind="company" />
              ) : (
                <EmptyNote>Companies appear once the collection lands.</EmptyNote>
              ),
          },
          {
            label: "CONTINUE",
            links: (
              <div className="flex flex-wrap gap-1.5">
                <a href={spaSearch(data.name)} className="chip chip-signal">
                  SEARCH {data.name.split(" ")[0].toUpperCase()} IN THE APP →
                </a>
                <Link href="/investors" className="chip">
                  ALL INVESTORS →
                </Link>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
