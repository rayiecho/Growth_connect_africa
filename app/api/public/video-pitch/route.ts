import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Query, d1Add, d1UpdateById } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { renderEmailTemplate } from "@/lib/engine/templateStore";
import { nextReviewWindow } from "@/lib/engine/dates";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const now = new Date();

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `video-pitch:${ip}`, 10, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
    if (matches.length === 0) {
      return NextResponse.json(
        { error: "We couldn't find an application matching this email. Please apply first." },
        { status: 404 }
      );
    }
    const applicantDoc = matches[0];
    const applicant = applicantDoc.data() as any;

    if (!applicant.video_invite_sent_at) {
      return NextResponse.json(
        { error: "Your application has not yet been reviewed and approved to proceed to the video pitch stage." },
        { status: 403 }
      );
    }

    const releaseDate = nextReviewWindow(now);
    const existingSubmissions = await d1Query("video_submissions", [{ field: "applicant_id", op: "EQUAL", value: applicantDoc.id }]);

    if (existingSubmissions.length > 0) {
      const existing = existingSubmissions[0];
      const existingData = existing.data() as any;
      if (existingData.review_status !== "action_required") {
        return NextResponse.json(
          { error: "A video pitch has already been submitted for this application." },
          { status: 409 }
        );
      }
      await d1UpdateById("video_submissions", existing.id, {
        video_link: body.video_link,
        review_status: "pending",
        submitted_at: now.toISOString(),
        outcome_release_date: releaseDate.toISOString().slice(0, 10),
        outcome_sent_at: null,
        previous_feedback: existingData.feedback ?? null,
        feedback: null,
        resubmitted_at: now.toISOString(),
      });
      await d1UpdateById("applicants", applicantDoc.id, {
        video_submitted_at: now.toISOString(),
        awaiting_video_submission: false,
      });
      try {
        const { subject, html } = await renderEmailTemplate("video_received", { first_name: applicant.first_name ?? "there", email: encodeURIComponent(applicant.email) });
        await sendEmail({ to: applicant.email, subject, html });
      } catch (emailErr) {
        console.error("video-pitch: confirmation email failed (non-critical):", emailErr);
      }
      return NextResponse.json({ success: true, id: existing.id, mode: "resubmitted" });
    }

    const { id } = await d1Add("video_submissions", {
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
    await d1UpdateById("applicants", applicantDoc.id, {
      video_submitted_at: now.toISOString(),
      awaiting_video_submission: false,
    });
    try {
      const { subject, html } = await renderEmailTemplate("video_received", { first_name: applicant.first_name ?? "there", email: encodeURIComponent(applicant.email) });
      await sendEmail({ to: applicant.email, subject, html });
    } catch (emailErr) {
      console.error("video-pitch: confirmation email failed (non-critical):", emailErr);
    }
    return NextResponse.json({ success: true, id, mode: "new" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your video." }, { status: 500 });
  }
}
