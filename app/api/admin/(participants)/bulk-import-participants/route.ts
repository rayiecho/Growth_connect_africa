import { NextResponse } from "next/server";
import { d1Add, d1Query } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { computeCohort } from "@/lib/engine/dates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const PEOPLE: { email: string; completedAt: string }[] = [
  { email: "brightmgbelele556@gmail.com", completedAt: "2026-06-22" },
  { email: "seyiofgod1@gmail.com", completedAt: "2026-06-22" },
  { email: "adesholaadegoke72@gmail.com", completedAt: "2026-06-21" },
  { email: "asokunade@gmail.com", completedAt: "2026-06-21" },
  { email: "gboladedeborah@gmail.com", completedAt: "2026-06-14" },
  { email: "adamsnyore@gmail.com", completedAt: "2026-06-13" },
];

function generateLpxId(): string {
  const randomBits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `LPX-${randomBits}`;
}

export const POST = withAdminAuth(async (req, session) => {
  const now = new Date();
  const results = { created: 0, emailed: 0, skippedExisting: 0, errors: [] as string[] };
  for (const person of PEOPLE) {
    const email = person.email.trim().toLowerCase();
    try {
      const existing = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
      if (existing.length > 0) {
        results.skippedExisting++;
        continue;
      }
      const completedDate = new Date(person.completedAt);
      const lpxId = generateLpxId();
      await d1Add("applicants", {
        first_name: "Founder",
        last_name: "",
        email,
        phone: "",
        current_stage: "Program Participant",
        current_status: "Active",
        cohort: computeCohort(completedDate),
        date_applied: completedDate.toISOString(),
        submitted_at: completedDate.toISOString(),
        video_submitted_at: completedDate.toISOString(),
        verification_submitted_at: completedDate.toISOString(),
        verified_at: now.toISOString(),
        lpx_id: lpxId,
        lpx_id_generated_at: now.toISOString(),
        program_completed: false,
        trial_number: 1,
        cleared_for_reapply: false,
        imported_legacy: true,
      });
      results.created++;
      const { subject, html } = await renderEmailTemplate("legacy_participant_welcome", {
        first_name: "Founder",
        lpx_id: lpxId,
        email: encodeURIComponent(email),
      });
      const { error: sendError } = await sendEmail({ to: email, subject, html });
      if (!sendError) results.emailed++;
      else results.errors.push(`${email} (email): ${sendError}`);
    } catch (err: any) {
      results.errors.push(`${email}: ${err.message}`);
    }
  }
  return NextResponse.json(results);
});
