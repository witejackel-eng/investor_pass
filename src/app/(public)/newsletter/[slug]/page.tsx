import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ISSUES, issueBySlug, FOUNDER } from "@/data/newsletter/issues";
import { TrackView } from "@/components/public/track-view";
import { PageHead } from "../../ui";
import { breadcrumbLd, serializeJsonLd } from "@/lib/server/jsonld";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ISSUES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const issue = issueBySlug(slug);
  if (!issue) return { title: "Issue not found" };
  const title = `#${String(issue.number).padStart(2, "0")} — ${issue.title}`;
  return {
    title,
    description: issue.subtitle,
    alternates: { canonical: `/newsletter/${slug}` },
    openGraph: { title, description: issue.subtitle, type: "article", url: `/newsletter/${slug}`, publishedTime: issue.publishedAt },
    twitter: { card: "summary_large_image", title, description: issue.subtitle },
  };
}

export default async function IssuePage({ params }: Params) {
  const { slug } = await params;
  const issue = issueBySlug(slug);
  if (!issue) notFound();

  return (
    <div>
      <TrackView name="newsletter_issue_open" props={{ slug }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            breadcrumbLd([
              { label: "INVESTOR/PASS", href: "/" },
              { label: "NEWSLETTER", href: "/newsletter" },
              { label: issue.title },
            ]),
          ]),
        }}
      />
      <PageHead
        crumb={[{ label: "INVESTOR/PASS", href: "/" }, { label: "NEWSLETTER", href: "/newsletter" }]}
        title={issue.title}
        meta={[`ISSUE #${String(issue.number).padStart(2, "0")}`, issue.publishedAt, `BY ${FOUNDER.name.toUpperCase()}`]}
        lede={issue.subtitle}
      />

      <article className="reading mt-10">
        {issue.body.map((s) => (
          <section key={s.heading} className="border-t border-border py-6">
            <h2 className="font-display text-xl font-bold tracking-tight">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="prose-reader mt-3">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>

      {issue.related.length > 0 && (
        <aside className="mt-10 border-t-2 border-[var(--ink)] pt-6" aria-label="Continue into the library">
          <p className="kicker text-[var(--signal-dark)]">CONTINUE INTO THE LIBRARY</p>
          <ul className="mt-3 space-y-2">
            {issue.related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="font-display text-sm font-semibold hover:text-[var(--signal-dark)]">
                  {r.label} →
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <section className="mt-10 max-w-xl border border-[var(--ink)] bg-[var(--paper)] p-6" aria-label="Subscribe">
        <p className="kicker text-[var(--signal-dark)]">{FOUNDER.name.toUpperCase()}&apos;S NEXT NOTE GOES TO SUBSCRIBERS FIRST</p>
        <form action="/api/newsletter/subscribe" method="post" className="mt-3 flex items-stretch border border-[var(--ink)]">
          <label htmlFor="issue-subscribe-email" className="sr-only">
            Email address
          </label>
          <input
            id="issue-subscribe-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full bg-transparent px-3 py-2.5 font-reader text-base focus:outline-none"
          />
          <button type="submit" className="bg-[var(--ink)] px-4 text-[0.78rem] font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]">
            SUBSCRIBE FREE
          </button>
        </form>
      </section>
    </div>
  );
}
