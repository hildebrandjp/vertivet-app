import { type NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./app/shared/config/routes";
import { SESSION_COOKIE } from "./app/shared/config/session";
import { isDemoMode } from "./app/shared/server/env";

/**
 * Optimistic auth gate: send visitors without a session cookie to the
 * login page before any rendering happens. It only checks that the cookie
 * exists; the Data Access Layer (verifySession) does the real check.
 */
export function proxy(request: NextRequest) {
  if (isDemoMode() || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(ROUTES.login, request.url));
}

// Signed-in areas. Matchers must be literals; keep in sync with ROUTES.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pets/:path*",
    "/appointments/:path*",
    "/medical-records/:path*",
    "/settings/:path*",
  ],
};
