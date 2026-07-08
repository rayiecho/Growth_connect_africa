/**
 * Firebase Admin SDK — server-side only.
 *
 * Used inside server components, server actions, and API route handlers.
 * NEVER import this into a "use client" component.
 *
 * Two ways to provide credentials (in priority order):
 *   1. FIREBASE_SERVICE_ACCOUNT_BASE64 — base64-encoded JSON blob. Preferred
 *      for Render/managed deploys where file mounts aren't available.
 *   2. FIREBASE_SERVICE_ACCOUNT_PATH — filesystem path to the JSON. Convenient
 *      for local dev: `secrets/firebase-service-account.json`.
 */

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getDatabase, type Database } from "firebase-admin/database";

function loadServiceAccount(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  const fromBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (fromBase64 && fromBase64.length > 0) {
    const json = Buffer.from(fromBase64, "base64").toString("utf8");
    return JSON.parse(json);
  }
  const fromPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (fromPath && fromPath.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(fromPath);
  }
  throw new Error(
    "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_PATH."
  );
}

function ensureApp(): App {
  if (getApps().length > 0) return getApps()[0]!;
  return initializeApp({
    credential: cert(loadServiceAccount()),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

let cachedApp: App | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Database | null = null;

export function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  cachedApp = ensureApp();
  return cachedApp;
}

export function getAdminAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getAdminApp());
  return cachedAuth;
}

export function getAdminDatabase(): Database {
  if (cachedDb) return cachedDb;
  cachedDb = getDatabase(getAdminApp());
  return cachedDb;
}
