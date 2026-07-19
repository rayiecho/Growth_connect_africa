import { NextRequest, NextResponse } from "next/server";
import { d1QueryOrdered, d1BatchUpdate, d1LogCronRun } from "@/lib/db/d1-admin";
import { sendBulkEmail } from "@/lib/engine/email";
import { getRawEmailTemplateForBulk } from "@/lib/engine/templateStore";
import { addCalendarDays, formatDeadline } from "@/lib/engine/dates";
import { timingSafeEqual } from "@/lib/engine/timingSafeEqual";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  if (!secret || !expected || !(await timingSafeEqual(secret, expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const results = { sent: 0, errors: [] as string[] };
  try {
    const due = await d1QueryOrdered(
      "applicants",
      [
        { field: "video_invite_sent_at", op: "EQUAL", value: null },
        { field: "video_invite_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ],
      "video_invite_release_date",
      "ASCENDING",
      500
    );
    if (due.length === 0) {
      await d1LogCronRun("video-invite-batch", results);
      return NextResponse.json(results);
    }
    const deadline = addCalendarDays(now, 5);
    const deadlineStr = deadline.toISOString().slice(0, 10);
    const deadlineFormatted = formatDeadline(deadline);
    const { subject, html } = await getRawEmailTemplateForBulk("video_invite");
    const recipients = due.map((doc) => {
      const a = doc.data() as any;
      return {
        email: a.email,
        fields: {
          first_name: a.first_name || "there",
          deadline_date: deadlineFormatted,
          email: encodeURIComponent(a.email),
        },
      };
    });
    const { error } = await sendBulkEmail({ recipients, subject, html });
    if (error) {
      results.errors.push(error || "Unknown error");
      await d1LogCronRun("video-invite-batch", results);
      return NextResponse.json(results);
    }
    await d1BatchUpdate(
      due.map((doc) => ({
        table: "applicants",
        id: doc.id,
        fields: {
          video_invite_sent_at: now.toISOString(),
          video_deadline_date: deadlineStr,
          current_stage: "Video Pitch Stage",
          awaiting_video_submission: true,
        },
      }))
    );
    results.sent = due.length;
    await d1LogCronRun("video-invite-batch", results);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("video-invite-batch failed:", err);
    return NextResponse.json({ error: err.message || "Failed to run video invite batch." }, { status: 500 });
  }
}
