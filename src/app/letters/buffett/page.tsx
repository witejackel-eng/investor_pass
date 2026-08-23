import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BUFFETT_LETTER_YEARS, officialLetterUrl, LETTERS_NOTE } from "@/lib/letters/buffett";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Warren Buffett shareholder letters — complete index 1977–2024",
  description:
    "Every Berkshire Hathaway shareholder letter from Berkshire's official archive (1977–2024), each linked to its official PDF, cross-referenced with Investor/Pass's indexed research units — exportable as PDF, EPUB and Markdown.",
  alternates: { canonical: "/letters/buffett" },
  openGraph: { title: "Buffett letters library — Investor/Pass", description: "Every letter 1977–2024, officially sourced, research-indexed, exportable.", type: "website", url: "/letters/buffett" },
};

type Counts = Map<number, number>;

async function loadIndexedCounts(): Promise<Counts> {
  try {
    const rows = await db.$queryRawUnsafe<{ year: number; n: number }[]>(`
      SELECT s.year, COUNT(p.id)::int AS n
      FROM "Source" s JOIN "Passage" p ON p."sourceId" = s."id"
      WHERE s."personId" = (SELECT id FROM "Person" WHERE slug='buffett')
        AND s."sourceType" = 'shareholder_letter' AND s.year IS NOT NULL
      GROUP BY s.year ORDER BY s.year
    `);
    return new Map(rows.map((r) => [Number(r.year), Number(r.n)]));
  } catch {
    return new Map();
  }
}

export default async function BuffettLettersPage() {
  const counts = await loadIndexedCounts();
  const covered = BUFFETT_LETTER_YEARS.filter((y) => counts.has(y)).length;
  const totalUnits = [...counts.values()].reduce((a, b) => a + b, 0);

  return (
    <div>
      <header className="max-w-4xl">
        <nav aria-label="Breadcrumb" className="kicker flex gap-2">
          <Link href="/" className="hover:text-foreground">INVESTOR/PASS</Link> /{" "}
          <Link href="/investors/buffett" className="hover:text-foreground">WARREN BUFFETT</Link> / LETTERS
        </nav>
        <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
          Berkshire shareholder letters — the complete index
        </h1>
        <p className="kicker mt-4 flex flex-wrap gap-x-3">
          <span>1977–2024 · {BUFFETT_LETTER_YEARS.length} LETTERS</span>
          <span>{covered} INDEXED FOR RESEARCH</span>
          <span>{totalUnits.toLocaleString()} RESEARCH UNITS</span>
          <span>OFFICIAL PDFS</span>
        </p>
        <p className="prose-reader mt-6 max-w-2xl text-lg leading-relaxed">
          Every letter in Berkshire&apos;s official archive, each linked to its official PDF at
          berkshirehathaway.com, cross-referenced with the research units indexed here — and the
          full indexed volume exports to PDF, EPUB and Markdown.
        </p>
      </header>

      <section className="mt-8 max-w-3xl border border-[var(--ink)] bg-[var(--paper)] p-5" aria-label="Export the research volume">
        <p className="kicker text-[var(--signal-dark)]">EXPORT THE COMPLETE RESEARCH VOLUME</p>
        <p className="mt-2 font-reader text-sm text-[var(--graphite)]">
          All {totalUnits.toLocaleString()} paraphrased research units across every indexed letter —
          organized by year, every unit with its source attribution. Investor/Pass&apos;s own
          copyrighted content, exportable in full.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["PDF", "pdf"], ["EPUB", "epub"], ["MARKDOWN", "md"],
          ].map(([label, fmt]) => (
            <a key={fmt} href={`/api/export/buffett?format=${fmt}`} className="bg-[var(--ink)] px-4 py-2 text-[0.72rem] font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]">
              DOWNLOAD {label}
            </a>
          ))}
        </div>
        <p className="mt-2 text-[0.68rem] text-[var(--graphite)]">{LETTERS_NOTE}</p>
      </section>

      <section className="mt-10 max-w-3xl" aria-label="Letters by year">
        {BUFFETT_LETTER_YEARS.slice().reverse().map((year) => {
          const n = counts.get(year);
          return (
            <article key={year} className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border py-3">
              <div>
                <a href={officialLetterUrl(year)} target="_blank" rel="noopener noreferrer" className="font-display text-lg font-bold tracking-tight hover:text-[var(--signal-dark)]">
                  {year} shareholder letter <span aria-hidden>↗</span>
                </a>
                <p className="kicker mt-0.5">OFFICIAL PDF · BERKSHIREHATHAWAY.COM</p>
              </div>
              {n !== undefined ? (
                <Link href={`/years/${year}`} className="chip chip-signal" aria-label={`${n} indexed research units`}>
                  {n.toLocaleString()} INDEXED UNITS
                </Link>
              ) : (
                <span className="chip">NOT YET INDEXED</span>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
