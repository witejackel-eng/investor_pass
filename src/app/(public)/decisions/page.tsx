import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getDecisionLedger, type DecisionLedgerFilter } from "@/lib/server/public-pages";
import { breadcrumbLd, serializeJsonLd } from "@/lib/server/jsonld";
import { Crumb, EmptyNote, PageHead, SectionLabel, fmt, spaSearch } from "../ui";
import { ExternalLink, Scale, Filter, X } from "lucide-react";

export const revalidate = 3600;

type SearchParams = {
  company?: string;
  theme?: string;
  year?: string;
  person?: string;
};

export const metadata: Metadata = {
  title: "Decision Ledger — documented investor decisions with outcomes",
  description:
    "Every documented decision in the library: what was said, what was done, what happened next. Filter by company, year, or theme. The clearest differentiator of Investor/Pass.",
  alternates: { canonical: "/decisions" },
  openGraph: {
    title: "Decision Ledger — Investor/Pass",
    description:
      "What was said, what was done, what happened next. Filter by company, year, or theme.",
    url: "/decisions",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default async function DecisionLedgerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filter: DecisionLedgerFilter = {
    companySlug: sp.company || undefined,
    themeSlug: sp.theme || undefined,
    year: sp.year || undefined,
    personSlug: sp.person || undefined,
  };

  const data = await getDecisionLedger(filter);

  if (!data) {
    return (
      <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHead
          crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "DECISIONS" }]}
          title="Decision Ledger"
          meta={["Refreshing"]}
          lede="The Decision Ledger is being refreshed. Please return within the hour."
        />
      </div>
    );
  }

  const activeFilters: { label: string; param: string; value: string }[] = [];
  if (sp.company) activeFilters.push({ label: "Company", param: "company", value: sp.company });
  if (sp.theme) activeFilters.push({ label: "Theme", param: "theme", value: sp.theme });
  if (sp.year) activeFilters.push({ label: "Year", param: "year", value: sp.year });
  if (sp.person) activeFilters.push({ label: "Investor", param: "person", value: sp.person });

  // Build a "clear filter" URL (drop one param, keep the rest)
  const clearOne = (param: string) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k !== param && v) next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `/decisions?${qs}` : "/decisions";
  };

  // Build an "add filter" URL (set one param, keep the rest)
  const addFilter = (param: string, value: string) => {
    const next = new URLSearchParams(sp as Record<string, string>);
    next.set(param, value);
    return `/decisions?${next.toString()}`;
  };

  const jsonld = serializeJsonLd([
    breadcrumbLd([{ label: "Investor/Pass", href: "/" }, { label: "Decision Ledger", href: "/decisions" }]),
  ]);

  const actionColor = (a?: string | null) =>
    a === "acquired" || a === "invested" || a === "initiated" || a === "increased"
      ? "chip chip-signal"
      : a === "exited" || a === "sold" || a === "reduced"
      ? "chip"
      : "chip chip-ink";

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonld }} />

      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "DECISIONS" }]}
        title="Decision Ledger"
        meta={[
          `${fmt(data.total)} documented decisions`,
          `${fmt(data.filtered)}${data.filtered !== data.total ? " shown" : " total"}`,
          "Every outcome sourced",
        ]}
        lede="The clearest differentiator of Investor/Pass. Every decision follows the same structure: what was said, what was done, what happened next — with a primary source link for every outcome."
      />

      {/* ── Filter bar ── */}
      <section className="mt-8 border-t-2 border-ink pt-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-signal-dark" />
          <p className="kicker text-signal-dark">FILTER</p>
          {activeFilters.length > 0 && (
            <Link href="/decisions" className="ml-auto chip hover:chip-signal">
              <X className="h-3 w-3" /> CLEAR ALL
            </Link>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <Link
                key={f.param}
                href={clearOne(f.param)}
                className="chip chip-ink inline-flex items-center gap-1.5"
                title={`Clear ${f.label} filter`}
              >
                <span className="font-mono text-[0.55rem] uppercase tracking-wider text-graphite">{f.label}</span>
                <span className="capitalize">{f.value.replace(/-/g, " ")}</span>
                <X className="h-3 w-3" />
              </Link>
            ))}
          </div>
        )}

        {/* Facet chips — collapsible rows */}
        <div className="mt-4 space-y-3">
          {/* Investors */}
          {data.facets.persons.length > 0 && (
            <FacetRow
              label="INVESTORS"
              items={data.facets.persons.slice(0, 12).map((p) => ({
                slug: p.slug,
                name: p.name,
                count: p.count,
                href: addFilter("person", p.slug),
              }))}
            />
          )}
          {/* Companies */}
          {data.facets.companies.length > 0 && (
            <FacetRow
              label="COMPANIES"
              items={data.facets.companies.slice(0, 12).map((c) => ({
                slug: c.slug,
                name: c.name,
                count: c.count,
                href: addFilter("company", c.slug),
              }))}
            />
          )}
          {/* Themes */}
          {data.facets.themes.length > 0 && (
            <FacetRow
              label="THEMES"
              items={data.facets.themes.slice(0, 12).map((t) => ({
                slug: t.slug,
                name: t.name,
                count: t.count,
                href: addFilter("theme", t.slug),
              }))}
            />
          )}
          {/* Years */}
          {data.facets.years.length > 0 && (
            <FacetRow
              label="YEARS"
              items={data.facets.years.slice(-12).map((y) => ({
                slug: y.year,
                name: y.year,
                count: y.count,
                href: addFilter("year", y.year),
              }))}
            />
          )}
        </div>
      </section>

      {/* ── Decision timeline ── */}
      <section className="mt-10">
        <div className="flex items-center gap-2 border-t-2 border-ink pt-4">
          <Scale className="h-5 w-5" />
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {fmt(data.filtered)} {data.filtered === 1 ? "decision" : "decisions"}
          </h2>
          <span className="kicker ml-auto">STATEMENT → DECISION → OUTCOME</span>
        </div>

        {data.decisions.length === 0 ? (
          <EmptyNote>
            <p className="mt-2 font-reader text-sm text-graphite">
              No verified decisions match this filter.{" "}
              <Link href="/decisions" className="underline hover:text-ink">Clear filters</Link> to see all {fmt(data.total)} decisions.
            </p>
          </EmptyNote>
        ) : (
          <div className="mt-6 space-y-0">
            {data.decisions.map((d) => (
              <article
                key={d.id}
                className="border-l-2 border-rule pl-4 pb-8 ml-2 relative"
              >
                <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-signal-dark" />

                {/* Date + action + confidence */}
                <p className="font-mono text-xs uppercase tracking-wider text-graphite">
                  {d.date ?? "N.D."}
                  {d.action && (
                    <span className={`ml-2 ${actionColor(d.action)} px-1`}>{d.action.toUpperCase()}</span>
                  )}
                  {d.confidence === "medium" && <span className="ml-2 text-signal">· MEDIUM CONFIDENCE</span>}
                  {d.confidence === "inferred" && <span className="ml-2 text-graphite">· INFERRED</span>}
                </p>

                {/* Title */}
                <h3 className="mt-1 font-display text-lg font-semibold leading-tight">{d.title}</h3>

                {/* Investor + company + event context */}
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wider text-graphite">
                  <Link
                    href={d.person.kind === "founder" ? `/founders/${d.person.slug}` : `/investors/${d.person.slug}`}
                    className="hover:text-ink hover:underline"
                  >
                    {d.person.name}
                  </Link>
                  {d.company && (
                    <>
                      {" · "}
                      <Link href={`/companies/${d.company.slug}`} className="hover:text-ink hover:underline">
                        {d.company.name}
                      </Link>
                    </>
                  )}
                  {d.event && (
                    <>
                      {" · "}
                      <Link href={`/events/${d.event.slug}`} className="hover:text-ink hover:underline">
                        {d.event.name}
                      </Link>
                    </>
                  )}
                </p>

                {/* Statement (multi-paragraph) */}
                {d.statement && (
                  <div className="mt-3 max-w-[75ch] space-y-2 font-reader text-sm text-graphite">
                    {d.statement.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}

                {/* Outcome (multi-paragraph + source) */}
                {d.outcome && (
                  <div className="mt-3 max-w-[75ch] space-y-2 font-reader text-sm">
                    <p>
                      <span className="kicker mr-2">OUTCOME</span>
                    </p>
                    {d.outcome.split("\n\n").map((para, i) => (
                      <p key={i} className="text-graphite">{para}</p>
                    ))}
                    {d.outcomeSourceUrl && (
                      <p className="mt-2">
                        <a
                          href={d.outcomeSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs text-signal-dark hover:underline"
                        >
                          primary source <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {/* Theme tags */}
                {d.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {d.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={spaSearch(tag)}
                        className="chip text-[0.65rem]"
                      >
                        {tag.replace(/-/g, " ")}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Explore next ── */}
      <SectionLabel>
        <Link href="/investors" className="hover:text-ink hover:underline">Browse all investors</Link>
        {" · "}
        <Link href="/themes" className="hover:text-ink hover:underline">Browse all themes</Link>
        {" · "}
        <Link href="/search" className="hover:text-ink hover:underline">Search the library</Link>
      </SectionLabel>
    </div>
  );
}

// ── Facet row component ──────────────────────────────────────────────────────
function FacetRow({
  label,
  items,
}: {
  label: string;
  items: { slug: string; name: string; count: number; href: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="kicker mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <Link
            key={it.slug}
            href={it.href}
            className="chip hover:chip-signal inline-flex items-center gap-1"
          >
            <span className="capitalize">{it.name}</span>
            <span className="font-mono text-[0.55rem] text-graphite">{it.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
