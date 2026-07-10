import { NextRequest, NextResponse } from "next/server";
import { firestoreQuery, firestoreAdd } from "@/lib/firebase/rest-admin";
import { sendEmail } from "@/lib/engine/ses";
import { videoReceivedEmail } from "@/lib/engine/emailTemplates";
import { addCalendarDays, reviewWindowOnOrAfter } from "@/lib/engine/dates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const now = new Date();

    const matches = await firestoreQuery("applicants", [
      { field: "email", op: "EQUAL", value: email },
    ]);
    if (matches.length === 0) {
      return NextResponse.json(
        { error: "We couldn't find an application matching this email. Please use the same email you applied with." },
        { status: 404 }
      );
    }
    const applicantDoc = matches[0];
    const applicant = applicantDoc.data() as any;

    const releaseDate = reviewWindowOnOrAfter(addCalendarDays(now, 10));

    const docRef = await firestoreAdd("video_submissions", {
      applicant_id: applicantDoc.id,
      applicant_first_name: applicant.first_name ?? "",
      applicant_last_name: applicant.last_name ?? "",
      applicant_email: applicant.email,
      video_link: body.video_link,
      submitted_at: now.toISOString(),
      review_status: "pending",
      outcome_release_date: releaseDate.toISOString().slice(0, 10),
      outcome_sent_at: null,
    });

    const { subject, html } = videoReceivedEmail(applicant.first_name ?? "there");
    await sendEmail({ to: applicant.email, subject, html });

    return NextResponse.json({ success: true, id: (docRef as any)?.id ?? null });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your video." }, { status: 500 });
  }
}
