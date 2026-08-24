import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /collections — REAL, shareable path for the authenticated collections view
 * (replaces the #/view=collections hash island).
 *
 * Private/auth-gated surface: no SEO value, so robots noindex,follow so link
 * equity still flows to the crawled investor/library pages it links to.
 */
export const metadata: Metadata = {
  title: "Collections — Investor/Pass",
  description:
    "Group your research — passages, sources, themes and companies — into named collections you can revisit and share.",
  alternates: { canonical: "/collections" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Collections — Investor/Pass",
    description:
      "Group your research into named collections you can revisit and share.",
    type: "website",
    url: "/collections",
  },
};

export default function CollectionsPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Collections</h1>
        <p>
          Group your research on Investor/Pass — passages, sources, themes and
          companies — into named collections you can revisit, annotate and
          share. Every item keeps its provenance: a publisher and a date.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/library">Your research library</Link></li>
          <li><Link href="/login">Log in to Investor/Pass</Link></li>
        </ul>
      </div>
      <AppRoot initialView="collections" />
    </>
  );
}
