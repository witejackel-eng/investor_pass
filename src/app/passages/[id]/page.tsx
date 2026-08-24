import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /passages/[id] — REAL, shareable, clean path for an individual research unit
 * (replaces the #/view=passage&id=… hash island).
 *
 * Individual paraphrased passages are many (12,078) and thin — noindex per
 * Google internal-search guidance; follow so link equity still flows. The
 * route is dynamic (ƒ): generateStaticParams returns [] so Next.js never
 * tries to hit the DB at build time.
 */
type Params = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  try {
    return [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Research unit — Investor/Pass",
    description:
      "A single paraphrased research unit with source attribution — historical reference, never investment advice.",
    alternates: { canonical: `/passages/${id}` },
    robots: { index: false, follow: true },
    openGraph: {
      title: "Research unit — Investor/Pass",
      description:
        "A single paraphrased research unit with source attribution — historical reference, never investment advice.",
      type: "website",
      url: `/passages/${id}`,
    },
  };
}

export default async function PassagePage({ params }: Params) {
  const { id } = await params;
  return (
    <>
      <div className="sr-only">
        <h1>Research unit</h1>
        <p>
          A single paraphrased research unit in the Investor/Pass library.
          Every unit is traceable to a source — a shareholder letter, memo,
          speech or interview — with a publisher and a date. Historical
          reference, never investment advice.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/legal/disclaimer">Disclaimer</Link></li>
        </ul>
      </div>
      <AppRoot initialView="passage" initialParams={{ id }} />
    </>
  );
}
