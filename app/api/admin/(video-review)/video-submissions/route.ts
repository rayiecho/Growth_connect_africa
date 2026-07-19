import { NextResponse } from "next/server";
import { d1UpdateById, d1GetById } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { id, action, feedback } = await req.json();
  if (!id || !["approve", "reject", "action_required"].includes(action)) {
    return NextResponse.json({ error: "id and a valid action are required." }, { status: 400 });
  }
  try {
    if (action === "approve") {
      await d1UpdateById("video_submissions", id, {
        review_status: "approved",
        approved_at: new Date().toISOString(),
      });
    } else if (action === "reject") {
      await d1UpdateById("video_submissions", id, {
        review_status: "rejected",
        rejected_at: new Date().toISOString(),
      });
    } else if (action === "action_required") {
      if (!feedback?.trim()) {
        return NextResponse.json({ error: "feedback is required for this action." }, { status: 400 });
      }
      await d1UpdateById("video_submissions", id, {
        review_status: "action_required",
        feedback: feedback.trim(),
      });
      const doc = await d1GetById("video_submissions", id);
      if (doc) {
        const data = doc.data() as any;
        const escapedFeedback = feedback.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
        const { subject, html } = await renderEmailTemplate("video_action_required", {
          first_name: data.applicant_first_name ?? "there",
          feedback: escapedFeedback,
          email: encodeURIComponent(data.applicant_email),
        });
        await sendEmail({ to: data.applicant_email, subject, html });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("video-submissions update failed:", err);
    return NextResponse.json({ error: "Failed to update submission." }, { status: 500 });
  }
});
