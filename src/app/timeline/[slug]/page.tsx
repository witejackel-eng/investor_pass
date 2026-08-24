import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /timeline/[slug] — REAL, shareable, crawlable path for one investor's
 * chronological timeline (replaces the #/view=timeline&slug=… hash island).
 *
 * Per-investor timelines are real content worth indexing — letters, memos,
 * decisions, year by year — so robots index,follow. The route is dynamic (ƒ):
 * generateStaticParams returns [] so Next.js never tries to hit the DB at
 * build time (the known Task-10 crash cause).
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
  const title = "Timeline — Investor/Pass";
  const description =
    "A chronological timeline of one investor's indexed record — letters, memos, decisions, year by year.";
  return {
    title,
    description,
    alternates: { canonical: `/timeline/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "website", url: `/timeline/${slug}` },
  };
}

export default async function TimelinePage({ params }: Params) {
  const { slug } = await params;
  return (
    <>
      <div className="sr-only">
        <h1>Investor timeline</h1>
        <p>
          A chronological timeline of one investor's indexed record on
          Investor/Pass — shareholder letters, memos, speeches, interviews and
          decisions, year by year, every unit paraphrased and traceable to a
          publisher and a date. Historical reference, never investment advice.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/trails">Source-backed research trails</Link></li>
          <li><Link href="/search">Search the record</Link></li>
        </ul>
      </div>
      <AppRoot initialView="timeline" initialParams={{ slug }} />
    </>
  );
}
