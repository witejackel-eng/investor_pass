import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventPage } from "@/lib/server/public-pages";
import { asIsoDate, breadcrumbLd, entityJsonld, serializeJsonLd } from "@/lib/server/jsonld";
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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEventPage(slug);
  if (!data) return { title: "Event not found" };

  const title = `${data.name} — how investors responded`;
  const description = `${fmt(data.counts.total)} source-linked references across ${
    data.investors.length
  } investor record${data.investors.length === 1 ? "" : "s"}: what they said, what they did, and what happened next.`;

  return {
    title,
    description,
    alternates: { canonical: `/events/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "article", url: `/events/${slug}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const data = await getEventPage(slug);
  if (!data) notFound();

  const crumbs = [
    { label: "INVESTOR/PASS", href: "/" },
    { label: "EVENTS" },
    { label: data.name.toUpperCase() },
  ];
  const eventDescription =
    data.description ??
    `${fmt(data.counts.total)} source-linked references across ${data.investors.length} investor record${
      data.investors.length === 1 ? "" : "s"
    }.`;
  const startDate = asIsoDate(data.date);
  const jsonldHtml = serializeJsonLd([
    breadcrumbLd(crumbs),
    startDate
      ? entityJsonld("Event", {
          name: data.name,
          path: `/events/${data.slug}`,
          description: eventDescription,
          startDate,
        })
      : entityJsonld("WebPage", {
          name: data.name,
          path: `/events/${data.slug}`,
          description: eventDescription,
        }),
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonldHtml }} />
      <PageHead
        crumb={crumbs}
        title={data.name}
        meta={[
          ...(data.date ? [data.date.toUpperCase()] : []),
          `${fmt(data.counts.total)} INDEXED REFERENCES`,
          `${data.investors.length} INVESTOR${data.investors.length === 1 ? "" : "S"}`,
        ]}
        lede={
          data.description ||
          "What investors said, what they did, and what the record shows — organized around a moment that mattered."
        }
      />

      <section className="mt-10">
        <SectionLabel>WHAT THEY SAID — BY INVESTOR</SectionLabel>
        <div className="max-w-3xl">
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
        </div>
      </section>

      <ExploreNext
        groups={[
          {
            label: "INVESTORS IN THIS EVENT",
            links:
              data.investors.length > 0 ? (
                <ChipRow items={data.investors.slice(0, 8)} kind="investor" />
              ) : (
                <EmptyNote>—</EmptyNote>
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
