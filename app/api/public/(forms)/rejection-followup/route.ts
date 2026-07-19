import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Add, d1Query, d1UpdateById } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const email = (req.nextUrl.searchParams.get("email") || "").trim().toLowerCase();
    const stage = req.nextUrl.searchParams.get("stage") || "unknown";
    const response = req.nextUrl.searchParams.get("response") === "yes" ? "yes" : "no";
    if (!email) {
      return new NextResponse("Missing email.", { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `rejection-followup:${ip}`, 20, 3600);
    if (!limit.allowed) {
      return new NextResponse("Too many requests. Please try again later.", { status: 429 });
    }

    const existing = await d1Query("rejection_followups", [{ field: "email", op: "EQUAL", value: email }]);
    if (existing.length > 0) {
      await d1UpdateById("rejection_followups", existing[0].id, {
        response,
        stage,
        responded_at: new Date().toISOString(),
      });
    } else {
      await d1Add("rejection_followups", {
        email,
        stage,
        response,
        responded_at: new Date().toISOString(),
      });
    }
    const message = response === "yes"
      ? "Thank you! We'll keep you updated with future opportunities and news from GrowthConnect."
      : "No problem - you won't receive further updates from us. Thank you for applying to LaunchPadX.";
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Thank You</title></head>
      <body style="font-family:Arial,sans-serif;background:#F9FAFB;margin:0;padding:60px 20px;text-align:center;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <h2 style="color:#111827;margin:0 0 16px;">Thanks for letting us know</h2>
          <p style="color:#6B7280;font-size:15px;line-height:1.6;">${message}</p>
        </div>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("rejection-followup failed:", err);
    return new NextResponse("Something went wrong.", { status: 500 });
  }
}
