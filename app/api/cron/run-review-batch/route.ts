import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sendEmail, mergeTags } from "@/lib/engine/ses";
import {
  nextReviewWindow,
  addCalendarDays,
  isOnOrBefore,
  formatDeadline,
} from "@/lib/engine/dates";

const BATCH_SIZE = 50;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const results = {
    videoInvitesSent: 0,
    verificationInvitesSent: 0,
    trainingEmailsSent: 0,
    errors: [] as string[],
  };

  // ============================================================
  // PART A — Application submitted -> Video Pitch invite
  // ============================================================
  const pendingSnap = await adminDb
    .collection("applicants")
    .where("video_invite_sent_at", "==", null)
    .orderBy("date_applied", "asc")
    .limit(BATCH_SIZE)
    .get();

  for (const doc of pendingSnap.docs) {
    const applicant = { id: doc.id, ...doc.data() } as any;
    try {
      const window = nextReviewWindow(new Date(applicant.date_applied));
      if (!isOnOrBefore(window, today)) continue;

      const deadline = addCalendarDays(today, 5);
      const windowLabel = window.getDay() === 2 ? "tue" : "fri";

      const templateSnap = await adminDb.collection("templates").doc("video_invite").get();
      const template = templateSnap.data();
      if (!template) {
        results.errors.push("No 'video_invite' template found");
        continue;
      }

      const html = mergeTags(template.html_body, {
        first_name: applicant.first_name ?? "",
        deadline: formatDeadline(deadline),
        video_form_link: "https://growthconnect.africa/founder-assessment-video-pitch-submission/",
      });

      const { error: sendError } = await sendEmail({ to: applicant.email, subject: template.subject, html });
      if (sendError) {
        results.errors.push(`Email failed for ${applicant.email}: ${sendError}`);
        continue;
      }

      await doc.ref.update({
        video_invite_sent_at: today.toISOString(),
        video_invite_window: windowLabel,
        current_stage: "Video Pitch",
        last_updated: today.toISOString(),
      });

      await adminDb.collection("send_log").add({
        applicant_id: applicant.id,
        template_key: "video_invite",
        sent_at: today.toISOString(),
      });

      results.videoInvitesSent++;
    } catch (err: any) {
      results.errors.push(`Applicant ${applicant.email}: ${err.message}`);
    }
  }

  // ============================================================
  // PART B — Video approved -> held until 5 days closed -> Verification invite
  // ============================================================
  const approvedSnap = await adminDb
    .collection("video_submissions")
    .where("review_status", "==", "approved")
    .where("verification_invite_sent_at", "==", null)
    .orderBy("approved_at", "asc")
    .limit(BATCH_SIZE)
    .get();

  for (const doc of approvedSnap.docs) {
    const submission = { id: doc.id, ...doc.data() } as any;
    try {
      if (!submission.applicant_id || !submission.video_invite_sent_at_snapshot) {
        // Fallback: look up the applicant directly if not denormalized.
      }
      const applicantSnap = await adminDb.collection("applicants").doc(submission.applicant_id).get();
      const applicant = applicantSnap.data() as any;
      if (!applicant?.video_invite_sent_at) continue;

      const holdRelease = addCalendarDays(new Date(applicant.video_invite_sent_at), 5);
      const window = nextReviewWindow(holdRelease);
      if (!isOnOrBefore(window, today)) continue;

      const deadline = addCalendarDays(today, 10);

      const batchSnap = await adminDb
        .collection("verification_batches")
        .where("batch_date", "<=", today.toISOString().slice(0, 10))
        .orderBy("batch_date", "desc")
        .limit(1)
        .get();
      const batch = batchSnap.docs[0]?.data();

      const templateSnap = await adminDb.collection("templates").doc("verification_invite").get();
      const template = templateSnap.data();
      if (!template) {
        results.errors.push("No 'verification_invite' template found");
        continue;
      }

      const lpxId = `LPX-${Date.now().toString(36).toUpperCase()}`;
      const verificationRef = await adminDb.collection("verifications").add({
        applicant_id: submission.applicant_id,
        email: applicant.email,
        lpx_id: lpxId,
        invited_at: today.toISOString(),
        deadline_date: deadline.toISOString(),
        review_status: "Pending",
        form_submitted: false,
      });

      const html = mergeTags(template.html_body, {
        first_name: applicant.first_name ?? "",
        deadline: formatDeadline(deadline),
        lpx_id: lpxId,
        verification_community_link: batch?.whatsapp_link ?? "",
      });

      const { error: sendError } = await sendEmail({ to: applicant.email, subject: template.subject, html });
      if (sendError) {
        results.errors.push(`Verification email failed for ${applicant.email}: ${sendError}`);
        continue;
      }

      await doc.ref.update({ verification_invite_sent_at: today.toISOString() });

      await adminDb.collection("applicants").doc(submission.applicant_id).update({
        current_stage: "Video Pitch Approved",
        last_updated: today.toISOString(),
      });

      await adminDb.collection("send_log").add({
        applicant_id: submission.applicant_id,
        template_key: "verification_invite",
        sent_at: today.toISOString(),
      });

      results.verificationInvitesSent++;
    } catch (err: any) {
      results.errors.push(`Video submission ${submission.id}: ${err.message}`);
    }
  }

  // ============================================================
  // PART C — Rejected videos -> training program email
  // ============================================================
  const rejectedSnap = await adminDb
    .collection("video_submissions")
    .where("review_status", "==", "rejected")
    .where("training_email_sent_at", "==", null)
    .orderBy("rejected_at", "asc")
    .limit(BATCH_SIZE)
    .get();

  for (const doc of rejectedSnap.docs) {
    const submission = { id: doc.id, ...doc.data() } as any;
    try {
      const applicantSnap = await adminDb.collection("applicants").doc(submission.applicant_id).get();
      const applicant = applicantSnap.data() as any;
      if (!applicant) continue;

      const templateSnap = await adminDb.collection("templates").doc("training_rejection").get();
      const template = templateSnap.data();

      const subject = template?.subject ?? "An Update from GrowthConnect Africa";
      const html = template?.html_body
        ? mergeTags(template.html_body, { first_name: applicant.first_name ?? "" })
        : `<p>Hi ${applicant.first_name},</p><p>Thank you for your interest in GrowthConnect Africa.</p><p>After careful consideration, we won't be moving forward with your application at this time. We encourage you to explore our free training programs.</p>`;

      const { error: sendError } = await sendEmail({ to: applicant.email, subject, html });
      if (sendError) {
        results.errors.push(`Training email failed for ${applicant.email}: ${sendError}`);
        continue;
      }

      await doc.ref.update({ training_email_sent_at: today.toISOString() });

      await adminDb.collection("applicants").doc(submission.applicant_id).update({
        current_stage: "Rejected Application",
        current_status: "Rejected",
        last_updated: today.toISOString(),
      });

      await adminDb.collection("send_log").add({
        applicant_id: submission.applicant_id,
        template_key: "training_rejection",
        sent_at: today.toISOString(),
      });

      results.trainingEmailsSent++;
    } catch (err: any) {
      results.errors.push(`Rejected submission ${submission.id}: ${err.message}`);
    }
  }

  if (results.errors.length > 0) {
    await adminDb.collection("engine_run_log").add({
      ran_at: today.toISOString(),
      video_invites_sent: results.videoInvitesSent,
      verification_invites_sent: results.verificationInvitesSent,
      error_count: results.errors.length,
      errors: results.errors,
    });
  }

  return NextResponse.json(results);
}
