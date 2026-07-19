import { NextResponse } from "next/server";
import { d1GetAll } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1GetAll("email_conversations");
    const conversations = docs
      .map((d) => {
        const data = d.data() as any;
        let messages: any[] = [];
        try {
          messages = typeof data.messages === "string" ? JSON.parse(data.messages) : (data.messages || []);
        } catch {
          messages = [];
        }
        return { id: d.id, ...data, messages };
      })
      .sort((a: any, b: any) => (b.updated_at || "").localeCompare(a.updated_at || ""));
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("email-conversations fetch failed:", err);
    return NextResponse.json({ error: "Failed to load conversations." }, { status: 500 });
  }
});

