import { NextRequest, NextResponse } from "next/server";
import { firestoreQueryOrdered, firestoreUpdate } from "@/lib/firebase/rest-admin";
import { sendEmail } from "@/lib/engine/ses";
import { verificationApprovedEmail, verificationRejectedEmail } from "@/lib/engine/emailTemplates";

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

  for (const status of ["Approved", "Rejected"] as const) {
    const due = await firestoreQueryOrdered(
      "verifications",
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
      const v = doc.data() as any;
      try {
        const { subject, html } =
          status === "Approved"
            ? verificationApprovedEmail(v.applicant_first_name ?? "there")
            : verificationRejectedEmail(v.applicant_first_name ?? "there");

        await sendEmail({ to: v.email, subject, html });
        await firestoreUpdate(doc.ref.name, { outcome_sent_at: new Date().toISOString() });

        if (v.applicant_id) {
          await firestoreUpdate(
            docPath("applicants", v.applicant_id),
            status === "Approved"
              ? { current_stage: "Program Participant", current_status: "Active", verified_at: new Date().toISOString() }
              : { current_stage: "Verification Rejected" }
          );
        }

        if (status === "Approved") results.approvedSent++;
        else results.rejectedSent++;
      } catch (err: any) {
        results.errors.push(`${v.email}: ${err.message}`);
      }
    }
  }

  return NextResponse.json(results);
}
