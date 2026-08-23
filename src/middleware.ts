import { NextRequest, NextResponse } from "next/server";

/**
 * Control Room gate — runs at the edge BEFORE any /ops page or /api/ops
 * handler. Verifies the ops session cookie with the same HMAC the server
 * issued (Web Crypto, edge-safe). Unauthenticated → redirect (pages) or
 * 401 JSON (APIs). All /ops responses get noindex + no-store.
 *
 * DNS note: ops.investorpass.com is a CNAME to the same Vercel deployment;
 * this path gate serves both origins without touching the public site.
 */

const COOKIE = "ip_ops_session";
const SECRET_FALLBACK = "73f2b0963461934fdf5e595c5e88f22fe4adc155aa53911b5d48f11139739a88";

async function hmac(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  let bin = "";
  const bytes = new Uint8Array(sig);
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function validSession(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmac(payload, secret);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return false;
  const parts = payload.split(".");
  return parts.length === 3 && parts[0] === "ops" && Number(parts[1]) > Date.now();
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login endpoints and the login page stay reachable (they set the session).
  if (pathname === "/ops/login" || pathname === "/api/ops/login") {
    if (pathname.startsWith("/ops/")) {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/ops") || pathname.startsWith("/api/ops")) {
    // Prefer env secret when the deployment provides it.
    const secret = process.env.OPS_SECRET || process.env.SESSION_SECRET || SECRET_FALLBACK;
    const authed = await validSession(req.cookies.get(COOKIE)?.value, secret);

    if (!authed) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Control Room authentication required" },
          { status: 401, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } }
        );
      }
      const url = req.nextUrl.clone();
      url.pathname = "/ops/login";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ops/:path*", "/api/ops/:path*"],
};
