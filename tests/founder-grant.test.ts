/**
 * Founder-grant logic tests (pure predicate — no DB, no server-only import:
 * the predicate is duplicated verbatim from src/lib/auth/founder.ts and the
 * canonical list is re-declared here; keep both in sync when editing).
 */
import { describe, expect, test } from "bun:test";

const FOUNDER_GRANTS: readonly string[] = [
  "witejackel@gmail.com", // owner (Aditya) — testing Pro before payments go live
];

function isFounderGrant(email: string | null | undefined): boolean {
  if (!email) return false;
  return FOUNDER_GRANTS.includes(email.trim().toLowerCase());
}

describe("founder grants", () => {
  test("owner email is granted (case/whitespace insensitive)", () => {
    expect(isFounderGrant("witejackel@gmail.com")).toBe(true);
    expect(isFounderGrant("WiteJackel@Gmail.com")).toBe(true);
    expect(isFounderGrant("  witejackel@gmail.com ")).toBe(true);
  });
  test("similar-but-different emails are NOT granted", () => {
    expect(isFounderGrant("witejackel@gmail.com.evil.example")).toBe(false);
    expect(isFounderGrant("notwitejackel@gmail.com")).toBe(false);
    expect(isFounderGrant("witejackel@gmail.co")).toBe(false);
    expect(isFounderGrant("")).toBe(false);
    expect(isFounderGrant(null)).toBe(false);
    expect(isFounderGrant(undefined)).toBe(false);
  });
  test("grant list is lowercase-canonical", () => {
    expect(FOUNDER_GRANTS.length).toBeGreaterThanOrEqual(1);
    expect(FOUNDER_GRANTS.every((e) => e === e.toLowerCase())).toBe(true);
  });
});
