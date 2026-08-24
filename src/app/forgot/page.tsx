import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /forgot — REAL, shareable path for the password-reset request form
 * (replaces the #/view=forgot hash island).
 *
 * Auth flow surface: no SEO value, so robots noindex,follow so link equity
 * still flows to the crawled /login and /signup pages it links to.
 */
export const metadata: Metadata = {
  title: "Reset your password — Investor/Pass",
  description:
    "Request a password reset link for your Investor/Pass account — we'll email you a one-time recovery link.",
  alternates: { canonical: "/forgot" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Reset your password — Investor/Pass",
    description:
      "Request a password reset link for your Investor/Pass account.",
    type: "website",
    url: "/forgot",
  },
};

export default function ForgotPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Reset your password</h1>
        <p>
          Password recovery on Investor/Pass — enter the email tied to your
          account and we'll send a one-time recovery link. The link expires
          quickly and only works once, so check your inbox promptly.
        </p>
        <ul>
          <li><Link href="/login">Log in to Investor/Pass</Link></li>
          <li><Link href="/signup">Create an Investor/Pass account</Link></li>
          <li><Link href="/">Back to the Investor/Pass homepage</Link></li>
        </ul>
      </div>
      <AppRoot initialView="forgot" />
    </>
  );
}
