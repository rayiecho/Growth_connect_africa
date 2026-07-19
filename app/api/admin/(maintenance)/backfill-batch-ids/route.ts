import { NextResponse } from "next/server";
import { d1GetAll, d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1GetAll("platform_users");
    const users = docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const missingBatch = users.filter((u) => u.is_applicant === false && !u.batch_id);
    let updated = 0;
    for (const u of missingBatch) {
      const dateOnly = (u.uploaded_at || new Date().toISOString()).slice(0, 10);
      await d1UpdateById("platform_users", u.id, { batch_id: `${dateOnly}T00:00:00.000Z` });
      updated++;
    }
    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("backfill-batch-ids failed:", err);
    return NextResponse.json({ error: "Failed to backfill batch IDs." }, { status: 500 });
  }
});
