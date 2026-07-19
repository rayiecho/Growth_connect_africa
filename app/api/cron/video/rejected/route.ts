import { NextRequest, NextResponse } from "next/server";
import { firestoreUpdate } from "@/lib/firebase/firestore-rest";
import { timingSafeEqual } from "@/lib/engine/timingSafeEqual";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const docPath = (collection: string, id: string) =>
  `projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${id}`;

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  if (!secret || !expected || !(await timingSafeEqual(secret, expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { submissionId } = await req.json();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
  }
  await firestoreUpdate(docPath("video_submissions", submissionId), {
    review_status: "rejected",
    decision_at: new Date().toISOString(),
  });
  return NextResponse.json({
    success: true,
    message: "Video rejected. Outcome email will be sent on the scheduled release date.",
  });
}
