import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCompanyPage } from "@/lib/server/public-pages";
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
} from "../../ui";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

// Prerender every [slug] page in the corpus.
export async function generateStaticParams() {
  try {
    const rows = await db.company.findMany({ select: { slug: true } });
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCompanyPage(slug);
  if (!data) return { title: "Company not found" };

  const topInvestor = data.investors[0]?.name;
  const title = `${data.name} — ${fmt(data.counts.total)} investor references`;
  const description = `${fmt(data.counts.total)} source-linked references to ${data.name} across the public record${
    topInvestor ? `, most from ${topInvestor}` : ""
  }${data.years.from ? ` (${data.years.from}–${data.years.to})` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: `/companies/${slug}` },
    robots: { index: data.counts.publicCount > 0, follow: true },
    openGraph: { title, description, type: "website", url: `/companies/${slug}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function CompanyPage({ params }: Params) {
  const { slug } = await params;
  const data = await getCompanyPage(slug);
  if (!data) notFound();

  const span =
    data.years.from && data.years.to ? `${data.years.from}–${data.years.to}` : null;

  const crumbs = [
    { label: "INVESTOR/PASS", href: "/" },
    { label: "COMPANIES" },
    { label: data.name.toUpperCase() },
  ];
  const jsonldHtml = serializeJsonLd([
    breadcrumbLd(crumbs),
    entityJsonld("WebPage", {
      name: data.name,
      path: `/companies/${data.slug}`,
      description:
        data.description ??
        `${fmt(data.counts.total)} source-linked references to ${data.name} across investor letters, memos and speeches.`,
    }),
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonldHtml }} />
      <PageHead
        crumb={crumbs}
        title={data.name}
        meta={[
          `${fmt(data.counts.total)} INDEXED REFERENCES`,
          `${data.investors.length} INVESTOR${data.investors.length === 1 ? "" : "S"}`,
          ...(span ? [`FIRST INDEXED ${data.years.from}`, `LAST ${data.years.to}`] : []),
        ]}
        lede={
          data.description ||
          (data.investors.length > 0
            ? `${data.name} appears across ${data.investors.length} investor record${
                data.investors.length === 1 ? "" : "s"
              } in the library. Follow each investor's references below.`
            : null)
        }
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
          <EmptyNote>No free preview passages yet — references are indexed in the app.</EmptyNote>
        )}
      </section>

      <ExploreNext
        groups={[
          {
            label: "INVESTORS",
            links:
              data.investors.length > 0 ? (
                <ChipRow items={data.investors.slice(0, 8)} kind="investor" />
              ) : (
                <EmptyNote>—</EmptyNote>
              ),
          },
          {
            label: "THEMES IN THIS THREAD",
            links:
              data.themes.length > 0 ? (
                <ChipRow items={data.themes} kind="theme" />
              ) : (
                <EmptyNote>No themes tagged yet.</EmptyNote>
              ),
          },
          {
            label: "CONTINUE",
            links: (
              <div className="flex flex-wrap gap-1.5">
                <a
                  href={`/#/view=search&q=${encodeURIComponent(data.name)}`}
                  className="chip chip-signal"
                >
                  SEARCH IN THE APP →
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
