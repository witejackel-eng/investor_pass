import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /graph — REAL, shareable, crawlable path for the evidence-graph view
 * (replaces the #/view=graph hash island).
 *
 * The evidence graph is a feature worth indexing: it is the canonical
 * visualisation of how every investor, source, theme, company and decision
 * connects in the corpus.
 */
export const metadata: Metadata = {
  title: "Evidence graph — Investor/Pass",
  description:
    "Explore the connected record: 13,000 nodes and 29,663 edges linking investors, sources, themes, companies and decisions. Trace every claim to its origin.",
  alternates: { canonical: "/graph" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Evidence graph — Investor/Pass",
    description:
      "Explore the connected record: 13,000 nodes and 29,663 edges linking investors, sources, themes, companies and decisions. Trace every claim to its origin.",
    type: "website",
    url: "/graph",
  },
};

export default function GraphPage() {
  return (
    <>
      <div className="sr-only">
        <h1>The evidence graph</h1>
        <p>
          The Investor/Pass evidence graph connects the entire corpus —
          31 investors, 619 sources, 12,078 paraphrased research units, 13,000
          nodes and 29,663 edges linking investors, sources, themes, companies
          and decisions. Explore the connections and trace every claim to its
          origin.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/trails">Source-backed research trails</Link></li>
        </ul>
      </div>
      <AppRoot initialView="graph" />
    </>
  );
}
