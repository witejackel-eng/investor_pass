
import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/server/public-pages";
import { db } from "@/lib/db";
import { EXPLAINERS } from "@/data/learn/explainers";
import { ISSUES } from "@/data/newsletter/issues";

const EXPLAINER_SLUGS = EXPLAINERS.map((e) => e.slug);
const ISSUE_SLUGS = ISSUES.map((i) => i.slug);

// sitemap.xml — crawlable public research surface (Lane B, spec §43).
// Index ONLY meaningful, stable pages: active investors with ≥1 public
// passage, investor×theme topic pairs with ≥3 references and ≥1 public
// passage, and theme/company/event/year entities with ≥1 public passage.
export const revalidate = 3600;

const BASE = process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Prelaunch fail-safe: emit nothing while SITE_PRELAUNCH=true.
  if (process.env.SITE_PRELAUNCH === "true") return [];

  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/learn`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/newsletter`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/investors`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/trails`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/changelog`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/legal`, changeFrequency: "yearly", priority: 0.3 },
  ];

    for (const slug of EXPLAINER_SLUGS) {
    entries.push({ url: `${BASE}/learn/${slug}`, changeFrequency: "monthly", priority: 0.8 });
  }
  for (const slug of ISSUE_SLUGS) {
    entries.push({ url: `${BASE}/newsletter/${slug}`, changeFrequency: "monthly", priority: 0.7 });
  }
  // Real-path app surfaces (SEO landings; /search?q= variants are noindex via meta)
  entries.push({ url: `${BASE}/search`, changeFrequency: "weekly", priority: 0.8 });
  entries.push({ url: `${BASE}/letters/buffett`, changeFrequency: "monthly", priority: 0.9 });
  const kbPeople = await db.person
    .findMany({ where: { status: "active" }, select: { slug: true } })
    .catch(() => [] as { slug: string }[]);
  for (const p of kbPeople) entries.push({ url: `${BASE}/kb/${p.slug}`, changeFrequency: "weekly", priority: 0.8 });
  entries.push({ url: `${BASE}/compare`, changeFrequency: "weekly", priority: 0.8 });
for (const slug of ["terms", "privacy", "cookies", "copyright", "disclaimer", "refunds"]) {
    entries.push({ url: `${BASE}/legal/${slug}`, changeFrequency: "yearly", priority: 0.3 });
  }

  for (const t of ["how-buffett-learned-to-value-quality", "2008-through-five-investors", "margin-of-safety-graham-to-klarman"]) {
    entries.push({ url: `${BASE}/trails/${t}`, changeFrequency: "monthly", priority: 0.8 });
  }

  try {
    const data = await getSitemapData();
    if (!data) return entries;

    for (const inv of data.investors) {
      entries.push({
        url: `${BASE}/investors/${inv.slug}`,
        lastModified: inv.lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
    for (const pair of data.topicPairs) {
      entries.push({
        url: `${BASE}/investors/${pair.personSlug}/topics/${pair.themeSlug}`,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
    for (const t of data.themes) {
      entries.push({ url: `${BASE}/themes/${t.slug}`, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const c of data.companies) {
      entries.push({ url: `${BASE}/companies/${c.slug}`, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const e of data.events) {
      entries.push({ url: `${BASE}/events/${e.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const y of data.years) {
      entries.push({ url: `${BASE}/years/${y}`, changeFrequency: "yearly", priority: 0.4 });
    }
  } catch {
    // Database unavailable — hub URLs only, sitemap still renders.
  }

  return entries;
}


