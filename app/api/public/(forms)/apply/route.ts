import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Add, d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { firestoreQuery, firestoreDeleteById } from "@/lib/firebase/firestore-rest";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { nextReviewWindow, computeCohort } from "@/lib/engine/dates";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email || "").trim().toLowerCase();
  const now = new Date();
  let applicantIdForResponse: string | null = null;

  const cfContext = await getCloudflareContext();
  const kv = (cfContext?.env as any)?.TOKEN_CACHE;
  const ip = req.headers.get("cf-connecting-ip") || "unknown";
  const limit = await checkRateLimit(kv, `apply:${ip}`, 10, 3600);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const releaseDate = nextReviewWindow(now);
  const existing = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);

  const freshFields: Record<string, any> = {
    first_name: body.first_name,
    last_name: body.last_name,
    email,
    email_verified: false,
    phone: body.phone,
    country: body.country,
    state_province: body.state_province,
    business_name: body.business_name,
    business_category: body.business_category,
    business_stage: body.business_stage,
    business_description: body.business_description,
    goal_question: body.goal_question,
    commitment_question: body.commitment_question,
    commitment_confirmed: true,
    submitted_at: now.toISOString(),
    date_applied: now.toISOString(),
    current_stage: "Application Submitted",
    current_status: "Active",
    cohort: computeCohort(now),
    video_invite_release_date: releaseDate.toISOString().slice(0, 10),
    video_invite_sent_at: null,
    video_deadline_date: null,
    video_submitted_at: null,
    video_reminder_2_sent: false,
    video_reminder_4_sent: false,
    video_reminder_deadline_sent: false,
    awaiting_video_submission: false,
    verification_invite_sent_at: null,
    verification_deadline_date: null,
    verification_submitted_at: null,
    verification_reminder_2_sent: false,
    verification_reminder_4_sent: false,
    verification_reminder_6_sent: false,
    verification_reminder_8_sent: false,
    verification_reminder_10_sent: false,
    awaiting_verification_submission: false,
    lpx_id: null,
    lpx_id_generated_at: null,
    program_completed: false,
    program_completed_at: null,
    certificate_code: null,
  };

  if (existing.length > 0) {
    const existingDoc = existing[0];
    const existingData = existingDoc.data() as any;
    if (!existingData.cleared_for_reapply) {
      return NextResponse.json(
        { error: "An application has already been submitted with this email address." },
        { status: 409 }
      );
    }
    await d1UpdateById("applicants", existingDoc.id, {
      ...freshFields,
      trial_number: (existingData.trial_number || 1) + 1,
      cleared_for_reapply: false,
    });
    applicantIdForResponse = existingDoc.id;
  } else {
    const { id } = await d1Add("applicants", {
      ...freshFields,
      trial_number: 1,
      cleared_for_reapply: false,
    });
    applicantIdForResponse = id;
  }

  try {
    const leadEntry = await firestoreQuery("platform_users", [{ field: "email", op: "EQUAL", value: email }]);
    if (leadEntry.length > 0) {
      await firestoreDeleteById("platform_users", leadEntry[0].id);
    }
  } catch (err) {
    console.error("apply route: non-applicant lead cleanup skipped (non-critical):", err);
  }

  try {
    const { subject, html } = await renderEmailTemplate("application_received", { first_name: body.first_name ?? "there", email: encodeURIComponent(email) });
    await sendEmail({ to: email, subject, html });
  } catch (emailErr) {
    console.error("apply route: confirmation email failed (non-critical):", emailErr);
  }

  return NextResponse.json({ success: true, id: applicantIdForResponse });
}
