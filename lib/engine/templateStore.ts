import { d1GetById } from "@/lib/db/d1-admin";
import { DEFAULT_TEMPLATES } from "./defaultTemplates";

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#31ad7c;padding:28px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;width:100%;"><tr>
            <td valign="middle" width="440" style="width:440px;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">GrowthConnect</p>
              <p style="margin:6px 0 0;font-size:13px;color:#E6FFF4;">LaunchPadX Programme</p>
            </td>
            <td valign="middle" align="right" width="60" style="width:60px;text-align:right;"><div style="text-align:right;">
              <img src="https://lpx.growthconnect.africa/icon.png" alt="GrowthConnect" width="40" height="40" style="display:block;margin-left:auto;" /></div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          ${bodyHtml}
          <p style="margin:24px 0 0;font-size:13px;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:16px;">
            Follow us:
            <a href="https://whatsapp.com/channel/0029VaDTbXUCcW4nag3FKI2i" style="color:#31ad7c;">WhatsApp</a> &middot;
            <a href="https://www.tiktok.com/@joingrowthconnect" style="color:#31ad7c;">TikTok</a> &middot;
            <a href="https://www.linkedin.com/company/joingrowthconnect" style="color:#31ad7c;">LinkedIn</a> &middot;
            <a href="https://instagram.com/joingrowthconnect" style="color:#31ad7c;">Instagram</a>
          </p>
        </td></tr>
        <tr><td style="background:#F3F4F6;padding:20px 40px;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">(c) ${new Date().getFullYear()} GrowthConnect Africa. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function renderEmailTemplate(
  templateId: string,
  vars: Record<string, string> = {}
): Promise<{ subject: string; html: string }> {
  const defaultTemplate = DEFAULT_TEMPLATES[templateId];
  if (!defaultTemplate) {
    throw new Error(`Unknown email template: ${templateId}`);
  }

  let subject = defaultTemplate.subject;
  let bodyHtml = defaultTemplate.bodyHtml;

  try {
    const doc = await d1GetById("email_templates", templateId);
    if (doc) {
      const data = doc.data() as any;
      if (data.subject) subject = data.subject;
      if (data.body_html) bodyHtml = data.body_html;
    }
  } catch {
    // No custom override saved yet - use defaults.
  }

  for (const key in vars) {
    const token = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    subject = subject.replace(token, vars[key]);
    bodyHtml = bodyHtml.replace(token, vars[key]);
  }

  return { subject, html: shell(subject, bodyHtml) };
}

export function getAllTemplateIds(): { id: string; name: string; variables: string[] }[] {
  return Object.entries(DEFAULT_TEMPLATES).map(([id, t]) => ({ id, name: t.name, variables: t.variables }));
}




export async function getRawEmailTemplateForBulk(templateId: string): Promise<{ subject: string; html: string }> {
  const defaultTemplate = DEFAULT_TEMPLATES[templateId];
  if (!defaultTemplate) {
    throw new Error(`Unknown email template: ${templateId}`);
  }

  let subject = defaultTemplate.subject;
  let bodyHtml = defaultTemplate.bodyHtml;
  try {
    const doc = await d1GetById("email_templates", templateId);
    if (doc) {
      const data = doc.data() as any;
      if (data.subject) subject = data.subject;
      if (data.body_html) bodyHtml = data.body_html;
    }
  } catch {
    // No custom override saved yet - use defaults.
  }

  const fullHtml = shell(subject, bodyHtml);

  const toMergeSyntax = (s: string) => s.replace(/{{\s*(\w+)\s*}}/g, "{$1}");

  return { subject: toMergeSyntax(subject), html: toMergeSyntax(fullHtml) };
}

