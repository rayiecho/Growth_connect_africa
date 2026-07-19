import { NextResponse } from "next/server";
import { d1QueryOrdered, normalizeApplicant } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  const cursor = req.nextUrl.searchParams.get("cursor");
  if (!cursor) return NextResponse.json({ error: "cursor is required." }, { status: 400 });
  try {
    const docs = await d1QueryOrdered("applicants", [], "date_applied", "DESCENDING", 100, cursor);
    const applicants = docs.map((d) => normalizeApplicant({ id: d.id, ...d.data() }));
    return NextResponse.json({ applicants, hasMore: applicants.length === 100 });
  } catch (err) {
    console.error("applicants-more failed:", err);
    return NextResponse.json({ error: "Failed to load more applicants." }, { status: 500 });
  }
});

