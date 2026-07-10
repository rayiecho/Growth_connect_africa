import { cookies } from "next/headers";
import { verifySessionCookieRest } from "@/lib/firebase/rest-admin";

export async function getVerifiedAdminSession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await verifySessionCookieRest(sessionCookie);
    if (!decoded.admin) return null;
    return decoded;
  } catch (err) {
    console.error("Session verification failed:", err);
    return null;
  }
}
