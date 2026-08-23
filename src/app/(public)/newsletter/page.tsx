import type { Metadata } from "next";
import Link from "next/link";
import { FOUNDER, ISSUES, latestIssue } from "@/data/newsletter/issues";
import { TrackView } from "@/components/public/track-view";
import { PageHead } from "../ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Newsletter — Aditya's research, explanations & discoveries",
  description:
    "Free notes from the founder of Investor/Pass: how finance works, what the indexed record actually says, and what's worth researching next. Every claim connects to sources you can check.",
  alternates: { canonical: "/newsletter" },
  openGraph: {
    title: "Investor/Pass Newsletter — Aditya's research notes",
    description: "How finance works, investor discoveries, and research trails — connected to the indexed record.",
    type: "website",
    url: "/newsletter",
  },
};

export default function NewsletterPage() {
  const latest = latestIssue();
  return (
    <div>
      <TrackView name="newsletter_view" props={{ page: "newsletter_index" }} />
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "NEWSLETTER" }]}
        title="Aditya's research, explanations & discoveries"
        meta={[`ISSUE #${latest.number} OUT NOW`, "FREE", "EVERY CLAIM SOURCE-CHECKABLE"]}
        lede={FOUNDER.positioning}
      />

      {/* Subscribe — standard mailto-free placeholder; wiring an ESP is an ops task, not a code invention */}
      <section className="mt-10 max-w-xl border border-[var(--ink)] bg-[var(--paper)] p-6" aria-label="Subscribe">
        <p className="kicker text-[var(--signal-dark)]">SUBSCRIBE FREE</p>
        <p className="prose-reader mt-2">
          Notes on how finance works, what the indexed record says, and what I&apos;m researching next.
          Roughly every few days — only when there&apos;s something worth saying.
        </p>
        <form
          action="/api/newsletter/subscribe"
          method="post"
          className="mt-4 flex items-stretch border border-[var(--ink)] bg-[var(--paper)]"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full bg-transparent px-3 py-2.5 font-reader text-base focus:outline-none"
          />
          <button type="submit" className="bg-[var(--ink)] px-4 text-[0.78rem] font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]">
            SUBSCRIBE
          </button>
        </form>
        <p className="kicker mt-2">NO SPAM · UNSUBSCRIBE ANYTIME · THE RECORD STAYS FREE</p>
      </section>

      {/* Issue archive */}
      <section className="mt-12 max-w-3xl" aria-label="Issues">
        <p className="kicker mb-2">ISSUES</p>
        {[...ISSUES].reverse().map((issue) => (
          <article key={issue.slug} className="border-t border-border py-6">
            <p className="kicker text-[var(--signal-dark)]">
              ISSUE #{String(issue.number).padStart(2, "0")} · {issue.publishedAt}
              {issue.subscriberEdition && " · DEEPER EDITION FOR SUBSCRIBERS"}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
              <Link href={`/newsletter/${issue.slug}`} className="hover:text-[var(--signal-dark)]">
                {issue.title}
              </Link>
            </h2>
            <p className="prose-reader mt-2">{issue.subtitle}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
