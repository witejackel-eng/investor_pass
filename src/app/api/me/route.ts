import { json } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { isAllAccess } from "@/lib/promo";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/me — current user + entitlement + server-authoritative country
// (Vercel edge geo header) used for currency defaulting: INR only for India.
export async function GET(req: Request) {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;
  let user = await getSessionUser();
  // 3-day all-access: anonymous visitors get a client-side Pro entitlement
  // so all UI gates (pricing, upgrade prompts) disappear. Server-side
  // research APIs independently check isAllAccess() for anonymous access.
  // Personal features (save/follow) still require a real free account.
  if (!user && isAllAccess()) {
    user = { id: "", email: "", name: null, entitlement: "pro", role: "user" };
  }
  return NextResponse.json(
    { user, country, allAccess: isAllAccess() },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
