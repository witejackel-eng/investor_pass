import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { paymentsMode, type ProviderName } from "@/lib/payments/provider";
import { razorpay } from "@/lib/payments/razorpay";
import { paypal } from "@/lib/payments/paypal";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// POST /api/checkout { variant: "monthly" | "annual", provider?: "razorpay" | "paypal" }
// PAYMENTS_MODE=live routes through the real processor. Demo entitlement grants
// are DISABLED unless MOCK_CHECKOUT_ENABLED=true is set explicitly — a checkout
// endpoint must never hand out real entitlements by default.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);

  const rl = rateLimit(`checkout:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.ok) return error("Too many checkout attempts. Try again later.", 429);

  let body: { variant?: string; provider?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }
  const variant = body.variant;
  if (variant !== "monthly" && variant !== "annual") return error("Invalid variant", 400);

  if (paymentsMode() !== "live") {
    // DEMO MODE — opt-in only. Set MOCK_CHECKOUT_ENABLED=true to let the
    // pre-launch demo grant Pro without payment. Never enable in production
    // once payments are live.
    if (process.env.MOCK_CHECKOUT_ENABLED !== "true") {
      return error("Payments are not live yet. Pro launches soon — join the list to be notified.", 503);
    }
    const periodEnd = new Date(Date.now() + (variant === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000);
    await db.subscription.upsert({
      where: { userId: user.id },
      update: {
        state: "active",
        variant,
        entitlement: "pro",
        currentPeriodEnd: periodEnd,
        canceledAt: null,
      },
      create: { userId: user.id, state: "active", variant, entitlement: "pro", currentPeriodEnd: periodEnd },
    });
    await db.user.update({ where: { id: user.id }, data: { entitlement: "pro" } });
    return json({ ok: true, mode: "demo", entitlement: "pro", variant });
  }

  const providerName: ProviderName = body.provider === "paypal" ? "paypal" : "razorpay";
  const adapter = providerName === "razorpay" ? razorpay : paypal;
  if (!adapter.configured())
    return error(`${providerName} is not configured yet — try the other payment method`, 503);

  try {
    const result = await adapter.createCheckout(variant);
    if (result.mode === "unconfigured") return error(result.reason, 503);

    await db.subscription.upsert({
      where: { userId: user.id },
      update: { state: "checkout_started", variant, provider: providerName, providerRef: result.providerRef },
      create: {
        userId: user.id,
        state: "checkout_started",
        variant,
        entitlement: "free",
        provider: providerName,
        providerRef: result.providerRef,
      },
    });
    return json({ ok: true, mode: "redirect", url: result.url });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Checkout failed", 502);
  }
}
