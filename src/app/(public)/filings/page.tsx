import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Crumb, PageHead, fmt, EmptyNote } from "../ui";
import { FileText, ExternalLink, Filter } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Filings Library — SEC EDGAR + NSE/BSE searchable archive",
  description:
    "Every major US SEC filing (10-K, 10-Q, 8-K, S-1, DEF 14A, Form 4, 13F) and Indian NSE/BSE filing (annual reports, quarterly results, shareholding patterns), extracted, compressed, and full-text searchable. Linked to the investors and themes in the library.",
  alternates: { canonical: "/filings" },
  openGraph: {
    title: "Filings Library — Investor/Pass",
    description: "SEC EDGAR + NSE/BSE searchable filing archive.",
    url: "/filings",
    type: "website",
  },
  robots: { index: true, follow: true },
};

type SearchParams = {
  q?: string;
  country?: string;
  form?: string;
  company?: string;
  from?: string;
  to?: string;
  page?: string;
};

export default async function FilingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (sp.country) where.country = sp.country;
  if (sp.form) where.formType = sp.form;
  if (sp.company) where.companySlug = sp.company;
  if (sp.from || sp.to) {
    where.filingDate = {};
    if (sp.from) (where.filingDate as any).gte = new Date(sp.from);
    if (sp.to) (where.filingDate as any).lte = new Date(sp.to);
  }
  if (sp.q) {
    where.OR = [
      { searchText: { ilike: `%${sp.q}%` } },
      { textPreview: { ilike: `%${sp.q}%` } },
      { title: { ilike: `%${sp.q}%` } },
      { companyName: { ilike: `%${sp.q}%` } },
    ];
  }

  let data: { filings: any[]; total: number; facets: any; hasMore?: boolean } | null = null;
  try {
    const [filings, total, countries, forms, companies] = await Promise.all([
      db.filing.findMany({
        where,
        orderBy: { filingDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.filing.count({ where }),
      db.filing.groupBy({ by: ["country"], _count: true }),
      db.filing.groupBy({ by: ["formType"], _count: true, orderBy: { _count: { formType: "desc" } }, take: 20 }),
      db.filing.groupBy({ by: ["companyName"], _count: true, orderBy: { _count: { companyName: "desc" } }, take: 20 }),
    ]);
    data = {
      filings,
      total,
      hasMore: total > page * limit,
      facets: {
        countries: countries.map((c) => ({ value: c.country, count: c._count })),
        forms: forms.map((f) => ({ value: f.formType, count: f._count })),
        companies: companies.map((c) => ({ value: c.companyName, count: c._count })),
      },
    };
  } catch (e) {
    data = null;
  }

  const addFilter = (param: string, value: string) => {
    const next = new URLSearchParams(sp as Record<string, string>);
    next.set(param, value);
    next.delete("page");
    return `/filings?${next.toString()}`;
  };
  const clearOne = (param: string) => {
    const next = new URLSearchParams(sp as Record<string, string>);
    next.delete(param);
    next.delete("page");
    const qs = next.toString();
    return qs ? `/filings?${qs}` : "/filings";
  };

  const activeFilters: { label: string; param: string; value: string }[] = [];
  if (sp.country) activeFilters.push({ label: "Country", param: "country", value: sp.country });
  if (sp.form) activeFilters.push({ label: "Form", param: "form", value: sp.form });
  if (sp.company) activeFilters.push({ label: "Company", param: "company", value: sp.company });
  if (sp.q) activeFilters.push({ label: "Query", param: "q", value: sp.q });

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "FILINGS" }]}
        title="Filings Library"
        meta={[
          data ? `${fmt(data.total)} filings indexed` : "Loading",
          "SEC EDGAR (US) + NSE/BSE (India)",
          "Full-text searchable",
        ]}
        lede="Every major US SEC filing (10-K, 10-Q, 8-K, S-1, DEF 14A, Form 4, 13F) and Indian NSE/BSE filing (annual reports, quarterly results, shareholding patterns), extracted, compressed, and full-text searchable. Linked to the investors and themes in the library."
      />

      {/* Search bar */}
      <form className="mt-6 flex gap-2" action="/filings" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={sp.q || ""}
          placeholder="Search filing text — e.g. 'risk factors', 'CEO departure', 'dividend'"
          className="flex-1 border border-ink bg-paper px-4 py-2 font-reader text-sm outline-none focus:border-signal"
        />
        <button type="submit" className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal-dark">
          SEARCH
        </button>
      </form>

      {/* Filter bar */}
      <section className="mt-6 border-t-2 border-ink pt-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-signal-dark" />
          <p className="kicker text-signal-dark">FILTER</p>
          {activeFilters.length > 0 && (
            <Link href="/filings" className="ml-auto chip hover:chip-signal">CLEAR ALL</Link>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <Link key={f.param} href={clearOne(f.param)} className="chip chip-ink inline-flex items-center gap-1.5">
                <span className="font-mono text-[0.55rem] uppercase tracking-wider text-graphite">{f.label}</span>
                <span>{f.value}</span>
                <span className="text-graphite">×</span>
              </Link>
            ))}
          </div>
        )}

        {data && (
          <div className="mt-4 space-y-3">
            {data.facets.countries.length > 0 && (
              <div>
                <p className="kicker mb-1.5">COUNTRY</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.facets.countries.map((c) => (
                    <Link key={c.value} href={addFilter("country", c.value)} className="chip hover:chip-signal inline-flex items-center gap-1">
                      <span>{c.value}</span>
                      <span className="font-mono text-[0.55rem] text-graphite">{c.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {data.facets.forms.length > 0 && (
              <div>
                <p className="kicker mb-1.5">FORM TYPE</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.facets.forms.map((f) => (
                    <Link key={f.value} href={addFilter("form", f.value)} className="chip hover:chip-signal inline-flex items-center gap-1">
                      <span className="font-mono text-[0.65rem]">{f.value}</span>
                      <span className="font-mono text-[0.55rem] text-graphite">{f.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      <section className="mt-8">
        {!data ? (
          <EmptyNote>
            <p className="mt-2 font-reader text-sm text-graphite">
              The Filings Library is being indexed. Please check back shortly.
            </p>
          </EmptyNote>
        ) : data.filings.length === 0 ? (
          <EmptyNote>
            <p className="mt-2 font-reader text-sm text-graphite">
              No filings match your search.{" "}
              <Link href="/filings" className="underline hover:text-ink">Clear filters</Link> to browse all {fmt(data.total)} filings.
            </p>
          </EmptyNote>
        ) : (
          <div className="space-y-3">
            {data.filings.map((f) => (
              <article key={f.id} className="border border-rule p-4 hover:border-ink transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
                      <span className="chip chip-ink mr-1.5">{f.country}</span>
                      <span className="chip mr-1.5">{f.formType}</span>
                      {f.filingDate && <span>{new Date(f.filingDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>}
                    </p>
                    <h3 className="mt-1 font-display text-base font-semibold leading-tight">{f.title}</h3>
                    <p className="mt-0.5 font-mono text-[0.6rem] text-graphite">{f.companyName} · {f.companyId}</p>
                    {f.textPreview && (
                      <p className="mt-2 line-clamp-3 font-reader text-xs text-graphite">
                        {f.textPreview.slice(0, 300)}…
                      </p>
                    )}
                    <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-wider text-graphite">
                      {(f.fileSizeOriginal / 1024).toFixed(1)} KB original → {(f.fileSizeCompressed / 1024).toFixed(1)} KB compressed
                      {f.storagePath && " · stored on R2"}
                    </p>
                  </div>
                  <a
                    href={f.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip shrink-0"
                    title="Open original filing on SEC EDGAR"
                  >
                    <ExternalLink className="h-3 w-3" /> SOURCE
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.total > limit && (
          <div className="mt-6 flex items-center justify-between border-t border-rule pt-4">
            <span className="font-mono text-xs text-graphite">
              Page {page} of {Math.ceil(data.total / limit)} · {fmt(data.total)} total
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={addFilter("page", String(page - 1))} className="chip">← PREV</Link>
              )}
              {data.hasMore && (
                <Link href={addFilter("page", String(page + 1))} className="chip chip-signal">NEXT →</Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
