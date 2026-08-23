/**
 * POST /api/newsletter/subscribe — newsletter signup (Master Plan Phase 19).
 *
 * V1 storage: AppConfig rows keyed `newsletter:<email>` (value = ISO date).
 * Deliberately reuses the existing KV table so the endpoint works on deploy
 * with zero migration. When volume justifies it, port to a dedicated
 * NewsletterSubscriber model — the API contract (this form) stays the same.
 *
 * The form on /newsletter posts here; we redirect back with a query flag
 * (works on statically-rendered pages), rate-limited per IP.
 */
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const rl = rateLimit(`nl-sub:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return Response.redirect(new URL("/newsletter?rate_limited=1", req.url), 303);
  }

  let email = "";
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const body = (await req.json()) as { email?: string };
      email = (body.email || "").trim().toLowerCase();
    } else {
      const form = await req.formData();
      email = String(form.get("email") || "").trim().toLowerCase();
    }
  } catch {
    return Response.redirect(new URL("/newsletter?error=1", req.url), 303);
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.redirect(new URL("/newsletter?error=invalid", req.url), 303);
  }

  try {
    await db.appConfig.upsert({
      where: { key: `newsletter:${email}` },
      update: { value: new Date().toISOString() },
      create: { key: `newsletter:${email}`, value: new Date().toISOString() },
    });
  } catch {
    return Response.redirect(new URL("/newsletter?error=1", req.url), 303);
  }

  return Response.redirect(new URL("/newsletter?subscribed=1", req.url), 303);
}
