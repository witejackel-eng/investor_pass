/**
 * GET /api/auth/google — starts the Google OAuth flow.
 * Derives redirect_uri from the incoming request origin so local, preview,
 * and production deployments all work with their registered console URIs.
 */
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response("Google login is not configured", { status: 500 });
  }

  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = req.headers.get("host") || url.host;
  const siteUrl = `${proto}://${host}`;
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  const state = randomBytes(16).toString("hex");
  const store = await cookies();
  store.set("ip_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("prompt", "select_account");

  return Response.redirect(auth.toString(), 302);
}
