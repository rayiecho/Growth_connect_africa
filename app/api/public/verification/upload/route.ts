import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { checkRateLimit } from "@/lib/engine/rateLimit";

// POST /api/public/verification/upload
// Accepts multipart/form-data: folder, type, file
// Writes the file into the bound R2 bucket and returns the object key.

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const limit = await checkRateLimit(kv, `verification-upload:${ip}`, 10, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const folder = form.get("folder");
    const type = form.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (typeof folder !== "string" || !folder) {
      return NextResponse.json({ error: "folder is required" }, { status: 400 });
    }
    if (typeof type !== "string" || !["verification-form", "payment-receipt"].includes(type)) {
      return NextResponse.json({ error: "type must be verification-form or payment-receipt" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PDF or image uploads are allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large. Max 15 MB." }, { status: 400 });
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${safeFolder}/${type}-${safeName}`;

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
    console.error("R2 upload failed:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
