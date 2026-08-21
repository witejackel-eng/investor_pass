import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// POST /api/auth/signup { email, password, name? }
export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const name = (body.name || "").trim() || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("A valid email is required", 400);
  if (password.length < 8) return error("Password must be at least 8 characters", 400);

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

  const token = await createSession(user.id);
  await setSessionCookie(token);

  return json({
    user: { id: user.id, email: user.email, name: user.name, entitlement: "free", role: "user" },
  });
}
