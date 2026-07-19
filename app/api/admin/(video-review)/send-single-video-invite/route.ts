import { NextResponse } from "next/server";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { addCalendarDays, formatDeadline } from "@/lib/engine/dates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: cleanEmail }]);
  if (matches.length === 0) return NextResponse.json({ error: "No applicant found." }, { status: 404 });
  const doc = matches[0];
  const applicant = doc.data() as any;
  const now = new Date();
  const deadline = addCalendarDays(now, 5);
  const { subject, html } = await renderEmailTemplate("video_invite", {
    first_name: applicant.first_name ?? "there",
    deadline_date: formatDeadline(deadline),
    email: encodeURIComponent(cleanEmail),
  });
  const { error } = await sendEmail({ to: cleanEmail, subject, html });
  if (error) return NextResponse.json({ error }, { status: 500 });
  await d1UpdateById("applicants", doc.id, {
    video_invite_sent_at: now.toISOString(),
    video_deadline_date: deadline.toISOString().slice(0, 10),
    current_stage: "Video Pitch Stage",
    awaiting_video_submission: true,
  });
  return NextResponse.json({ success: true, sentTo: cleanEmail });
});
