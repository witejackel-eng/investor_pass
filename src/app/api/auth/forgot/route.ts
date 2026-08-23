/**
 * POST /api/auth/forgot — request a password-reset token.
 *
 * Always responds { ok: true } (no account enumeration). When the email
 * exists, a single-use token (60 min) is stored sha256-hashed; any previous
 * live token for that user is invalidated first.
 *
 * Email delivery ships with Wave K. Until then, while SITE_PRELAUNCH !==
 * "false", the response carries resetPath so the flow is testable E2E.
 * Flip SITE_PRELAUNCH=false in production and this leaks nothing.
 */
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  let body: { email?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: true }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const prelaunch = process.env.SITE_PRELAUNCH !== "false";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    // Same generic answer as every other failure — no enumeration signal.
    return NextResponse.json({ ok: true });
  }

  let resetPath: string | undefined;
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      const raw = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(raw).digest("hex");
      // Invalidate previous tokens by consuming them, then store the new one.
      await db.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });
      if (prelaunch) {
        resetPath = `/reset?token=${raw}`;
      }
      // Wave K: await sendPasswordResetEmail(email, raw) lands here.
    }
  } catch {
    // Fall through to the same generic response.
  }

  return NextResponse.json(prelaunch && resetPath ? { ok: true, resetPath } : { ok: true });
}
