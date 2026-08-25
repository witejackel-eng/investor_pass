import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Crumb, PageHead, fmt } from "../ui";
import { Users, Lightbulb, Building2, FileText, BookOpen, ArrowRight } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Discover — browse the public record by people, ideas, companies, filings, and books",
  description:
    "The hub for browsing Investor/Pass. People (investors + founders), themes, companies, filings (SEC + NSE/BSE), and key books — all in one place.",
  alternates: { canonical: "/discover" },
  openGraph: { title: "Discover — Investor/Pass", description: "Browse by people, ideas, companies, filings, and books.", url: "/discover", type: "website" },
  robots: { index: true, follow: true },
};

export default async function DiscoverPage() {
  // Fetch counts for each section
  const [investors, founders, themes, companies, filings, events, concepts] = await Promise.all([
    db.person.count({ where: { kind: "investor", status: "active" } }).catch(() => 0),
    db.person.count({ where: { kind: "founder", status: "active" } }).catch(() => 0),
    db.theme.count().catch(() => 0),
    db.company.count().catch(() => 0),
    db.filing.count().catch(() => 0),
    db.event.count().catch(() => 0),
    db.concept.count().catch(() => 0),
  ]);

  // Featured people (top 4 investors by passage count)
  let featuredInvestors: { slug: string; name: string; shortDescription: string | null }[] = [];
  let featuredFounders: { slug: string; name: string; shortDescription: string | null; region: string | null }[] = [];
  let featuredThemes: { slug: string; name: string }[] = [];
  let featuredCompanies: { slug: string; name: string; ticker: string | null; industry: string | null; passageCount: number }[] = [];
  try {
    const [inv, fnd, thm, cmp] = await Promise.all([
      db.$queryRaw<{ slug: string; name: string; shortDescription: string | null; passageCount: number }[]>`
        SELECT p.slug, p.name, p."shortDescription", COUNT(pa.id) AS "passageCount"
        FROM "Person" p
        LEFT JOIN "Source" s ON s."personId" = p.id
        LEFT JOIN "Passage" pa ON pa."sourceId" = s.id
        WHERE p.kind = 'investor' AND p.status = 'active'
        GROUP BY p.id ORDER BY "passageCount" DESC LIMIT 4`,
      db.$queryRaw<{ slug: string; name: string; shortDescription: string | null; region: string | null; passageCount: number }[]>`
        SELECT p.slug, p.name, p."shortDescription", p.region, COUNT(pa.id) AS "passageCount"
        FROM "Person" p
        LEFT JOIN "Source" s ON s."personId" = p.id
        LEFT JOIN "Passage" pa ON pa."sourceId" = s.id
        WHERE p.kind = 'founder' AND p.status = 'active'
        GROUP BY p.id ORDER BY "passageCount" DESC LIMIT 4`,
      db.theme.findMany({ take: 8, orderBy: { name: "asc" }, select: { slug: true, name: true } }),
      db.$queryRaw<{ slug: string; name: string; ticker: string | null; industry: string | null; passageCount: number }[]>`
        SELECT c.slug, c.name, c.ticker, i.name AS industry,
               (SELECT COUNT(*) FROM "PassageCompany" pc WHERE pc."companyId" = c.id) AS "passageCount"
        FROM "Company" c
        LEFT JOIN "Industry" i ON c."industryId" = i.id
        ORDER BY "passageCount" DESC, c.name ASC
        LIMIT 8`,
    ]);
    featuredInvestors = inv as any;
    featuredFounders = fnd as any;
    featuredThemes = thm;
    featuredCompanies = cmp as any;
  } catch {}

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "DISCOVER" }]}
        title="Discover"
        meta={[
          `${fmt(investors + founders)} people`,
          `${fmt(themes)} themes`,
          `${fmt(companies)} companies`,
          `${fmt(filings)} filings`,
        ]}
        lede="Browse the public record by people, ideas, companies, filings, and books. Every record is sourced, paraphrased, and connected."
      />

      {/* ── People ──────────────────────────────────────────────────────── */}
      <section className="mt-10 border-t-2 border-ink pt-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="font-display text-2xl font-semibold tracking-tight">People</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="border border-rule p-5">
            <p className="kicker text-signal-dark">INVESTORS</p>
            <p className="mt-1 font-display text-3xl font-bold">{fmt(investors)}</p>
            <p className="mt-1 font-reader text-sm text-graphite">Capital allocators whose letters, memos, speeches, and decisions are indexed.</p>
            <div className="mt-3 space-y-1.5">
              {featuredInvestors.map((inv) => (
                <Link key={inv.slug} href={`/investors/${inv.slug}`} className="block font-display text-sm font-medium hover:text-signal-dark">
                  {inv.name}
                </Link>
              ))}
            </div>
            <Link href="/investors" className="mt-3 inline-flex items-center gap-1 chip chip-signal">
              View all investors <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="border border-rule p-5">
            <p className="kicker text-signal-dark">FOUNDERS</p>
            <p className="mt-1 font-display text-3xl font-bold">{fmt(founders)}</p>
            <p className="mt-1 font-reader text-sm text-graphite">Operating builders from the United States, China, and India whose public record is indexed.</p>
            <div className="mt-3 space-y-1.5">
              {featuredFounders.map((fnd) => (
                <Link key={fnd.slug} href={`/founders/${fnd.slug}`} className="block font-display text-sm font-medium hover:text-signal-dark">
                  {fnd.name} {fnd.region && <span className="ml-1 font-mono text-[0.55rem] uppercase text-graphite">{fnd.region}</span>}
                </Link>
              ))}
            </div>
            <Link href="/founders" className="mt-3 inline-flex items-center gap-1 chip chip-signal">
              View all founders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Themes ──────────────────────────────────────────────────────── */}
      <section className="mt-10 border-t border-rule pt-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          <h2 className="font-display text-2xl font-semibold tracking-tight">Themes</h2>
        </div>
        <p className="mt-1 font-reader text-sm text-graphite">{fmt(themes)} themes connect every passage across the library.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {featuredThemes.map((t) => (
            <Link key={t.slug} href={`/themes/${t.slug}`} className="chip hover:chip-signal">
              {t.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Companies ───────────────────────────────────────────────────── */}
      <section className="mt-10 border-t border-rule pt-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h2 className="font-display text-2xl font-semibold tracking-tight">Companies</h2>
        </div>
        <p className="mt-1 font-reader text-sm text-graphite">{fmt(companies)} companies linked to investors and passages, with documented decisions.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {featuredCompanies.map((c) => (
            <Link key={c.slug} href={`/companies/${c.slug}`} className="chip hover:chip-signal">
              {c.name}
            </Link>
          ))}
        </div>
        <Link href="/companies" className="mt-3 inline-flex items-center gap-1 chip chip-signal">
          View all companies <ArrowRight className="h-3 w-3" />
        </Link>
      </section>

      {/* ── Filings ─────────────────────────────────────────────────────── */}
      <section className="mt-10 border-t border-rule pt-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="font-display text-2xl font-semibold tracking-tight">Filings</h2>
        </div>
        <p className="mt-1 font-reader text-sm text-graphite">
          {fmt(filings)} SEC EDGAR (US) + NSE/BSE (India) filings indexed, extracted, compressed, and full-text searchable.
        </p>
        <Link href="/filings" className="mt-3 inline-flex items-center gap-1 chip chip-signal">
          Browse filings <ArrowRight className="h-3 w-3" />
        </Link>
      </section>

      {/* ── Books / key works ────────────────────────────────────────────── */}
      <section className="mt-10 border-t border-rule pt-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h2 className="font-display text-2xl font-semibold tracking-tight">Books</h2>
        </div>
        <p className="mt-1 font-reader text-sm text-graphite">Paraphrased key works — Intelligent Investor, Margin of Safety, One Up on Wall Street, The Most Important Thing, and more.</p>
        <Link href="/investors/graham" className="mt-3 inline-flex items-center gap-1 chip chip-signal">
          Graham's record <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </div>
  );
}
