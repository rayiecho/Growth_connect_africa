import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/firebase/session-cookie";

/**
 * Edge-runtime guard for /admin/*.
 *
 * We deliberately only check for cookie *presence* here. Edge runtime
 * doesn't have access to firebase-admin's certificate-based credential
 * helpers without extra polyfills, and verifying JWTs on every request
 * would also add latency. Verification of the cookie's signature is
 * done in server components / route handlers via `requireAdmin()`
 * (firebase-admin confirms the cookie each call).
 *
 * What this gate ensures:
 *   - Anonymous traffic to /admin/* → redirected to /admin/login.
 *   - Authenticated admins reach server components, which then
 *     verify the cookie signature + admin claim.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // /admin/login is the only public admin route.
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
