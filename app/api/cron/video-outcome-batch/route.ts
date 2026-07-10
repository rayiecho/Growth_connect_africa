import { NextRequest, NextResponse } from "next/server";
import { firestoreQueryOrdered, firestoreUpdate } from "@/lib/firebase/rest-admin";
import { sendEmail } from "@/lib/engine/ses";
import { videoApprovedEmail, videoRejectedEmail } from "@/lib/engine/emailTemplates";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const docPath = (collection: string, id: string) =>
  `projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${id}`;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const results = { approvedSent: 0, rejectedSent: 0, errors: [] as string[] };

  for (const status of ["approved", "rejected"] as const) {
    const due = await firestoreQueryOrdered(
      "video_submissions",
      [
        { field: "review_status", op: "EQUAL", value: status },
        { field: "outcome_sent_at", op: "EQUAL", value: null },
        { field: "outcome_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ],
      "outcome_release_date",
      "ASCENDING",
      100
    );

    for (const doc of due) {
      const sub = doc.data() as any;
      try {
        const { subject, html } =
          status === "approved"
            ? videoApprovedEmail(sub.applicant_first_name ?? "there", sub.whatsapp_link ?? null)
            : videoRejectedEmail(sub.applicant_first_name ?? "there");

        await sendEmail({ to: sub.applicant_email, subject, html });
        await firestoreUpdate(doc.ref.name, { outcome_sent_at: new Date().toISOString() });

        if (sub.applicant_id) {
          await firestoreUpdate(docPath("applicants", sub.applicant_id), {
            current_stage: status === "approved" ? "Video Pitch Approved" : "Video Pitch Rejected",
          });
        }

        if (status === "approved") results.approvedSent++;
        else results.rejectedSent++;
      } catch (err: any) {
        results.errors.push(`${sub.applicant_email}: ${err.message}`);
      }
    }
  }

  return NextResponse.json(results);
}

