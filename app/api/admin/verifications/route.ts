import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreUpdateById } from "@/lib/firebase/rest-admin";

export async function POST(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, applicant_id, status } = await req.json();
  if (!id || !["Approved", "Rejected"].includes(status)) {
    return NextResponse.json({ error: "id and a valid status are required." }, { status: 400 });
  }

  try {
    await firestoreUpdateById("verifications", id, {
      review_status: status,
      decision_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Decision recorded. Outcome email will be sent on the scheduled release date.",
    });
  } catch (err) {
    console.error("verifications update failed:", err);
    return NextResponse.json({ error: "Failed to update verification." }, { status: 500 });
  }
}
