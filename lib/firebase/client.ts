import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

// Client-side Firebase app — safe to import in "use client" components.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const clientDb = getDatabase(app);
export const clientAuth = getAuth(app);
export const clientStorage = getStorage(app);
