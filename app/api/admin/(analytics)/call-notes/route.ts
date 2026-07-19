import { NextResponse } from "next/server";
import { d1Add, d1Query } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  const email = (req.nextUrl.searchParams.get("email") || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ notes: [] });
  try {
    const matches = await d1Query("call_notes", [{ field: "email", op: "EQUAL", value: email }]);
    const notes = matches
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""));
    return NextResponse.json({ notes });
  } catch (err) {
    console.error("call-notes GET failed:", err);
    return NextResponse.json({ error: "Failed to load notes." }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req, session) => {
  const { email, note, outcome } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !note?.trim()) {
    return NextResponse.json({ error: "email and note are required." }, { status: 400 });
  }
  try {
    await d1Add("call_notes", {
      email: cleanEmail,
      note: note.trim(),
      outcome: outcome || "called",
      author: (session as any).email || "Admin",
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("call-notes POST failed:", err);
    return NextResponse.json({ error: "Failed to save note." }, { status: 500 });
  }
});
