import { NextResponse } from "next/server";
import { d1GetAll } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1GetAll("rejection_followups");
    const followups = docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.responded_at || "").localeCompare(a.responded_at || ""));
    return NextResponse.json({ followups });
  } catch (err) {
    console.error("rejection-followups fetch failed:", err);
    return NextResponse.json({ error: "Failed to load follow-up responses." }, { status: 500 });
  }
});
