import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/engine/supabaseAdmin";
import { sendEmail } from "@/lib/engine/ses";

// POST /api/cron/video/action-required?secret=...
// Fires INSTANTLY when reviewer clicks "Send Feedback" on the dashboard.
// Sends action-required email right now (no wait).
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, feedback } = await req.json();

  if (!submissionId || !feedback?.trim()) {
    return NextResponse.json(
      { error: "submissionId and feedback are required." },
      { status: 400 }
    );
  }

  // Fetch applicant + submission
  const { data: sub, error: subError } = await supabaseAdmin
    .from("video_submissions")
    .select("id, applicants(first_name, email)")
    .eq("id", submissionId)
    .single();

  if (subError || !sub) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const applicant = (Array.isArray(sub.applicants) ? sub.applicants[0] : sub.applicants) as { first_name: string; email: string } | null;
  if (!applicant) {
    return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
  }

  const { data: template } = await supabaseAdmin
    .from("templates")
    .select("subject, html_body")
    .eq("key", "action_required")
    .single();

  const subject = template?.subject ?? "Action Required – GrowthConnect Africa";
  const body =
    template?.html_body ??
    `<p>Hi ${applicant.first_name},</p>
     <p>We reviewed your video submission and need additional information:</p>
     <p><strong>${feedback}</strong></p>
     <p>Please resubmit your video or provide the requested information as soon as possible.</p>
     <p>Best regards,<br/>GrowthConnect Africa Team</p>`;

  const { error: sendError } = await sendEmail({
    to: applicant.email,
    subject,
    html: body,
  });

  if (sendError) {
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  // Update submission with feedback (no timestamp change — not queued)
  await supabaseAdmin
    .from("video_submissions")
    .update({ feedback: feedback.trim(), review_status: "action_required" })
    .eq("id", submissionId);

  return NextResponse.json({
    success: true,
    message: "Action-required email sent instantly.",
  });
}
