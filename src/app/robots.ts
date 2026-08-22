import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

// robots.txt — public research pages are crawlable in production.
// SITE_PRELAUNCH=true fail-safe blocks everything (spec §43, master prompt §30).
const BASE = process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app";

export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_PRELAUNCH === "true") {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}

