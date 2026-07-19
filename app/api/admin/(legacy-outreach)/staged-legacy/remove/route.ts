import { NextResponse } from "next/server";
import { d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { applicantId } = await req.json();
  if (!applicantId) return NextResponse.json({ error: "applicantId is required." }, { status: 400 });
  try {
    await d1UpdateById("applicants", applicantId, {
      pending_legacy_email: null,
      legacy_email_scheduled_date: null,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("staged-legacy/remove failed:", err);
    return NextResponse.json({ error: "Failed to remove from staged batch." }, { status: 500 });
  }
});
