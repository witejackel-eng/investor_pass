import type { NextConfig } from "next";
import path from "path";

// Security headers applied to every response. CSP keeps Next.js's inline
// hydration payloads working via 'unsafe-inline' (a nonce-based CSP requires
// middleware plumbing); everything else is fully locked down.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://oauth2.googleapis.com https://openidconnect.googleapis.com",
      "form-action 'self' https://accounts.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  // Pin the workspace root — a stray package-lock.json in the user home made
  // Next infer C:\Users\Aditya as root and pick up a foreign src/middleware.ts.
  turbopack: {
    root: path.join(__dirname),
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
