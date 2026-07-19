import { NextRequest, NextResponse } from "next/server";

// Protects /admin/dashboard by checking for the session cookie.
// Full verification (is it valid? is admin:true set?) happens server-side
// in the dashboard page itself via Firebase Admin SDK — this here is just
// the fast, cheap check: is there a cookie at all.
//
// Also handles domain-based routing: visitors on home.growthconnect.africa
// (and eventually growthconnect.africa) get internally routed to the new
// main-site pages under /main-site, while lpx.growthconnect.africa continues
// to resolve exactly as it always has — completely untouched, zero shared code path.

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin/dashboard")) {
    const session = req.cookies.get("session");
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  const hostname = req.headers.get("host") || "";
  const isMainSiteDomain =
    hostname.startsWith("home.growthconnect.africa") || hostname === "growthconnect.africa" || hostname === "www.growthconnect.africa";

  if (isMainSiteDomain && !pathname.startsWith("/main-site")) {
    const url = req.nextUrl.clone();
    url.pathname = `/main-site${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|growth-connect-logo.png).*)"],
};
