import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    // Query Firestore collection for matching email
    const snapshot = await adminDb.collection("applicants").where("email", "==", email).limit(1).get();
    
    if (snapshot.empty) {
      return NextResponse.json(
        { error: "We couldn't find an application matching this email. Please use the same email you applied with." },
        { status: 404 }
      );
    }
    
    const applicantDoc = snapshot.docs[0];
    const applicantId = applicantDoc.id;
    const applicant = applicantDoc.data();

    // Add document to firestore video_submissions collection
    const docRef = await adminDb.collection("video_submissions").add({
      applicant_id: applicantId,
      applicant_first_name: applicant.first_name ?? "",
      applicant_last_name: applicant.last_name ?? "",
      applicant_email: applicant.email,
      video_link: body.video_link,
      submitted_at: new Date().toISOString(),
      review_status: "pending",
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your video." }, { status: 500 });
  }
}
