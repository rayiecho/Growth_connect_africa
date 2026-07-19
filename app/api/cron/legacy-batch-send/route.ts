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
  const todayStr = new Date().toISOString().slice(0, 10);
  const results = { templatesSent: 0, totalSent: 0, errors: [] as string[] };
  try {
    const candidates = await d1Query("applicants", [{ field: "legacy_email_sent_at", op: "EQUAL", value: null }]);
    const dueByTemplate: Record<string, { id: string; email: string; first_name: string; lpx_id: string }[]> = {};
    for (const doc of candidates) {
      const a = doc.data() as any;
      if (!a.pending_legacy_email || !a.legacy_email_scheduled_date) continue;
      if (a.legacy_email_scheduled_date > todayStr) continue;
      if (!dueByTemplate[a.pending_legacy_email]) dueByTemplate[a.pending_legacy_email] = [];
      dueByTemplate[a.pending_legacy_email].push({
        id: doc.id,
        email: a.email,
        first_name: a.first_name || "Founder",
        lpx_id: a.lpx_id || "",
      });
    }
    for (const templateId in dueByTemplate) {
      const people = dueByTemplate[templateId];
      try {
        const { subject, html } = await getRawEmailTemplateForBulk(templateId);
        const recipients = people.map((p) => ({
          email: p.email,
          fields: {
            first_name: p.first_name,
            lpx_id: p.lpx_id,
            email: encodeURIComponent(p.email),
          },
        }));
        const { error } = await sendBulkEmail({ recipients, subject, html });
        if (error) {
          results.errors.push(`Template ${templateId}: ${error}`);
          continue;
        }
        const now = new Date().toISOString();
        await d1BatchUpdate(
          people.map((p) => ({
            table: "applicants",
            id: p.id,
            fields: { legacy_email_sent_at: now },
          }))
        );
        results.templatesSent++;
        results.totalSent += people.length;
      } catch (err: any) {
        results.errors.push(`Template ${templateId}: ${err.message}`);
      }
    }
    await d1LogCronRun("legacy-batch-send", results);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("legacy-batch-send failed:", err);
    return NextResponse.json({ error: err.message || "Failed to run legacy batch send." }, { status: 500 });
  }
}
