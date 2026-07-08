import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

// POST /api/auth/session
// Body: { idToken: string } — the Firebase ID token from client-side sign-in.
// Verifies it, checks the admin claim, and sets a secure session cookie.
export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.admin) {
      return NextResponse.json(
        { error: "This account does not have admin access." },
        { status: 403 }
      );
    }

    // 5-day session, matching a typical "stay logged in" expectation.
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Session creation failed:", err);
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }
}

// DELETE /api/auth/session — logout, clears the cookie.
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", "", { maxAge: 0, path: "/" });
  return response;
}
