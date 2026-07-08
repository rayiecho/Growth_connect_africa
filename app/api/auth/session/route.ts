import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_DURATION_MS } from "@/lib/firebase/session-cookie";

/**
 * Exchange a Firebase ID token for a session cookie.
 *
 * Client posts the ID token immediately after `signInWithEmailAndPassword`
 * resolves. The minted cookie is what server components verify.
 */
export async function POST(req: NextRequest) {
  let body: { idToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const idToken = body.idToken;
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "missing_id_token" }, { status: 400 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken, true);

    const cookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const res = NextResponse.json({
      ok: true,
      uid: decoded.uid,
      isAdmin: decoded.admin === true,
    });
    res.cookies.set({
      name: SESSION_COOKIE,
      value: cookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "verification_failed", detail: (err as Error).message },
      { status: 401 }
    );
  }
}
