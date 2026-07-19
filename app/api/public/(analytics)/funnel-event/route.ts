import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Add } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, event, step, detail } = await req.json();
    if (!sessionId || !event) {
      return NextResponse.json({ error: "sessionId and event are required." }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `funnel-event:${ip}`, 60, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    await d1Add("application_funnel_events", {
      session_id: sessionId,
      event,
      step: step ?? null,
      detail: detail ?? null,
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("funnel-event failed:", err);
    return NextResponse.json({ error: "Failed to log event." }, { status: 500 });
  }
}
