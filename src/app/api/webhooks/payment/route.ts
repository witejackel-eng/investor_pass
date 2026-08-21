import { db } from "@/lib/db";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/webhooks/payment — simulated provider webhook.
// In production this would verify a HMAC signature from Lemon Squeezy and
// reconcile the subscription state. Here it accepts a JSON body describing
// the event and applies it, so the entitlement flow is end-to-end testable.
export async function POST(req: Request) {
  let body: { event?: string; userId?: string; variant?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const { event, userId, variant } = body;
  if (!userId) return json({ error: "userId required" }, 400);

  if (event === "subscription_created" || event === "subscription_renewed") {
    await db.subscription.upsert({
      where: { userId },
      update: { state: "active", entitlement: "pro", variant, canceledAt: null, currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      create: { userId, state: "active", entitlement: "pro", variant, currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
    await db.user.update({ where: { id: userId }, data: { entitlement: "pro" } });
  } else if (event === "subscription_canceled" || event === "subscription_expired") {
    await db.subscription.updateMany({ where: { userId }, data: { state: "canceled", entitlement: "free", canceledAt: new Date() } });
    await db.user.update({ where: { id: userId }, data: { entitlement: "free" } });
  }
  return json({ ok: true });
}
