import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { paymentsMode, type ProviderName } from "@/lib/payments/provider";
import { razorpay } from "@/lib/payments/razorpay";
import { paypal } from "@/lib/payments/paypal";

export const dynamic = "force-dynamic";

// POST /api/checkout { variant: "monthly" | "annual", provider?: "razorpay" | "paypal" }
// PAYMENTS_MODE=live routes through the real processor; otherwise grants demo entitlement.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);

  let body: { variant?: string; provider?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }
  const variant = body.variant;
  if (variant !== "monthly" && variant !== "annual") return error("Invalid variant", 400);

  if (paymentsMode() !== "live") {
    // DEMO MODE — grant entitlement immediately so the product is fully explorable
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
