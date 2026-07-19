import { NextResponse } from "next/server";
import { d1UpdateById, d1GetById } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { conversationId, message } = await req.json();
  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: "conversationId and message are required." }, { status: 400 });
  }
  try {
    const doc = await d1GetById("email_conversations", conversationId);
    if (!doc) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }
    const data = doc.data() as any;
    let existingMessages: any[] = [];
    try {
      existingMessages = typeof data.messages === "string" ? JSON.parse(data.messages) : (data.messages || []);
    } catch {
      existingMessages = [];
    }
    const now = new Date().toISOString();
    const messages = [...existingMessages, { from: "admin", content: message.trim(), at: now }];
    await d1UpdateById("email_conversations", conversationId, {
      messages,
      updated_at: now,
      status: "replied",
    });
    const escaped = message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
    const emailUrl = `https://lpx.growthconnect.africa/reply?email=${encodeURIComponent(data.email)}&context=${encodeURIComponent(data.context || "general")}`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              <tr><td style="background:#31ad7c;padding:28px 40px;">
                <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">GrowthConnect</p>
                <p style="margin:6px 0 0;font-size:13px;color:#E6FFF4;">LaunchPadX Programme</p>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${escaped}</p>
                <p style="margin:24px 0 0;font-size:13px;color:#6B7280;">Have more to say? <a href="${emailUrl}" style="color:#31ad7c;">Reply to us</a>.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>`;
    await sendEmail({ to: data.email, subject: "Re: Your message to GrowthConnect", html });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("email-conversations reply failed:", err);
    return NextResponse.json({ error: "Failed to send reply." }, { status: 500 });
  }
});
