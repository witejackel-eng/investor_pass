import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvestorTopic } from "@/lib/server/public-pages";
import {
  ChipRow,
  EmptyNote,
  ExploreNext,
  PageHead,
  PassageBoundary,
  PassageItem,
  SectionLabel,
  fmt,
} from "../../../../ui";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string; theme: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, theme } = await params;
  const data = await getInvestorTopic(slug, theme);
  if (!data) return { title: "Topic not found" };

  const title = `${data.person.name} on ${data.theme.name} — ${fmt(data.counts.total)} indexed references`;
  const description = `${fmt(data.counts.total)} source-linked references to ${data.theme.name.toLowerCase()} across ${data.person.name}'s public record${
    data.years.from ? `, ${data.years.from}–${data.years.to}` : ""
  }.`;

  return {
    title,
    description,
    alternates: { canonical: `/investors/${slug}/topics/${theme}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "article", url: `/investors/${slug}/topics/${theme}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function InvestorTopicPage({ params }: Params) {
  const { slug, theme } = await params;
  const data = await getInvestorTopic(slug, theme);
  if (!data) notFound();

  const span =
    data.years.from && data.years.to ? `${data.years.from}–${data.years.to}` : null;

  return (
    <div>
      <PageHead
        crumb={[
          { label: "INVESTOR/PASS", href: "/" },
          { label: "INVESTORS", href: "/investors" },
          { label: data.person.name.toUpperCase(), href: `/investors/${data.person.slug}` },
          { label: "TOPICS" },
          { label: data.theme.name.toUpperCase() },
        ]}
        title={`${data.person.name} on ${data.theme.name}`}
        meta={[
          fmt(data.counts.total) + " INDEXED REFERENCES",
          ...(span ? [span] : []),
          `${data.passages.length > 0 ? Math.min(5, data.counts.publicCount) : 0} SHOWN FREE`,
        ]}
        lede={
          data.theme.description ||
          `${fmt(
            data.counts.total
          )} indexed references drawn from ${data.person.name}'s letters, memos, speeches and interviews, tagged to ${data.theme.name.toLowerCase()}.`
        }
      />

      <section className="mt-10">
        <SectionLabel>SELECTED REFERENCES</SectionLabel>
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
              No free preview passages for this combination yet —{" "}
              {fmt(data.counts.total)} reference
              {data.counts.total === 1 ? "" : "s"} indexed in total.
            </EmptyNote>
          )}
        </div>
      </section>

      <ExploreNext
        groups={[
          {
            label: "COMPANIES IN THIS THREAD",
            links:
              data.companies.length > 0 ? (
                <ChipRow items={data.companies} kind="company" />
              ) : (
                <EmptyNote>No companies tagged in this thread.</EmptyNote>
              ),
          },
          {
            label: "RELATED CONCEPTS",
            links:
              data.concepts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.concepts.map((c) => (
                    <a
                      key={c.slug}
                      href={`/#/view=search&q=${encodeURIComponent(c.name)}`}
                      className="chip"
                    >
                      {c.name} · {fmt(c.total)}
                    </a>
                  ))}
                </div>
              ) : (
                <EmptyNote>No concepts indexed yet.</EmptyNote>
              ),
          },
          {
            label: "CONTINUE",
            links: (
              <div className="flex flex-wrap gap-1.5">
                <Link href={`/themes/${data.theme.slug}`} className="chip chip-signal">
                  ALL INVESTORS ON {data.theme.name.toUpperCase()} →
                </Link>
                <Link href={`/investors/${data.person.slug}`} className="chip">
                  {data.person.name.split(" ")[0].toUpperCase()}'S PROFILE →
                </Link>
                <a
                  href={`/#/view=search&q=${encodeURIComponent(`${data.person.name} ${data.theme.name}`)}`}
                  className="chip"
                >
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
