import { NextResponse } from "next/server";
import { d1Query } from "@/lib/db/d1-admin";
import { withRateLimit } from "@/lib/engine/withRateLimit";
import { hasRecentOtpVerification } from "@/lib/engine/otpGate";

export const POST = withRateLimit({ key: "certificate-lookup", maxRequests: 10, windowSeconds: 3600 })(async (req) => {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
    if (matches.length === 0) {
      return NextResponse.json({ found: false });
    }
    const data = matches[0].data() as any;
    if (!data.program_completed) {
      return NextResponse.json({ found: true, eligible: false });
    }
    const otpVerified = await hasRecentOtpVerification(email);
    if (!otpVerified) {
      return NextResponse.json({ found: true, eligible: true, otpRequired: true });
    }
    return NextResponse.json({
      found: true,
      eligible: true,
      certificate: {
        code: data.certificate_code,
        first_name: data.first_name,
        last_name: data.last_name,
        lpx_id: data.lpx_id,
        cohort: data.cohort,
        completed_at: data.program_completed_at,
      },
    });
  } catch (err) {
    console.error("certificate lookup failed:", err);
    return NextResponse.json({ error: "Something went wrong looking up your certificate." }, { status: 500 });
  }
});
