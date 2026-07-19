import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";
import { hasRecentOtpVerification } from "@/lib/engine/otpGate";

const ELIGIBLE_STAGES = ["Video Pitch Approved", "LaunchpadX ID Activated", "Program Participant"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      action,
      preferred_name,
      alternate_phone,
      linkedin,
      photo_path,
      consent_stored
    } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `lpx-id:${ip}`, 10, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const queryResults = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: normalizedEmail }]);
    if (queryResults.length === 0) {
      return NextResponse.json({ error: "No matching application found for this email address." }, { status: 404 });
    }

    const applicantId = queryResults[0].id;
    const applicantData = queryResults[0].data() as any;
    const isEligible = ELIGIBLE_STAGES.includes(applicantData.current_stage);

    if (action === "lookup") {
      const otpVerified = await hasRecentOtpVerification(normalizedEmail);
      if (!otpVerified) {
        return NextResponse.json({
          success: true,
          hasId: !!applicantData.lpx_id,
          isEligible,
          otpRequired: true,
          data: {
            lpx_id: applicantData.lpx_id,
          }
        });
      }
      return NextResponse.json({
        success: true,
        hasId: !!applicantData.lpx_id,
        isEligible,
        data: {
          lpx_id: applicantData.lpx_id,
          first_name: applicantData.first_name,
          last_name: applicantData.last_name,
          email: applicantData.email,
          business_name: applicantData.business_name,
          cohort: applicantData.cohort,
          preferred_name: applicantData.preferred_name,
          alternate_phone: applicantData.alternate_phone,
          linkedin: applicantData.linkedin,
          photo_path: applicantData.photo_path,
        }
      });
    }

    if (action === "generate") {
      if (applicantData.lpx_id) {
        return NextResponse.json({
          success: true,
          message: "ID already generated.",
          lpx_id: applicantData.lpx_id
        });
      }
      if (!isEligible) {
        return NextResponse.json(
          { error: "Your LaunchPadX ID can only be generated after your video pitch has been approved." },
          { status: 403 }
        );
      }
      if (!consent_stored) {
        return NextResponse.json({ error: "Data processing consent is mandatory." }, { status: 400 });
      }
      const randomBits = Math.floor(1000000000 + Math.random() * 9000000000);
      const generatedId = `LPX-${randomBits}`;
      await d1UpdateById("applicants", applicantId, {
        lpx_id: generatedId,
        lpx_id_generated_at: new Date().toISOString(),
        current_stage: "LaunchpadX ID Activated",
        preferred_name: preferred_name?.trim() || null,
        alternate_phone: alternate_phone?.trim() || null,
        linkedin: linkedin?.trim() || null,
        photo_path: photo_path || null,
        consent_stored: true
      });
      return NextResponse.json({
        success: true,
        lpx_id: generatedId
      });
    }

    if (action === "update_profile") {
      if (!applicantData.lpx_id) {
        return NextResponse.json({ error: "Generate your LaunchPadX ID before updating profile details." }, { status: 400 });
      }
      await d1UpdateById("applicants", applicantId, {
        preferred_name: preferred_name?.trim() || applicantData.preferred_name || null,
        alternate_phone: alternate_phone?.trim() || applicantData.alternate_phone || null,
        linkedin: linkedin?.trim() || applicantData.linkedin || null,
        photo_path: photo_path || applicantData.photo_path || null,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action requested." }, { status: 400 });
  } catch (err: any) {
    console.error("ID Generation route exception:", err);
    return NextResponse.json({ error: "Internal transaction failure." }, { status: 500 });
  }
}
