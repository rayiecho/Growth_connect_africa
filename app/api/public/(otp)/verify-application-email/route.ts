import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const db = (cfContext?.env as any)?.launchpadx_db;
    if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 500 });

    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const attemptLimit = await checkRateLimit(kv, `verify-application-email:${cleanEmail}`, 5, 600);
    if (!attemptLimit.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please request a new verification code." }, { status: 429 });
    }

    const otpRow = await db.prepare("SELECT * FROM email_otps WHERE email = ?").bind(cleanEmail).first();
    if (!otpRow) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
    }
    if (otpRow.verified) {
      return NextResponse.json({ error: "This code has already been used." }, { status: 400 });
    }
    if (new Date(otpRow.expires_at as string) < new Date()) {
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }
    if (otpRow.code !== code) {
      return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
    }

    const applicants = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: cleanEmail }]);
    if (applicants.length === 0) {
      return NextResponse.json({ error: "No application found for this email." }, { status: 404 });
    }

    await d1UpdateById("applicants", applicants[0].id, { email_verified: true });
    await db.prepare("UPDATE email_otps SET verified = 1 WHERE email = ?").bind(cleanEmail).run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-application-email (D1) failed:", err);
    return NextResponse.json({ error: "Something went wrong verifying your email." }, { status: 500 });
  }
}
