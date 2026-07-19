import { NextResponse } from "next/server";
import { d1BatchUpdate } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { ids, action } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0 || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "ids array and a valid action are required." }, { status: 400 });
  }
  const now = new Date().toISOString();
  try {
    await d1BatchUpdate(
      ids.map((id: string) => ({
        table: "video_submissions",
        id,
        fields: {
          review_status: action === "approve" ? "approved" : "rejected",
          [action === "approve" ? "approved_at" : "rejected_at"]: now,
        },
      }))
    );
    return NextResponse.json({ success: true, updated: ids.length, errors: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, updated: 0, errors: [err.message] });
  }
});
