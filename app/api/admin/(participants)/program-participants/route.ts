import { NextResponse } from "next/server";
import { d1Query, normalizeApplicant } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1Query("applicants", [{ field: "current_stage", op: "EQUAL", value: "Program Participant" }]);
    const activeProgramDocs = await d1Query("applicants", [{ field: "current_stage", op: "EQUAL", value: "Active Program" }]);
    const all = [...docs, ...activeProgramDocs].map((d) => normalizeApplicant({ id: d.id, ...d.data() }));
    return NextResponse.json({ participants: all });
  } catch (err) {
    console.error("program-participants fetch failed:", err);
    return NextResponse.json({ error: "Failed to load program participants." }, { status: 500 });
  }
});
