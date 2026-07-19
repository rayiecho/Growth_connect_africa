import { NextResponse } from "next/server";
import { d1Query } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const GET = withAdminAuth(async (req, session) => {
  try {
    const [videoWaiting, verificationWaiting] = await Promise.all([
      d1Query("applicants", [{ field: "awaiting_video_submission", op: "EQUAL", value: true }]),
      d1Query("applicants", [{ field: "awaiting_verification_submission", op: "EQUAL", value: true }]),
    ]);

    const now = new Date();
    const entries: any[] = [];

    for (const doc of videoWaiting) {
      const a = doc.data() as any;
      if (!a.video_invite_sent_at || a.video_submitted_at) continue;
      const invitedAt = new Date(a.video_invite_sent_at);
      const deadline = a.video_deadline_date ? new Date(a.video_deadline_date) : addDays(invitedAt, 5);
      const schedule = [
        { label: "Day 2 reminder", date: fmt(addDays(invitedAt, 2)), sent: !!a.video_reminder_2_sent },
        { label: "Day 4 reminder", date: fmt(addDays(invitedAt, 4)), sent: !!a.video_reminder_4_sent },
        { label: "Deadline reminder", date: fmt(deadline), sent: !!a.video_reminder_deadline_sent },
      ];
      entries.push({
        id: doc.id,
        name: `${a.first_name || ""} ${a.last_name || ""}`.trim() || "Unnamed",
        email: a.email,
        phone: a.phone || "-",
        stage: "Video Pitch",
        submittedAt: fmt(invitedAt),
        deadline: fmt(deadline),
        daysRemaining: daysBetween(now, deadline),
        remindersSent: schedule.filter((s) => s.sent).length,
        remindersTotal: schedule.length,
        schedule,
      });
    }

    for (const doc of verificationWaiting) {
      const a = doc.data() as any;
      if (!a.verification_invite_sent_at || a.verification_submitted_at) continue;
      const invitedAt = new Date(a.verification_invite_sent_at);
      const deadline = a.verification_deadline_date ? new Date(a.verification_deadline_date) : addDays(invitedAt, 10);
      const schedule = [
        { label: "Day 2 reminder", date: fmt(addDays(invitedAt, 2)), sent: !!a.verification_reminder_2_sent },
        { label: "Day 4 reminder", date: fmt(addDays(invitedAt, 4)), sent: !!a.verification_reminder_4_sent },
        { label: "Day 6 reminder", date: fmt(addDays(invitedAt, 6)), sent: !!a.verification_reminder_6_sent },
        { label: "Day 8 reminder", date: fmt(addDays(invitedAt, 8)), sent: !!a.verification_reminder_8_sent },
        { label: "Deadline reminder", date: fmt(deadline), sent: !!a.verification_reminder_10_sent },
      ];
      entries.push({
        id: doc.id,
        name: `${a.first_name || ""} ${a.last_name || ""}`.trim() || "Unnamed",
        email: a.email,
        phone: a.phone || "-",
        stage: "Verification",
        submittedAt: fmt(invitedAt),
        deadline: fmt(deadline),
        daysRemaining: daysBetween(now, deadline),
        remindersSent: schedule.filter((s) => s.sent).length,
        remindersTotal: schedule.length,
        schedule,
      });
    }

    entries.sort((a, b) => a.daysRemaining - b.daysRemaining);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("call-log fetch failed:", err);
    return NextResponse.json({ error: "Failed to load call log." }, { status: 500 });
  }
});
