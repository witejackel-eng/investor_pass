import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /sources/[slug] — REAL, shareable, crawlable path for an individual source
 * (replaces the #/view=source&slug=… hash island).
 *
 * Sources are too many (619) to prerender; the route is dynamic (ƒ) and
 * AppRoot fetches the source client-side. generateStaticParams returns []
 * so Next.js never tries to hit the DB at build time.
 */
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const title = `${slug} — source in the record`;
  const description =
    "An indexed source in the Investor/Pass library — shareholder letters, memos, speeches, interviews, every unit traceable to a publisher and a date.";
  return {
    title,
    description,
    alternates: { canonical: `/sources/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "website", url: `/sources/${slug}` },
  };
}

export default async function SourcePage({ params }: Params) {
  const { slug } = await params;
  return (
    <>
      <div className="sr-only">
        <h1>Source in the record</h1>
        <p>
          An indexed source in the Investor/Pass library — shareholder letters,
          memos, speeches and interviews, every paraphrased research unit
          traceable to this publisher and a date. Provenance is the foundation
          of the record: follow every claim back to its origin.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/trails">Source-backed research trails</Link></li>
        </ul>
      </div>
      <AppRoot initialView="source" initialParams={{ slug }} />
    </>
  );
}
