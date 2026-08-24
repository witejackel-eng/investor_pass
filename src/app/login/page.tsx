import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /login — REAL, shareable, clean path for the login view
 * (replaces the #/view=login hash island).
 *
 * robots noindex: auth pages have no SEO value.
 */
export const metadata: Metadata = {
  title: "Log in — Investor/Pass",
  description:
    "Log in to Investor/Pass to access the full indexed library — 619 sources and 12,078 paraphrased research units across 31 exceptional investors.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Log in — Investor/Pass",
    description:
      "Access the full indexed library of shareholder letters, memos, speeches and interviews.",
    type: "website",
    url: "/login",
  },
};

export default function LoginPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Log in to Investor/Pass</h1>
        <p>
          Sign in to access the full indexed library — every shareholder letter,
          memo, speech and interview across 31 exceptional investors, each unit
          traceable to a publisher and a date.
        </p>
        <ul>
          <li><Link href="/signup">Create an account</Link></li>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/">Back to the public record</Link></li>
        </ul>
      </div>
      <AppRoot initialView="login" />
    </>
  );
}
