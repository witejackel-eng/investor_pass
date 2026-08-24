import type { Metadata } from "next";
import Link from "next/link";
import { AppRoot } from "@/components/investor/app-root";

/**
 * /concepts/[slug] — REAL, shareable, crawlable path for an investing concept
 * (replaces the #/view=concept&slug=… hash island).
 *
 * Concepts are real content worth indexing — who talks about an idea, which
 * sources document it — so robots index,follow. The route is dynamic (ƒ):
 * generateStaticParams returns [] so Next.js never tries to hit the DB at
 * build time (the known Task-10 crash cause).
 */
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const title = `${slug} — concept in the record`;
  const description =
    "An investing concept traced across the indexed record — who talks about it, which sources document it.";
  return {
    title,
    description,
    alternates: { canonical: `/concepts/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "website", url: `/concepts/${slug}` },
  };
}

export default async function ConceptPage({ params }: Params) {
  const { slug } = await params;
  return (
    <>
      <div className="sr-only">
        <h1>Concept in the record</h1>
        <p>
          An investing concept traced across the Investor/Pass record —
          follow the idea across 31 exceptional investors and see which
          shareholder letters, memos, speeches and interviews document it.
          Every claim is paraphrased and traceable to a publisher and a date.
        </p>
        <ul>
          <li><Link href="/investors">Browse all investors</Link></li>
          <li><Link href="/search">Search the record</Link></li>
          <li><Link href="/themes/risk-management">Risk Management — canonical theme</Link></li>
          <li><Link href="/trails">Source-backed research trails</Link></li>
        </ul>
      </div>
      <AppRoot initialView="concept" initialParams={{ slug }} />
    </>
  );
}
