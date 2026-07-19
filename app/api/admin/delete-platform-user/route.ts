import { NextResponse } from "next/server";
import { d1Delete } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }
  try {
    await d1Delete("platform_users", userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete-platform-user failed:", err);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
});
