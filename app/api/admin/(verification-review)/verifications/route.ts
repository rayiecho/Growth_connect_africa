import { NextResponse } from "next/server";
import { d1UpdateById, d1GetById } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { id, applicant_id, status, feedback } = await req.json();
  if (!id || !["Approved", "Rejected", "Action Required"].includes(status)) {
    return NextResponse.json({ error: "id and a valid status are required." }, { status: 400 });
  }
  if (status === "Action Required" && !feedback?.trim()) {
    return NextResponse.json({ error: "feedback is required for Action Required." }, { status: 400 });
  }
  try {
    await d1UpdateById("verifications", id, {
      review_status: status,
      decision_at: new Date().toISOString(),
      ...(status === "Action Required" ? { feedback: feedback.trim() } : {}),
    });
    if (status === "Action Required") {
      const doc = await d1GetById("verifications", id);
      if (doc) {
        const data = doc.data() as any;
        const escapedFeedback = feedback.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
        const { subject, html } = await renderEmailTemplate("verification_action_required", {
          first_name: data.applicant_first_name ?? "there",
          feedback: escapedFeedback,
          email: encodeURIComponent(data.email),
        });
        await sendEmail({ to: data.email, subject, html });
      }
    }
    return NextResponse.json({
      success: true,
      message: status === "Action Required"
        ? "Feedback recorded and email sent."
        : "Decision recorded. Outcome email will be sent on the scheduled release date.",
    });
  } catch (err) {
    console.error("verifications update failed:", err);
    return NextResponse.json({ error: "Failed to update verification." }, { status: 500 });
  }
});
