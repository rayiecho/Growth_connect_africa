import { NextRequest, NextResponse } from "next/server";
import { firestoreAdd } from "@/lib/firebase/rest-admin";
import { sendEmail } from "@/lib/engine/ses";
import { applicationReceivedEmail } from "@/lib/engine/emailTemplates";
import { addCalendarDays, reviewWindowOnOrAfter } from "@/lib/engine/dates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date();

    const releaseDate = reviewWindowOnOrAfter(addCalendarDays(now, 5));

    const docRef = await firestoreAdd("applicants", {
      ...body,
      email: (body.email || "").trim().toLowerCase(),
      submitted_at: now.toISOString(),
      current_stage: "Application Submitted",
      current_status: "Active",
      video_invite_release_date: releaseDate.toISOString().slice(0, 10),
      video_invite_sent_at: null,
    });

    const { subject, html } = applicationReceivedEmail(body.first_name ?? "there");
    await sendEmail({ to: body.email, subject, html });

    return NextResponse.json({ success: true, id: (docRef as any)?.id ?? null });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your application." }, { status: 500 });
  }
}
