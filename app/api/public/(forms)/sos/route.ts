import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Add } from "@/lib/db/d1-admin";
import { sendEmail } from "@/lib/engine/email";
import { sosAlertEmail } from "@/lib/engine/emailTemplates";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const message = (body.message || "").trim();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `sos:${ip}`, 5, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    await d1Add("sos_reports", {
      name,
      email,
      message,
      status: "new",
      submitted_at: new Date().toISOString(),
    });
    const alertTo = process.env.ADMIN_ALERT_EMAIL || "launchpadx@growthconnect.africa";
    const { subject, html } = sosAlertEmail(name, email, message);
    await sendEmail({ to: alertTo, subject, html });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SOS submission failed:", err);
    return NextResponse.json({ error: "Something went wrong sending your SOS report. Please try again." }, { status: 500 });
  }
}
