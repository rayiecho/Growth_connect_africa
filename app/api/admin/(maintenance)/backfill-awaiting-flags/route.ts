import { NextResponse } from "next/server";
import { d1GetAll, d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1GetAll("applicants");
    let videoFlagged = 0;
    let verificationFlagged = 0;
    for (const doc of docs) {
      const a = doc.data() as any;
      const updates: Record<string, any> = {};
      const shouldAwaitVideo = !!a.video_invite_sent_at && !a.video_submitted_at;
      const currentlyAwaitingVideo = !!a.awaiting_video_submission;
      if (shouldAwaitVideo && !currentlyAwaitingVideo) {
        updates.awaiting_video_submission = true;
        videoFlagged++;
      } else if (!shouldAwaitVideo && currentlyAwaitingVideo) {
        updates.awaiting_video_submission = false;
      }
      const shouldAwaitVerification = !!a.verification_invite_sent_at && !a.verification_submitted_at;
      const currentlyAwaitingVerification = !!a.awaiting_verification_submission;
      if (shouldAwaitVerification && !currentlyAwaitingVerification) {
        updates.awaiting_verification_submission = true;
        verificationFlagged++;
      } else if (!shouldAwaitVerification && currentlyAwaitingVerification) {
        updates.awaiting_verification_submission = false;
      }
      if (Object.keys(updates).length > 0) {
        await d1UpdateById("applicants", doc.id, updates);
      }
    }
    return NextResponse.json({ success: true, videoFlagged, verificationFlagged, totalChecked: docs.length });
  } catch (err) {
    console.error("backfill-awaiting-flags failed:", err);
    return NextResponse.json({ error: "Failed to backfill flags." }, { status: 500 });
  }
});
