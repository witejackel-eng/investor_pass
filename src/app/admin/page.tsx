import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /admin — REAL, shareable path for the in-app admin console
 * (replaces the #/view=admin hash island).
 *
 * Admin surface: never index, do not follow outbound links (admin context is
 * strictly staff-only). robots noindex,nofollow.
 */
export const metadata: Metadata = {
  title: "Admin — Investor/Pass",
  description: "Staff admin console for Investor/Pass.",
  alternates: { canonical: "/admin" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Admin — Investor/Pass",
    description: "Staff admin console for Investor/Pass.",
    type: "website",
    url: "/admin",
  },
};

export default function AdminPage() {
  return (
    <>
      <div className="sr-only">
        <h1>Admin</h1>
        <p>
          Staff admin console for Investor/Pass. Restricted to authorised
          staff; not for public use.
        </p>
        <ul>
          <li><Link href="/">Investor/Pass homepage</Link></li>
          <li><Link href="/login">Log in</Link></li>
        </ul>
      </div>
      <AppRoot initialView="admin" />
    </>
  );
}
