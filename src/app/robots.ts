import type { MetadataRoute } from "next";

// robots.txt — public pages indexable in production.
// Master prompt §30: preserve the SITE_PRELAUNCH fail-safe.
export default function robots(): MetadataRoute.Robots {
  const prelaunch = process.env.SITE_PRELAUNCH === "true";
  if (prelaunch) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/library", "/admin"],
      },
    ],
    sitemap: "https://investor-pass.vercel.app/sitemap.xml",
    host: "https://investor-pass.vercel.app",
  };
}
