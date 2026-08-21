import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// POST /api/auth/login { email, password }
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) return error("Email and password are required", 400);

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return error("Invalid email or password", 401);
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);

  // Resolve effective entitlement
  let entitlement: "free" | "pro" = user.entitlement as "free" | "pro";
  if (entitlement === "pro") {
    const sub = await db.subscription.findUnique({ where: { userId: user.id } });
    if (sub && !["active", "past_due"].includes(sub.state)) entitlement = "free";
  }

  return json({
    user: { id: user.id, email: user.email, name: user.name, entitlement, role: user.role },
  });
}
