import { NextRequest, NextResponse } from "next/server";
import { d1Query, d1BatchUpdate, d1LogCronRun } from "@/lib/db/d1-admin";
import { sendBulkEmail } from "@/lib/engine/email";
import { getRawEmailTemplateForBulk } from "@/lib/engine/templateStore";
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
    const leads = await d1Query("platform_users", [{ field: "is_applicant", op: "EQUAL", value: false }]);
    const due: { doc: any; user: any }[] = [];
    for (const doc of leads) {
      const user = doc.data() as any;
      results.checked++;
      if (!user.email) continue;
      const lastSent = user.last_followup_sent_at ? new Date(user.last_followup_sent_at) : null;
      const uploadedAt = user.uploaded_at ? new Date(user.uploaded_at) : now;
      const baseline = lastSent || uploadedAt;
      const daysSinceBaseline = Math.floor((now.getTime() - baseline.getTime()) / 86400000);
      const requiredGap = lastSent ? 5 : 1;
      if (daysSinceBaseline < requiredGap) continue;
      due.push({ doc, user });
    }
    if (due.length === 0) {
      await d1LogCronRun("non-applicant-followup", results);
      return NextResponse.json(results);
    }
    const { subject, html } = await getRawEmailTemplateForBulk("non_applicant_followup");
    const recipients = due.map(({ user }) => ({
      email: user.email,
      fields: { first_name: user.first_name || "there", email: encodeURIComponent(user.email) },
    }));
    const { error } = await sendBulkEmail({ recipients, subject, html });
    if (error) {
      results.errors.push(error || "Unknown error");
      await d1LogCronRun("non-applicant-followup", results);
      return NextResponse.json(results);
    }
    await d1BatchUpdate(
      due.map(({ doc }) => ({
        table: "platform_users",
        id: doc.id,
        fields: { last_followup_sent_at: now.toISOString() },
      }))
    );
    results.sent = due.length;
    await d1LogCronRun("non-applicant-followup", results);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("non-applicant-followup failed:", err);
    return NextResponse.json({ error: err.message || "Failed to run non-applicant followup." }, { status: 500 });
  }
}
