/**
 * RTDB path constants and shared utilities.
 *
 * All RTDB paths must use these constants so renames happen in one place
 * and security rules stay in sync.
 */

import { getAdminDatabase } from "../admin";
import type {
  Applicant,
  ApplicantId,
  EmailLookupKey,
  TemplateKey,
} from "../types";


export const RT = {
  applicants: "applicants",
  applicantsByEmail: "applicantsByEmail",
  videoSubmissions: "videoSubmissions",
  videoSubmissionsByApplicant: "videoSubmissionsByApplicant",
  verifications: "verifications",
  verificationsByApplicant: "verificationsByApplicant",
  templates: "templates",
  verificationBatches: "verificationBatches",
  sendLog: "sendLog",
  engineRunLog: "engineRunLog",
} as const;

/** Stable sha256-style key for an email. RTDB keys cannot contain
 *  `.`, `#`, `$`, `[`, `]`, `/`. Emails contain `@` and `.`. */
export function emailLookupKey(email: string): EmailLookupKey {
  // FNV-1a 32-bit; not cryptographic — we don't need security here, just a
  // stable non-reversible key with even distribution.
  let h = 0x811c9dc5;
  const lower = email.trim().toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    h ^= lower.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Generate an LPX-XXXXXX id (alphanumeric, no 0/O/1/I to avoid confusion). */
export function generateLpxId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `LPX-${id}`;
}

/** Convenience: grab a snapshot of an applicant or null. */
export async function readApplicant(id: ApplicantId): Promise<Applicant | null> {
  const snap = await getAdminDatabase().ref(`${RT.applicants}/${id}`).get();
  return snap.exists() ? (snap.val() as Applicant) : null;
}

export async function writeApplicantRecord(applicant: Applicant): Promise<void> {
  const db = getAdminDatabase();
  const updates: Record<string, unknown> = {};
  updates[`${RT.applicants}/${applicant.id}`] = applicant;
  updates[`${RT.applicantsByEmail}/${emailLookupKey(applicant.email)}/${applicant.id}`] = true;
  await db.ref().update(updates);
}

export async function readTemplate(key: TemplateKey): Promise<{ subject: string; htmlBody: string } | null> {
  const snap = await getAdminDatabase().ref(`${RT.templates}/${key}`).get();
  return snap.exists() ? (snap.val() as { subject: string; htmlBody: string }) : null;
}
