import type { Metadata } from "next";
import Link from "next/link";
import { EXPLAINERS } from "@/data/learn/explainers";
import { TrackView } from "@/components/public/track-view";
import { PageHead } from "../ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "How Finance Works — explainers connected to the evidence",
  description:
    "Free, careful explainers on hedge funds, short selling, quant investing and how markets actually work — each one connected to the indexed investors, sources and decisions in the Investor/Pass library.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "How Finance Works — Investor/Pass",
    description:
      "Learn how finance works, then study the investors who operate inside it. Every explainer connects to the evidence graph.",
    type: "website",
    url: "/learn",
  },
};

export default function LearnIndexPage() {
  return (
    <div>
      <TrackView name="learn_page_view" props={{ page: "learn_index" }} />
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "LEARN" }]}
        title="How finance works"
        meta={[`${EXPLAINERS.length} EXPLAINERS`, "CONNECTED TO THE EVIDENCE GRAPH", "FREE TO READ"]}
        lede="Careful explanations of how the financial world actually works — hedge funds, short selling, quantitative investing — each one ending in the indexed record: the investors, sources and decisions where the ideas live."
      />

      <section className="mt-12 max-w-3xl">
        {EXPLAINERS.map((e) => (
          <article key={e.slug} className="border-t border-border py-6">
            <p className="kicker text-[var(--signal-dark)]">
              {e.category} · {e.difficulty}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
              <Link href={`/learn/${e.slug}`} className="hover:text-[var(--signal-dark)]">
                {e.title}
              </Link>
            </h2>
            <p className="prose-reader mt-2 max-w-2xl">{e.summary}</p>
            <p className="kicker mt-3">
              CONNECTED: {e.related.investors.length} INVESTORS · {e.related.themes.length} THEMES
              {e.related.trail ? " · 1 TRAIL" : ""}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-10 max-w-3xl border-t-2 border-[var(--ink)] pt-6">
        <p className="prose-reader">
          Every explainer is a door into the research library — never a dead end. Start with{" "}
          <Link href="/learn/how-hedge-funds-work" className="underline decoration-[var(--rule)] underline-offset-2">
            how hedge funds work
          </Link>
          , and end up in the indexed record of the people who run them.
        </p>
      </section>
    </div>
  );
}
