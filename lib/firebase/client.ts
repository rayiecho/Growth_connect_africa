"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

/**
 * Firebase Web SDK singletons.
 *
 * Used inside client components ("use client"). Lazy-init guards against
 * double initialization during Next.js hot-reload and SSR/CSR hand-off.
 */

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Database | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }
  // Lazy import config so build doesn't fail when NEXT_PUBLIC_* vars are absent
  // during type-check without env (e.g. CI dry run).
  const { getFirebaseWebConfig } = require("./config");
  cachedApp = initializeApp(getFirebaseWebConfig());
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getFirebaseApp());
  return cachedAuth;
}

export function getFirebaseDatabase(): Database {
  if (cachedDb) return cachedDb;
  cachedDb = getDatabase(getFirebaseApp());
  return cachedDb;
}
