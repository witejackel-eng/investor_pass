import { json } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/me — current user + entitlement
export async function GET() {
  const user = await getSessionUser();
  if (!user) return json({ user: null });
  return json({ user });
}
