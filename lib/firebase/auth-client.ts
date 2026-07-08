"use client";

import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

/**
 * Sign in an admin user.
 *
 * Exchanges the resulting Firebase ID token for a server-side session
 * cookie via /api/auth/session. After this resolves, the user is
 * authenticated for server components too (subject to admin claim).
 */
export async function signInAdmin(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  const idToken = await cred.user.getIdToken();
  const resp = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!resp.ok) {
    await fbSignOut(getFirebaseAuth()).catch(() => {});
    throw new Error("session_exchange_failed");
  }
  return cred.user;
}

/**
 * Sign out the admin and clear the server-side session cookie.
 */
export async function signOutAdmin(): Promise<void> {
  await fbSignOut(getFirebaseAuth()).catch(() => {});
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
}

/**
 * Subscribe to auth-state changes. Use inside `useEffect` in client components.
 */
export function watchAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), cb);
}
