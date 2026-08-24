import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /watchlist — REAL, shareable path for the authenticated watchlist
 * (replaces the #/view=watchlist hash island).
 *
 * Private/auth-gated surface: no SEO value, so robots noindex,follow so link
 * equity still flows to the crawled investor/theme/source pages it links to.
 */
export const metadata: Metadata = {
  title: "Your watchlist — Investor/Pass",
  description:
    "Track companies, themes and sources you're following across the indexed record — see new coverage as it lands.",
  alternates: { canonical: "/watchlist" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Your watchlist — Investor/Pass",
    description:
      "Track companies, themes and sources you're following across the indexed record.",
    type: "website",
    url: "/watchlist",
  },
};

export default function WatchlistPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Your watchlist</h1>
        <p>
          The Investor/Pass watchlist tracks the companies, themes and sources
          you're following across the indexed record. As new paraphrased
          research units land — letters, memos, speeches, interviews — your
          watchlist surfaces them in one place, every unit traceable to a
          publisher and a date.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/login">Log in to Investor/Pass</Link></li>
        </ul>
      </div>
      <AppRoot initialView="watchlist" />
    </>
  );
}
