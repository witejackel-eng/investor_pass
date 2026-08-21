import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// POST /api/checkout { variant: "monthly" | "annual" }
// Simulated checkout — in production this would create a Lemon Squeezy checkout
// and redirect. Here we grant entitlement immediately for demonstration,
// recording the subscription state transition server-side.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);

  let body: { variant?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }
  const variant = body.variant;
  if (variant !== "monthly" && variant !== "annual") return error("Invalid variant", 400);

  // Update subscription + entitlement server-side (the source of truth).
  await db.subscription.upsert({
    where: { userId: user.id },
    update: {
      state: "active",
      variant,
      entitlement: "pro",
      currentPeriodEnd: new Date(Date.now() + (variant === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
      canceledAt: null,
    },
    create: {
      userId: user.id,
      state: "active",
      variant,
      entitlement: "pro",
      currentPeriodEnd: new Date(Date.now() + (variant === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
    },
  });
  await db.user.update({ where: { id: user.id }, data: { entitlement: "pro" } });

  return json({ ok: true, entitlement: "pro", variant });
}
