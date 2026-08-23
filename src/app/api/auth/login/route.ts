import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import {
  verifyPassword,
  isLegacyPasswordHash,
  hashPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// POST /api/auth/login { email, password }
export async function POST(req: Request) {
  const rl = rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!rl.ok) return error("Too many attempts. Try again in a few minutes.", 429);

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
  // Constant-ish time: always run a password verification, even when the
  // user doesn't exist, to blunt the user-enumeration timing oracle.
  const storedHash = user?.passwordHash || hashPassword("invalid-password-placeholder");
  const valid = verifyPassword(password, storedHash) && Boolean(user);
  if (!user || !valid) {
    return error("Invalid email or password", 401);
  }

  // Transparent upgrade: legacy single-SHA-256 hashes are re-hashed with
  // scrypt on the first successful login after this change.
  if (isLegacyPasswordHash(user.passwordHash)) {
    await db.user
      .update({ where: { id: user.id }, data: { passwordHash: hashPassword(password) } })
      .catch(() => {});
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
