import { NextRequest, NextResponse } from "next/server";
import { d1QueryOrdered, d1BatchUpdate, d1LogCronRun } from "@/lib/db/d1-admin";
import { sendBulkEmail } from "@/lib/engine/email";
import { getRawEmailTemplateForBulk } from "@/lib/engine/templateStore";
import { daysBetween, formatDeadline } from "@/lib/engine/dates";
import { timingSafeEqual } from "@/lib/engine/timingSafeEqual";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  if (!secret || !expected || !(await timingSafeEqual(secret, expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = new Date();
  const results = { checked: 0, sent: 0, errors: [] as string[] };
  try {
    const candidates = await d1QueryOrdered(
      "applicants",
      [{ field: "video_submitted_at", op: "EQUAL", value: null }],
      "video_invite_sent_at",
      "ASCENDING",
      500
    );
    const day2Group: { doc: any; a: any; deadline: Date }[] = [];
    const day4Group: { doc: any; a: any; deadline: Date }[] = [];
    const deadlineGroup: { doc: any; a: any; deadline: Date }[] = [];
    for (const doc of candidates) {
      const a = doc.data() as any;
      if (!a.video_invite_sent_at || !a.video_deadline_date) continue;
      results.checked++;
      const invitedAt = new Date(a.video_invite_sent_at);
      const deadline = new Date(a.video_deadline_date);
      const daysSince = daysBetween(invitedAt, now);
      const isDeadlineDay = daysBetween(now, deadline) === 0;
      if (daysSince === 2 && !a.video_reminder_2_sent) day2Group.push({ doc, a, deadline });
      else if (daysSince === 4 && !a.video_reminder_4_sent) day4Group.push({ doc, a, deadline });
      else if (isDeadlineDay && !a.video_reminder_deadline_sent) deadlineGroup.push({ doc, a, deadline });
    }
    async function sendGroup(
      group: { doc: any; a: any; deadline: Date }[],
      templateId: string,
      includeDaysRemaining: boolean,
      flagField: string
    ) {
      if (group.length === 0) return;
      const { subject, html } = await getRawEmailTemplateForBulk(templateId);
      const recipients = group.map(({ a, deadline }) => ({
        email: a.email,
        fields: {
          first_name: a.first_name || "there",
          deadline_date: formatDeadline(deadline),
          ...(includeDaysRemaining ? { days_remaining: String(daysBetween(now, deadline)) } : {}),
          email: encodeURIComponent(a.email),
        },
      }));
      const { error } = await sendBulkEmail({ recipients, subject, html });
      if (error) {
        results.errors.push(`${templateId}: ${error}`);
        return;
      }
      await d1BatchUpdate(
        group.map(({ doc }) => ({ table: "applicants", id: doc.id, fields: { [flagField]: true } }))
      );
      results.sent += group.length;
    }
    await sendGroup(day2Group, "video_reminder", true, "video_reminder_2_sent");
    await sendGroup(day4Group, "video_reminder", true, "video_reminder_4_sent");
    await sendGroup(deadlineGroup, "video_reminder_final", false, "video_reminder_deadline_sent");
    await d1LogCronRun("video-reminder-batch", results);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("video-reminder-batch failed:", err);
    return NextResponse.json({ error: err.message || "Failed to run video reminder batch." }, { status: 500 });
  }
}
