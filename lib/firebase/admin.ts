import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// SERVER-ONLY. Never import into a "use client" component.
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  }
  const serviceAccount = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));

  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminDb = getDatabase(getAdminApp());
export const adminAuth = getAuth(getAdminApp());
export const adminStorage = getStorage(getAdminApp());
