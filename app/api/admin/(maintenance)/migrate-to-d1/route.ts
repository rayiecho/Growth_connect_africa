import { NextResponse } from "next/server";
import { firestoreGetAll } from "@/lib/firebase/firestore-rest";
import { d1Add } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const APPLICANT_FIELDS = [
  "first_name", "last_name", "email", "email_verified", "phone", "country", "state_province",
  "business_name", "business_category", "business_stage", "business_description",
  "goal_question", "commitment_question", "commitment_confirmed", "disclaimers_accepted",
  "submitted_at", "date_applied", "current_stage", "current_status", "cohort",
  "trial_number", "cleared_for_reapply", "trial_history",
  "video_invite_release_date", "video_invite_sent_at", "video_deadline_date", "video_submitted_at",
  "video_reminder_2_sent", "video_reminder_4_sent", "video_reminder_deadline_sent", "awaiting_video_submission",
  "verification_invite_sent_at", "verification_deadline_date", "verification_submitted_at",
  "verification_reminder_2_sent", "verification_reminder_4_sent", "verification_reminder_6_sent",
  "verification_reminder_8_sent", "verification_reminder_10_sent", "awaiting_verification_submission",
  "verified_at", "lpx_id", "lpx_id_generated_at", "photo_path", "program_completed", "program_completed_at",
  "certificate_code", "legacy_email_sent_at", "pending_legacy_email", "legacy_email_scheduled_date",
  "batch_id", "linkedin", "business_social",
];

const VIDEO_SUBMISSION_FIELDS = [
  "applicant_id", "applicant_first_name", "applicant_last_name", "applicant_email",
  "video_link", "review_status", "feedback", "submitted_at", "outcome_release_date", "outcome_sent_at",
];

const VERIFICATION_FIELDS = [
  "applicant_id", "applicant_first_name", "applicant_last_name", "email", "lpx_id",
  "verification_form_path", "payment_receipt_path", "review_status", "feedback",
  "submitted_at", "outcome_release_date", "outcome_sent_at",
];

const PLATFORM_USER_FIELDS = [
  "first_name", "last_name", "email", "phone", "source", "is_applicant",
  "uploaded_at", "batch_id", "last_followup_sent_at",
];
const ADDITIONAL_DETAILS_FIELDS = [
  "email", "first_name", "last_name", "phone", "business_name", "business_stage",
  "industry", "business_description", "linkedin", "submitted_at", "reconciled",
];

async function migrateCollection(collection: string, table: string, allowedFields: string[]) {
  const docs = await firestoreGetAll(collection);
  const result = { total: docs.length, migrated: 0, errors: [] as string[] };
  for (const doc of docs) {
    const a = doc.data() as any;
    try {
      const fields: Record<string, any> = { id: doc.id };
      for (const f of allowedFields) {
        if (a[f] !== undefined) {
          fields[f] = typeof a[f] === "object" && a[f] !== null ? JSON.stringify(a[f]) : a[f];
        }
      }
      await d1Add(table, fields);
      result.migrated++;
    } catch (err: any) {
      result.errors.push(`${a.email || doc.id}: ${err.message}`);
    }
  }
  return result;
}

export const POST = withAdminAuth(async (req, session) => {
  try {
    const applicants = await migrateCollection("applicants", "applicants", APPLICANT_FIELDS);
    const videoSubmissions = await migrateCollection("video_submissions", "video_submissions", VIDEO_SUBMISSION_FIELDS);
    const verifications = await migrateCollection("verifications", "verifications", VERIFICATION_FIELDS);
    const platformUsers = await migrateCollection("platform_users", "platform_users", PLATFORM_USER_FIELDS);
    const additionalDetails = await migrateCollection("additional_details_submissions", "additional_details_submissions", ADDITIONAL_DETAILS_FIELDS);

    return NextResponse.json({ applicants, videoSubmissions, verifications, platformUsers, additionalDetails });
  } catch (err: any) {
    console.error("migrate-to-d1 failed:", err);
    return NextResponse.json({ error: err.message || "Migration failed." }, { status: 500 });
  }
});



