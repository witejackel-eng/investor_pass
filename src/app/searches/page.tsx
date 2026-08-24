import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /searches — REAL, shareable path for the authenticated saved-searches view
 * (replaces the #/view=searches hash island).
 *
 * Private/auth-gated surface: no SEO value, so robots noindex,follow so link
 * equity still flows to the crawled /search landing page it links to.
 */
export const metadata: Metadata = {
  title: "Saved searches — Investor/Pass",
  description:
    "Revisit your saved research questions — who talks about a theme, which sources document it, across 31 indexed investors.",
  alternates: { canonical: "/searches" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Saved searches — Investor/Pass",
    description:
      "Revisit your saved research questions across the indexed record.",
    type: "website",
    url: "/searches",
  },
};

export default function SearchesPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Saved searches</h1>
        <p>
          Your saved research questions on Investor/Pass — every query you've
          pinned, ready to revisit. See who talks about a theme, which sources
          document it, across 31 indexed investors and 12,078 paraphrased
          research units.
        </p>
        <ul>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/login">Log in to Investor/Pass</Link></li>
        </ul>
      </div>
      <AppRoot initialView="searches" />
    </>
  );
}
