import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreUpdateById } from "@/lib/firebase/rest-admin";

export async function POST(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action, feedback, whatsapp_link } = await req.json();
  if (!id || !["approve", "reject", "action_required"].includes(action)) {
    return NextResponse.json({ error: "id and a valid action are required." }, { status: 400 });
  }

  try {
    if (action === "approve") {
      if (!whatsapp_link?.trim()) {
        return NextResponse.json(
          { error: "A WhatsApp group link is required to approve this batch." },
          { status: 400 }
        );
      }
      await firestoreUpdateById("video_submissions", id, {
        review_status: "approved",
        approved_at: new Date().toISOString(),
        whatsapp_link: whatsapp_link.trim(),
      });
    } else if (action === "reject") {
      await firestoreUpdateById("video_submissions", id, {
        review_status: "rejected",
        rejected_at: new Date().toISOString(),
      });
    } else if (action === "action_required") {
      if (!feedback?.trim()) {
        return NextResponse.json({ error: "feedback is required for this action." }, { status: 400 });
      }
      await firestoreUpdateById("video_submissions", id, {
        review_status: "action_required",
        feedback: feedback.trim(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("video-submissions update failed:", err);
    return NextResponse.json({ error: "Failed to update submission." }, { status: 500 });
  }
}
