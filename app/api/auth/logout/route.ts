import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/firebase/session-cookie";

/**
 * Clear the session cookie.
 *
 * Firebase Auth's ID token is cleared client-side via `signOut()` —
 * server-side we only need to drop our cookie.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
