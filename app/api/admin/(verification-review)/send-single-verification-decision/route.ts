import { NextResponse } from "next/server";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { email, decision } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !["Approved", "Rejected"].includes(decision)) {
    return NextResponse.json({ error: "email and decision (Approved|Rejected) are required." }, { status: 400 });
  }
  const matches = await d1Query("verifications", [{ field: "email", op: "EQUAL", value: cleanEmail }]);
  if (matches.length === 0) return NextResponse.json({ error: "No verification found." }, { status: 404 });
  const doc = matches.sort((a: any, b: any) => (b.data().submitted_at || "").localeCompare(a.data().submitted_at || ""))[0];
  const data = doc.data() as any;
  const now = new Date();
  const { subject, html } = await renderEmailTemplate(
    decision === "Approved" ? "verification_approved" : "verification_rejected",
    { first_name: data.applicant_first_name ?? "there", email: encodeURIComponent(cleanEmail) }
  );
  const { error } = await sendEmail({ to: cleanEmail, subject, html });
  if (error) return NextResponse.json({ error }, { status: 500 });
  await d1UpdateById("verifications", doc.id, { outcome_sent_at: now.toISOString() });
  if (decision === "Approved" && data.applicant_id) {
    await d1UpdateById("applicants", data.applicant_id, {
      current_stage: "Program Participant",
      current_status: "Active",
      verified_at: now.toISOString(),
    });
  }
  return NextResponse.json({ success: true, sentTo: cleanEmail, decision, verificationId: doc.id });
});
