
import type { Metadata } from "next";
import Link from "next/link";
import { getCompanyDirectory } from "@/lib/server/public-pages";
import { Chip, EmptyNote, PageHead, SectionLabel, fmt, spaSearch } from "../ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Company Directory",
  description:
    "Every company in the indexed record — Berkshire Hathaway, Coca-Cola, Apple, Amazon, Standard Oil, Tata Steel and more — with source-linked references, themes, investors and documented decisions.",
  alternates: { canonical: "/companies" },
  openGraph: {
    title: "Company Directory — the public record, company by company",
    description:
      "Source-linked research pages for every indexed company: references, themes, linked investors and founders, and documented decisions.",
    type: "website",
    url: "/companies",
  },
  twitter: {
    card: "summary",
    title: "Company Directory — Investor/Pass",
    description:
      "The public record, company by company. References, themes, decisions — all source-linked.",
  },
};

type SearchParams = { industry?: string };

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Build-time resilience: if the database is unreachable during prerender,
  // render an empty directory rather than failing the deploy. ISR
  // (revalidate = 3600) replaces it with the real page on first revalidation.
  const all = (await getCompanyDirectory()) ?? [];
  const sp = await searchParams;

  // Industry filter — server-side on the row's industry, crawlable plain
  // anchor links (no client JS), same pattern as the founders region filter.
  const industries = Array.from(
    new Set(all.map((c) => c.industry).filter((i): i is string => Boolean(i))),
  ).sort((a, b) => a.localeCompare(b));
  const industryParam = sp.industry?.toLowerCase();
  const industry = industries.find((i) => i.toLowerCase() === industryParam) ?? null;

  const people = industry ? all.filter((c) => c.industry === industry) : all;
  const totalRefs = people.reduce((s, c) => s + c.counts.passages, 0);
  const linkedCompanies = all.filter((c) => c.counts.passages > 0).length;

  const filterHref = (r: string | null) =>
    r ? `/companies?industry=${encodeURIComponent(r)}` : "/companies";
  const isActive = (r: string | null) => (r === null && !industry) || (r !== null && industry === r);
  const filterChip = (label: string, r: string | null) => (
    <Link
      href={filterHref(r)}
      className={`chip ${isActive(r) ? "chip-ink" : ""}`}
      aria-current={isActive(r) ? "page" : undefined}
    >
      {label}
    </Link>
  );

  return (
    <div>
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "COMPANIES" }]}
        title="The company directory"
        meta={[
          `${fmt(all.length)} COMPANIES`,
          `${fmt(totalRefs)} LINKED REFERENCES`,
          `${fmt(linkedCompanies)} WITH INDEXED RECORDS`,
        ]}
        lede="Every company in the indexed public record — the businesses the investors and founders of this library actually ran, bought, studied, and fought over. Company pages carry source-linked references, themes, the people connected to them, and documented decisions."
      />

      {industries.length > 1 ? (
        <section className="mt-8">
          <SectionLabel>FILTER BY INDUSTRY</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {filterChip("ALL", null)}
            {industries.map((i) => filterChip(i.toUpperCase(), i))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <SectionLabel>
          {industry ? `${industry.toUpperCase()} COMPANIES` : "ALL COMPANIES"}
        </SectionLabel>
        <div className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((c) => (
            <article key={c.slug} className="border-t border-border py-5">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                <Link
                  href={`/companies/${c.slug}`}
                  className="nav-link hover:text-[var(--signal-dark)]"
                >
                  {c.name}
                </Link>
              </h2>
              <p className="kicker mt-1">
                {c.ticker ? `${c.ticker} · ` : ""}
                {c.industry ?? "UNCLASSIFIED"}
              </p>
              <p className="kicker mt-1">
                {fmt(c.counts.passages)} REFERENCES
                {c.counts.people > 0 ? ` · ${c.counts.people} ${c.counts.people === 1 ? "PERSON" : "PEOPLE"}` : ""}
                {c.counts.decisions > 0 ? ` · ${c.counts.decisions} ${c.counts.decisions === 1 ? "DECISION" : "DECISIONS"}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/companies/${c.slug}`} className="chip chip-ink">
                  OPEN COMPANY →
                </Link>
                <Chip href={spaSearch(c.name)}>SEARCH IN APP →</Chip>
              </div>
            </article>
          ))}
        </div>
        {people.length === 0 ? (
          <EmptyNote>
            The company directory is being indexed — companies with paraphrased,
            source-linked references land here shortly. Explore the investors
            and founders in the meantime.
          </EmptyNote>
        ) : null}
      </section>
    </div>
  );
}
