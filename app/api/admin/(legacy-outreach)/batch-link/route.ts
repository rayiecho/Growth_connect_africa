import { NextResponse } from "next/server";
import { d1GetBatchLink, d1SetBatchLink } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });
  try {
    const link = await d1GetBatchLink(date);
    return NextResponse.json({ date, link });
  } catch (err) {
    console.error("batch-link GET failed:", err);
    return NextResponse.json({ error: "Failed to load batch link." }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req, session) => {
  const { date, link } = await req.json();
  if (!date || !link?.trim()) {
    return NextResponse.json({ error: "date and link are required." }, { status: 400 });
  }
  try {
    await d1SetBatchLink(date, link.trim());
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("batch-link POST failed:", err);
    return NextResponse.json({ error: "Failed to save batch link." }, { status: 500 });
  }
});
