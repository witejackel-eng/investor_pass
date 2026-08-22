import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/server/public-pages";

// sitemap.xml — crawlable public research surface (Lane B, spec §43).
// Index ONLY meaningful, stable pages: active investors, investor×theme topic
// pairs with ≥3 references and ≥1 public passage, and theme/company/event/year
// entities with ≥1 public passage.
export const revalidate = 3600;

const BASE = process.env.PUBLIC_SITE_URL || "https://investor-pass.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Prelaunch fail-safe: emit nothing while SITE_PRELAUNCH=true.
  if (process.env.SITE_PRELAUNCH === "true") return [];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/investors`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  try {
    const data = await getSitemapData();

    for (const inv of data.investors) {
      entries.push({
        url: `${BASE}/investors/${inv.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
    for (const pair of data.topicPairs) {
      entries.push({
        url: `${BASE}/investors/${pair.personSlug}/topics/${pair.themeSlug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
    for (const t of data.themes) {
      entries.push({ url: `${BASE}/themes/${t.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const c of data.companies) {
      entries.push({ url: `${BASE}/companies/${c.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const e of data.events) {
      entries.push({ url: `${BASE}/events/${e.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const y of data.years) {
      entries.push({ url: `${BASE}/years/${y}`, lastModified: now, changeFrequency: "yearly", priority: 0.4 });
    }
  } catch {
    // Database unavailable (e.g. build without the SQLite file) — hub only.
  }

  return entries;
}
