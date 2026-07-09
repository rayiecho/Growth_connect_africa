import { cookies } from "next/headers";
import { adminAuth } from "./admin";

// Verifies the session cookie server-side and confirms the admin claim.
// Returns the decoded token if valid+admin, or null otherwise.
export async function getVerifiedAdminSession() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (!decoded.admin) return null;
    return decoded;
  } catch {
    return null;
  }
}
