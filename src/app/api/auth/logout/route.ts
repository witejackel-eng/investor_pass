import { db } from "@/lib/db";
import { json } from "@/lib/api";
import { getSessionUser, clearSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// POST /api/auth/logout
export async function POST() {
  const user = await getSessionUser();
  if (user) {
    // delete all sessions for the user (simple logout everywhere)
    await db.session.deleteMany({ where: { userId: user.id } }).catch(() => {});
  }
  await clearSessionCookie();
  return json({ ok: true });
}
