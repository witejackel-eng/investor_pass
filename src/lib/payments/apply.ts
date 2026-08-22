import "server-only";
import { db } from "@/lib/db";

const ENTITLEMENT_BY_STATE: Record<string, string> = {
  active: "pro",
  past_due: "pro",
  checkout_started: "free",
  canceled: "free",
  expired: "free",
  free: "free",
};

export function entitlementForState(state: string): string {
  return ENTITLEMENT_BY_STATE[state] ?? "free";
}

export async function applySubscriptionState(
  userId: string,
  state: string,
  opts?: { provider?: string; providerRef?: string; variant?: string }
) {
  const entitlement = entitlementForState(state);
  await db.subscription.upsert({
    where: { userId },
    update: { state, entitlement, ...(opts?.provider && { provider: opts.provider }), ...(opts?.variant && { variant: opts.variant }) },
    create: {
      userId,
      state,
      entitlement,
      ...(opts?.provider && { provider: opts.provider }),
      ...(opts?.providerRef && { providerRef: opts.providerRef }),
      ...(opts?.variant && { variant: opts.variant }),
    },
  });
  await db.user.update({ where: { id: userId }, data: { entitlement } });
}

export async function applySubscriptionStateByRef(provider: string, providerRef: string, state: string) {
  const sub = await db.subscription.findUnique({ where: { providerRef }, include: { user: true } });
  if (!sub) return false;
  await applySubscriptionState(sub.userId, state, { provider, providerRef });
  return true;
}
