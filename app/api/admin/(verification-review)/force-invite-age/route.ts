import { NextResponse } from "next/server";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { addCalendarDays } from "@/lib/engine/dates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { email, stage, daysAgo } = await req.json();
  if (!email || !["video", "verification"].includes(stage) || typeof daysAgo !== "number") {
    return NextResponse.json({ error: "email, stage (video|verification), and daysAgo are required." }, { status: 400 });
  }
  const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email.trim().toLowerCase() }]);
  if (matches.length === 0) {
    return NextResponse.json({ error: "No applicant found for that email." }, { status: 404 });
  }
  const now = new Date();
  const shiftedInvite = addCalendarDays(now, -daysAgo);
  if (stage === "video") {
    const deadline = addCalendarDays(shiftedInvite, 5);
    await d1UpdateById("applicants", matches[0].id, {
      video_invite_sent_at: shiftedInvite.toISOString(),
      video_deadline_date: deadline.toISOString().slice(0, 10),
      video_submitted_at: null,
      video_reminder_2_sent: false,
      video_reminder_4_sent: false,
      video_reminder_deadline_sent: false,
    });
    return NextResponse.json({ success: true, invite_sent_at: shiftedInvite.toISOString(), deadline: deadline.toISOString().slice(0, 10) });
  } else {
    const deadline = addCalendarDays(shiftedInvite, 10);
    await d1UpdateById("applicants", matches[0].id, {
      verification_invite_sent_at: shiftedInvite.toISOString(),
      verification_deadline_date: deadline.toISOString().slice(0, 10),
      verification_submitted_at: null,
      verification_reminder_2_sent: false,
      verification_reminder_4_sent: false,
      verification_reminder_6_sent: false,
      verification_reminder_8_sent: false,
      verification_reminder_10_sent: false,
    });
    return NextResponse.json({ success: true, invite_sent_at: shiftedInvite.toISOString(), deadline: deadline.toISOString().slice(0, 10) });
  }
});
