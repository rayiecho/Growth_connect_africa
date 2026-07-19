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
    const limit = await checkRateLimit(kv, `verification-lookup:${ip}`, 10, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const applicants = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
    if (applicants.length === 0) {
      return NextResponse.json({ found: false });
    }
    const applicant = applicants[0];
    const applicantData = applicant.data() as any;
    if (applicantData.lpx_id && !applicantData.verification_invite_sent_at) {
      return NextResponse.json({
        found: true,
        hasId: true,
        lpx_id: applicantData.lpx_id,
        notYetInvited: true,
      });
    }
    const existingVerifications = await d1Query("verifications", [{ field: "email", op: "EQUAL", value: email }]);
    let alreadySubmitted = false;
    let canResubmit = false;
    let previousFeedback: string | null = null;
    if (existingVerifications.length > 0) {
      const existingData = existingVerifications[0].data() as any;
      if (existingData.review_status === "Action Required") {
        canResubmit = true;
        previousFeedback = existingData.feedback ?? null;
      } else {
        alreadySubmitted = true;
      }
    }
    const otpVerified = await hasRecentOtpVerification(email);
    if (!otpVerified) {
      return NextResponse.json({
        found: true,
        hasId: !!applicantData.lpx_id,
        lpx_id: applicantData.lpx_id ?? null,
        alreadySubmitted,
        canResubmit,
        previousFeedback,
        otpRequired: true,
      });
    }
    return NextResponse.json({
      found: true,
      hasId: !!applicantData.lpx_id,
      lpx_id: applicantData.lpx_id ?? null,
      alreadySubmitted,
      canResubmit,
      previousFeedback,
      applicant: {
        first_name: applicantData.first_name,
        last_name: applicantData.last_name,
        email: applicantData.email,
        lpx_id: applicantData.lpx_id ?? null,
      },
    });
  } catch (err) {
    console.error("verification lookup failed:", err);
    return NextResponse.json({ error: "Something went wrong looking up your details." }, { status: 500 });
  }
}
