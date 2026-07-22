import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
    const session = sessionCookie ? verifySessionValue(sessionCookie) : null;
    // A buyer session is valid but not for admin routes — treat it the same
    // as no session at all here.
    if (!session || (session.role !== "seller" && session.role !== "platform_admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (pathname.startsWith("/admin/stores") && session.role !== "platform_admin") {
      return NextResponse.redirect(new URL("/admin/orders", request.url));
    }

    return NextResponse.next();
  }

  // /checkout: guest browsing/cart is fine, but placing an order requires a
  // logged-in buyer. Redirect back here (via `next`) after login/signup.
  // /orders (buyer's own order history) has no guest use case, so it's
  // gated the same way.
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionCookie ? verifySessionValue(sessionCookie) : null;
  if (!session || session.role !== "buyer") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/orders/:path*"],
};
