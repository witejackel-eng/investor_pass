/**
 * GET /api/auth/google — starts the Google OAuth flow.
 * Derives redirect_uri from the incoming request origin so local, preview,
 * and production deployments all work with their registered console URIs.
 */
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/**
 * Trust only the configured site origin for the OAuth redirect_uri. In
 * production the origin is pinned to PUBLIC_SITE_URL; request-header
 * derivation remains only for local development.
 */
function origin(req: Request): string {
  if (process.env.NODE_ENV === "production") {
    return (process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app").replace(/\/$/, "");
  }
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = req.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response("Google login is not configured", { status: 500 });
  }

  const redirectUri = `${origin(req)}/api/auth/google/callback`;

  const state = randomBytes(16).toString("hex");

  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("prompt", "select_account");

  // Set the CSRF state cookie directly on the redirect response so no proxy
  // or runtime cookie-store quirk can drop it mid-flow.
  const res = NextResponse.redirect(auth.toString(), 302);
  res.cookies.set("ip_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
