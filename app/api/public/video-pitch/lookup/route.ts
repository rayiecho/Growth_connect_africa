import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Query } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";
import { hasRecentOtpVerification } from "@/lib/engine/otpGate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `video-pitch-lookup:${ip}`, 10, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const applicants = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
    if (applicants.length === 0) {
      return NextResponse.json({ found: false });
    }
    const applicant = applicants[0];
    const applicantData = applicant.data() as any;
    if (!applicantData.video_invite_sent_at) {
      return NextResponse.json({
        found: true,
        notYetInvited: true,
        canSubmit: false,
      });
    }
    const submissions = await d1Query("video_submissions", [{ field: "applicant_id", op: "EQUAL", value: applicant.id }]);
    if (submissions.length === 0) {
      const otpVerified = await hasRecentOtpVerification(email);
      if (!otpVerified) {
        return NextResponse.json({ found: true, canSubmit: true, otpRequired: true });
      }
      return NextResponse.json({
        found: true,
        canSubmit: true,
        mode: "new",
        applicant: {
          first_name: applicantData.first_name,
          last_name: applicantData.last_name,
          phone: applicantData.phone,
          email: applicantData.email,
        },
      });
    }
    const submission = submissions[0];
    const submissionData = submission.data() as any;
    if (submissionData.review_status === "action_required") {
      const otpVerified = await hasRecentOtpVerification(email);
      if (!otpVerified) {
        return NextResponse.json({ found: true, canSubmit: true, otpRequired: true });
      }
      return NextResponse.json({
        found: true,
        canSubmit: true,
        mode: "resubmit",
        existingSubmissionId: submission.id,
        previousFeedback: submissionData.feedback ?? null,
        applicant: {
          first_name: applicantData.first_name,
          last_name: applicantData.last_name,
          phone: applicantData.phone,
          email: applicantData.email,
        },
      });
    }
    return NextResponse.json({
      found: true,
      canSubmit: false,
      existingStatus: submissionData.review_status,
    });
  } catch (err) {
    console.error("video-pitch lookup failed:", err);
    return NextResponse.json({ error: "Something went wrong looking up your details." }, { status: 500 });
  }
}
