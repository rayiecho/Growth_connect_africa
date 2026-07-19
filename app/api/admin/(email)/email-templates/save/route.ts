import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { DEFAULT_TEMPLATES } from "@/lib/engine/defaultTemplates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  const { templateId, subject, body_html, reset } = await req.json();
  if (!templateId || !DEFAULT_TEMPLATES[templateId]) {
    return NextResponse.json({ error: "Valid templateId is required." }, { status: 400 });
  }
  try {
    const cfContext = await getCloudflareContext();
    const db = (cfContext?.env as any)?.launchpadx_db;
    if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 500 });

    if (reset) {
      await db.prepare("DELETE FROM email_templates WHERE id = ?").bind(templateId).run();
      return NextResponse.json({ success: true, reset: true });
    }
    if (!subject?.trim() || !body_html?.trim()) {
      return NextResponse.json({ error: "subject and body_html are required." }, { status: 400 });
    }
    await db
      .prepare("INSERT OR REPLACE INTO email_templates (id, subject, body_html, updated_at) VALUES (?, ?, ?, ?)")
      .bind(templateId, subject.trim(), body_html.trim(), new Date().toISOString())
      .run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("email-templates save failed:", err);
    return NextResponse.json({ error: "Failed to save template." }, { status: 500 });
  }
});
