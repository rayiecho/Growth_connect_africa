import { NextResponse } from "next/server";
import { d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const ALLOWED_TARGETS: Record<string, string[]> = {
  applicants: ["video_invite_release_date", "verification_deadline_date"],
  video_submissions: ["outcome_release_date"],
  verifications: ["outcome_release_date"],
};

export const POST = withAdminAuth(async (req, session) => {
  const { collection, id, field } = await req.json();
  if (!collection || !id || !field) {
    return NextResponse.json({ error: "collection, id, and field are required." }, { status: 400 });
  }
  if (!ALLOWED_TARGETS[collection]?.includes(field)) {
    return NextResponse.json({ error: "collection/field combination is not allowed.", validTargets: ALLOWED_TARGETS }, { status: 400 });
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  await d1UpdateById(collection, id, { [field]: todayStr });
  return NextResponse.json({ success: true, collection, id, field, value: todayStr });
});
