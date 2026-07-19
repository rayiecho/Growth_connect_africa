import { NextResponse } from "next/server";
import { d1Query, d1Delete } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { applicantId } = await req.json();
  if (!applicantId) {
    return NextResponse.json({ error: "applicantId is required." }, { status: 400 });
  }
  try {
    const videoSubs = await d1Query("video_submissions", [{ field: "applicant_id", op: "EQUAL", value: applicantId }]);
    for (const sub of videoSubs) {
      await d1Delete("video_submissions", sub.id);
    }
    const verifications = await d1Query("verifications", [{ field: "applicant_id", op: "EQUAL", value: applicantId }]);
    for (const v of verifications) {
      await d1Delete("verifications", v.id);
    }
    await d1Delete("applicants", applicantId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete-applicant failed:", err);
    return NextResponse.json({ error: "Failed to delete applicant." }, { status: 500 });
  }
});
