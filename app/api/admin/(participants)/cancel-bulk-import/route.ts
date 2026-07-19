import { NextResponse } from "next/server";
import { d1Query, d1Delete } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const subs = await d1Query("video_submissions", [{ field: "imported_legacy", op: "EQUAL", value: true }]);
  let cancelled = 0;
  for (const s of subs) {
    const data = s.data() as any;
    if (!data.outcome_sent_at) {
      await d1Delete("video_submissions", s.id);
      cancelled++;
    }
  }
  return NextResponse.json({ success: true, cancelled, totalFound: subs.length });
});
