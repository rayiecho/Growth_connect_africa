import { NextResponse } from "next/server";
import { generateEmailVerificationLinkRest } from "@/lib/firebase/firestore-rest";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) return NextResponse.json({ error: "email is required" }, { status: 400 });

  try {
    const link = await generateEmailVerificationLinkRest(cleanEmail);
    const { subject, html } = await renderEmailTemplate("admin_email_verification", {
      verification_link: link,
    });
    const { error } = await sendEmail({ to: cleanEmail, subject, html });
    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json({ success: true, sentTo: cleanEmail });
  } catch (err: any) {
    console.error("send-verification-email failed:", err);
    return NextResponse.json({ error: err.message || "Failed to send verification email." }, { status: 500 });
  }
});

