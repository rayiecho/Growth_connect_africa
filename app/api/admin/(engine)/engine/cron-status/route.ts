import { NextResponse } from "next/server";
import { d1Query, d1QueryOrdered } from "@/lib/db/d1-admin";
import { daysBetween } from "@/lib/engine/dates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const CRON_META: Record<string, { label: string; schedule: string; endpoint: string }> = {
  "video-invite-batch": { label: "Video Pitch Invites", schedule: "Tue/Fri, 4:00 PM UTC", endpoint: "video-invite-batch" },
  "video-outcome-batch": { label: "Video Pitch Decisions", schedule: "Tue/Fri, 4:00 PM UTC", endpoint: "video-outcome-batch" },
  "verification-outcome-batch": { label: "Verification Decisions", schedule: "Daily, 8:00 AM UTC", endpoint: "verification-outcome-batch" },
  "video-reminder-batch": { label: "Video Pitch Reminders", schedule: "Daily, 8:00 AM UTC", endpoint: "video-reminder-batch" },
  "verification-reminder-batch": { label: "Verification Reminders", schedule: "Daily, 8:00 AM UTC", endpoint: "verification-reminder-batch" },
  "non-applicant-followup": { label: "Non-Applicant Follow-Ups", schedule: "Daily, 8:00 AM UTC", endpoint: "non-applicant-followup" },
  "legacy-batch-send": { label: "Legacy Batch Send", schedule: "Tue/Fri, 4:00 PM UTC", endpoint: "legacy-batch-send" },
};

export const GET = withAdminAuth(async (req, session) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  try {
    const [
      videoInviteDue,
      videoOutcomeApprovedDue,
      videoOutcomeRejectedDue,
      verificationOutcomeApprovedDue,
      verificationOutcomeRejectedDue,
      awaitingVideo,
      awaitingVerification,
      legacyDue,
      nonApplicantLeads,
      cronLogDocs,
    ] = await Promise.all([
      d1Query("applicants", [
        { field: "video_invite_sent_at", op: "EQUAL", value: null },
        { field: "video_invite_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ]),
      d1Query("video_submissions", [
        { field: "review_status", op: "EQUAL", value: "approved" },
        { field: "outcome_sent_at", op: "EQUAL", value: null },
        { field: "outcome_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ]),
      d1Query("video_submissions", [
        { field: "review_status", op: "EQUAL", value: "rejected" },
        { field: "outcome_sent_at", op: "EQUAL", value: null },
        { field: "outcome_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ]),
      d1Query("verifications", [
        { field: "review_status", op: "EQUAL", value: "Approved" },
        { field: "outcome_sent_at", op: "EQUAL", value: null },
        { field: "outcome_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ]),
      d1Query("verifications", [
        { field: "review_status", op: "EQUAL", value: "Rejected" },
        { field: "outcome_sent_at", op: "EQUAL", value: null },
        { field: "outcome_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ]),
      d1Query("applicants", [{ field: "awaiting_video_submission", op: "EQUAL", value: true }]),
      d1Query("applicants", [{ field: "awaiting_verification_submission", op: "EQUAL", value: true }]),
      d1Query("applicants", [{ field: "legacy_email_sent_at", op: "EQUAL", value: null }]),
      d1Query("platform_users", [{ field: "is_applicant", op: "EQUAL", value: false }]),
      d1QueryOrdered("cron_run_log", [], "ran_at", "DESCENDING", 50),
    ]);

    let videoReminderDue = 0;
    for (const doc of awaitingVideo) {
      const a = doc.data() as any;
      if (!a.video_invite_sent_at || !a.video_deadline_date) continue;
      const daysSince = daysBetween(new Date(a.video_invite_sent_at), now);
      const isDeadline = daysBetween(now, new Date(a.video_deadline_date)) === 0;
      if ((daysSince === 2 && !a.video_reminder_2_sent) || (daysSince === 4 && !a.video_reminder_4_sent) || (isDeadline && !a.video_reminder_deadline_sent)) videoReminderDue++;
    }

    let verificationReminderDue = 0;
    for (const doc of awaitingVerification) {
      const a = doc.data() as any;
      if (!a.verification_invite_sent_at || !a.verification_deadline_date) continue;
      const daysSince = daysBetween(new Date(a.verification_invite_sent_at), now);
      const isDeadline = daysBetween(now, new Date(a.verification_deadline_date)) === 0;
      const dayMatch = [2, 4, 6, 8].some((d) => daysSince === d && !a[`verification_reminder_${d}_sent`]);
      if (dayMatch || (isDeadline && !a.verification_reminder_10_sent)) verificationReminderDue++;
    }

    let legacyDueCount = 0;
    for (const doc of legacyDue) {
      const a = doc.data() as any;
      if (a.pending_legacy_email && a.legacy_email_scheduled_date && a.legacy_email_scheduled_date <= todayStr) legacyDueCount++;
    }

    let nonApplicantDueCount = 0;
    for (const doc of nonApplicantLeads) {
      const u = doc.data() as any;
      if (!u.email) continue;
      const lastSent = u.last_followup_sent_at ? new Date(u.last_followup_sent_at) : null;
      const uploadedAt = u.uploaded_at ? new Date(u.uploaded_at) : now;
      const baseline = lastSent || uploadedAt;
      const daysSince = Math.floor((now.getTime() - baseline.getTime()) / 86400000);
      const requiredGap = lastSent ? 5 : 1;
      if (daysSince >= requiredGap) nonApplicantDueCount++;
    }

    const dueCounts: Record<string, number> = {
      "video-invite-batch": videoInviteDue.length,
      "video-outcome-batch": videoOutcomeApprovedDue.length + videoOutcomeRejectedDue.length,
      "verification-outcome-batch": verificationOutcomeApprovedDue.length + verificationOutcomeRejectedDue.length,
      "video-reminder-batch": videoReminderDue,
      "verification-reminder-batch": verificationReminderDue,
      "non-applicant-followup": nonApplicantDueCount,
      "legacy-batch-send": legacyDueCount,
    };

    const logs = cronLogDocs.map((d) => d.data() as any);

    const crons = Object.entries(CRON_META).map(([key, meta]) => {
      const lastRun = logs.find((l) => l.cron_name === key);
      return {
        key,
        label: meta.label,
        schedule: meta.schedule,
        endpoint: meta.endpoint,
        dueNow: dueCounts[key] ?? 0,
        lastRun: lastRun
          ? { ranAt: lastRun.ran_at, hadErrors: lastRun.had_errors, result: lastRun.result }
          : null,
      };
    });

    return NextResponse.json({ crons });
  } catch (err) {
    console.error("engine cron-status failed:", err);
    return NextResponse.json({ error: "Failed to load cron status." }, { status: 500 });
  }
});

