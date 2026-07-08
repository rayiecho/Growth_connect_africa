#!/usr/bin/env npx tsx
/**
 * Mark Firebase Auth users as administrators by setting the
 * `admin: true` custom claim.
 *
 * Usage:
 *   # Mark specific users (preferred — least surprise):
 *   npx tsx scripts/set-admin-claims.ts alice@x.com bob@x.com
 *
 *   # Mark ALL users in the project (use during initial bootstrap):
 *   npx tsx scripts/set-admin-claims.ts --all
 *
 *   # Revoke admin status from a user:
 *   npx tsx scripts/set-admin-claims.ts --revoke bob@x.com
 *
 * Required env vars (or FIREBASE_SERVICE_ACCOUNT_PATH):
 *   FIREBASE_SERVICE_ACCOUNT_BASE64   — base64-encoded service account JSON
 *   NEXT_PUBLIC_FIREBASE_DATABASE_URL — needed for admin app init
 */

import { getAdminAuth } from "../lib/firebase/admin";

const args = process.argv.slice(2);
const all = args.includes("--all");
const revoke = args.includes("--revoke");
const emails = args.filter((a) => !a.startsWith("--"));

async function main() {
  const auth = getAdminAuth();

  if (all) {
    if (revoke) {
      console.error("Refusing to --all --revoke. Revoke specific emails one at a time.");
      process.exit(2);
    }
    console.log("Setting admin=true for every user in the project...");
    let nextPageToken: string | undefined;
    let count = 0;
    do {
      const page: Awaited<ReturnType<typeof auth.listUsers>> = await auth.listUsers(1000, nextPageToken);
      for (const user of page.users) {
        await auth.setCustomUserClaims(user.uid, { admin: true });
        console.log(`  + ${user.email ?? user.uid}`);
        count++;
      }
      nextPageToken = page.pageToken;
    } while (nextPageToken);
    console.log(`Done. Marked ${count} users as admin.`);
    return;
  }

  if (emails.length === 0) {
    console.error("Provide emails as args, or pass --all for bulk grant.");
    console.error("Usage: npx tsx scripts/set-admin-claims.ts email1@x.com [email2@x.com ...]");
    process.exit(1);
  }

  for (const email of emails) {
    try {
      const user = await auth.getUserByEmail(email);
      const next = revoke ? {} : { admin: true };
      await auth.setCustomUserClaims(user.uid, next);
      console.log(`  ${revoke ? "revoked" : "granted"} admin → ${email}`);
    } catch (err) {
      const message = (err as { code?: string }).code === "auth/user-not-found"
        ? "user not found (create the Firebase Auth user first)"
        : (err as Error).message;
      console.error(`  ✗ ${email}: ${message}`);
    }
  }
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
