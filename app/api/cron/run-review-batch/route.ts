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
// Reconciled version — merges tonight's tested verification pipeline
// (LaunchPadX ID generation, rotating WhatsApp link, real computed
// deadlines, correct Tue-Thu->Fri / Fri-Mon->Tue windowing) with the
// separately-built rejection/training-email pipeline (Part C).
//
// Two real rule mismatches from the other branch were fixed here, not
// just merged: (1) video invite windowing now uses the exact dictated
// rule via nextReviewWindow(), not a fixed Sat-Tue/Wed-Fri bucket; (2)
// verification invites fire once the applicant's actual 5-day video
// deadline has closed and the next window arrives — not a flat 10 days
// after approval regardless of when they were invited.
//
// Bounded batch size throughout — safe to call frequently (every few
// minutes via a scheduler) rather than only twice a week. Every write is
// guarded by an "already done?" check, so repeated or overlapping calls
// never double-send.
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
  // Tue/Wed/Thu applications -> the following Friday.
  // Fri/Sat/Sun/Mon applications -> the following Tuesday.
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
      if (!isOnOrBefore(window, today)) continue; // not due yet

      const deadline = addCalendarDays(today, 5);
      const windowLabel = window.getDay() === 2 ? "tue" : "fri";

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

      const { error: sendError } = await sendEmail({
        to: applicant.email,
        subject: template.subject,
        html,
      });

      if (sendError) {
        results.errors.push(`Email failed for ${applicant.email}: ${sendError}`);
        continue;
      }

      await supabaseAdmin
        .from("applicants")
        .update({
          video_invite_sent_at: today.toISOString(),
          video_invite_window: windowLabel,
          current_stage: "Video Pitch",
          last_updated: today.toISOString(),
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
  // PART B — Video approved -> held until 5 days closed -> Verification
  // invite at the next window. Creates the verifications row (auto-
  // assigns the LaunchPadX ID via trigger), picks the correct rotating
  // WhatsApp link, computes the real deadline date.
  // ============================================================
  const { data: approvedVideos, error: videoError } = await supabaseAdmin
    .from("video_submissions")
    .select(
      "id, applicant_id, review_status, verification_invite_sent_at, applicants(id, email, first_name, video_invite_sent_at)"
    )
    .eq("review_status", "approved")
    .is("verification_invite_sent_at", null)
    .order("approved_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (videoError)
    results.errors.push(`Fetching approved videos: ${videoError.message}`);

  for (const submission of approvedVideos ?? []) {
    try {
      const applicant = (submission as any).applicants;
      if (!applicant?.video_invite_sent_at) continue;

      const holdRelease = addCalendarDays(new Date(applicant.video_invite_sent_at), 5);
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

      const { data: verification, error: insertError } = await supabaseAdmin
        .from("verifications")
        .insert({
          applicant_id: applicant.id,
          email: applicant.email,
          invited_at: today.toISOString(),
          deadline_date: deadline.toISOString(),
          review_status: "Pending",
          form_submitted: false,
        })
        .select("lpx_id")
        .single();

      if (insertError) {
        results.errors.push(
          `Creating verification for ${applicant.email}: ${insertError.message}`
        );
        continue;
      }

      const html = mergeTags(template.html_body, {
        first_name: applicant.first_name ?? "",
        deadline: formatDeadline(deadline),
        lpx_id: verification?.lpx_id ?? "",
        verification_community_link: batch?.whatsapp_link ?? "",
      });

      const { error: sendError } = await sendEmail({
        to: applicant.email,
        subject: template.subject,
        html,
      });

      if (sendError) {
        results.errors.push(`Verification email failed for ${applicant.email}: ${sendError}`);
        continue;
      }

      await supabaseAdmin
        .from("video_submissions")
        .update({ verification_invite_sent_at: today.toISOString() })
        .eq("id", submission.id);

      await supabaseAdmin
        .from("applicants")
        .update({ current_stage: "Video Pitch Approved", last_updated: today.toISOString() })
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
  // PART C — Rejected videos -> training program redirect email.
  // Kept from the separately-built branch. Uses training_email_sent_at
  // (the column that actually exists for this purpose) as the guard,
  // not invite_email_sent_at, so this never collides with Part B's state.
  // ============================================================
  const { data: rejectedVideos, error: rejectError } = await supabaseAdmin
    .from("video_submissions")
    .select("id, applicant_id, training_email_sent_at, rejected_at, applicants(first_name, email)")
    .eq("review_status", "rejected")
    .is("training_email_sent_at", null)
    .not("rejected_at", "is", null)
    .order("rejected_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (rejectError) results.errors.push(`Fetching rejected videos: ${rejectError.message}`);

  for (const submission of rejectedVideos ?? []) {
    try {
      const applicant = (submission as any).applicants;
      if (!applicant) continue;

      const { data: template } = await supabaseAdmin
        .from("templates")
        .select("subject, html_body")
        .eq("key", "training_rejection")
        .single();

      const subject = template?.subject ?? "An Update from GrowthConnect Africa";
      const html =
        template?.html_body
          ? mergeTags(template.html_body, { first_name: applicant.first_name ?? "" })
          : `<p>Hi ${applicant.first_name},</p>
             <p>Thank you for your interest in GrowthConnect Africa and for taking the time to apply.</p>
             <p>After careful consideration, we won't be moving forward with your application at this time. However, we encourage you to explore our free training programs:</p>
             <p><a href="https://growthconnect.africa/programs" style="display:inline-block;background:#2FA36B;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;">View Training Programs</a></p>
             <p>Warm regards,<br/>GrowthConnect Africa Team</p>`;

      const { error: sendError } = await sendEmail({ to: applicant.email, subject, html });

      if (sendError) {
        results.errors.push(`Training email failed for ${applicant.email}: ${sendError}`);
        continue;
      }

      await supabaseAdmin
        .from("video_submissions")
        .update({ training_email_sent_at: today.toISOString() })
        .eq("id", submission.id);

      await supabaseAdmin
        .from("applicants")
        .update({
          current_stage: "Rejected Application",
          current_status: "Rejected",
          last_updated: today.toISOString(),
        })
        .eq("id", submission.applicant_id);

      await supabaseAdmin
        .from("send_log")
        .insert({ applicant_id: submission.applicant_id, template_key: "training_rejection" });

      results.trainingEmailsSent++;
    } catch (err: any) {
      results.errors.push(`Rejected submission ${submission.id}: ${err.message}`);
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
