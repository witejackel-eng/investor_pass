import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

async function getInvestor(slug: string) {
  try {
    const p = await db.person.findUnique({ where: { slug } });
    if (!p || p.status !== "active") return null;
    const [sources, units, themes, companies, events, decisions] = await Promise.all([
      db.source.count({ where: { personId: p.id } }),
      db.passage.count({ where: { source: { personId: p.id } } }),
      db.$queryRaw<{ n: number }[]>`SELECT COUNT(DISTINCT pt."themeId")::int AS n FROM "PassageTheme" pt JOIN "Passage" p2 ON pt."passageId"=p2."id" JOIN "Source" s ON p2."sourceId"=s."id" WHERE s."personId"=${p.id}`,
      db.$queryRaw<{ n: number }[]>`SELECT COUNT(DISTINCT pc."companyId")::int AS n FROM "PassageCompany" pc JOIN "Passage" p2 ON pc."passageId"=p2."id" JOIN "Source" s ON p2."sourceId"=s."id" WHERE s."personId"=${p.id}`,
      db.$queryRaw<{ n: number }[]>`SELECT COUNT(DISTINCT pe."eventId")::int AS n FROM "PassageEvent" pe JOIN "Passage" p2 ON pe."passageId"=p2."id" JOIN "Source" s ON p2."sourceId"=s."id" WHERE s."personId"=${p.id}`,
      db.decision.count({ where: { personId: p.id, verified: true } }),
    ]);
    return {
      name: p.name, slug: p.slug, shortDescription: p.shortDescription ?? "", birthYear: p.birthYear,
      sources: Number(sources), units: Number(units), themes: Number(themes[0]?.n ?? 0),
      companies: Number(companies[0]?.n ?? 0), events: Number(events[0]?.n ?? 0), decisions: Number(decisions),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getInvestor(slug);
  if (!p) return { title: "Knowledge base not found" };
  const title = `${p.name} — knowledge base`;
  const description = `${p.name}'s indexed record: ${p.sources} sources, ${p.units.toLocaleString()} research units, ${p.themes} themes, ${p.companies} companies, ${p.decisions} documented decisions — cross-referenced and source-linked.`;
  return { title, description, alternates: { canonical: `/kb/${slug}` }, openGraph: { title, description, type: "website", url: `/kb/${slug}` } };
}

export default async function KnowledgeBasePage({ params }: Params) {
  const { slug } = await params;
  const p = await getInvestor(slug);
  if (!p) notFound();

  const others = await db.person.findMany({ where: { status: "active", slug: { not: p.slug } }, select: { slug: true, name: true }, orderBy: { sortOrder: "asc" }, take: 31 }).catch(() => []);

  return (
    <div>
      <header className="max-w-4xl">
        <nav aria-label="Breadcrumb" className="kicker flex gap-2">
          <Link href="/" className="hover:text-foreground">INVESTOR/PASS</Link> /{" "}
          <Link href="/investors" className="hover:text-foreground">INVESTORS</Link> / KNOWLEDGE BASE
        </nav>
        <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
          {p.name}, decoded.
        </h1>
        <p className="prose-reader mt-4 max-w-2xl text-lg leading-relaxed">{p.shortDescription}</p>
        <p className="kicker mt-4 flex flex-wrap gap-x-3">
          <span>{p.sources.toLocaleString()} SOURCES</span>
          <span>{p.units.toLocaleString()} RESEARCH UNITS</span>
          <span>{p.themes} THEMES</span>
          <span>{p.companies} COMPANIES</span>
          <span>{p.events} EVENTS</span>
          <span>{p.decisions} DECISIONS</span>
        </p>
      </header>

      <section className="mt-10 max-w-3xl" aria-label="Index pages">
        <p className="kicker mb-3">INDEX PAGES — CROSS-REFERENCE GUIDES FOR DEEP RESEARCH</p>
        {[
          { t: "Sources", d: `Every indexed document — letters, memos, speeches, interviews (${p.sources.toLocaleString()})`, href: `/#/view=investor&slug=${p.slug}`, chip: "BROWSE" },
          { t: "Companies", d: `All companies referenced across the indexed record (${p.companies})`, href: `/investors/${p.slug}`, chip: "BROWSE" },
          { t: "Themes", d: `The canonical ideas this investor actually addresses (${p.themes})`, href: `/investors/${p.slug}`, chip: "BROWSE" },
          { t: "Decisions", d: `Documented actions with sources and outcomes (${p.decisions})`, href: `/investors/${p.slug}`, chip: "BROWSE" },
          ...(p.slug === "buffett" ? [{ t: "Letters library", d: "Every Berkshire letter 1977–2024 with official PDFs + full volume exports", href: "/letters/buffett", chip: "OPEN" }] : []),
        ].map((c) => (
          <article key={c.t} className="flex items-center justify-between gap-3 border-t border-border py-4">
            <div>
              <Link href={c.href} className="font-display text-lg font-bold tracking-tight hover:text-[var(--signal-dark)]">{c.t} <span aria-hidden>→</span></Link>
              <p className="font-reader text-sm text-[var(--graphite)]">{c.d}</p>
            </div>
            <Link href={c.href} className="chip chip-signal shrink-0">{c.chip}</Link>
          </article>
        ))}
      </section>

      {others.length > 0 && (
        <section className="mt-10 max-w-3xl border-t-2 border-[var(--ink)] pt-6">
          <p className="kicker mb-2">ALSO IN THE COLLECTION</p>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/kb/${o.slug}`} className="chip hover:chip-signal">{o.name}</Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
