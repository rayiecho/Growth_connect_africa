import { NextResponse } from "next/server";
import { d1Add, d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { withRateLimit } from "@/lib/engine/withRateLimit";

export const POST = withRateLimit({ key: "additional-details", maxRequests: 10, windowSeconds: 3600 })(async (req) => {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await d1Add("additional_details_submissions", {
      email,
      first_name: body.first_name || "",
      last_name: body.last_name || "",
      phone: body.phone || "",
      business_name: body.business_name || "",
      business_stage: body.business_stage || "",
      industry: body.industry || "",
      business_description: body.business_description || "",
      linkedin: body.linkedin || "",
      submitted_at: new Date().toISOString(),
      reconciled: true,
    });
    const matches = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
    if (matches.length > 0) {
      const updateFields: Record<string, any> = {};
      if (body.first_name?.trim()) updateFields.first_name = body.first_name.trim();
      if (body.last_name?.trim()) updateFields.last_name = body.last_name.trim();
      if (body.phone?.trim()) updateFields.phone = body.phone.trim();
      if (body.business_name?.trim()) updateFields.business_name = body.business_name.trim();
      if (body.business_stage?.trim()) updateFields.business_stage = body.business_stage.trim();
      if (body.industry?.trim()) updateFields.industry = body.industry.trim();
      if (body.business_description?.trim()) updateFields.business_description = body.business_description.trim();
      if (body.linkedin?.trim()) updateFields.linkedin = body.linkedin.trim();
      if (Object.keys(updateFields).length > 0) {
        await d1UpdateById("applicants", matches[0].id, updateFields);
      }
    }
    return NextResponse.json({ success: true, applicantUpdated: matches.length > 0 });
  } catch (err) {
    console.error("additional-details submit failed:", err);
    return NextResponse.json({ error: "Something went wrong submitting your details." }, { status: 500 });
  }
});
