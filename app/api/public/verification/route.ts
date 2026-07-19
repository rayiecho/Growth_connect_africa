import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Query, d1Add, d1UpdateById } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { addWorkingDays } from "@/lib/engine/dates";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const now = new Date();

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `verification:${ip}`, 10, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
    if (matches.length === 0) {
      return NextResponse.json(
        { error: "We couldn't find an application matching that email. Please check it matches your original application." },
        { status: 404 }
      );
    }
    const applicantId = matches[0].id;
    const applicant = matches[0].data() as any;

    if (!applicant.lpx_id) {
      return NextResponse.json(
        { error: "Please generate your LaunchPadX ID before submitting verification." },
        { status: 400 }
      );
    }
    if (!applicant.verification_invite_sent_at) {
      return NextResponse.json(
        { error: "You have not yet received your verification invitation email." },
        { status: 403 }
      );
    }
    if (!body.payment_confirmed) {
      return NextResponse.json(
        { error: "Please confirm your verification payment before submitting." },
        { status: 400 }
      );
    }

    const releaseDate = addWorkingDays(now, 7);
    const existing = await d1Query("verifications", [{ field: "email", op: "EQUAL", value: email }]);

    if (existing.length > 0) {
      const existingDoc = existing[0];
      const existingData = existingDoc.data() as any;
      if (existingData.review_status !== "Action Required") {
        return NextResponse.json(
          { error: "A verification has already been submitted for this application." },
          { status: 409 }
        );
      }
      await d1UpdateById("verifications", existingDoc.id, {
        verification_form_path: body.verification_form_path,
        payment_receipt_path: body.payment_receipt_path,
        payment_confirmed: true,
        review_status: "Pending",
        submitted_at: now.toISOString(),
        outcome_release_date: releaseDate.toISOString().slice(0, 10),
        outcome_sent_at: null,
        previous_feedback: existingData.feedback ?? null,
        feedback: null,
        resubmitted_at: now.toISOString(),
      });
      await d1UpdateById("applicants", applicantId, {
        verification_submitted_at: now.toISOString(),
        awaiting_verification_submission: false,
      });
      try {
        const { subject, html } = await renderEmailTemplate("verification_received", { first_name: applicant.first_name ?? "there", email: encodeURIComponent(email) });
        await sendEmail({ to: email, subject, html });
      } catch (emailErr) {
        console.error("verification: confirmation email failed (non-critical):", emailErr);
      }
      return NextResponse.json({ success: true, id: existingDoc.id, mode: "resubmitted" });
    }

    const { id } = await d1Add("verifications", {
      applicant_id: applicantId,
      applicant_first_name: applicant.first_name ?? "",
      applicant_last_name: applicant.last_name ?? "",
      email,
      lpx_id: applicant.lpx_id,
      form_submitted: true,
      submitted_at: now.toISOString(),
      review_status: "Pending",
      verification_form_path: body.verification_form_path,
      payment_receipt_path: body.payment_receipt_path,
      payment_confirmed: true,
      outcome_release_date: releaseDate.toISOString().slice(0, 10),
      outcome_sent_at: null,
    });
    await d1UpdateById("applicants", applicantId, {
      verification_submitted_at: now.toISOString(),
      awaiting_verification_submission: false,
    });
    try {
      const { subject, html } = await renderEmailTemplate("verification_received", { first_name: applicant.first_name ?? "there", email: encodeURIComponent(email) });
      await sendEmail({ to: email, subject, html });
    } catch (emailErr) {
      console.error("verification: confirmation email failed (non-critical):", emailErr);
    }
    return NextResponse.json({ success: true, id, mode: "new" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your verification." }, { status: 500 });
  }
}
