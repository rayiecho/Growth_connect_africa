import { NextResponse } from "next/server";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { email, template, scheduledDate } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !template || !scheduledDate) {
    return NextResponse.json({ error: "email, template, and scheduledDate are required." }, { status: 400 });
  }
  try {
    const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: cleanEmail }]);
    if (matches.length === 0) {
      return NextResponse.json({ error: "No applicant found with this email." }, { status: 404 });
    }
    await d1UpdateById("applicants", matches[0].id, {
      pending_legacy_email: template,
      legacy_email_scheduled_date: scheduledDate,
      legacy_email_sent_at: null,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("staged-legacy/add failed:", err);
    return NextResponse.json({ error: "Failed to add to staged batch." }, { status: 500 });
  }
});
