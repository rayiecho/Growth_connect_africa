import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const cf = await getCloudflareContext();
    const bucket = (cf.env as any).VERIFICATION_BUCKET;

    const key = `email-attachments/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    return NextResponse.json({ success: true, key, url: `https://lpx.growthconnect.africa/api/public/verification/file/${key}` });
  } catch (err) {
    console.error("upload-email-attachment failed:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
});
