import { NextRequest, NextResponse } from "next/server";
import { d1QueryOrdered, d1BatchUpdate, d1LogCronRun } from "@/lib/db/d1-admin";
import { sendBulkEmail } from "@/lib/engine/email";
import { getRawEmailTemplateForBulk } from "@/lib/engine/templateStore";
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
  try {
    for (const status of ["Approved", "Rejected"] as const) {
      const due = await d1QueryOrdered(
        "verifications",
        [
          { field: "review_status", op: "EQUAL", value: status },
          { field: "outcome_sent_at", op: "EQUAL", value: null },
          { field: "outcome_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
        ],
        "outcome_release_date",
        "ASCENDING",
        500
      );
      if (due.length === 0) continue;
      const templateId = status === "Approved" ? "verification_approved" : "verification_rejected";
      const { subject, html } = await getRawEmailTemplateForBulk(templateId);
      const recipients = due.map((doc) => {
        const v = doc.data() as any;
        return { email: v.email, fields: { first_name: v.applicant_first_name || "there", email: encodeURIComponent(v.email) } };
      });
      const { error } = await sendBulkEmail({ recipients, subject, html });
      if (error) {
        results.errors.push(`${status} batch: ${error}`);
        continue;
      }
      const writes: { table: string; id: string; fields: Record<string, any> }[] = [];
      for (const doc of due) {
        const v = doc.data() as any;
        writes.push({ table: "verifications", id: doc.id, fields: { outcome_sent_at: now.toISOString() } });
        if (v.applicant_id) {
          writes.push({
            table: "applicants",
            id: v.applicant_id,
            fields:
              status === "Approved"
                ? { current_stage: "Program Participant", current_status: "Active", verified_at: now.toISOString() }
                : { current_stage: "Verification Rejected" },
          });
        }
      }
      await d1BatchUpdate(writes);
      if (status === "Approved") results.approvedSent = due.length;
      else results.rejectedSent = due.length;
    }
    await d1LogCronRun("verification-outcome-batch", results);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("verification-outcome-batch failed:", err);
    return NextResponse.json({ error: err.message || "Failed to run verification outcome batch." }, { status: 500 });
  }
}
