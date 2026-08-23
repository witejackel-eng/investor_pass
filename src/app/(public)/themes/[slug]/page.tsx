import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getThemePage, themeExists } from "@/lib/server/public-pages";
import { breadcrumbLd, entityJsonld, serializeJsonLd } from "@/lib/server/jsonld";
import { Refreshing, Chip, EmptyNote, ExploreNext, PageHead, SectionLabel, fmt } from "../../ui";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

// Prerender every [slug] page in the corpus.
export async function generateStaticParams() {
  try {
    const rows = await db.theme.findMany({ select: { slug: true } });
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getThemePage(slug);
  if (!data) return { title: "Theme", robots: { index: false, follow: false } };

  const top = data.investors.slice(0, 4).map((i) => i.name.split(" ").pop()).join(", ");
  const title = `${data.name} — ${fmt(data.counts.total)} references across investors`;
  const description = `${fmt(data.counts.total)} source-linked references to ${data.name.toLowerCase()}${
    data.investors.length ? `, most from ${top}` : ""
  }${data.years.from ? ` (${data.years.from}–${data.years.to})` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: `/themes/${slug}` },
    robots: { index: data.counts.publicCount > 0, follow: true },
    openGraph: { title, description, type: "website", url: `/themes/${slug}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function ThemePage({ params }: Params) {
  const { slug } = await params;
  const data = await getThemePage(slug);
  if (!data) {
    if (await themeExists(slug)) return <Refreshing what="theme page" />;
    notFound();
  }

  const span =
    data.years.from && data.years.to ? `${data.years.from}–${data.years.to}` : null;

  const crumbs = [
    { label: "INVESTOR/PASS", href: "/" },
    { label: "THEMES" },
    { label: data.name.toUpperCase() },
  ];
  const jsonldHtml = serializeJsonLd([
    breadcrumbLd(crumbs),
    entityJsonld("WebPage", {
      name: data.name,
      path: `/themes/${data.slug}`,
      description:
        data.description ??
        `${fmt(data.counts.total)} source-linked references tagged ${data.name}.`,
      about: data.name,
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
          ...(span ? [span] : []),
        ]}
        lede={data.description}
      />

      <section className="mt-10">
        <SectionLabel>REFERENCED BY</SectionLabel>
        {data.investors.length > 0 ? (
          <ul className="max-w-3xl">
            {data.investors.map((inv) => (
              <li key={inv.slug} className="border-t border-border py-3 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <Link
                    href={`/investors/${inv.slug}`}
                    className="font-display text-lg font-semibold tracking-tight hover:text-[var(--signal-dark)]"
                  >
                    {inv.name}
                  </Link>
                  <p className="kicker">
                    {fmt(inv.total)} REFERENCES{inv.publicCount > 0 ? ` · ${fmt(inv.publicCount)} PUBLIC` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote>No investor references indexed yet.</EmptyNote>
        )}
      </section>

      <ExploreNext
        groups={[
          {
            label: "INVESTOR DEEP DIVES",
            links:
              data.investors.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.investors.slice(0, 6).map((inv) => (
                    <Chip
                      key={inv.slug}
                      href={`/investors/${inv.slug}/topics/${slug}`}
                      variant="signal"
                    >
                      {inv.name.split(" ")[0].toUpperCase()} ON {data.name.toUpperCase()} →
                    </Chip>
                  ))}
                </div>
              ) : (
                <EmptyNote>—</EmptyNote>
              ),
          },
          {
            label: "KEEP EXPLORING",
            links: (
              <div className="flex flex-wrap gap-1.5">
                <Link href="/investors" className="chip">
                  ALL INVESTORS →
                </Link>
                <a
                  href={`/#/view=search&q=${encodeURIComponent(data.name)}`}
                  className="chip chip-signal"
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
