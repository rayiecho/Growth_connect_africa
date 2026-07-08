import { getAdminDatabase } from "../admin";
import { RT } from "./_references";
import type {
  VideoSubmission,
  VideoSubmissionId,
  ApplicantId,
  VideoReviewStatus,
} from "../types";

function newId(): VideoSubmissionId {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return getAdminDatabase().ref().push().key ?? `vs_${Date.now()}`;
}

export type CreateVideoSubmissionInput = {
  applicantId: ApplicantId;
  videoLink: string;
};

export async function createVideoSubmission(
  input: CreateVideoSubmissionInput
): Promise<VideoSubmission> {
  const id = newId();
  const submission: VideoSubmission = {
    id,
    applicantId: input.applicantId,
    videoLink: input.videoLink,
    submittedAt: new Date().toISOString(),
    reviewStatus: "pending",
    feedback: null,
    approvedAt: null,
    rejectedAt: null,
    inviteEmailSentAt: null,
    verificationInviteSentAt: null,
    trainingEmailSentAt: null,
  };

  const db = getAdminDatabase();
  await db.ref().update({
    [`${RT.videoSubmissions}/${id}`]: submission,
    [`${RT.videoSubmissionsByApplicant}/${input.applicantId}/${id}`]: true,
  });
  return submission;
}

export async function listVideoSubmissions(): Promise<VideoSubmission[]> {
  const db = getAdminDatabase();
  const snap = await db
    .ref(RT.videoSubmissions)
    .orderByChild("submittedAt")
    .get();
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, VideoSubmission>).sort(
    (a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)
  );
}

export async function getVideoSubmissionById(
  id: VideoSubmissionId
): Promise<VideoSubmission | null> {
  const db = getAdminDatabase();
  const snap = await db.ref(`${RT.videoSubmissions}/${id}`).get();
  return snap.exists() ? (snap.val() as VideoSubmission) : null;
}

export async function markApproved(id: VideoSubmissionId): Promise<void> {
  const db = getAdminDatabase();
  await db.ref(`${RT.videoSubmissions}/${id}`).update({
    reviewStatus: "approved",
    approvedAt: new Date().toISOString(),
  });
}

export async function markRejected(id: VideoSubmissionId): Promise<void> {
  const db = getAdminDatabase();
  await db.ref(`${RT.videoSubmissions}/${id}`).update({
    reviewStatus: "rejected",
    rejectedAt: new Date().toISOString(),
  });
}

export async function setActionRequired(
  id: VideoSubmissionId,
  feedback: string
): Promise<void> {
  const db = getAdminDatabase();
  await db.ref(`${RT.videoSubmissions}/${id}`).update({
    feedback,
    reviewStatus: "action_required" satisfies VideoReviewStatus,
  });
}

export async function markVerificationInviteSent(
  id: VideoSubmissionId
): Promise<void> {
  const db = getAdminDatabase();
  await db.ref(`${RT.videoSubmissions}/${id}`).update({
    verificationInviteSentAt: new Date().toISOString(),
  });
}

export async function markTrainingEmailSent(
  id: VideoSubmissionId
): Promise<void> {
  const db = getAdminDatabase();
  await db.ref(`${RT.videoSubmissions}/${id}`).update({
    trainingEmailSentAt: new Date().toISOString(),
  });
}

export async function getApprovedVideosPendingVerification(
  limit = 50
): Promise<VideoSubmission[]> {
  const db = getAdminDatabase();
  const snap = await db
    .ref(RT.videoSubmissions)
    .orderByChild("reviewStatus")
    .equalTo("approved")
    .limitToFirst(limit)
    .get();
  if (!snap.exists()) return [];
  const all = Object.values(snap.val() as Record<string, VideoSubmission>);
  return all.filter(
    (s) => !s.verificationInviteSentAt && s.approvedAt
  );
}

export async function getRejectedVideosPendingTraining(
  limit = 50
): Promise<VideoSubmission[]> {
  const db = getAdminDatabase();
  const snap = await db
    .ref(RT.videoSubmissions)
    .orderByChild("reviewStatus")
    .equalTo("rejected")
    .limitToFirst(limit)
    .get();
  if (!snap.exists()) return [];
  const all = Object.values(snap.val() as Record<string, VideoSubmission>);
  return all.filter(
    (s) => !s.trainingEmailSentAt && s.rejectedAt
  );
}
