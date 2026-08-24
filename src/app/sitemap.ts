import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/server/public-pages";
import { EXPLAINERS } from "@/data/learn/explainers";
import { ISSUES } from "@/data/newsletter/issues";

// sitemap.xml — crawlable public research surface. Index ONLY meaningful,
// stable pages (see docs/ROUTES.md). All entity data comes from the cached,
// failure-safe getSitemapData(); if the database is unreachable the sitemap
// degrades to static entries instead of failing the build (outage lesson).
export const revalidate = 3600;

const BASE = process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Prelaunch fail-safe: emit nothing while SITE_PRELAUNCH=true.
  if (process.env.SITE_PRELAUNCH === "true") return [];

  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/learn`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/newsletter`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/investors`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/founders`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/trails`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/changelog`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/legal`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/search`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/compare`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/letters/buffett`, changeFrequency: "monthly", priority: 0.9 },
  ];

  for (const slug of EXPLAINERS.map((e) => e.slug)) {
    entries.push({ url: `${BASE}/learn/${slug}`, changeFrequency: "monthly", priority: 0.8 });
  }
  for (const slug of ISSUES.map((i) => i.slug)) {
    entries.push({ url: `${BASE}/newsletter/${slug}`, changeFrequency: "monthly", priority: 0.7 });
  }
  for (const slug of ["terms", "privacy", "cookies", "copyright", "disclaimer", "refunds"]) {
    entries.push({ url: `${BASE}/legal/${slug}`, changeFrequency: "yearly", priority: 0.3 });
  }
  for (const t of ["how-buffett-learned-to-value-quality", "2008-through-five-investors", "margin-of-safety-graham-to-klarman"]) {
    entries.push({ url: `${BASE}/trails/${t}`, changeFrequency: "monthly", priority: 0.8 });
  }

  // Entity data — one cached, failure-safe call. Null → static entries only.
  const data = await getSitemapData();
  if (!data) return entries;

  for (const inv of data.investors) {
    entries.push({
      url: `${BASE}/investors/${inv.slug}`,
      lastModified: inv.lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    });
    entries.push({ url: `${BASE}/kb/${inv.slug}`, changeFrequency: "weekly", priority: 0.8 });
  }
  for (const f of data.founders) {
    entries.push({
      url: `${BASE}/founders/${f.slug}`,
      lastModified: f.lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }
  // Build a founder-slug set so topic-pair URLs can be routed to the
  // founder surface (/founders/<slug>/topics/...) when the person is a
  // founder, and to the investor surface (/investors/<slug>/topics/...)
  // otherwise — both render the same underlying data via getInvestorTopic,
  // but the breadcrumb + canonical differ.
  const founderSlugs = new Set(data.founders.map((f) => f.slug));
  for (const pair of data.topicPairs) {
    const root = founderSlugs.has(pair.personSlug) ? "founders" : "investors";
    entries.push({
      url: `${BASE}/${root}/${pair.personSlug}/topics/${pair.themeSlug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const t of data.themes) {
    entries.push({ url: `${BASE}/themes/${t.slug}`, changeFrequency: "monthly", priority: 0.7 });
  }
  for (const c of data.companies) {
    entries.push({ url: `${BASE}/companies/${c.slug}`, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const e of data.events) {
    entries.push({ url: `${BASE}/events/${e.slug}`, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const y of data.years) {
    entries.push({ url: `${BASE}/years/${y}`, changeFrequency: "yearly", priority: 0.4 });
  }

  return entries;
}
