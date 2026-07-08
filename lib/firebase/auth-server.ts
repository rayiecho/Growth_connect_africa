import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "./admin";
import { SESSION_COOKIE } from "./session-cookie";

export interface AdminSession {
  uid: string;
  email: string | undefined;
  isAdmin: boolean;
  /** All decoded claims, for downstream use. */
  claims: Record<string, unknown>;
}

/**
 * Verify the session cookie and return decoded claims, or `null` if absent / invalid.
 * Safe to call from server components and route handlers.
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const claims = await getAdminAuth().verifySessionCookie(cookie, true);
    return {
      uid: claims.uid,
      email: claims.email,
      isAdmin: claims.admin === true,
      claims: claims as unknown as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side guard — redirect to login if no session, redirect if not admin.
 * Returns the decoded session so the caller can use the uid/email.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!session.isAdmin) redirect("/admin/login");
  return session;
}

/**
 * Like `requireAdmin` but for API route handlers — returns a 401/403 response
 * instead of redirecting. Pass the optional NextRequest to set cookies if needed.
 */
export async function requireAdminApi(): Promise<
  | { ok: true; session: AdminSession }
  | { ok: false; status: 401 | 403; message: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, status: 401, message: "unauthenticated" };
  if (!session.isAdmin) return { ok: false, status: 403, message: "not_admin" };
  return { ok: true, session };
}
