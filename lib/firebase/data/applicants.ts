import { getAdminDatabase } from "../admin";
import { RT, emailLookupKey, writeApplicantRecord, readApplicant } from "./_references";
import type {
  Applicant,
  ApplicantId,
  ApplicantSummary,
  EmailResponseStatus,
  VideoInviteWindow,
} from "../types";

export type CreateApplicantInput = Omit<Applicant, "id" | "dateApplied" | "lastUpdated"> & {
  id?: ApplicantId;
};

function newId(): ApplicantId {
  // UUID v4 via crypto.randomUUID — falls back to a push id on older runtimes.
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return getAdminDatabase().ref().push().key ?? `applicant_${Date.now()}`;
}

export async function createApplicant(input: CreateApplicantInput): Promise<Applicant> {
  const id = input.id ?? newId();
  const now = new Date().toISOString();
  const applicant: Applicant = {
    ...input,
    id,
    dateApplied: now,
    lastUpdated: now,
    currentStage: "Application Submitted",
    currentStatus: "Active",
    emailResponseStatus: "pending",
    scheduledSendDate: null,
    videoInviteWindow: null,
    videoInviteSentAt: null,
    commitmentConfirmed: true,
    disclaimersAccepted: true,
  };
  await writeApplicantRecord(applicant);
  return applicant;
}

export async function getApplicantById(id: ApplicantId): Promise<Applicant | null> {
  return readApplicant(id);
}

export async function getApplicantByEmail(email: string): Promise<Applicant | null> {
  const db = getAdminDatabase();
  const indexSnap = await db
    .ref(`${RT.applicantsByEmail}/${emailLookupKey(email)}`)
    .get();
  if (!indexSnap.exists()) return null;

  // The index is `{applicantId: true}`; pull all entries to find a hit.
  const entries = indexSnap.val() as Record<string, true> | ApplicantId;
  if (typeof entries === "string") return readApplicant(entries);
  const ids = Object.keys(entries);
  for (const id of ids) {
    const a = await readApplicant(id);
    if (a && a.email.toLowerCase() === email.trim().toLowerCase()) return a;
  }
  return null;
}

export async function listApplicants(): Promise<Applicant[]> {
  const db = getAdminDatabase();
  const snap = await db.ref(RT.applicants).orderByChild("dateApplied").get();
  if (!snap.exists()) return [];
  const all = Object.values(snap.val() as Record<string, Applicant>);
  return all.sort((a, b) => (a.dateApplied < b.dateApplied ? 1 : -1));
}

export async function listApplicantSummaries(): Promise<ApplicantSummary[]> {
  const all = await listApplicants();
  return all.map((a) => ({
    id: a.id,
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    phone: a.phone,
    currentStage: a.currentStage,
    currentStatus: a.currentStatus,
    dateApplied: a.dateApplied,
    industry: a.industry,
    businessName: a.businessName,
    businessStage: a.businessStage,
    adminResponse: a.adminResponse,
    emailResponseStatus: a.emailResponseStatus,
    scheduledSendDate: a.scheduledSendDate,
    videoInviteWindow: a.videoInviteWindow,
    assignedReviewer: a.assignedReviewer,
  }));
}

export async function updateApplicant(
  id: ApplicantId,
  fields: Partial<Omit<Applicant, "id" | "dateApplied">>
): Promise<void> {
  const db = getAdminDatabase();
  await db.ref(`${RT.applicants}/${id}`).update({
    ...fields,
    lastUpdated: new Date().toISOString(),
  });
}

export async function getPendingApplicantsForVideoInvite(
  limit = 50
): Promise<Applicant[]> {
  const db = getAdminDatabase();
  const snap = await db
    .ref(RT.applicants)
    .orderByChild("videoInviteSentAt")
    .equalTo(null)
    .limitToFirst(limit)
    .get();
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Applicant>);
}

export async function getQueuedResponsesForDate(dateStr: string): Promise<Applicant[]> {
  const db = getAdminDatabase();
  // Pull all queued; for 10k+ users we'd index a compound, but the queued
  // count is small in practice (only what an admin just queued).
  const snap = await db
    .ref(RT.applicants)
    .orderByChild("emailResponseStatus")
    .equalTo("queued")
    .get();
  if (!snap.exists()) return [];
  const queued = Object.values(snap.val() as Record<string, Applicant>);
  return queued.filter((a) => a.scheduledSendDate === dateStr);
}

export async function queueResponse(
  id: ApplicantId,
  response: string,
  scheduledDate: string
): Promise<void> {
  await updateApplicant(id, {
    adminResponse: response,
    emailResponseStatus: "queued" satisfies EmailResponseStatus,
    scheduledSendDate: scheduledDate,
  });
}

export async function clearQueuedResponse(id: ApplicantId): Promise<void> {
  await updateApplicant(id, {
    emailResponseStatus: "pending",
    scheduledSendDate: null,
  });
}

export async function markResponseSent(id: ApplicantId): Promise<void> {
  await updateApplicant(id, {
    emailResponseStatus: "sent",
  });
}

export async function markVideoInviteSent(
  id: ApplicantId,
  window: VideoInviteWindow
): Promise<void> {
  const now = new Date().toISOString();
  await updateApplicant(id, {
    videoInviteSentAt: now,
    videoInviteWindow: window,
    currentStage: "Video Pitch",
  });
}

export async function markVerificationInviteSent(id: ApplicantId): Promise<void> {
  await updateApplicant(id, {
    currentStage: "Video Pitch Approved",
  });
}

export async function markRejected(id: ApplicantId): Promise<void> {
  await updateApplicant(id, {
    currentStage: "Rejected Application",
    currentStatus: "Rejected",
  });
}
