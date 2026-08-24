import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getYearPage } from "@/lib/server/public-pages";
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
  Refreshing,
} from "../../ui";

export const revalidate = 3600;

type Params = { params: Promise<{ year: string }> };

// Prerender every year page in the corpus.
export async function generateStaticParams() {
  try {
    const years = await db.source.findMany({ where: { year: { not: null } }, distinct: ["year"], select: { year: true } });
    return years.filter((y) => y.year !== null).map((y) => ({ year: String(y.year) }));
  } catch {
    return [];
  }
}

function sourceTypeLabel(t: string) {
  return t.replaceAll("_", " ").toUpperCase();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { year } = await params;
  const data = await getYearPage(year);
  if (!data) return { title: "Year not found" };

  const topInvestor = data.investors[0]?.name;
  const title = `${data.year} — what investors were saying`;
  const description = `${fmt(data.counts.total)} source-linked references published or spoken in ${data.year}${
    topInvestor ? `, including ${topInvestor}` : ""
  }.`;

  return {
    title,
    description,
    alternates: { canonical: `/years/${year}` },
    robots: { index: data.counts.publicCount > 0, follow: true },
    openGraph: { title, description, type: "website", url: `/years/${year}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function YearPage({ params }: Params) {
  const { year } = await params;
  const data = await getYearPage(year);
  if (!data) {
    if (/^\d{4}$/.test(year)) return <Refreshing what="year page" />;
    notFound();
  }

  const crumbs = [
    { label: "INVESTOR/PASS", href: "/" },
    { label: "YEARS" },
    { label: String(data.year) },
  ];
  const jsonldHtml = serializeJsonLd([
    breadcrumbLd(crumbs),
    entityJsonld("WebPage", {
      name: String(data.year),
      path: `/years/${data.year}`,
      description: `${fmt(data.counts.total)} source-linked references published or spoken in ${data.year}, indexed across the library.`,
    }),
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonldHtml }} />
      <PageHead
        crumb={crumbs}
        title={String(data.year)}
        meta={[
          `${fmt(data.sources)} SOURCES`,
          `${fmt(data.counts.total)} INDEXED REFERENCES`,
          `${data.investors.length} INVESTOR${data.investors.length === 1 ? "" : "S"}`,
        ]}
        lede={`The public record as it stood in ${data.year}: letters, memos and speeches indexed across the library.`}
      />

      <section className="mt-10 max-w-3xl">
        <SectionLabel>SELECTED PUBLIC REFERENCES</SectionLabel>
        {data.passages.length > 0 ? (
          <>
            {data.passages.map((p) => (
              <PassageItem key={p.id} p={p} />
            ))}
            {data.counts.total > data.passages.length ? (
              <PassageBoundary total={data.counts.total} />
            ) : null}
          </>
        ) : (
          <EmptyNote>No free preview passages for this year yet.</EmptyNote>
        )}
      </section>

      <ExploreNext
        groups={[
          {
            label: "INVESTORS ACTIVE THIS YEAR",
            links:
              data.investors.length > 0 ? (
                <ChipRow items={data.investors.slice(0, 8)} kind="investor" />
              ) : (
                <EmptyNote>—</EmptyNote>
              ),
          },
          {
            label: "SOURCE TYPES",
            links:
              data.sourceTypes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.sourceTypes.map((t) => (
                    <span key={t.slug} className="chip">
                      {sourceTypeLabel(t.name)} · {fmt(t.total)}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyNote>—</EmptyNote>
              ),
          },
          {
            label: "CONTINUE",
            links: (
              <div className="flex flex-wrap gap-1.5">
                {data.prevYear ? (
                  <Link href={`/years/${data.prevYear}`} className="chip">
                    ← {data.prevYear}
                  </Link>
                ) : null}
                {data.nextYear ? (
                  <Link href={`/years/${data.nextYear}`} className="chip">
                    {data.nextYear} →
                  </Link>
                ) : null}
                <a href={`/search?q=${encodeURIComponent(String(data.year))}`} className="chip chip-signal">
                  SEARCH IN THE APP →
                </a>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
