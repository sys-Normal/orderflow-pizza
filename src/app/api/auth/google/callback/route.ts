import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { exchangeGoogleCode } from "@/lib/auth/google-oauth";
import {
  createSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/safe-next";
import { OAUTH_NEXT_COOKIE, OAUTH_STATE_COOKIE } from "@/lib/auth/oauth-cookies";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const next = safeNext(cookieStore.get(OAUTH_NEXT_COOKIE)?.value);
  cookieStore.delete(OAUTH_STATE_COOKIE);
  cookieStore.delete(OAUTH_NEXT_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(
      new URL(`/login?error=google&next=${encodeURIComponent(next)}`, request.url)
    );
  }

  try {
    const profile = await exchangeGoogleCode(code);

    // Prefer matching by googleId (stable across email changes); fall back
    // to linking an existing email/password account; otherwise create a new
    // buyer. Any non-buyer account with the same email is left alone — its
    // Google login just fails as "already in use" rather than silently
    // taking over a seller/admin account.
    let user = await prisma.user.findUnique({ where: { googleId: profile.googleId } });
    if (!user) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: profile.email },
      });
      if (existingByEmail && existingByEmail.role !== "buyer") {
        return NextResponse.redirect(
          new URL(`/login?error=email-in-use&next=${encodeURIComponent(next)}`, request.url)
        );
      }
      user = existingByEmail
        ? await prisma.user.update({
            where: { id: existingByEmail.id },
            data: { googleId: profile.googleId },
          })
        : await prisma.user.create({
            data: { email: profile.email, googleId: profile.googleId, role: "buyer" },
          });
    }

    cookieStore.set(
      SESSION_COOKIE,
      createSessionValue({ userId: user.id, role: "buyer" }),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      }
    );

    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return NextResponse.redirect(
      new URL(`/login?error=google&next=${encodeURIComponent(next)}`, request.url)
    );
  }
}
