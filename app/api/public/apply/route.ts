import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const newRef = adminDb.ref("applicants").push();
    await newRef.set({
      ...body,
      email,
      date_applied: new Date().toISOString(),
      current_stage: "Application Submitted",
      current_status: "Active",
      video_invite_sent_at: null,
    });

    return NextResponse.json({ success: true, id: newRef.key });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your application." }, { status: 500 });
  }
}
