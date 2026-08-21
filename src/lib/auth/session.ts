/**
 * Server-only auth utilities.
 * Lightweight email/password auth with hashed passwords and signed session tokens.
 * Entitlement is resolved server-side from the Subscription state.
 */
import "server-only";
import { db } from "../db";
import { cookies } from "next/headers";

const SESSION_COOKIE = "ip_session";
const SESSION_TTL_DAYS = 30;

// Tiny hashing — NOT crypto-grade, but adequate for a local MVP that never
// exposes real secrets. Uses Node's crypto for pbkdf2-like derivation.
import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(salt + password).digest("hex");
  return `pbkdf2$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const [, salt, hash] = parts;
  const computed = createHash("sha256").update(salt + password).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export function newSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function tokenSignature(token: string): string {
  return createHash("sha256").update(token + (process.env.SESSION_SECRET || "investor-pass-dev-secret")).digest("hex").slice(0, 16);
}

export function signToken(token: string): string {
  return `${token}.${tokenSignature(token)}`;
}

export function verifySignedToken(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const token = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  if (tokenSignature(token) !== sig) return null;
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
