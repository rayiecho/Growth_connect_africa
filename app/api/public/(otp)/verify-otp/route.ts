import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const code = (body.code || "").trim();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const db = (cfContext?.env as any)?.launchpadx_db;
    if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 500 });

    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const attemptLimit = await checkRateLimit(kv, `verify-otp:${email}`, 5, 600);
    if (!attemptLimit.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please request a new verification code." }, { status: 429 });
    }

    const row = await db
      .prepare("SELECT code, expires_at FROM email_otps WHERE email = ?")
      .bind(email)
      .first();
    if (!row) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 404 });
    }

    if (new Date(row.expires_at as string) < new Date()) {
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }
    if (row.code !== code) {
      return NextResponse.json({ error: "Incorrect code. Please check and try again." }, { status: 400 });
    }

    await db.prepare("UPDATE email_otps SET verified = 1 WHERE email = ?").bind(email).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-otp failed:", err);
    return NextResponse.json({ error: "Something went wrong verifying your code." }, { status: 500 });
  }
}
