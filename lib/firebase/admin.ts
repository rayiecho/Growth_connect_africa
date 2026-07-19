// RECONSTRUCTION NOTICE — read before trusting this file's history.
//
// The original lib/firebase/admin.ts was accidentally deleted during
// Phase 4 Tier 0 cleanup: it had zero imports from app/, lib/, or
// components/, but scripts/set-admin-claims.ts depended on it — that
// dependency was missed during the pre-deletion check.
//
// The original file's exact contents were NOT recoverable (this repo
// has no git history, and no build artifact ever captured it, since
// it was never bundled into the Next.js app in the first place).
//
// This is a FRESH RECONSTRUCTION, written on 2026-07-19 to satisfy
// exactly what scripts/set-admin-claims.ts actually calls
// (adminAuth.getUserByEmail, adminAuth.setCustomUserClaims). It is
// NOT the original file. If the original also exported adminDb /
// adminStorage, those are not recreated here, since nothing currently
// depends on them — add them back only if something needs them.
//
// SERVER-ONLY / NODE-ONLY. Uses the real firebase-admin SDK (gRPC),
// which does not run on Cloudflare Workers. Do not import this from
// anything under app/ or components/ — it's for standalone scripts
// run via `npx tsx` (plain Node.js), like scripts/set-admin-claims.ts.
// The app's own runtime uses lib/firebase/rest-admin.ts instead, which
// is Workers-compatible.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  return JSON.parse(Buffer.from(b64, "base64").toString("utf-8")) as {
    client_email: string;
    private_key: string;
    project_id: string;
  };
}

function getOrInitApp() {
  if (getApps().length) return getApps()[0];
  const serviceAccount = getServiceAccount();
  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
}

const app = getOrInitApp();

export const adminAuth = getAuth(app);
