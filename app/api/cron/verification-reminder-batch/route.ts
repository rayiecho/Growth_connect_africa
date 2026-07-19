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
      [{ field: "verification_submitted_at", op: "EQUAL", value: null }],
      "verification_invite_sent_at",
      "ASCENDING",
      500
    );

    const reminderDays = [
      { day: 2, field: "verification_reminder_2_sent" },
      { day: 4, field: "verification_reminder_4_sent" },
      { day: 6, field: "verification_reminder_6_sent" },
      { day: 8, field: "verification_reminder_8_sent" },
    ] as const;

    const groups: Record<string, { doc: any; a: any; deadline: Date }[]> = {};
    for (const r of reminderDays) groups[r.field] = [];
    groups["verification_reminder_10_sent"] = [];

    for (const doc of candidates) {
      const a = doc.data() as any;
      if (!a.verification_invite_sent_at || !a.verification_deadline_date) continue;
      results.checked++;

      const invitedAt = new Date(a.verification_invite_sent_at);
      const deadline = new Date(a.verification_deadline_date);
      const daysSince = daysBetween(invitedAt, now);
      const isDeadlineDay = daysBetween(now, deadline) === 0;

      let matched = false;
      for (const r of reminderDays) {
        if (daysSince === r.day && !a[r.field]) {
          groups[r.field].push({ doc, a, deadline });
          matched = true;
          break;
        }
      }
      if (!matched && isDeadlineDay && !a.verification_reminder_10_sent) {
        groups["verification_reminder_10_sent"].push({ doc, a, deadline });
      }
    }

    async function sendGroup(group: { doc: any; a: any; deadline: Date }[], templateId: string, includeDaysRemaining: boolean, flagField: string) {
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
        results.errors.push(`${templateId} (${flagField}): ${error}`);
        return;
      }

      await d1BatchUpdate(
        group.map(({ doc }) => ({ table: "applicants", id: doc.id, fields: { [flagField]: true } }))
      );
      results.sent += group.length;
    }

    for (const r of reminderDays) {
      await sendGroup(groups[r.field], "verification_reminder", true, r.field);
    }
    await sendGroup(groups["verification_reminder_10_sent"], "verification_reminder_final", false, "verification_reminder_10_sent");

    await d1LogCronRun("verification-reminder-batch", results);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("verification-reminder-batch failed:", err);
    return NextResponse.json({ error: err.message || "Failed to run verification reminder batch." }, { status: 500 });
  }
}
