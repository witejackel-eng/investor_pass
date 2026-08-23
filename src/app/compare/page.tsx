import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /compare — REAL, shareable, crawlable path for cross-investor compare
 * (replaces the #/view=compare hash island).
 */
export const metadata: Metadata = {
  title: "Compare investors on any idea",
  description:
    "Pick two investors and a theme — see shared indexed coverage, different emphasis in the indexed record, sources, companies and decisions. Evidence-oriented comparison across 31 exceptional investors.",
  alternates: { canonical: "/compare" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Compare investors — Investor/Pass",
    description: "One theme, two indexed records. Where they overlap, where the emphasis differs — every claim traceable to a source.",
    type: "website",
    url: "/compare",
  },
};

export default function ComparePage() {
  return (
    <>
      <div className="sr-only">
        <h1>Compare investors on any idea</h1>
        <p>
          The cross-investor wedge: study the same theme across two exceptional investors and see
          shared indexed coverage, different emphasis in the indexed record, the sources behind
          every unit, and the decisions that followed.
        </p>
        <ul>
          <li><Link href="/investors/marks/topics/risk-management">Howard Marks on Risk Management</Link></li>
          <li><Link href="/investors/buffett/topics/risk-management">Warren Buffett on Risk Management</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/investors">Browse all investors</Link></li>
        </ul>
      </div>
      <AppRoot initialView="compare" />
    </>
  );
}
