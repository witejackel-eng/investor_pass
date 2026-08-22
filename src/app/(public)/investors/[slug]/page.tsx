import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvestorPage } from "@/lib/server/public-pages";
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

  const title = `${data.name} — ${fmt(data.counts.total)} indexed references`;
  const description =
    data.shortDescription ||
    `The public record of ${data.name}: ${fmt(data.counts.sources)} sources and ${fmt(
      data.counts.total
    )} indexed references${data.years.from ? ` (${data.years.from}–${data.years.to})` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: `/investors/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "profile", url: `/investors/${slug}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function InvestorPage({ params }: Params) {
  const { slug } = await params;
  const data = await getInvestorPage(slug);
  if (!data) notFound();

  const span =
    data.years.from && data.years.to ? `${data.years.from}–${data.years.to}` : "date range pending";

  return (
    <div>
      <PageHead
        crumb={[
          { label: "INVESTOR/PASS", href: "/" },
          { label: "INVESTORS", href: "/investors" },
          { label: data.name.toUpperCase() },
        ]}
        title={data.name}
        meta={[
          `${fmt(data.counts.sources)} SOURCES`,
          `${fmt(data.counts.total)} INDEXED REFERENCES`,
          span,
        ]}
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
              No free preview passages yet — the complete record for {data.name} is available in the
              app.
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
                <EmptyNote>Themes are being indexed.</EmptyNote>
              ),
          },
          {
            label: "TOP COMPANIES",
            links:
              data.companies.length > 0 ? (
                <ChipRow items={data.companies.slice(0, 8)} kind="company" />
              ) : (
                <EmptyNote>No companies indexed yet.</EmptyNote>
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
