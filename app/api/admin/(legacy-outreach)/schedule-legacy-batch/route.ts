import { NextResponse } from "next/server";
import { d1Add, d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { computeCohort } from "@/lib/engine/dates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { emails, template, scheduledDate, stage } = await req.json();
  if (!Array.isArray(emails) || !template || !scheduledDate || !stage) {
    return NextResponse.json({ error: "emails, template, scheduledDate, and stage are required." }, { status: 400 });
  }
  const now = new Date();
  const results = { created: 0, tagged: 0, errors: [] as string[] };
  for (const rawEmail of emails) {
    const email = rawEmail.trim().toLowerCase();
    try {
      const existing = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
      if (existing.length > 0) {
        await d1UpdateById("applicants", existing[0].id, {
          pending_legacy_email: template,
          legacy_email_scheduled_date: scheduledDate,
          legacy_email_sent_at: null,
        });
        results.tagged++;
      } else {
        await d1Add("applicants", {
          first_name: "Founder",
          last_name: "",
          email,
          current_stage: stage,
          current_status: "Active",
          cohort: computeCohort(now),
          lpx_id: null,
          program_completed: false,
          trial_number: 1,
          cleared_for_reapply: false,
          imported_legacy: true,
          pending_legacy_email: template,
          legacy_email_scheduled_date: scheduledDate,
          legacy_email_sent_at: null,
        });
        results.created++;
      }
    } catch (err: any) {
      results.errors.push(`${email}: ${err.message}`);
    }
  }
  return NextResponse.json(results);
});
