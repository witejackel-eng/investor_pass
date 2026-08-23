import type { Metadata } from "next";
import { db } from "@/lib/db";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "What changed in the library — new collections, new decisions, editorial corrections, and product improvements. The record of the record.",
  alternates: { canonical: "/changelog" },
};

type Entry = {
  date: string;
  title: string;
  body: string;
  category: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  corpus: "CORPUS",
  feature: "FEATURE",
  editorial: "EDITORIAL",
  fix: "FIX",
};

export default async function ChangelogPage() {
  let entries: Entry[] = [];
  try {
    entries = await db.changelog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  } catch {
    entries = [];
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="kicker">THE RECORD OF THE RECORD</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Changelog</h1>
      <p className="prose-reader mt-4">
        Every meaningful change to the library — new collections, new decisions, corrections
        accepted, and improvements to the research system. Trust is the product; this is where we
        show the work.
      </p>

      <div className="mt-10">
        {entries.length === 0 ? (
          <p className="prose-reader text-[var(--graphite)]">
            The changelog is being prepared.
          </p>
        ) : (
          entries.map((e) => (
            <article key={e.date + e.title} className="border-t border-[var(--rule)] py-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="kicker text-[var(--signal-dark)]">
                  {CATEGORY_LABEL[e.category] ?? "UPDATE"}
                </span>
                <span className="kicker text-[var(--graphite)]">{e.date}</span>
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">{e.title}</h2>
              <div className="prose-reader mt-2 whitespace-pre-line">{e.body}</div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
