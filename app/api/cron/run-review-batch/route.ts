import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/engine/supabaseAdmin";
import { sendEmail } from "@/lib/engine/ses";
import { addCalendarDays } from "@/lib/engine/dates";

// GET /api/cron/run-review-batch?secret=...
//
// Unified scheduler — runs every Tue & Fri at midnight CAT (22:00 UTC).
//
// Pipeline:
//   TUE → sends video invites for Sat–Mon applications
//   TUE → sends verification emails for approved videos (10+ days ago)
//   TUE → sends training emails for rejected videos (10+ days ago)
//   FRI → sends video invites for Tue–Thu applications
//   FRI → sends verification emails for approved videos (10+ days ago)
//   FRI → sends training emails for rejected videos (10+ days ago)
//
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 2=Tue, 5=Fri

  const results = {
    videoInvitesSent: 0,
    verificationEmailsSent: 0,
    trainingEmailsSent: 0,
    errors: [] as string[],
  };

  // ── PART A: Video invites ──────────────────────────────────────────────
  // Determine which window to process today.
  //   Tue (day=2) → 'tue' window (apps submitted Sat–Mon)
  //   Fri (day=5) → 'fri' window (apps submitted Tue–Thu)
  //   Any other day → skip
  const targetWindow = dayOfWeek === 2 ? "tue" : dayOfWeek === 5 ? "fri" : null;

  if (targetWindow) {
    // Mark eligible applications as belonging to this invite window
    // and send them the video submission email.
    const { data: windowApps, error: appError } = await supabaseAdmin
      .from("applicants")
      .select("id, email, first_name, date_applied")
      .is("video_invite_window", null)
      .in("current_stage", ["Application Submitted", "Video Submission"]);

    if (appError) {
      results.errors.push(`Fetching applicants: ${appError.message}`);
    } else if (windowApps?.length) {
      for (const app of windowApps) {
        const appDay = new Date(app.date_applied).getDay();
        let appWindow: string;

        // Sat(6)-Tue(2) -> 'tue'; Wed(3)-Fri(5) -> 'fri'
        if (appDay === 6 || appDay === 0 || appDay === 1 || appDay === 2) {
          appWindow = "tue";
        } else {
          appWindow = "fri";
        }

        // Only process apps that match today's window
        if (appWindow !== targetWindow) continue;

        // Mark the window (idempotent)
        await supabaseAdmin
          .from("applicants")
          .update({ video_invite_window: appWindow })
          .eq("id", app.id);

        // Send video invite email
        const { data: template } = await supabaseAdmin
          .from("templates")
          .select("subject, body")
          .eq("name", "video_invite")
          .single();

        const subject = template?.subject ?? "Your Next Step – Video Pitch | GrowthConnect Africa";
        const body =
          template?.body ??
          `<p>Hi ${app.first_name},</p>
           <p>Thank you for applying to GrowthConnect Africa!</p>
           <p>Your application has moved to the next stage. Please submit your video pitch:</p>
           <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/video-pitch" style="display:inline-block;background:#2FA36B;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;">Submit Video Pitch</a></p>
           <p>Best regards,<br/>GrowthConnect Africa Team</p>`;

        const { error: sendError } = await sendEmail({
          to: app.email,
          subject,
          html: body,
        });

        if (sendError) {
          results.errors.push(`Email failed for ${app.email}: ${sendError}`);
        } else {
          results.videoInvitesSent++;
          // Mark as queued so we don't send again
          await supabaseAdmin
            .from("applicants")
            .update({
              email_response_status: "queued",
              video_invite_window: appWindow,
            })
            .eq("id", app.id);
        }
      }
    }
  }

  // ── PART B: Verification invites (10-day approved pipeline) ────────────
  // For every approved video that's been waiting 10+ days and hasn't received
  // an invite yet, send the verification invite.
  const tenDaysAgo = addCalendarDays(today, -10).toISOString();

  const { data: approvedVideos, error: approveError } = await supabaseAdmin
    .from("video_submissions")
    .select("id, applicant_id, invite_email_sent_at, applicants(first_name, email)")
    .eq("review_status", "approved")
    .is("invite_email_sent_at", null)
    .lte("approved_at", tenDaysAgo);

  if (approveError) {
    results.errors.push(`Fetching approved videos: ${approveError.message}`);
  } else if (approvedVideos?.length) {
    for (const vid of approvedVideos) {
      const applicant = (Array.isArray(vid.applicants) ? vid.applicants[0] : vid.applicants) as { first_name: string; email: string } | null;
      if (!applicant) continue;

      const { data: template } = await supabaseAdmin
        .from("templates")
        .select("subject, body")
        .eq("name", "verification_invite")
        .single();

      const subject = template?.subject ?? "Congratulations! Next Step – Verification | GrowthConnect Africa";
      const body =
        template?.body ??
        `<p>Hi ${applicant.first_name},</p>
         <p>Congratulations! Your video pitch has been reviewed and approved.</p>
         <p>You are now moving to the verification stage. Please complete the next steps:</p>
         <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/verification" style="display:inline-block;background:#2FA36B;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;">Complete Verification</a></p>
         <p>Best regards,<br/>GrowthConnect Africa Team</p>`;

      const { error: sendError } = await sendEmail({
        to: applicant.email,
        subject,
        html: body,
      });

      if (!sendError) {
        results.verificationEmailsSent++;
        await supabaseAdmin
          .from("video_submissions")
          .update({ invite_email_sent_at: today.toISOString() })
          .eq("id", vid.id);
      } else {
        results.errors.push(`Verification email failed for ${applicant.email}`);
      }
    }
  }

  // ── PART C: Training program emails (10-day rejected pipeline) ──────────
  const { data: rejectedVideos, error: rejectError } = await supabaseAdmin
    .from("video_submissions")
    .select("id, applicant_id, invite_email_sent_at, applicants(first_name, email)")
    .eq("review_status", "rejected")
    .is("invite_email_sent_at", null)
    .lte("rejected_at", tenDaysAgo);

  if (rejectError) {
    results.errors.push(`Fetching rejected videos: ${rejectError.message}`);
  } else if (rejectedVideos?.length) {
    for (const vid of rejectedVideos) {
      const applicant = (Array.isArray(vid.applicants) ? vid.applicants[0] : vid.applicants) as { first_name: string; email: string } | null;
      if (!applicant) continue;

      const { data: template } = await supabaseAdmin
        .from("templates")
        .select("subject, body")
        .eq("name", "training_rejection")
        .single();

      const subject = template?.subject ?? "An Update from GrowthConnect Africa";
      const body =
        template?.body ??
        `<p>Hi ${applicant.first_name},</p>
         <p>Thank you for your interest in GrowthConnect Africa and for taking the time to apply.</p>
         <p>After careful consideration, we won't be moving forward with your application at this time. However, we encourage you to explore our free training programs:</p>
         <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/programs" style="display:inline-block;background:#2FA36B;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;">View Training Programs</a></p>
         <p>We wish you the very best in your journey.</p>
         <p>Warm regards,<br/>GrowthConnect Africa Team</p>`;

      const { error: sendError } = await sendEmail({
        to: applicant.email,
        subject,
        html: body,
      });

      if (!sendError) {
        results.trainingEmailsSent++;
        await supabaseAdmin
          .from("video_submissions")
          .update({ invite_email_sent_at: today.toISOString() })
          .eq("id", vid.id);
      } else {
        results.errors.push(`Training email failed for ${applicant.email}`);
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: "Batch complete.",
    ...results,
  });
}
