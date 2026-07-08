import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth/google-oauth";
import { safeNext } from "@/lib/auth/safe-next";
import { OAUTH_NEXT_COOKIE, OAUTH_STATE_COOKIE, OAUTH_COOKIE_MAX_AGE_SECONDS } from "@/lib/auth/oauth-cookies";

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  };
  cookieStore.set(OAUTH_STATE_COOKIE, state, cookieOptions);
  cookieStore.set(OAUTH_NEXT_COOKIE, next, cookieOptions);

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
