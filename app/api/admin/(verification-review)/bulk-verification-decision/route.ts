import { NextResponse } from "next/server";
import { d1BatchUpdate } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { ids, status } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0 || !["Approved", "Rejected"].includes(status)) {
    return NextResponse.json({ error: "ids array and a valid status are required." }, { status: 400 });
  }
  const now = new Date().toISOString();
  try {
    await d1BatchUpdate(
      ids.map((id: string) => ({
        table: "verifications",
        id,
        fields: { review_status: status, decision_at: now },
      }))
    );
    return NextResponse.json({ success: true, updated: ids.length, errors: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, updated: 0, errors: [err.message] });
  }
});
