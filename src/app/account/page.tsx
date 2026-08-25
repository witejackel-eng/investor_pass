import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /account — REAL, shareable path for the authenticated account view
 * (replaces the #/view=account hash island).
 *
 * Private/auth-gated surface: no SEO value, so robots noindex,follow so link
 * equity still flows to the crawled /upgrade and /legal/terms pages it links to.
 */
export const metadata: Metadata = {
  title: "Account — Investor/Pass",
  description:
    "Manage your Investor/Pass subscription, profile and settings — billing, password, preferences.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Account — Investor/Pass",
    description:
      "Manage your Investor/Pass subscription, profile and settings.",
    type: "website",
    url: "/account",
  },
};

export default function AccountPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Your account</h1>
        <p>
          Manage your Investor/Pass subscription, profile and settings — billing,
          password, email preferences, and your plan. Your subscription powers
          the indexed record: investors and founders, sources and paraphrased
          research units, every one with provenance.
        </p>
        <ul>
          <li><Link href="/login">Log in to Investor/Pass</Link></li>
          <li><Link href="/upgrade">Upgrade to Investor/Pass Pro</Link></li>
          <li><Link href="/legal/terms">Terms of service</Link></li>
        </ul>
      </div>
      <AppRoot initialView="account" />
    </>
  );
}
