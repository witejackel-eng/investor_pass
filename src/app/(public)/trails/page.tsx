import type { Metadata } from "next";
import Link from "next/link";
import trailsJson from "@/data/trails/trails.json";
import type { Trail } from "@/components/investor/views-trails";
import { PageHead } from "../ui";

export const revalidate = 3600;

const trails = trailsJson as Trail[];

export const metadata: Metadata = {
  title: "Research Trails",
  description:
    "Curated, source-backed paths through the indexed public record of exceptional investors — every step dated, sourced, and linked.",
  alternates: { canonical: "/trails" },
  openGraph: {
    title: "Research Trails — Investor/Pass",
    description:
      "Editor-curated investigations through the library: how ideas developed, how investors overlapped, how decisions played out.",
    type: "website",
    url: "/trails",
  },
};

export default function TrailsPage() {
  return (
    <div>
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "TRAILS" }]}
        title="Research trails"
        meta={[`${trails.length} TRAILS`, "EVERY STEP SOURCED", "FREE TO READ"]}
        lede="An editor's path through the library — each trail follows one question across investors, years, companies and decisions, with the underlying sources linked at every step."
      />

      <section className="mt-12 max-w-3xl">
        {trails.map((t) => {
          const years = t.nodes.map((n) => n.year).filter(Boolean);
          return (
            <article key={t.slug} className="border-t border-border py-6">
              <p className="kicker text-[var(--signal-dark)]">
                TRAIL · {t.nodes.length} STEPS
                {years.length ? ` · ${Math.min(...years)}–${Math.max(...years)}` : ""}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                <Link
                  href={`/trails/${t.slug}`}
                  className="nav-link hover:text-[var(--signal-dark)]"
                >
                  {t.title}
                </Link>
              </h2>
              <p className="prose-reader mt-2 italic text-[var(--graphite)]">{t.centralQuestion}</p>
              <p className="prose-reader mt-2">{t.intro.slice(0, 220)}…</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Link href={`/trails/${t.slug}`} className="chip chip-signal">
                  READ THE TRAIL →
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
