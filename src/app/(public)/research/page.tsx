import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Crumb, PageHead, fmt } from "../ui";
import { Scale, GitCompare, Route, Share2 } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Research — Trails, Compare, and the Decision Ledger",
  description:
    "The research tools hub: Trails (curated reading paths), Compare (side-by-side investor analysis), and the Decision Ledger (documented decisions with outcomes).",
  alternates: { canonical: "/research" },
  openGraph: { title: "Research — Investor/Pass", description: "Trails, Compare, and the Decision Ledger.", url: "/research", type: "website" },
  robots: { index: true, follow: true },
};

export default async function ResearchPage() {
  const [decisions, investors, themes] = await Promise.all([
    db.decision.count({ where: { verified: true } }).catch(() => 0),
    db.person.count({ where: { kind: "investor", status: "active" } }).catch(() => 0),
    db.theme.count().catch(() => 0),
  ]);
  // Trails are stored as a static JSON file (not a DB table) — the worklog
  // documents 3 curated trails. Hard-code to avoid a file-read per request.
  const trails = 3;

  const tools = [
    {
      icon: Scale,
      label: "DECISION LEDGER",
      title: "What was said. What was done. What happened next.",
      desc: `${fmt(decisions)} documented decisions across investors. Every decision follows the same structure: statement → action → outcome, with a primary source link on every outcome. Filter by company, year, or theme.`,
      href: "/decisions",
      cta: "Open the Decision Ledger",
      stats: [`${fmt(decisions)} decisions`, "All outcomes sourced"],
    },
    {
      icon: GitCompare,
      label: "COMPARE",
      title: "Side-by-side investor analysis.",
      desc: `Place any two investors side-by-side and see how they thought about the same themes, companies, and decisions. ${fmt(investors)} investors and ${fmt(themes)} themes available for comparison.`,
      href: "/compare",
      cta: "Open Compare",
      stats: [`${fmt(investors)} investors`, `${fmt(themes)} themes`],
    },
    {
      icon: Route,
      label: "TRAILS",
      title: "Curated reading paths.",
      desc: `${fmt(trails)} trails connect passages across investors and themes into a single narrative. Follow a trail to read a story across the library — e.g. "2008 through five investors".`,
      href: "/",
      cta: "Browse trails",
      stats: [`${fmt(trails)} trails`, "Cross-investor narratives"],
    },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "RESEARCH" }]}
        title="Research"
        meta={[`${fmt(decisions)} decisions`, `${fmt(investors)} investors`, `${fmt(trails)} trails`]}
        lede="Three tools for turning the library into an argument: the Decision Ledger (documented decisions with outcomes), Compare (side-by-side investor analysis), and Trails (curated reading paths)."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group border-2 border-ink p-6 transition-colors hover:bg-paper-2"
          >
            <t.icon className="h-6 w-6 text-signal-dark" />
            <p className="kicker mt-3 text-signal-dark">{t.label}</p>
            <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">{t.title}</h2>
            <p className="mt-2 font-reader text-sm text-graphite">{t.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {t.stats.map((s) => (
                <span key={s} className="chip text-[0.65rem]">{s}</span>
              ))}
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-signal-dark group-hover:underline">
              {t.cta} →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
