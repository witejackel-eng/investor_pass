/**
 * ALL-ACCESS MODE (paywall dormant).
 *
 * The entire Investor/Pass library is free to every visitor right now.
 * This single switch controls every Pro-gated research surface — every
 * API route resolves `isPro = user?.entitlement === "pro" || isAllAccess()`,
 * so returning `true` here unlocks all 14+ gated routes in one shot.
 *
 * To RE-ACTIVATE the paywall later: change `return true` to `return false`
 * (or restore the date-window check below). The paywall UI elements
 * (PremiumGate, ProBadge, Crown, UPGRADE buttons) have been removed from
 * the rendered surfaces but their component definitions remain in the
 * codebase as no-ops, so re-introducing them is a small surgery.
 *
 * Server-safe (uses Date.now()). Also imported by client components via
 * /api/me which returns entitlement="pro" for everyone while this is on.
 */
export const PROMO_ALL_ACCESS_START = new Date("2026-08-23T00:00:00Z").getTime();
export const PROMO_ALL_ACCESS_UNTIL = new Date("2026-08-26T00:00:00Z").getTime();
export const PROMO_LABEL = "ALL-ACCESS";

// PAYWALL DORMANT — whole site free until manually re-activated.
// To re-enable: replace the body with the date-window check in the comment below.
export function isAllAccess(): boolean {
  return true;
  // const now = Date.now();
  // return now >= PROMO_ALL_ACCESS_START && now < PROMO_ALL_ACCESS_UNTIL;
}
