import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/engine/supabaseAdmin";
import { sendEmail, mergeTags } from "@/lib/engine/ses";
import {
  nextReviewWindow,
  addCalendarDays,
  isOnOrBefore,
  formatDeadline,
} from "@/lib/engine/dates";

// GET /api/cron/run-review-batch?secret=...
//
// SCALE-SAFETY DESIGN: bounded batch per invocation (BATCH_SIZE), safe to
// call repeatedly. Every operation checks "has this already happened?"
// before acting, so re-calling never double-sends.
const BATCH_SIZE = 50;

function getApplicant(row: any) {
  const a = row?.applicants;
  return Array.isArray(a) ? a[0] : a;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    videoInvitesSent: 0,
    verificationInvitesSent: 0,
    trainingEmailsSent: 0,
    errors: [] as string[],
  };
  const today = new Date();

  // ============================================================
  // PART A — Application submitted -> Video Pitch invite
  // ============================================================
  const { data: pendingApplicants, error: appError } = await supabaseAdmin
    .from("applicants")
    .select("id, email, first_name, date_applied, video_invite_sent_at")
    .is("video_invite_sent_at", null)
    .order("date_applied", { ascending: true })
    .limit(BATCH_SIZE);

  if (appError) results.errors.push(`Fetching applicants: ${appError.message}`);

  for (const applicant of pendingApplicants ?? []) {
    try {
      const window = nextReviewWindow(new Date(applicant.date_applied));
      if (!isOnOrBefore(window, today)) continue;

      const deadline = addCalendarDays(today, 5);

      const { data: template } = await supabaseAdmin
        .from("templates")
        .select("subject, html_body")
        .eq("key", "video_invite")
        .single();

      if (!template) {
        results.errors.push("No 'video_invite' template found in templates table");
        continue;
      }

      const html = mergeTags(template.html_body, {
        first_name: applicant.first_name ?? "",
        deadline: formatDeadline(deadline),
        video_form_link:
          "https://growthconnect.africa/founder-assessment-video-pitch-submission/",
      });

      await sendEmail({ to: applicant.email, subject: template.subject, html });

      await supabaseAdmin
        .from("applicants")
        .update({
          video_invite_sent_at: today.toISOString(),
          current_stage: "Applications Approved",
        })
        .eq("id", applicant.id);

      await supabaseAdmin
        .from("send_log")
        .insert({ applicant_id: applicant.id, template_key: "video_invite" });

      results.videoInvitesSent++;
    } catch (err: any) {
      results.errors.push(`Applicant ${applicant.email}: ${err.message}`);
    }
  }

  // ============================================================
  // PART B — Video approved -> 10 days from the APPROVE click ->
  // Verification invite, released on the next Tue/Fri window on
  // or after that 10-day mark. Does NOT pre-create a verifications
  // row — that row is created solely when the applicant submits the
  // real /verification form, to avoid duplicate/empty rows.
  // ============================================================
  const { data: approvedVideos, error: videoError } = await supabaseAdmin
    .from("video_submissions")
    .select(
      "id, applicant_id, review_status, approved_at, verification_invite_sent_at, applicants(id, email, first_name)"
    )
    .eq("review_status", "approved")
    .is("verification_invite_sent_at", null)
    .order("approved_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (videoError)
    results.errors.push(`Fetching approved videos: ${videoError.message}`);

  for (const submission of approvedVideos ?? []) {
    try {
      const applicant = getApplicant(submission);
      if (!applicant || !submission.approved_at) continue;

      const holdRelease = addCalendarDays(new Date(submission.approved_at), 10);
      const window = nextReviewWindow(holdRelease);
      if (!isOnOrBefore(window, today)) continue;

      const deadline = addCalendarDays(today, 10);

      const { data: batch } = await supabaseAdmin
        .from("verification_batches")
        .select("whatsapp_link")
        .lte("batch_date", today.toISOString().slice(0, 10))
        .order("batch_date", { ascending: false })
        .limit(1)
        .single();

      const { data: template } = await supabaseAdmin
        .from("templates")
        .select("subject, html_body")
        .eq("key", "verification_invite")
        .single();

      if (!template) {
        results.errors.push("No 'verification_invite' template found in templates table");
        continue;
      }

      const html = mergeTags(template.html_body, {
        first_name: applicant.first_name ?? "",
        deadline: formatDeadline(deadline),
        verification_community_link: batch?.whatsapp_link ?? "",
      });

      await sendEmail({ to: applicant.email, subject: template.subject, html });

      await supabaseAdmin
        .from("video_submissions")
        .update({ verification_invite_sent_at: today.toISOString() })
        .eq("id", submission.id);

      await supabaseAdmin
        .from("applicants")
        .update({ current_stage: "Video Pitch Approved" })
        .eq("id", applicant.id);

      await supabaseAdmin
        .from("send_log")
        .insert({ applicant_id: applicant.id, template_key: "verification_invite" });

      results.verificationInvitesSent++;
    } catch (err: any) {
      results.errors.push(`Video submission ${submission.id}: ${err.message}`);
    }
  }

  // ============================================================
  // PART C — Video rejected -> 10 days from the REJECT click ->
  // Training program email, same next-Tue/Fri release pattern.
  // ============================================================
  const { data: rejectedVideos, error: rejectedError } = await supabaseAdmin
    .from("video_submissions")
    .select(
      "id, applicant_id, review_status, rejected_at, training_email_sent_at, applicants(id, email, first_name)"
    )
    .eq("review_status", "rejected")
    .is("training_email_sent_at", null)
    .order("rejected_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (rejectedError)
    results.errors.push(`Fetching rejected videos: ${rejectedError.message}`);

  for (const submission of rejectedVideos ?? []) {
    try {
      const applicant = getApplicant(submission);
      if (!applicant || !submission.rejected_at) continue;

      const holdRelease = addCalendarDays(new Date(submission.rejected_at), 10);
      const window = nextReviewWindow(holdRelease);
      if (!isOnOrBefore(window, today)) continue;

      const { data: template } = await supabaseAdmin
        .from("templates")
        .select("subject, html_body")
        .eq("key", "training_rejection")
        .single();

      if (!template) {
        results.errors.push("No 'training_rejection' template found in templates table");
        continue;
      }

      const html = mergeTags(template.html_body, {
        first_name: applicant.first_name ?? "",
      });

      await sendEmail({ to: applicant.email, subject: template.subject, html });

      await supabaseAdmin
        .from("video_submissions")
        .update({ training_email_sent_at: today.toISOString() })
        .eq("id", submission.id);

      await supabaseAdmin
        .from("applicants")
        .update({ current_stage: "Video Pitch Rejected" })
        .eq("id", applicant.id);

      await supabaseAdmin
        .from("send_log")
        .insert({ applicant_id: applicant.id, template_key: "training_rejection" });

      results.trainingEmailsSent++;
    } catch (err: any) {
      results.errors.push(`Rejected video ${submission.id}: ${err.message}`);
    }
  }

  if (results.errors.length > 0) {
    await supabaseAdmin.from("engine_run_log").insert({
      ran_at: today.toISOString(),
      video_invites_sent: results.videoInvitesSent,
      verification_invites_sent: results.verificationInvitesSent,
      error_count: results.errors.length,
      errors: results.errors,
    });
  }

  return NextResponse.json(results);
}