import { NextResponse } from "next/server";
import { d1UpdateById, d1Add } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

function generateCertCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

export const POST = withAdminAuth(async (req, session) => {
  const { applicantId, firstName, lastName, lpxId, cohort } = await req.json();
  if (!applicantId || !lpxId) {
    return NextResponse.json({ error: "applicantId and lpxId are required." }, { status: 400 });
  }
  try {
    const now = new Date();
    const certCode = generateCertCode();
    await d1Add("certificates", {
      code: certCode,
      applicant_id: applicantId,
      lpx_id: lpxId,
      first_name: firstName ?? "",
      last_name: lastName ?? "",
      cohort: cohort ?? "",
      issued_at: now.toISOString(),
    });
    await d1UpdateById("applicants", applicantId, {
      program_completed: true,
      program_completed_at: now.toISOString(),
      certificate_code: certCode,
    });
    return NextResponse.json({ success: true, certificate_code: certCode });
  } catch (err) {
    console.error("mark-completed failed:", err);
    return NextResponse.json({ error: "Failed to mark as completed." }, { status: 500 });
  }
});
