
import type { Metadata } from "next";
import Link from "next/link";
import { getFounderDirectory } from "@/lib/server/public-pages";
import { Chip, EmptyNote, PageHead, SectionLabel, fmt, spaSearch } from "../ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Founder Directory",
  description:
    "Study the public record of exceptional Chinese and Indian business founders — Jack Ma, Pony Ma, Mukesh Ambani, Ratan Tata, Azim Premji and more. Source-linked references, themes, companies and events.",
  alternates: { canonical: "/founders" },
  openGraph: {
    title: "Founder Directory — the public record of Eastern business founders",
    description:
      "Source-linked research pages for the launch universe of Chinese and Indian business founders: references, themes, companies, events and timelines.",
    type: "website",
    url: "/founders",
  },
  twitter: {
    card: "summary",
    title: "Founder Directory — Investor/Pass",
    description:
      "The public record of Chinese and Indian business founders, properly indexed. References, themes, companies, events.",
  },
};

type SearchParams = { region?: string };

export default async function FoundersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Build-time resilience: if the database is unreachable during prerender,
  // render an empty directory rather than failing the deploy. ISR
  // (revalidate = 3600) replaces it with the real page on first revalidation.
  const all = (await getFounderDirectory()) ?? [];
  const sp = await searchParams;
  const regionParam = sp.region?.toLowerCase();
  const region =
    regionParam === "china" || regionParam === "india" ? regionParam : null;

  // Server-side filter on `region` (one row already carries it). The All
  // view (region=null) shows every founder; China / India narrow the lens.
  const people = region ? all.filter((p) => p.region === region) : all;
  const totalRefs = people.reduce((s, p) => s + p.counts.total, 0);

  // Region filter — plain anchor links so server-side filtering stays
  // crawlable (no client JS required). The active state mirrors the
  // chip-ink treatment used elsewhere on the site.
  const filterHref = (r: "all" | "china" | "india") =>
    r === "all" ? "/founders" : `/founders?region=${r}`;
  const isActive = (r: "all" | "china" | "india") =>
    (r === "all" && !region) || (r !== "all" && region === r);
  const filterChip = (label: string, r: "all" | "china" | "india") => (
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
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "FOUNDERS" }]}
        title="The founder directory"
        meta={[
          `${all.length} FOUNDERS`,
          `${fmt(totalRefs)} PARAPHRASED REFERENCES`,
          "CHINA · INDIA",
        ]}
        lede="Letters, speeches, interviews, shareholder communications and decisions — every founder below has a documented public record, indexed and cross-linked. The Eastern operating builders sit alongside the Western capital allocators: shared themes, shared companies, shared arguments."
      />

      <section className="mt-8">
        <SectionLabel>FILTER BY REGION</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {filterChip("ALL", "all")}
          {filterChip("CHINA", "china")}
          {filterChip("INDIA", "india")}
        </div>
      </section>

      <section className="mt-12">
        <SectionLabel>
          {region ? `${region.toUpperCase()} COLLECTION` : "ACTIVE COLLECTION"}
        </SectionLabel>
        <div className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <article key={p.slug} className="border-t border-border py-5">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                <Link
                  href={`/founders/${p.slug}`}
                  className="nav-link hover:text-[var(--signal-dark)]"
                >
                  {p.name}
                </Link>
              </h2>
              <p className="kicker mt-1">
                {fmt(p.counts.total)} REFERENCES · {p.counts.sources} SOURCES
                {p.region ? ` · ${p.region.toUpperCase()}` : ""}
              </p>
              {p.shortDescription ? (
                <EmptyNote>{p.shortDescription}</EmptyNote>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/founders/${p.slug}`} className="chip chip-ink">
                  OPEN PROFILE →
                </Link>
                <Chip href={spaSearch(p.name)}>SEARCH IN APP →</Chip>
              </div>
            </article>
          ))}
        </div>
        {people.length === 0 ? (
          <EmptyNote>
            The founder collection is being indexed — paraphrased passages with
            full source attribution land here shortly. Explore the active
            investors in the meantime.
          </EmptyNote>
        ) : null}
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
            href="/upgrade"
            className="bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]"
          >
            START PRO — $9/MONTH
          </a>
          <span className="kicker">OR $79/YEAR — SAVE 27%</span>
        </div>
      </aside>
    </div>
  );
}
