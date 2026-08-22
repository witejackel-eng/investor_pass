/**
 * Single source of truth for the public site origin.
 * Every absolute URL (metadata, JSON-LD, sitemap, robots, exports) must use this.
 */
export const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app").replace(/\/$/, "");
