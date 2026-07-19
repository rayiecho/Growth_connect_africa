import { NextResponse } from "next/server";
import { d1Add, d1GetAll } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const MAX_WRITES_PER_RUN = 40;

export const POST = withAdminAuth(async (req, session) => {
  const { rows, batchId: existingBatchId } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "rows array is required." }, { status: 400 });
  }
  const results = { added: 0, skippedExistingApplicant: 0, skippedExistingUser: 0, skippedNoEmail: 0, errors: [] as string[] };
  const batchId = existingBatchId || new Date().toISOString();
  try {
    const [applicantDocs, platformUserDocs] = await Promise.all([
      d1GetAll("applicants"),
      d1GetAll("platform_users"),
    ]);
    const applicantEmails = new Set(applicantDocs.map((d) => ((d.data() as any).email || "").toLowerCase()));
    const platformUserEmails = new Set(platformUserDocs.map((d) => ((d.data() as any).email || "").toLowerCase()));
    let writesUsed = 0;
    const remainingRows: any[] = [];
    for (const row of rows) {
      const email = (row.email || "").trim().toLowerCase();
      if (!email) {
        results.skippedNoEmail++;
        continue;
      }
      if (applicantEmails.has(email)) {
        results.skippedExistingApplicant++;
        continue;
      }
      if (platformUserEmails.has(email)) {
        results.skippedExistingUser++;
        continue;
      }
      if (writesUsed >= MAX_WRITES_PER_RUN) {
        remainingRows.push(row);
        continue;
      }
      try {
        await d1Add("platform_users", {
          first_name: row.first_name || "",
          last_name: row.last_name || "",
          email,
          phone: row.phone || "",
          source: "csv_upload",
          is_applicant: false,
          uploaded_at: new Date().toISOString(),
          batch_id: batchId,
        });
        platformUserEmails.add(email);
        results.added++;
        writesUsed++;
      } catch (err: any) {
        results.errors.push(`${email}: ${err.message}`);
      }
    }
    return NextResponse.json({ success: true, batchId, ...results, remainingRows });
  } catch (err: any) {
    console.error("users-upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 500 });
  }
});
