// One-time bootstrap script: grants the Firebase custom claim `admin: true`
// to a given user, so they can log into /admin/dashboard.
//
// Usage:
//   npx tsx scripts/set-admin-claims.ts someone@example.com
//
// The user must already exist in Firebase Auth (create them in Firebase
// Console -> Authentication -> Add User first, or sign them up via the
// app once Phase 2 auth is live).

import { adminAuth } from "../lib/firebase/admin";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/set-admin-claims.ts <email>");
    process.exit(1);
  }

  const user = await adminAuth.getUserByEmail(email);
  await adminAuth.setCustomUserClaims(user.uid, { admin: true });

  console.log(`Granted admin claim to ${email} (uid: ${user.uid})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
