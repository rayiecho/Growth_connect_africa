import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { sendEmail, mergeTags } from "@/lib/engine/ses";

// POST /api/cron/video/action-required
// Protected by admin session cookie — NOT a public secret, since this is
// triggered by a logged-in reviewer clicking a button, not an automated
// scheduler. CRON_SECRET stays reserved for the actual scheduled routes.
export async function POST(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, feedback } = await req.json();
  if (!submissionId || !feedback?.trim()) {
    return NextResponse.json({ error: "submissionId and feedback are required." }, { status: 400 });
  }

  const subSnap = await adminDb.ref(`video_submissions/${submissionId}`).once("value");
  const submission = subSnap.val();
  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const templateSnap = await adminDb.ref("templates/action_required").once("value");
  const template = templateSnap.val();

  const subject = template?.subject ?? "Action Required – GrowthConnect Africa";
  const html = template?.html_body
    ? mergeTags(template.html_body, {
        first_name: submission.applicant_first_name ?? "",
        feedback: feedback.trim(),
      })
    : `<p>Hi ${submission.applicant_first_name},</p><p>${feedback.trim()}</p>`;

  const { error: sendError } = await sendEmail({
    to: submission.applicant_email,
    subject,
    html,
  });

  if (sendError) {
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Action-required email sent instantly." });
}
