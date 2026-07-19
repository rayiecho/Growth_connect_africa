import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Add, d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const message = (body.message || "").trim();
    const context = body.context || "general";
    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `email-reply:${ip}`, 10, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const now = new Date().toISOString();
    const existing = await d1Query("email_conversations", [{ field: "email", op: "EQUAL", value: email }]);
    if (existing.length > 0) {
      const data = existing[0].data() as any;
      let existingMessages: any[] = [];
      try {
        existingMessages = typeof data.messages === "string" ? JSON.parse(data.messages) : (data.messages || []);
      } catch {
        existingMessages = [];
      }
      const messages = [...existingMessages, { from: "user", content: message, at: now }];
      await d1UpdateById("email_conversations", existing[0].id, {
        messages,
        updated_at: now,
        status: "new",
      });
    } else {
      await d1Add("email_conversations", {
        email,
        context,
        messages: [{ from: "user", content: message, at: now }],
        started_at: now,
        updated_at: now,
        status: "new",
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("email-reply submit failed:", err);
    return NextResponse.json({ error: "Something went wrong sending your message." }, { status: 500 });
  }
}
