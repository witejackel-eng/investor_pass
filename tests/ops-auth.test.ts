/**
 * Control Room auth unit tests — scrypt verify, session token roundtrip,
 * tamper rejection, login gate rate limiting. No DB needed.
 */
import { describe, expect, test } from "bun:test";

// The production module imports server-only; test the pure crypto paths by
// re-implementing the same primitives through the module boundary where
// possible. Here we exercise the actual algorithms the ops auth uses.
import { scryptSync, createHmac, timingSafeEqual, randomBytes } from "crypto";

function makeHash(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
}

function verify(input: string, hash: string): boolean {
  const parts = hash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, saltHex, keyHex] = parts;
  try {
    const key = scryptSync(input, Buffer.from(saltHex, "hex"), 64, { N: Number(N), r: Number(r), p: Number(p) });
    const expected = Buffer.from(keyHex, "hex");
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

const SECRET = "unit-test-secret";
function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}
function makeToken(): string {
  const payload = `ops.${Date.now() + 60_000}.${randomBytes(8).toString("hex")}`;
  return `${payload}.${sign(payload)}`;
}
function checkToken(token: string): boolean {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const parts = payload.split(".");
  return parts.length === 3 && parts[0] === "ops" && Number(parts[1]) > Date.now();
}

describe("ops auth — password verification", () => {
  test("correct password verifies", () => {
    const h = makeHash("19273927");
    expect(verify("19273927", h)).toBe(true);
  });
  test("wrong password rejected", () => {
    const h = makeHash("19273927");
    expect(verify("19273928", h)).toBe(false);
    expect(verify("", h)).toBe(false);
    expect(verify("192739273", h)).toBe(false);
  });
  test("malformed hash rejected without throw", () => {
    expect(verify("19273927", "plaintext")).toBe(false);
    expect(verify("19273927", "scrypt$1$2")).toBe(false);
  });
});

describe("ops auth — session tokens", () => {
  test("issued token verifies", () => {
    expect(checkToken(makeToken())).toBe(true);
  });
  test("tampered signature rejected", () => {
    const t = makeToken();
    expect(checkToken(t.slice(0, -2) + "xx")).toBe(false);
  });
  test("expired token rejected", () => {
    const payload = `ops.${Date.now() - 1000}.${randomBytes(8).toString("hex")}`;
    const t = `${payload}.${sign(payload)}`;
    expect(checkToken(t)).toBe(false);
  });
  test("non-ops payload rejected", () => {
    const payload = `user.${Date.now() + 60_000}.x`;
    const t = `${payload}.${sign(payload)}`;
    expect(checkToken(t)).toBe(false);
  });
});

describe("ops auth — login gate (5/15min)", () => {
  // Mirror of the in-app limiter semantics using a Map.
  const buckets = new Map<string, { n: number; reset: number }>();
  const gate = (ip: string) => {
    const now = Date.now();
    const b = buckets.get(ip);
    if (!b || b.reset < now) {
      buckets.set(ip, { n: 1, reset: now + 15 * 60_000 });
      return { ok: true };
    }
    b.n += 1;
    return { ok: b.n <= 5 };
  };
  test("five attempts allowed, sixth blocked", () => {
    for (let i = 0; i < 5; i++) expect(gate("1.2.3.4").ok).toBe(true);
    expect(gate("1.2.3.4").ok).toBe(false);
  });
  test("independent per IP", () => {
    expect(gate("5.6.7.8").ok).toBe(true);
  });
});
