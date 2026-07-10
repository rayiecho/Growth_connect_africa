import { NextRequest, NextResponse } from "next/server";
import { firestoreQuery, firestoreAdd } from "@/lib/firebase/rest-admin";
import { sendEmail } from "@/lib/engine/ses";
import { verificationReceivedEmail } from "@/lib/engine/emailTemplates";
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
        { error: "We couldn't find an application matching that email. Please check it matches your original application." },
        { status: 404 }
      );
    }
    const applicantId = matches[0].id;
    const applicant = matches[0].data() as any;

    const releaseDate = reviewWindowOnOrAfter(addCalendarDays(now, 10));

    const docRef = await firestoreAdd("verifications", {
      applicant_id: applicantId,
      applicant_first_name: applicant.first_name ?? "",
      applicant_last_name: applicant.last_name ?? "",
      email,
      lpx_id: body.lpx_id || null,
      form_submitted: true,
      submitted_at: now.toISOString(),
      review_status: "Pending",
      verification_form_path: body.verification_form_path,
      payment_receipt_path: body.payment_receipt_path,
      outcome_release_date: releaseDate.toISOString().slice(0, 10),
      outcome_sent_at: null,
    });

    const { subject, html } = verificationReceivedEmail(applicant.first_name ?? "there");
    await sendEmail({ to: email, subject, html });

    return NextResponse.json({ success: true, id: (docRef as any)?.id ?? null });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your verification." }, { status: 500 });
  }
}
