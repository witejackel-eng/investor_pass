import "server-only";

/**
 * Founder / operator test grants — server-side entitlement grants for the
 * product owner(s). Authorized by the owner (2026-08-23) so their own login
 * carries Pro while payment processors are not yet live.
 *
 * Rules:
 * - Applies ONLY to exact lowercase email matches in this list.
 * - Idempotent: once granted (User.entitlement = pro + active Subscription),
 *   the hook is a no-op comparison on every later session load.
 * - Auditable: Subscription rows carry provider "founder_grant" and a
 *   variant note; the ops dashboard counts them like any active sub.
 * - Removable: delete the email from FOUNDER_GRANTS (existing grant stays
 *   until manually canceled, per owner instruction).
 */
export const FOUNDER_GRANTS: readonly string[] = [
  "witejackel@gmail.com", // owner (Aditya) — testing Pro before payments go live
];

export function isFounderGrant(email: string | null | undefined): boolean {
  if (!email) return false;
  return FOUNDER_GRANTS.includes(email.trim().toLowerCase());
}
