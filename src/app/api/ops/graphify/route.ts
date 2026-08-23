/**
 * GET /api/ops/graphify — serve the self-contained Graphify repo map
 * (graph.html) to authenticated Control Room sessions only. Private.
 */
import { GRAPHIFY_HTML_B64 } from "@/data/ops/graphify-html";

export const dynamic = "force-dynamic";

export async function GET() {
  const html = Buffer.from(GRAPHIFY_HTML_B64, "base64").toString("utf8");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy": "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline' data: blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'",
    },
  });
}
