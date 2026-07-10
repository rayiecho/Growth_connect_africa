import { NextRequest, NextResponse } from "next/server";
import { firestoreQueryOrdered, firestoreUpdate, firestoreAdd } from "@/lib/firebase/rest-admin";
import { sendEmail } from "@/lib/engine/ses";
import { videoInviteEmail } from "@/lib/engine/emailTemplates";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const results = { sent: 0, errors: [] as string[] };

  const due = await firestoreQueryOrdered(
    "applicants",
    [
      { field: "video_invite_sent_at", op: "EQUAL", value: null },
      { field: "video_invite_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
    ],
    "video_invite_release_date",
    "ASCENDING",
    100
  );

  for (const doc of due) {
    const applicant = doc.data() as any;
    try {
      const { subject, html } = videoInviteEmail(applicant.first_name ?? "there");
      await sendEmail({ to: applicant.email, subject, html });
      await firestoreUpdate(doc.ref.name, {
        video_invite_sent_at: new Date().toISOString(),
        current_stage: "Video Pitch Stage",
      });
      results.sent++;
    } catch (err: any) {
      results.errors.push(`${applicant.email}: ${err.message}`);
    }
  }

  return NextResponse.json(results);
}
