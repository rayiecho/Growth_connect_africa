import { NextResponse } from "next/server";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const CONFIGS: Record<string, { collection: string; lookupField: string; targetField: string }> = {
  applicant_video_invite: { collection: "applicants", lookupField: "email", targetField: "video_invite_release_date" },
  applicant_verification_deadline: { collection: "applicants", lookupField: "email", targetField: "verification_deadline_date" },
  video_submission_outcome: { collection: "video_submissions", lookupField: "applicant_email", targetField: "outcome_release_date" },
  verification_outcome: { collection: "verifications", lookupField: "email", targetField: "outcome_release_date" },
};

export const POST = withAdminAuth(async (req, session) => {
  const { email, target } = await req.json();
  const config = CONFIGS[target];
  if (!email || !config) {
    return NextResponse.json({ error: "email and a valid target are required.", validTargets: Object.keys(CONFIGS) }, { status: 400 });
  }
  const matches = await d1Query(config.collection, [{ field: config.lookupField, op: "EQUAL", value: email.trim().toLowerCase() }]);
  if (matches.length === 0) {
    return NextResponse.json({ error: `No ${config.collection} record found for that email.` }, { status: 404 });
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  await d1UpdateById(config.collection, matches[0].id, { [config.targetField]: todayStr });
  return NextResponse.json({ success: true, id: matches[0].id, collection: config.collection, field: config.targetField, value: todayStr });
});
