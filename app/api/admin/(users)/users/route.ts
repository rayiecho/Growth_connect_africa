import { NextResponse } from "next/server";
import { d1GetAll } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1GetAll("platform_users");
    return NextResponse.json({
      users: docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    console.error("users fetch failed:", err);
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
});
