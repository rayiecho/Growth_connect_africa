import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/engine/supabaseAdmin";

// POST /api/cron/video/rejected?secret=...
// Marks video as rejected + sets rejected_at timestamp.
// The 10-day wait + training email are handled by run-review-batch (Fri cron).
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId } = await req.json();

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
  }

  const { data: sub, error } = await supabaseAdmin
    .from("video_submissions")
    .update({
      review_status: "rejected",
      rejected_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select("id")
    .single();

  if (error || !sub) {
    return NextResponse.json(
      { error: "Failed to update submission." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Video rejected. Training program email will be sent automatically after the 10-day review window.",
  });
}
