import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId } = await req.json();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
  }

  try {
    await adminDb.collection("video_submissions").doc(submissionId).update({
      review_status: "approved",
      approved_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update submission." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Video approved. Verification email will be sent automatically after the review window.",
  });
}
