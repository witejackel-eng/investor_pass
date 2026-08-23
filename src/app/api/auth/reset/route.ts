/**
 * POST /api/auth/reset — consume a password-reset token and set a new password.
 *
 * Also serves as the account-linking completion step for Google-only users
 * (passwordHash "" — they cannot use credentials login today): requesting a
 * reset for their verified email lets them set a password, after which both
 * Google and credentials sign-in work on the same account.
 *
 * On success every existing session is revoked (stolen-session defense) and
 * the token is marked used (single-use).
 */
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = rateLimit(`reset:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let body: { token?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!token || token.length > 128) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (password.length > 200) {
    return NextResponse.json({ error: "Password must be at most 200 characters" }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  let record;
  try {
    record = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link is invalid or has expired. Request a new one." }, { status: 400 });
  }

  try {
    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { passwordHash: hashPassword(password) },
      }),
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all sessions — if someone else held this link, they get nothing.
      db.session.deleteMany({ where: { userId: record.userId } }),
    ]);
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
