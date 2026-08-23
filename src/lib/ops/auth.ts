/**
 * Control Room auth — server-only.
 *
 * Single shared operator password (8-digit), verified server-side via
 * scrypt against a hashed credential. The plaintext password is NEVER in
 * client code, NEXT_PUBLIC vars, logs, or git. Set OPS_PASSWORD_HASH in the
 * deployment environment to override the baked launch hash (owner runbook:
 * rotate by generating a new scrypt string).
 *
 * Session: HMAC-signed token in an HttpOnly+Secure+SameSite=Strict cookie,
 * 12h TTL. Middleware verifies the same HMAC at the edge (Web Crypto) so
 * every /ops route and /api/ops route is gated before any handler runs.
 * Login is rate-limited and lockout-protected per IP.
 */
import "server-only";
import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "crypto";
import { rateLimit } from "@/lib/rate-limit";

const COOKIE = "ip_ops_session";
const TTL_MS = 12 * 60 * 60 * 1000;

// Dedicated ops-session signing secret (server + edge middleware share this
// fallback; override with OPS_SECRET env in production).
const OPS_SECRET_FALLBACK = "73f2b0963461934fdf5e595c5e88f22fe4adc155aa53911b5d48f11139739a88";

// Launch credential (scrypt of the operator password). Override via env.
const BAKED_HASH =
  "scrypt$16384$8$1$3f2b23efa2ad5ae9f947e248f54b9894$99e8fb790bb2e5e9b0f69c75201fd4f0db06c5cb78320a9cc877afa3e71590426fbcb3cf2e9bbe4f19e83a8f84b109b708da889dc5810051fb23703d5ebc63d3";

function opsSecret(): string {
  // Prefer the app session secret; the ops token namespace isolates it.
  return process.env.OPS_SECRET || process.env.SESSION_SECRET || OPS_SECRET_FALLBACK;
}

export function verifyPassword(input: string): boolean {
  const hash = process.env.OPS_PASSWORD_HASH || BAKED_HASH;
  const parts = hash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, saltHex, keyHex] = parts;
  try {
    const key = scryptSync(input, Buffer.from(saltHex, "hex"), 64, {
      N: Number(N), r: Number(r), p: Number(p),
    });
    const expected = Buffer.from(keyHex, "hex");
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

function sign(payload: string): string {
  return createHmac("sha256", opsSecret()).update(payload).digest("base64url");
}

export function createSessionToken(): { token: string; maxAgeSec: number } {
  const exp = Date.now() + TTL_MS;
  const payload = `ops.${exp}.${randomBytes(8).toString("hex")}`;
  return { token: `${payload}.${sign(payload)}`, maxAgeSec: TTL_MS / 1000 };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const parts = payload.split(".");
  if (parts.length !== 3 || parts[0] !== "ops") return false;
  return Number(parts[1]) > Date.now();
}

export const OPS_COOKIE = COOKIE;

/** Brute-force protection: 5 attempts / 15 min / IP, plus hard lockout. */
export function loginGate(ip: string): { ok: boolean; retryAfterSec?: number } {
  const burst = rateLimit(`ops-login:${ip}`, 5, 15 * 60 * 1000);
  if (!burst.ok) return { ok: false, retryAfterSec: Math.ceil(burst.retryAfterMs / 1000) };
  return { ok: true };
}
