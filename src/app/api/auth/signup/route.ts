import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// POST /api/auth/signup { email, password, name? }
export async function POST(req: Request) {
  const rl = rateLimit(`signup:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) return error("Too many attempts. Try again later.", 429);

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const name = (body.name || "").trim().slice(0, 80) || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("A valid email is required", 400);
  if (password.length < 8) return error("Password must be at least 8 characters", 400);
  if (password.length > 200) return error("Password must be at most 200 characters", 400);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return error("An account with that email already exists", 409);

  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash: hashPassword(password),
      entitlement: "free",
      role: "user",
      subscription: { create: { state: "free", entitlement: "free" } },
    },
  });

  let token: string;
  try {
    token = await createSession(user.id);
  } catch (e) {
    console.error("[auth/signup] session creation failed:", e instanceof Error ? e.message : e);
    return error("Sign-up is temporarily unavailable. Please try again in a moment.", 500);
  }
  await setSessionCookie(token);

  return json({
    user: { id: user.id, email: user.email, name: user.name, entitlement: "free", role: "user" },
  });
}
