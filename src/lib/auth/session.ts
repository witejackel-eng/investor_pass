/**
 * Server-only auth utilities.
 * Email/password auth with scrypt password hashing and HMAC-signed session tokens.
 * Entitlement is resolved server-side from the Subscription state.
 */
import "server-only";
import { db } from "../db";
import { cookies } from "next/headers";

const SESSION_COOKIE = "ip_session";
const SESSION_TTL_DAYS = 30;

import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

// ── Password hashing (scrypt) ────────────────────────────────────────────────
// Format: scrypt$N$r$p$saltHex$keyHex
// Legacy format (pre-hardening): pbkdf2$saltHex$sha256Hex — verified for
// backwards compatibility and transparently upgraded on next login.

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${key.toString("hex")}`;
}

/** True when the stored hash uses the legacy single-SHA-256 scheme. */
export function isLegacyPasswordHash(stored: string): boolean {
  return stored.startsWith("pbkdf2$");
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    if (stored.startsWith("scrypt$")) {
      const parts = stored.split("$");
      if (parts.length !== 6) return false;
      const [, nStr, rStr, pStr, saltHex, keyHex] = parts;
      const N = parseInt(nStr, 10);
      const r = parseInt(rStr, 10);
      const p = parseInt(pStr, 10);
      if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;
      const salt = Buffer.from(saltHex, "hex");
      const expected = Buffer.from(keyHex, "hex");
      const computed = scryptSync(password, salt, expected.length, { N, r, p });
      return timingSafeEqual(computed, expected);
    }
    // Legacy "pbkdf2$salt$sha256(salt+password)" — upgrade path only.
    const parts = stored.split("$");
    if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
    const [, salt, hash] = parts;
    const computed = createHash("sha256").update(salt + password).digest("hex");
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

/** Constant-time compare of a computed hex digest against a stored hex string. */
function safeHexEqual(aHex: string, bHex: string): boolean {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

// ── Session tokens ───────────────────────────────────────────────────────────

export function newSessionToken(): string {
  return randomBytes(32).toString("hex");
}

function sessionSecret(): string {
  // Fail closed in production if the secret is missing.
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret || "investor-pass-dev-secret";
}

export function tokenSignature(token: string): string {
  return createHmac("sha256", sessionSecret()).update(token).digest("hex");
}

export function signToken(token: string): string {
  return `${token}.${tokenSignature(token)}`;
}

export function verifySignedToken(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const token = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  if (!token || !sig) return null;
  if (!safeHexEqual(tokenSignature(token), sig)) return null;
  return token;
}

export async function createSession(userId: string): Promise<string> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { userId, token, expiresAt } });
  return signToken(token);
}

export async function getSessionUser(): Promise<{
  id: string;
  email: string;
  name: string | null;
  entitlement: "free" | "pro";
  role: "user" | "admin";
} | null> {
  const store = await cookies();
  const signed = store.get(SESSION_COOKIE)?.value;
  if (!signed) return null;
  const token = verifySignedToken(signed);
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  // Resolve effective entitlement: subscription state must be active/past_due to be pro.
  let entitlement: "free" | "pro" = session.user.entitlement as "free" | "pro";
  if (entitlement === "pro") {
    const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
    if (sub && !["active", "past_due"].includes(sub.state)) {
      entitlement = "free";
    }
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    entitlement,
    role: session.user.role as "user" | "admin",
  };
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
