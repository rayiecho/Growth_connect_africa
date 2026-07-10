import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreQuery, firestoreGetAll } from "@/lib/firebase/rest-admin";
import { sendEmail, mergeTags } from "@/lib/engine/ses";

export async function POST(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, feedback } = await req.json();
  if (!submissionId || !feedback?.trim()) {
    return NextResponse.json({ error: "submissionId and feedback are required." }, { status: 400 });
  }

  const allSubs = await firestoreGetAll("video_submissions");
  const subDoc = allSubs.find((d) => d.id === submissionId);
  if (!subDoc) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }
  const submission = subDoc.data() as any;

  const allTemplates = await firestoreGetAll("templates");
  const templateDoc = allTemplates.find((d) => d.id === "action_required");
  const template = templateDoc?.data() as any;

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
