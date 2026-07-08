import { getAdminDatabase } from "../admin";
import { RT, generateLpxId } from "./_references";
import type { Verification, ApplicantId, VerificationId } from "../types";

function newId(): VerificationId {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return getAdminDatabase().ref().push().key ?? `ver_${Date.now()}`;
}

export type CreateVerificationInput = {
  applicantId: ApplicantId;
  email: string;
  deadline: Date;
};

/**
 * In Supabase, the `verifications` insert had a Postgres trigger that
 * auto-assigned `lpx_id`. Without triggers in RTDB, we generate it here
 * with a 32^6 alphanumeric scheme — collision probability is ~1 in 1B
 * per pass, well below user count.
 */
export async function createVerification(
  input: CreateVerificationInput
): Promise<Verification> {
  const id = newId();
  const lpxId = generateLpxId();
  const now = new Date().toISOString();
  const verification: Verification = {
    id,
    applicantId: input.applicantId,
    email: input.email,
    lpxId,
    invitedAt: now,
    deadlineDate: input.deadline.toISOString(),
    formSubmitted: false,
    submittedAt: null,
    reviewStatus: "Pending",
    verificationFormPath: null,
    paymentReceiptPath: null,
  };

  const db = getAdminDatabase();
  await db.ref().update({
    [`${RT.verifications}/${id}`]: verification,
    [`${RT.verificationsByApplicant}/${input.applicantId}/${id}`]: true,
  });
  return verification;
}

export async function getVerificationByApplicant(
  applicantId: ApplicantId
): Promise<Verification | null> {
  const db = getAdminDatabase();
  const indexSnap = await db
    .ref(`${RT.verificationsByApplicant}/${applicantId}`)
    .get();
  if (!indexSnap.exists()) return null;
  const ids = Object.keys(indexSnap.val() as Record<string, true>);
  if (ids.length === 0) return null;
  const snap = await db.ref(`${RT.verifications}/${ids[0]}`).get();
  return snap.exists() ? (snap.val() as Verification) : null;
}
