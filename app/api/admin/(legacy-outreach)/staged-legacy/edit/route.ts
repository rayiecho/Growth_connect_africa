import { NextResponse } from "next/server";
import { d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { applicantId, template, scheduledDate } = await req.json();
  if (!applicantId) return NextResponse.json({ error: "applicantId is required." }, { status: 400 });
  const updates: Record<string, any> = {};
  if (template) updates.pending_legacy_email = template;
  if (scheduledDate) updates.legacy_email_scheduled_date = scheduledDate;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  try {
    await d1UpdateById("applicants", applicantId, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("staged-legacy/edit failed:", err);
    return NextResponse.json({ error: "Failed to update staged batch entry." }, { status: 500 });
  }
});
