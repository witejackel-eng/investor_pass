import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /bookmarks — REAL, shareable path for the authenticated bookmarks library
 * (replaces the #/view=bookmarks hash island).
 *
 * Private/auth-gated surface: no SEO value, so robots noindex,follow so link
 * equity still flows to the crawled investor/source/passage pages it links to.
 */
export const metadata: Metadata = {
  title: "Bookmarks — Investor/Pass",
  description:
    "Save individual research units — passages, sources, themes — to your personal bookmark library across the indexed record.",
  alternates: { canonical: "/bookmarks" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Bookmarks — Investor/Pass",
    description:
      "Save individual research units to your personal bookmark library across the indexed record.",
    type: "website",
    url: "/bookmarks",
  },
};

export default function BookmarksPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Bookmarks</h1>
        <p>
          Your personal bookmark library on Investor/Pass — save individual
          paraphrased research units, sources, themes and companies from across
          the indexed record and return to them later. Every bookmark keeps its
          provenance: a publisher and a date.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/library">Your research library</Link></li>
          <li><Link href="/login">Log in to Investor/Pass</Link></li>
        </ul>
      </div>
      <AppRoot initialView="bookmarks" />
    </>
  );
}
