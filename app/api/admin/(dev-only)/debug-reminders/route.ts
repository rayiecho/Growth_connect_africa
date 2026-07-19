import { NextRequest, NextResponse } from "next/server";
import { firestoreQuery } from "@/lib/firebase/firestore-rest";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const authedGET = withAdminAuth(async (req, session) => {
  const videoCandidates = await firestoreQuery("applicants", [
    { field: "video_submitted_at", op: "EQUAL", value: null },
  ]);
  const verificationCandidates = await firestoreQuery("applicants", [
    { field: "verification_submitted_at", op: "EQUAL", value: null },
  ]);

  return NextResponse.json({
    videoReminderCandidates: videoCandidates
      .filter((d) => (d.data() as any).video_invite_sent_at)
      .map((d) => ({
        id: d.id,
        email: (d.data() as any).email,
        video_invite_sent_at: (d.data() as any).video_invite_sent_at,
        video_deadline_date: (d.data() as any).video_deadline_date,
        reminders_sent: {
          day2: (d.data() as any).video_reminder_2_sent,
          day4: (d.data() as any).video_reminder_4_sent,
          deadline: (d.data() as any).video_reminder_deadline_sent,
        },
      })),
    verificationReminderCandidates: verificationCandidates
      .filter((d) => (d.data() as any).verification_invite_sent_at)
      .map((d) => ({
        id: d.id,
        email: (d.data() as any).email,
        verification_invite_sent_at: (d.data() as any).verification_invite_sent_at,
        verification_deadline_date: (d.data() as any).verification_deadline_date,
        reminders_sent: {
          day2: (d.data() as any).verification_reminder_2_sent,
          day4: (d.data() as any).verification_reminder_4_sent,
          day6: (d.data() as any).verification_reminder_6_sent,
          day8: (d.data() as any).verification_reminder_8_sent,
          day10: (d.data() as any).verification_reminder_10_sent,
        },
      })),
  });
});

export async function GET(req: NextRequest, context: unknown) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return authedGET(req, context);
}
