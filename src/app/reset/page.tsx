import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /reset — REAL, shareable path for the password-reset confirm form
 * (replaces the #/view=reset&token=… hash island).
 *
 * Reads ?token=… from the URL and forwards it to the SPA via initialParams.
 * Auth flow surface: no SEO value, so robots noindex,follow so link equity
 * still flows to the crawled /login and /forgot pages it links to.
 */
type Props = { searchParams: Promise<{ token?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  await searchParams;
  return {
    title: "Set a new password — Investor/Pass",
    description:
      "Set a new password for your Investor/Pass account using the one-time recovery token emailed to you.",
    alternates: { canonical: "/reset" },
    robots: { index: false, follow: true },
    openGraph: {
      title: "Set a new password — Investor/Pass",
      description:
        "Set a new password for your Investor/Pass account using the one-time recovery token emailed to you.",
      type: "website",
      url: "/reset",
    },
  };
}

export default async function ResetPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <>
      <div className="sr-only">
        <h1>Set a new password</h1>
        <p>
          Set a new password for your Investor/Pass account using the one-time
          recovery token emailed to you. The token expires quickly and only
          works once — if it has expired, request a fresh link.
        </p>
        <ul>
          <li><Link href="/login">Log in to Investor/Pass</Link></li>
          <li><Link href="/forgot">Request a new recovery link</Link></li>
          <li><Link href="/">Back to the Investor/Pass homepage</Link></li>
        </ul>
      </div>
      <AppRoot initialView="reset" initialParams={token ? { token } : undefined} />
    </>
  );
}
