import { NextRequest, NextResponse } from "next/server";
import { firestoreUpdate } from "@/lib/firebase/rest-admin";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const docPath = (collection: string, id: string) =>
  `projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${id}`;

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { submissionId } = await req.json();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
  }
  await firestoreUpdate(docPath("video_submissions", submissionId), {
    review_status: "approved",
    decision_at: new Date().toISOString(),
  });
  return NextResponse.json({
    success: true,
    message: "Video approved. Outcome email will be sent on the scheduled release date.",
  });
}
