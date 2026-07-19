import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Add, d1UpdateById, d1GetById } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";

const SYSTEM_PROMPT = `You are the LaunchPadX Support Assistant for GrowthConnect Africa. You help people understand the LaunchPadX application process. You do NOT have access to look up anyone's personal application status, email, or account details - if asked, direct them to the correct page instead of trying to answer specifically.

Key facts about the program:
- Application stage: submit at /apply. No resubmission allowed once submitted. Decisions are released every Tuesday and Friday - if you apply Friday through Monday, you hear back the next Tuesday; if you apply Tuesday through Thursday, you hear back that Friday.
- Video Pitch stage: after being invited, submit at /video-pitch using the same email. You have 5 days to submit. Reminders are sent on day 2, day 4, and the deadline day. Video decisions are released every Tuesday and Friday, 10 days after submission. If marked "Action Required" you can resubmit; otherwise no resubmission is allowed.
- LaunchPadX ID: generated at /id after video approval, using your application email.
- Verification stage: at /verification, enter your email to check status. If you don't have a LaunchPadX ID yet, you'll be directed to get one first. You have 10 days to submit verification with reminders on day 2, 4, 6, 8, and 10. Verification requires a processing fee paid via Paystack. Decisions are made within 7 working days of submission (not tied to Tuesday/Friday).
- Certificate: once marked as a program completer by GrowthConnect, download at /certificate using your email.
- For anything requiring a lookup of personal/account status, direct the user to the relevant page (/video-pitch, /verification, /certificate) where they can enter their email themselves.
- For anything you cannot answer, or urgent issues, direct them to use the Contact Team or SOS button in the site footer, or visit /faq.
- Keep answers short, friendly, and accurate. Do not make up information not covered here.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = (body.message || "").trim();
    const sessionId = body.sessionId || crypto.randomUUID();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const env = (cfContext?.env || {}) as any;
    if (!env.AI) {
      return NextResponse.json({ error: "AI binding missing from context" }, { status: 500 });
    }

    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(env.TOKEN_CACHE, `chatbot:${ip}`, 20, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages });
    const reply = aiResponse?.response || "Sorry, I couldn't generate a response. Please try again.";

    const now = new Date().toISOString();
    const existing = await d1GetById("chatbot_conversations", sessionId).catch(() => null);

    if (existing) {
      const data = existing.data() as any;
      let existingMessages: any[] = [];
      try {
        existingMessages = typeof data.messages === "string" ? JSON.parse(data.messages) : (data.messages || []);
      } catch {
        existingMessages = [];
      }
      const updatedMessages = [...existingMessages, { role: "user", content: message, at: now }, { role: "assistant", content: reply, at: now }];
      await d1UpdateById("chatbot_conversations", sessionId, {
        messages: updatedMessages,
        updated_at: now,
      });
    } else {
      await d1Add("chatbot_conversations", {
        id: sessionId,
        session_id: sessionId,
        messages: [{ role: "user", content: message, at: now }, { role: "assistant", content: reply, at: now }],
        started_at: now,
        updated_at: now,
      });
    }

    return NextResponse.json({ reply, sessionId });
  } catch (err) {
    console.error("chatbot failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
