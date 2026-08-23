import { json } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/me — current user + entitlement + server-authoritative country
// (Vercel edge geo header) used for currency defaulting: INR only for India.
export async function GET(req: Request) {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;
  const user = await getSessionUser();
  return NextResponse.json(
    { user, country },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
