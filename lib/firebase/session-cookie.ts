/**
 * Shared session-cookie constants for Firebase Auth.
 *
 * The cookie is a Firebase session cookie minted by
 * `firebase-admin.auth.createSessionCookie()`. We deliberately use a name
 * with the `__lpx_` prefix (NOT the Supabase default) so the two auth
 * systems can co-exist cleanly during the migration window.
 */

export const SESSION_COOKIE = "__lpx_session";

/** 14 days. Firebase session cookies cap at 2 weeks. */
export const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000;
