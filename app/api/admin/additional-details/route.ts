import { NextResponse } from "next/server";
import { d1GetAll } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1GetAll("additional_details_submissions");
    const submissions = docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));
    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("additional-details fetch failed:", err);
    return NextResponse.json({ error: "Failed to load submissions." }, { status: 500 });
  }
});
