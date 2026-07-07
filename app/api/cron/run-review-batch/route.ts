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
// For now, this is triggered manually (visit the URL, or click a button)
// so we can prove the logic is correct before wiring up real scheduling.
// Once deployed to Vercel, a Vercel Cron Job hits this same URL
// automatically on the Tue/Fri/daily schedule — no code changes needed,
// just a vercel.json entry pointing at this path.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    videoInvitesSent: 0,
    verificationInvitesSent: 0,
    errors: [] as string[],
  };
  const today = new Date();

  // ============================================================
  // PART A — Application submitted -> Video Pitch invite
  // Tue/Wed/Thu applications go out the following Friday.
  // Fri/Sat/Sun/Mon applications go out the following Tuesday.
  // ============================================================
  const { data: pendingApplicants, error: appError } = await supabaseAdmin
    .from("applicants")
    .select("id, email, first_name, date_applied, video_invite_sent_at")
    .is("video_invite_sent_at", null);

  if (appError) results.errors.push(`Fetching applicants: ${appError.message}`);

  for (const applicant of pendingApplicants ?? []) {
    try {
      const window = nextReviewWindow(new Date(applicant.date_applied));
      if (!isOnOrBefore(window, today)) continue; // not due yet

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
  // PART B — Video approved -> held until 5 days closed -> Verification
  // invite at the next window. Creates the verifications row (which
  // auto-assigns the LaunchPadX ID via the database trigger), picks the
  // correct rotating WhatsApp link, computes the real 10-day deadline date.
  // ============================================================
  const { data: approvedVideos, error: videoError } = await supabaseAdmin
    .from("video_submissions")
    .select(
      "id, applicant_id, review_status, verification_invite_sent_at, applicants(id, email, first_name, video_invite_sent_at)"
    )
    .eq("review_status", "approved")
    .is("verification_invite_sent_at", null);

  if (videoError)
    results.errors.push(`Fetching video submissions: ${videoError.message}`);

  for (const submission of approvedVideos ?? []) {
    try {
      const applicant = (submission as any).applicants;
      if (!applicant?.video_invite_sent_at) continue; // can't compute hold without this

      const holdRelease = addCalendarDays(new Date(applicant.video_invite_sent_at), 5);
      const window = nextReviewWindow(holdRelease);
      if (!isOnOrBefore(window, today)) continue; // still on hold, or window not here yet

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

      // This insert is what triggers the LaunchPadX ID auto-generation.
      const { data: verification, error: insertError } = await supabaseAdmin
        .from("verifications")
        .insert({
          applicant_id: applicant.id,
          invite_sent_at: today.toISOString(),
          deadline_date: deadline.toISOString().slice(0, 10),
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

  return NextResponse.json(results);
}
