import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { d1Query } from "@/lib/db/d1-admin";
import { checkRateLimit } from "@/lib/engine/rateLimit";

export async function GET(req: NextRequest, { params }: { params: { key: string[] } }) {
  try {
    const key = params.key.map(decodeURIComponent).join("/");

    if (!key || key.includes("..") || key.startsWith("/")) {
      return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
    }

    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `lpx-id-photo:${ip}`, 30, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matches = await d1Query("applicants", [
      { field: "email", op: "EQUAL", value: email },
      { field: "photo_path", op: "EQUAL", value: key },
    ]);
    if (matches.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const env = (cfContext?.env || {}) as any;
    if (!env.VERIFICATION_BUCKET) {
      return NextResponse.json({ error: "R2 bucket binding missing from context" }, { status: 500 });
    }

    const object = await env.VERIFICATION_BUCKET.get(key);
    if (!object) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Photo fetch failed:", err);
    return NextResponse.json({ error: "Failed to load photo." }, { status: 500 });
  }
}
