import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Query } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = decodeURIComponent(params.code);

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `verify-code:${ip}`, 20, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const matches = await d1Query("certificates", [
      { field: "code", op: "EQUAL", value: code },
    ]);

    if (matches.length === 0) {
      return NextResponse.json({ valid: false });
    }

    const data = matches[0].data() as any;
    return NextResponse.json({
      valid: true,
      first_name: data.first_name,
      last_name: data.last_name,
      lpx_id: data.lpx_id,
      cohort: data.cohort,
      issued_at: data.issued_at,
    });
  } catch (err) {
    console.error("verify lookup failed:", err);
    return NextResponse.json({ error: "Something went wrong verifying this certificate." }, { status: 500 });
  }
}
