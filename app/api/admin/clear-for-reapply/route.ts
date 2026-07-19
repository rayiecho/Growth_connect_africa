import { NextResponse } from "next/server";
import { d1UpdateById, d1GetById, d1Query, d1Add } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { applicantId } = await req.json();
  if (!applicantId) {
    return NextResponse.json({ error: "applicantId is required." }, { status: 400 });
  }
  try {
    const doc = await d1GetById("applicants", applicantId);
    if (!doc) {
      return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
    }
    const data = doc.data() as any;
    const now = new Date().toISOString();
    const trialRecord = {
      trial_number: data.trial_number || 1,
      current_stage: data.current_stage || null,
      current_status: data.current_status || null,
      submitted_at: data.submitted_at || null,
      video_submitted_at: data.video_submitted_at || null,
      verification_submitted_at: data.verification_submitted_at || null,
      cleared_at: now,
    };
    let existingHistory: any[] = [];
    if (data.trial_history) {
      try {
        const parsed = typeof data.trial_history === "string" ? JSON.parse(data.trial_history) : data.trial_history;
        existingHistory = Array.isArray(parsed) ? parsed : [];
      } catch {
        existingHistory = [];
      }
    }
    await d1UpdateById("applicants", applicantId, {
      trial_history: [...existingHistory, trialRecord],
      cleared_for_reapply: true,
    });
    const existingUser = await d1Query("platform_users", [{ field: "email", op: "EQUAL", value: data.email }]);
    if (existingUser.length === 0) {
      await d1Add("platform_users", {
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email,
        phone: data.phone ?? "",
        source: "cleared_applicant",
        is_applicant: false,
        linked_applicant_id: applicantId,
        uploaded_at: now,
      });
    } else {
      await d1UpdateById("platform_users", existingUser[0].id, {
        is_applicant: false,
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("clear-for-reapply failed:", err);
    return NextResponse.json({ error: "Failed to clear applicant for reapply." }, { status: 500 });
  }
});
