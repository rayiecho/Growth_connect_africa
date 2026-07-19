import { NextRequest, NextResponse } from "next/server";
import { d1QueryOrdered, d1BatchUpdate, d1GetBatchLink, d1LogCronRun } from "@/lib/db/d1-admin";
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
  const results = { approvedSent: 0, rejectedSent: 0, errors: [] as string[] };
  const verificationDeadline = addCalendarDays(now, 10);
  const verificationDeadlineStr = verificationDeadline.toISOString().slice(0, 10);
  const verificationDeadlineFormatted = formatDeadline(verificationDeadline);

  try {
    const rejectedDue = await d1QueryOrdered(
      "video_submissions",
      [
        { field: "review_status", op: "EQUAL", value: "rejected" },
        { field: "outcome_sent_at", op: "EQUAL", value: null },
        { field: "outcome_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ],
      "outcome_release_date",
      "ASCENDING",
      500
    );

    if (rejectedDue.length > 0) {
      const { subject, html } = await getRawEmailTemplateForBulk("video_rejected");
      const recipients = rejectedDue.map((doc) => {
        const sub = doc.data() as any;
        return { email: sub.applicant_email, fields: { first_name: sub.applicant_first_name || "there", email: encodeURIComponent(sub.applicant_email) } };
      });
      const { error } = await sendBulkEmail({ recipients, subject, html });
      if (error) {
        results.errors.push(`rejected batch: ${error}`);
      } else {
        const writes: { table: string; id: string; fields: Record<string, any> }[] = [];
        for (const doc of rejectedDue) {
          const sub = doc.data() as any;
          writes.push({ table: "video_submissions", id: doc.id, fields: { outcome_sent_at: now.toISOString() } });
          if (sub.applicant_id) {
            writes.push({ table: "applicants", id: sub.applicant_id, fields: { current_stage: "Video Pitch Rejected" } });
          }
        }
        await d1BatchUpdate(writes);
        results.rejectedSent = rejectedDue.length;
      }
    }

    const approvedDue = await d1QueryOrdered(
      "video_submissions",
      [
        { field: "review_status", op: "EQUAL", value: "approved" },
        { field: "outcome_sent_at", op: "EQUAL", value: null },
        { field: "outcome_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ],
      "outcome_release_date",
      "ASCENDING",
      500
    );

    const approvedByReleaseDate: Record<string, typeof approvedDue> = {};
    for (const doc of approvedDue) {
      const sub = doc.data() as any;
      const key = sub.outcome_release_date;
      if (!approvedByReleaseDate[key]) approvedByReleaseDate[key] = [];
      approvedByReleaseDate[key].push(doc);
    }

    const { subject: approvedSubject, html: approvedHtml } = await getRawEmailTemplateForBulk("video_approved");

    for (const releaseDate in approvedByReleaseDate) {
      const docsForDate = approvedByReleaseDate[releaseDate];
      try {
        const batchLink = await d1GetBatchLink(releaseDate);
        const recipients = docsForDate.map((doc) => {
          const sub = doc.data() as any;
          return {
            email: sub.applicant_email,
            fields: {
              first_name: sub.applicant_first_name || "there",
              whatsapp_link: batchLink || "",
              deadline_date: verificationDeadlineFormatted,
              email: encodeURIComponent(sub.applicant_email),
            },
          };
        });

        const { error } = await sendBulkEmail({ recipients, subject: approvedSubject, html: approvedHtml });
        if (error) {
          results.errors.push(`approved batch (${releaseDate}): ${error}`);
          continue;
        }

        const writes: { table: string; id: string; fields: Record<string, any> }[] = [];
        for (const doc of docsForDate) {
          const sub = doc.data() as any;
          writes.push({ table: "video_submissions", id: doc.id, fields: { outcome_sent_at: now.toISOString() } });
          if (sub.applicant_id) {
            writes.push({
              table: "applicants",
              id: sub.applicant_id,
              fields: {
                current_stage: "Video Pitch Approved",
                verification_invite_sent_at: now.toISOString(),
                verification_deadline_date: verificationDeadlineStr,
                awaiting_verification_submission: true,
              },
            });
          }
        }
        await d1BatchUpdate(writes);
        results.approvedSent += docsForDate.length;
      } catch (err: any) {
        results.errors.push(`approved batch (${releaseDate}): ${err.message}`);
      }
    }

    await d1LogCronRun("video-outcome-batch", results);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("video-outcome-batch failed:", err);
    return NextResponse.json({ error: err.message || "Failed to run video outcome batch." }, { status: 500 });
  }
}
