import { NextResponse } from "next/server";
import { sendBulkEmail } from "@/lib/engine/email";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

function buildHtml(bodyHtml: string, attachmentLinks: { name: string; url: string }[]): string {
  const attachmentsSection = attachmentLinks.length > 0
    ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #E5E7EB;">
        <p style="margin:0 0 8px;font-size:13px;color:#6B7280;font-weight:bold;">Attachments:</p>
        ${attachmentLinks.map((a) => `<p style="margin:4px 0;"><a href="${a.url}" style="color:#31ad7c;font-size:14px;">${a.name}</a></p>`).join("")}
      </div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <tr><td style="background:#31ad7c;padding:28px 40px;">
              <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">GrowthConnect</p>
              <p style="margin:6px 0 0;font-size:13px;color:#E6FFF4;">LaunchPadX Programme</p>
            </td></tr>
            <tr><td style="padding:40px;">
              <div style="font-size:15px;color:#374151;line-height:1.7;">${bodyHtml}</div>
              ${attachmentsSection}
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;
}

export const POST = withAdminAuth(async (req, session) => {
  const { recipients, subject, bodyHtml, attachments } = await req.json();

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ error: "At least one recipient is required." }, { status: 400 });
  }
  if (!subject?.trim() || !bodyHtml?.trim()) {
    return NextResponse.json({ error: "Subject and message body are required." }, { status: 400 });
  }

  try {
    const attachmentLinks = Array.isArray(attachments) ? attachments : [];
    const fullHtml = buildHtml(bodyHtml, attachmentLinks);

    const bulkRecipients = recipients.map((email: string) => ({
      email,
      fields: { email: encodeURIComponent(email) },
    }));

    const { error } = await sendBulkEmail({ recipients: bulkRecipients, subject: subject.trim(), html: fullHtml });
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, sentTo: recipients.length });
  } catch (err) {
    console.error("compose-email failed:", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
});
