import { NextResponse } from "next/server";
import { d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { collection, id } = await req.json();
  if (!collection || !id || !["contact_messages", "sos_reports"].includes(collection)) {
    return NextResponse.json({ error: "collection (contact_messages|sos_reports) and id are required." }, { status: 400 });
  }
  try {
    await d1UpdateById(collection, id, {
      status: "resolved",
      resolved_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("mark-resolved failed:", err);
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 });
  }
});
