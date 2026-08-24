import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /upgrade — REAL, shareable, clean path for the Pro upgrade view
 * (replaces the #/view=upgrade hash island).
 *
 * robots noindex: commercial/checkout pages have no SEO value; the
 * canonical marketing pitch lives on the homepage and /learn.
 */
export const metadata: Metadata = {
  title: "Upgrade to Pro — Investor/Pass",
  description:
    "Investor/Pass Pro unlocks the full indexed library, cross-investor compare, the watchlist and saved searches — the complete research surface across 31 exceptional investors.",
  alternates: { canonical: "/upgrade" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Upgrade to Investor/Pass Pro",
    description:
      "Unlock the full library, cross-investor compare, watchlist and saved searches.",
    type: "website",
    url: "/upgrade",
  },
};

export default function UpgradePage() {
  return (
    <>
      <div className="sr-only">
        <h1>Upgrade to Investor/Pass Pro</h1>
        <p>
          Pro unlocks the full indexed library — 619 sources and 12,078
          paraphrased research units — plus cross-investor compare on any
          theme, the watchlist, saved searches and collections. $9/month or
          $79/year, cancel anytime.
        </p>
        <ul>
          <li><Link href="/investors">Browse all 31 investors</Link></li>
          <li><Link href="/login">Already a member? Log in</Link></li>
          <li><Link href="/legal/terms">Terms of service</Link></li>
        </ul>
      </div>
      <AppRoot initialView="upgrade" />
    </>
  );
}
