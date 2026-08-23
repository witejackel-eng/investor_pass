import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /search — REAL, shareable, crawlable path for the flagship search surface
 * (replaces the #/view=search hash island, which engines cannot index).
 *
 * SEO policy:
 * - Bare /search → indexable landing with server-rendered content + links.
 * - /search?q=… → noindex,follow (infinite query space; Google guideline for
 *   internal search results). The app mounts on top for humans.
 * - Internal app navigation continues via the hash router inside AppRoot.
 */
type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `“${q}” — search the record` : "Search the record";
  const description = q
    ? `Investor/Pass research results for “${q}” — who talks about it, which sources document it, across 31 indexed investors.`
    : "Search across 31 exceptional investors — 619 sources and 12,078 paraphrased research units, every one with provenance. Ask one question, see who talks about it.";
  return {
    title,
    description,
    alternates: { canonical: "/search" },
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, type: "website", url: "/search" },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return (
    <>
      {/* Server-rendered SEO content — crawlable even without JS */}
      <div className="sr-only">
        <h1>Search the record</h1>
        <p>
          Investor/Pass search covers 31 investors, 619 sources and 12,078 paraphrased research
          units — shareholder letters, memos, speeches and interviews, every unit traceable to a
          publisher and a date. Ask one question and see who talks about it.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/themes/risk-management">Risk Management — canonical theme</Link></li>
          <li><Link href="/themes/inflation">Inflation — canonical theme</Link></li>
          <li><Link href="/themes/capital-allocation">Capital Allocation — canonical theme</Link></li>
          <li><Link href="/compare">Compare investors on a theme</Link></li>
          <li><Link href="/learn">How finance works — explainers</Link></li>
          <li><Link href="/trails">Source-backed research trails</Link></li>
        </ul>
      </div>
      <AppRoot initialView="search" initialParams={q ? { q } : undefined} />
    </>
  );
}
