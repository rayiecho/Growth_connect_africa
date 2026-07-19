import { NextResponse } from "next/server";
import { d1GetAll, d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1GetAll("additional_details_submissions");
    const submissions = docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const unreconciled = submissions.filter((s) => !s.reconciled);
    let updated = 0;
    const errors: string[] = [];
    for (const sub of unreconciled) {
      try {
        const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: sub.email }]);
        if (matches.length > 0) {
          const updateFields: Record<string, any> = {};
          if (sub.first_name?.trim()) updateFields.first_name = sub.first_name.trim();
          if (sub.last_name?.trim()) updateFields.last_name = sub.last_name.trim();
          if (sub.phone?.trim()) updateFields.phone = sub.phone.trim();
          if (sub.business_name?.trim()) updateFields.business_name = sub.business_name.trim();
          if (sub.business_stage?.trim()) updateFields.business_stage = sub.business_stage.trim();
          if (sub.industry?.trim()) updateFields.industry = sub.industry.trim();
          if (sub.business_description?.trim()) updateFields.business_description = sub.business_description.trim();
          if (sub.linkedin?.trim()) updateFields.linkedin = sub.linkedin.trim();
          if (Object.keys(updateFields).length > 0) {
            await d1UpdateById("applicants", matches[0].id, updateFields);
            updated++;
          }
        }
        await d1UpdateById("additional_details_submissions", sub.id, { reconciled: true });
      } catch (err: any) {
        errors.push(`${sub.email}: ${err.message}`);
      }
    }
    return NextResponse.json({ success: true, checked: unreconciled.length, updated, errors });
  } catch (err) {
    console.error("reconcile-details failed:", err);
    return NextResponse.json({ error: "Failed to reconcile details." }, { status: 500 });
  }
});
