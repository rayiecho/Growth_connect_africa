import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreUpdateById } from "@/lib/firebase/rest-admin";

export async function POST(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, assigned_reviewer, notes, next_action_required } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    await firestoreUpdateById("applicants", id, {
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
}
