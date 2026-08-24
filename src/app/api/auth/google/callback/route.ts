/**
 * GET /api/auth/google/callback — exchanges the OAuth code for tokens,
 * finds or creates the User, and issues the same ip_session cookie used
 * by email/password login. Google accounts carry passwordHash: "" which
 * verifyPassword() always rejects, so they can only sign in via Google.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Trust only the configured site origin for OAuth redirects. Deriving the
 * origin from x-forwarded-* headers allowed host-header injection on hosts
 * without a locked-down proxy; in production we pin to PUBLIC_SITE_URL.
 */
function siteUrl(req: Request): string {
  if (process.env.NODE_ENV === "production") {
    return (process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app").replace(/\/$/, "");
  }
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = req.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

function oauthRedirect(req: Request, errMsg?: string) {
  const dest = errMsg ? `${siteUrl(req)}/login?error=google&reason=${encodeURIComponent(errMsg)}` : `${siteUrl(req)}/`;
  return NextResponse.redirect(dest);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const expectedState = store.get("ip_oauth_state")?.value;
  store.delete("ip_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return oauthRedirect(req, "state_mismatch");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return oauthRedirect(req, "unconfigured");

  // Exchange authorization code for tokens
  let accessToken: string | undefined;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${siteUrl(req)}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return oauthRedirect(req, "token_exchange");
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    accessToken = tokenJson.access_token;
  } catch {
    return oauthRedirect(req, "token_exchange");
  }
  if (!accessToken) return oauthRedirect(req, "token_exchange");

  // Fetch verified profile (userinfo endpoint avoids local JWT verification)
  let profile: { sub?: string; email?: string; name?: string; email_verified?: boolean };
  try {
    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!infoRes.ok) return oauthRedirect(req, "profile");
    profile = await infoRes.json();
  } catch {
    return oauthRedirect(req, "profile");
  }

  const email = profile.email?.trim().toLowerCase();
  if (!email || profile.email_verified === false) return oauthRedirect(req, "no_email");

  // Find or create the user. Entitlement defaults to free and is resolved
  // per-request by getSessionUser(), identical to credentials accounts.
  let user;
  try {
    user = await db.user.findUnique({ where: { email } });
    if (!user) {
      user = await db.user.create({
        data: { email, name: profile.name || null, passwordHash: "" },
      });
    }
  } catch {
    return oauthRedirect(req, "db");
  }

  let signed: string;
  try {
    signed = await createSession(user.id);
  } catch (e) {
    console.error("[auth/google] session creation failed:", e instanceof Error ? e.message : e);
    return oauthRedirect(req, "session");
  }

  // Set the session cookie directly on the redirect response — the most
  // reliable delivery through a 307 (mutations via the cookies() store can
  // be dropped by some proxies in front of redirects).
  const res = oauthRedirect(req);
  res.cookies.set(SESSION_COOKIE_NAME, signed, SESSION_COOKIE_OPTIONS);
  return res;
}
