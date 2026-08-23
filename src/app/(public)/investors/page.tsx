
import type { Metadata } from "next";
import Link from "next/link";
import { getInvestorDirectory } from "@/lib/server/public-pages";
import { Chip, EmptyNote, PageHead, SectionLabel, fmt, spaSearch } from "../ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Investor Directory",
  description:
    "Study the public record of exceptional investors — Buffett, Munger, Marks, Bogle and more. Source-linked references, themes, companies and events.",
  alternates: { canonical: "/investors" },
  openGraph: {
    title: "Investor Directory — the public record of exceptional investors",
    description:
      "Source-linked research pages for the launch universe of exceptional investors: references, themes, companies, events and timelines.",
    type: "website",
    url: "/investors",
  },
  twitter: {
    card: "summary",
    title: "Investor Directory — Investor/Pass",
    description:
      "The public record of exceptional investors, properly indexed. References, themes, companies, events.",
  },
};

export default async function InvestorsPage() {
  // Build-time resilience: if the database is unreachable during prerender,
  // render an empty directory rather than failing the deploy. ISR
  // (revalidate = 3600) replaces it with the real page on first revalidation.
  const people = (await getInvestorDirectory()) ?? [];
  const totalRefs = people.reduce((s, p) => s + p.counts.total, 0);

  return (
    <div>
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "INVESTORS" }]}
        title="The investor directory"
        meta={[
          `${people.length} INVESTORS`,
          `${fmt(totalRefs)} INDEXED REFERENCES`,
          "PRIMARY SOURCES · PARAPHRASED SUMMARIES",
        ]}
        lede="Letters, memos, speeches, interviews and decisions — every investor below has a documented public record, indexed and cross-linked. Follow any name into the graph: shared themes, shared companies, shared arguments."
      />

      <section className="mt-12">
        <SectionLabel>ACTIVE COLLECTION</SectionLabel>
        <div className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <article key={p.slug} className="border-t border-border py-5">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                <Link href={`/investors/${p.slug}`} className="nav-link hover:text-[var(--signal-dark)]">
                  {p.name}
                </Link>
              </h2>
              <p className="kicker mt-1">
                {fmt(p.counts.total)} REFERENCES · {p.counts.sources} SOURCES
              </p>
              {p.shortDescription ? (
                <EmptyNote>{p.shortDescription}</EmptyNote>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/investors/${p.slug}`}
                  className="chip chip-ink"
                >
                  OPEN PROFILE →
                </Link>
                <Chip href={spaSearch(p.name)}>SEARCH IN APP →</Chip>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="gate mt-12 max-w-2xl">
        <p className="font-display text-lg font-semibold tracking-tight">
          The full library goes deeper.
        </p>
        <p className="prose-reader mt-2">
          Every reference searchable, all premium passages unlocked, comparison
          tools, and your own saved research — bookmarks, collections and alerts.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="/#/view=upgrade"
            className="bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]"
          >
            START PRO — $19/MONTH
          </a>
          <span className="kicker">OR $149/YEAR — 12 MONTHS FOR THE PRICE OF 8</span>
        </div>
      </aside>
    </div>
  );
}

