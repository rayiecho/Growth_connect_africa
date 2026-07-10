import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// GET /api/public/verification/file/[...key]
// Admin-only — streams the R2 object body back safely.
export async function GET(
  req: NextRequest,
  { params }: { params: { key: string[] } }
) {
  try {
    // 1. Authenticate using internal Next.js cookies parsing mechanism
    const session = await getVerifiedAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate path params and prevent path traversal exploits
    const keyArray = params.key || [];
    const key = keyArray.join("/");
    
    if (!key || key.includes("..") || key.startsWith("/")) {
      return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
    }

    // 3. Resolve context and cast env as any to clear TypeScript compilation flags
    const cfContext = getCloudflareContext();
    if (!cfContext || !cfContext.env) {
      return NextResponse.json({ error: "Storage environment uninitialized" }, { status: 500 });
    }

    const env = cfContext.env as any;
    if (!env.VERIFICATION_BUCKET) {
      return NextResponse.json({ error: "R2 bucket binding missing from context" }, { status: 500 });
    }

    const obj = await env.VERIFICATION_BUCKET.get(key);
    if (!obj) {
      return NextResponse.json({ error: "Requested asset not found" }, { status: 404 });
    }

    // 4. Construct stream headers matching original document types
    const headers = new Headers();
    if (obj.httpMetadata?.contentType) {
      headers.set("Content-Type", obj.httpMetadata.contentType);
    } else {
      headers.set("Content-Type", "application/octet-stream");
    }
    
    const safeFilename = key.split("/").pop() || "download";
    headers.set("Content-Disposition", `inline; filename="${safeFilename}"`);
    headers.set("Cache-Control", "private, max-age=60");

    return new Response(obj.body, { 
      status: 200,
      headers 
    });
  } catch (err) {
    console.error("R2 asset proxy stream failure:", err);
    return NextResponse.json({ error: "Internal download stream engine crash" }, { status: 500 });
  }
}
