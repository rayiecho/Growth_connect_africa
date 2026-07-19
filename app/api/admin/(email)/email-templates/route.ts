import { NextResponse } from "next/server";
import { d1GetById } from "@/lib/db/d1-admin";
import { getAllTemplateIds } from "@/lib/engine/templateStore";
import { DEFAULT_TEMPLATES } from "@/lib/engine/defaultTemplates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  const list = getAllTemplateIds();
  const templates = [];
  for (const t of list) {
    const defaultData = DEFAULT_TEMPLATES[t.id];
    let subject = defaultData.subject;
    let bodyHtml = defaultData.bodyHtml;
    let customized = false;
    try {
      const doc = await d1GetById("email_templates", t.id);
      if (doc) {
        const data = doc.data() as any;
        if (data.subject) { subject = data.subject; customized = true; }
        if (data.body_html) { bodyHtml = data.body_html; customized = true; }
      }
    } catch {
      // no override yet
    }
    templates.push({
      id: t.id,
      name: t.name,
      variables: t.variables,
      subject,
      body_html: bodyHtml,
      customized,
    });
  }
  return NextResponse.json({ templates });
});
