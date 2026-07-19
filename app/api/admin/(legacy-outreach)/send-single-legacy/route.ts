import { NextResponse } from "next/server";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: cleanEmail }]);
  if (matches.length === 0) return NextResponse.json({ error: "No applicant found." }, { status: 404 });
  const doc = matches[0];
  const applicant = doc.data() as any;
  if (!applicant.pending_legacy_email) {
    return NextResponse.json({ error: "This applicant has no pending legacy email tagged." }, { status: 400 });
  }
  const { subject, html } = await renderEmailTemplate(applicant.pending_legacy_email, {
    first_name: applicant.first_name || "Founder",
    lpx_id: applicant.lpx_id || "",
    email: encodeURIComponent(cleanEmail),
  });
  const { error } = await sendEmail({ to: cleanEmail, subject, html });
  if (error) return NextResponse.json({ error }, { status: 500 });
  await d1UpdateById("applicants", doc.id, { legacy_email_sent_at: new Date().toISOString() });
  return NextResponse.json({ success: true, sentTo: cleanEmail, template: applicant.pending_legacy_email });
});
