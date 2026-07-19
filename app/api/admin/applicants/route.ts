import { NextResponse } from "next/server";
import { d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { id, assigned_reviewer, notes, next_action_required } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    await d1UpdateById("applicants", id, {
      assigned_reviewer: assigned_reviewer ?? "",
      notes: notes ?? "",
      next_action_required: next_action_required ?? "",
      last_updated: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("applicants update failed:", err);
    return NextResponse.json({ error: "Failed to save changes." }, { status: 500 });
  }
});
