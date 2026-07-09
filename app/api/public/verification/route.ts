import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    const snap = await adminDb.ref("applicants").orderByChild("email").equalTo(email).once("value");
    const val = snap.val();
    if (!val) {
      return NextResponse.json(
        { error: "We couldn't find an application matching that email. Please check it matches your original application." },
        { status: 404 }
      );
    }
    const applicantId = Object.keys(val)[0];
    const applicant = val[applicantId];

    const newRef = adminDb.ref("verifications").push();
    await newRef.set({
      applicant_id: applicantId,
      applicant_first_name: applicant.first_name ?? "",
      applicant_last_name: applicant.last_name ?? "",
      email,
      lpx_id: body.lpx_id || null,
      form_submitted: true,
      submitted_at: new Date().toISOString(),
      review_status: "Pending",
      verification_form_path: body.verification_form_path,
      payment_receipt_path: body.payment_receipt_path,
    });

    return NextResponse.json({ success: true, id: newRef.key });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your verification." }, { status: 500 });
  }
}
