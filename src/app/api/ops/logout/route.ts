/**
 * POST /api/ops/logout — clear the Control Room session cookie.
 */
import { NextResponse } from "next/server";
import { OPS_COOKIE } from "@/lib/ops/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(OPS_COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
