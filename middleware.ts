import { NextRequest, NextResponse } from "next/server";

// Protects /admin/dashboard by checking for the session cookie.
// Full verification (is it valid? is admin:true set?) happens server-side
// in the dashboard page itself via Firebase Admin SDK — middleware here
// just does the fast, cheap check: is there a cookie at all.
export function middleware(req: NextRequest) {
  const session = req.cookies.get("session");

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard"],
};
