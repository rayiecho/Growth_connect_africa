import { NextResponse } from "next/server";
import { d1Query } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const GET = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1Query("platform_users", [{ field: "is_applicant", op: "EQUAL", value: false }]);
    const leads = docs.map((d) => ({ id: d.id, ...d.data() })).filter((u: any) => u.batch_id) as any[];
    const batchesMap: Record<string, any> = {};
    for (const u of leads) {
      if (!batchesMap[u.batch_id]) {
        batchesMap[u.batch_id] = {
          batchId: u.batch_id,
          uploadedAt: u.batch_id,
          people: [],
        };
      }
      const baseline = u.last_followup_sent_at ? new Date(u.last_followup_sent_at) : new Date(u.uploaded_at);
      const gap = u.last_followup_sent_at ? 5 : 1;
      const nextFollowUp = addDays(baseline, gap);
      batchesMap[u.batch_id].people.push({
        id: u.id,
        name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unnamed",
        email: u.email,
        followUpsSent: u.last_followup_sent_at ? 1 : 0,
        nextFollowUpDate: nextFollowUp.toISOString().slice(0, 10),
        template: "non_applicant_followup",
      });
    }
    const batches = Object.values(batchesMap).sort((a: any, b: any) => b.uploadedAt.localeCompare(a.uploadedAt));
    return NextResponse.json({ batches });
  } catch (err) {
    console.error("followup-batches fetch failed:", err);
    return NextResponse.json({ error: "Failed to load follow-up batches." }, { status: 500 });
  }
});
