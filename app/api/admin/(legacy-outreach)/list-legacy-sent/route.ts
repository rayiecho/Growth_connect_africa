import { NextResponse } from "next/server";
import { d1Query } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  const subs = await d1Query("video_submissions", [{ field: "imported_legacy", op: "EQUAL", value: true }]);
  const sentTo = subs
    .map((s) => s.data() as any)
    .filter((d) => d.outcome_sent_at)
    .map((d) => ({ email: d.applicant_email, sent_at: d.outcome_sent_at }));
  return NextResponse.json({ count: sentTo.length, sentTo });
});
