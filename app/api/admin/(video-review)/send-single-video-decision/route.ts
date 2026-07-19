import { NextResponse } from "next/server";
import { d1Query, d1UpdateById, d1GetBatchLink } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { addWorkingDays, formatDeadline } from "@/lib/engine/dates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { email, decision } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !["approved", "rejected"].includes(decision)) {
    return NextResponse.json({ error: "email and decision (approved|rejected) are required." }, { status: 400 });
  }
  const subs = await d1Query("video_submissions", [{ field: "applicant_email", op: "EQUAL", value: cleanEmail }]);
  if (subs.length === 0) return NextResponse.json({ error: "No video submission found." }, { status: 404 });
  const sub = subs.sort((a: any, b: any) => (b.data().submitted_at || "").localeCompare(a.data().submitted_at || ""))[0];
  const data = sub.data() as any;
  const now = new Date();
  if (decision === "approved") {
    const applicantMatch = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: cleanEmail }]);
    const applicant = applicantMatch[0]?.data() as any;
    const applicantId = applicantMatch[0]?.id;
    const verificationDeadline = addWorkingDays(now, 10);
    const batchLink = await d1GetBatchLink(data.outcome_release_date || now.toISOString().slice(0, 10));
    const { subject, html } = await renderEmailTemplate("video_approved", {
      first_name: data.applicant_first_name ?? "there",
      whatsapp_link: batchLink || "",
      deadline_date: formatDeadline(verificationDeadline),
      email: encodeURIComponent(cleanEmail),
    });
    const { error } = await sendEmail({ to: cleanEmail, subject, html });
    if (error) return NextResponse.json({ error }, { status: 500 });
    await d1UpdateById("video_submissions", sub.id, { outcome_sent_at: now.toISOString() });
    if (applicantId) {
      await d1UpdateById("applicants", applicantId, {
        current_stage: "Video Pitch Approved",
        verification_invite_sent_at: now.toISOString(),
        verification_deadline_date: verificationDeadline.toISOString().slice(0, 10),
        awaiting_verification_submission: true,
      });
    }
  } else {
    const { subject, html } = await renderEmailTemplate("video_rejected", {
      first_name: data.applicant_first_name ?? "there",
      email: encodeURIComponent(cleanEmail),
    });
    const { error } = await sendEmail({ to: cleanEmail, subject, html });
    if (error) return NextResponse.json({ error }, { status: 500 });
    await d1UpdateById("video_submissions", sub.id, { outcome_sent_at: now.toISOString() });
  }
  return NextResponse.json({ success: true, sentTo: cleanEmail, decision, submissionId: sub.id });
});
