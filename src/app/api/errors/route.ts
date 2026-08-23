import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// POST /api/errors — receives client error reports and stores them as
// SearchEvent(name="client_error"). Always returns 204, even on DB failure:
// error intake must never surface an error to the client.

// Simple abuse guard: max 20 requests/min per IP (in-memory, per instance).
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 1000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_LIMIT;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "local";
    if (rateLimited(ip)) return new Response(null, { status: 204 });

    let body: { message?: unknown; stack?: unknown; url?: unknown; userAgent?: unknown };
    try { body = await req.json(); } catch { return new Response(null, { status: 204 }); }

    const message = typeof body.message === "string" ? body.message : "";
    if (!message) return new Response(null, { status: 204 });

    const stack = typeof body.stack === "string" ? body.stack.slice(0, 4000) : undefined;
    const url = typeof body.url === "string" ? body.url.slice(0, 500) : undefined;
    const userAgent = typeof body.userAgent === "string" ? body.userAgent.slice(0, 300) : undefined;

    try {
      const user = await getSessionUser();
      await db.searchEvent.create({
        data: {
          userId: user?.id ?? null,
          name: "client_error",
          props: JSON.stringify({ message: message.slice(0, 500), stack, url, userAgent }),
        },
      });
    } catch {
      // analytics must never break the product
    }
  } catch {
    // absolute guard — always 204
  }
  return new Response(null, { status: 204 });
}
