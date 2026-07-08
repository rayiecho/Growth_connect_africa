import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/firebase/session-cookie";

/**
 * Form-POST logout endpoint.
 *
 * The Logout button in the dashboard posts here as
 * `<form action="/admin/logout" method="post">`. We clear the session
 * cookie and redirect. The Firebase ID token is cleared separately on
 * the client via signOutAdmin() if the user clicks an interactive button;
 * for a plain form-POST this is fine — the cookie is what gates access.
 */
export async function POST() {
  cookies().set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/login");
}
