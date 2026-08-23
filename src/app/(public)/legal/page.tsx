import Link from "next/link";
import type { Metadata } from "next";
import { LEGAL_DOCS, LEGAL_UPDATED } from "@/lib/legal";


export const metadata: Metadata = {
  title: "Legal — Investor/Pass",
  description:
    "Terms of service, privacy policy, cookie policy, copyright notice, investment disclaimer, and refund policy for Investor/Pass.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/legal" },
};

export default function LegalIndexPage() {
  return (
    <div className="mx-auto max-w-3xl py-16">
      <p className="kicker">LEGAL — INVESTOR/PASS</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
        The fine print, properly indexed.
      </h1>
      <p className="prose-reader mt-4">
        Six documents govern the Service. They are written to be read, not buried.
        Last updated {LEGAL_UPDATED}.
      </p>
      <ul className="mt-10 divide-y divide-rule border-y border-ink">
        {LEGAL_DOCS.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/legal/${doc.slug}`}
              className="group block py-5 transition-colors hover:bg-paper-2"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
                  {doc.slug}
                </span>
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
                  UPDATED {doc.updated}
                </span>
              </div>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight group-hover:text-signal">
                {doc.title}
              </h2>
              <p className="mt-1 font-reader text-sm text-graphite">
                {doc.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
