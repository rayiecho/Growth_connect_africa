import { NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreGetAll } from "@/lib/firebase/rest-admin";

export async function GET() {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [applicantsDocs, videoDocs, verificationsDocs] = await Promise.all([
      firestoreGetAll("applicants"),
      firestoreGetAll("video_submissions"),
      firestoreGetAll("verifications"),
    ]);

    return NextResponse.json({
      applicants: applicantsDocs.map((d) => ({ id: d.id, ...d.data() })),
      videoSubmissions: videoDocs.map((d) => ({ id: d.id, ...d.data() })),
      verifications: verificationsDocs.map((d) => ({ id: d.id, ...d.data() })),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("analytics-data failed:", err);
    return NextResponse.json({ error: "Failed to load analytics data." }, { status: 500 });
  }
}
