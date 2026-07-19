import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { checkRateLimit } from "@/lib/engine/rateLimit";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `lpx-id-upload-photo:${ip}`, 10, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const email = form.get("email");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (typeof email !== "string" || !email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPEG, or WEBP images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large. Max 5 MB." }, { status: 400 });
    }

    const safeEmail = email.trim().toLowerCase().replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `id-photos/${safeEmail}-${Date.now()}-${safeName}`;

    const env = (cfContext?.env || {}) as any;
    if (!env.VERIFICATION_BUCKET) {
      return NextResponse.json({ error: "R2 bucket binding missing from context" }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    await env.VERIFICATION_BUCKET.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    return NextResponse.json({ success: true, key });
  } catch (err) {
    console.error("ID photo upload failed:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
