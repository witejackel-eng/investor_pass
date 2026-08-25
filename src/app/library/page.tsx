import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /library — REAL, shareable, clean path for the library view
 * (replaces the #/view=library hash island).
 *
 * robots noindex: the library requires auth and renders empty for crawlers;
 * the indexable surface is the per-source and per-investor pages.
 */
export const metadata: Metadata = {
  title: "The library — Investor/Pass",
  description:
    "The full indexed corpus of shareholder letters, memos, speeches and interviews from investors and founders — every paraphrased research unit traceable to a publisher and a date.",
  alternates: { canonical: "/library" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "The library — Investor/Pass",
    description:
      "The full indexed corpus of shareholder letters, memos, speeches and interviews.",
    type: "website",
    url: "/library",
  },
};

export default function LibraryPage() {
  return (
    <>
      <div className="sr-only">
        <h1>The library</h1>
        <p>
          The Investor/Pass library is the full indexed corpus — shareholder
          letters, memos, speeches and interviews from investors and founders,
          every unit traceable to a publisher and a date.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/login">Log in to access the library</Link></li>
        </ul>
      </div>
      <AppRoot initialView="library" />
    </>
  );
}
