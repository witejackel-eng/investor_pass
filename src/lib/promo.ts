/**
 * 3-day all-access promo (2026-08-24 → 2026-08-27 UTC).
 * While active: every Pro-gated research surface is open to all visitors,
 * and all pricing/upgrade UI is hidden. Auto-reverts after the window.
 *
 * Server-safe (uses Date.now()). Also imported by client components via
 * /api/me which returns entitlement="pro" for everyone during the window.
 */
export const PROMO_ALL_ACCESS_START = new Date("2026-08-24T00:00:00Z").getTime();
export const PROMO_ALL_ACCESS_UNTIL = new Date("2026-08-27T00:00:00Z").getTime();
export const PROMO_LABEL = "ALL-ACCESS";

export function isAllAccess(): boolean {
  const now = Date.now();
  return now >= PROMO_ALL_ACCESS_START && now < PROMO_ALL_ACCESS_UNTIL;
}
