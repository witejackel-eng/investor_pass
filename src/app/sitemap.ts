import type { MetadataRoute } from "next";

// sitemap.xml — includes public investor pages, topics, companies, years, sources.
// Master prompt §30 SEO requirement.
// Wrapped in try-catch so the build doesn't fail when the database is
// unavailable (e.g. on Vercel build where the SQLite file may not exist).
export const revalidate = 3600; // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.PUBLIC_SITE_URL || "https://investor-pass.vercel.app";
  const prelaunch = process.env.SITE_PRELAUNCH === "true";

  if (prelaunch) return [];

  // Base entries that don't require database access
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/#/view=investors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/#/view=investor&slug=buffett`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/#/view=timeline&slug=buffett`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/#/view=search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Try to add database-driven entries; if the database is unavailable
  // (e.g. during Vercel build), return the base entries only.
  try {
    const { db } = await import("@/lib/db");
    const [people, sources, themes, companies, buffett] = await Promise.all([
      db.person.findMany({ where: { status: "active" } }),
      db.source.findMany({ include: { person: true } }),
      db.theme.findMany(),
      db.company.findMany(),
      db.person.findUnique({ where: { slug: "buffett" } }),
    ]);

    for (const p of people) {
      entries.push({ url: `${BASE}/#/view=investor&slug=${p.slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 });
      entries.push({ url: `${BASE}/#/view=timeline&slug=${p.slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
    }
    for (const s of sources) {
      entries.push({ url: `${BASE}/#/view=source&slug=${s.slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 });
    }
    for (const t of themes) {
      entries.push({ url: `${BASE}/#/view=topic&slug=${t.slug}&investor=buffett`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 });
    }
    for (const c of companies) {
      entries.push({ url: `${BASE}/#/view=company&slug=${c.slug}&investor=buffett`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 });
    }
    if (buffett) {
      const years = await db.source.findMany({ where: { personId: buffett.id, year: { not: null } }, distinct: ["year"] });
      for (const y of years) {
        if (y.year) entries.push({ url: `${BASE}/#/view=year&year=${y.year}&investor=buffett`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 });
      }
    }
  } catch {
    // Database unavailable — return base entries only
  }

  return entries;
}
