import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sendEmail } from "@/lib/engine/email";
import { otpEmail } from "@/lib/engine/emailTemplates";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const db = (cfContext?.env as any)?.launchpadx_db;
    if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 500 });

    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";

    const emailLimit = await checkRateLimit(kv, `send-otp:email:${email}`, 5, 3600);
    if (!emailLimit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    const ipLimit = await checkRateLimit(kv, `send-otp:ip:${ip}`, 20, 3600);
    if (!ipLimit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    await db
      .prepare(
        "INSERT OR REPLACE INTO email_otps (email, code, expires_at, verified, created_at) VALUES (?, ?, ?, 0, ?)"
      )
      .bind(email, code, expiresAt.toISOString(), now.toISOString())
      .run();

    const { subject, html } = otpEmail(code);
    const { error: sendError } = await sendEmail({ to: email, subject, html });
    if (sendError) {
      return NextResponse.json({ error: "Failed to send verification code." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-otp (D1) failed:", err);
    return NextResponse.json({ error: "Something went wrong sending your verification code." }, { status: 500 });
  }
}
