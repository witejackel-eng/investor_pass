/**
 * POST /api/ops/login { password } — Control Room session login.
 * Server-side scrypt verification; HttpOnly+Secure session cookie;
 * 5 attempts / 15 min / IP. Never reveals partial correctness.
 */
import { NextResponse } from "next/server";
import { verifyPassword, createSessionToken, loginGate, OPS_COOKIE } from "@/lib/ops/auth";
import { clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = loginGate(clientIp(req));
  if (!gate.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${gate.retryAfterSec}s.` },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  // Constant-ish work regardless of input shape; single generic failure.
  if (!/^\d{8}$/.test(password) || !verifyPassword(password)) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { token, maxAgeSec } = createSessionToken();
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(OPS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSec,
  });
  return res;
}
