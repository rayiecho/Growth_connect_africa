import { NextResponse } from "next/server";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  try {
    const matches = await d1Query("applicants", [{ field: "pending_legacy_email", op: "EQUAL", value: "legacy_welcome_accepted" }]);
    let promoted = 0;
    for (const doc of matches) {
      const data = doc.data() as any;
      if (data.legacy_email_sent_at) {
        await d1UpdateById("applicants", doc.id, {
          current_stage: "Program Participant",
          current_status: "Active",
        });
        promoted++;
      }
    }
    return NextResponse.json({ success: true, promoted, totalChecked: matches.length });
  } catch (err) {
    console.error("promote-to-participants failed:", err);
    return NextResponse.json({ error: "Failed to promote participants." }, { status: 500 });
  }
});
