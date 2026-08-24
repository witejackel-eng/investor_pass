import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /signup — REAL, shareable, clean path for the signup view
 * (replaces the #/view=signup hash island).
 *
 * robots noindex: auth pages have no SEO value.
 */
export const metadata: Metadata = {
  title: "Sign up — Investor/Pass",
  description:
    "Join Investor/Pass to unlock the full indexed library — 619 sources and 12,078 paraphrased research units across 31 exceptional investors, every claim traceable to a source.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Sign up — Investor/Pass",
    description:
      "Join Investor/Pass to unlock the full indexed library and follow the evidence.",
    type: "website",
    url: "/signup",
  },
};

export default function SignupPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Sign up for Investor/Pass</h1>
        <p>
          Create an account to join the public record properly indexed —
          shareholder letters, memos, speeches and interviews from 31 exceptional
          investors, every unit with provenance you can verify.
        </p>
        <ul>
          <li><Link href="/login">Already have an account? Log in</Link></li>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/learn">How finance works — explainers</Link></li>
        </ul>
      </div>
      <AppRoot initialView="signup" />
    </>
  );
}
