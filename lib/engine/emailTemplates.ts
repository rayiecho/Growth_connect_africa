// lib/engine/emailTemplates.ts
// Shared HTML shell + specific builders for every automated email in the
// pipeline. Content is intentionally minimal/placeholder - wording is
// meant to be edited later; this file's job is correct plumbing.

const SITE_URL = "https://lpx.growthconnect.africa";

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#16A34A;padding:32px 40px;">
          <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">GrowthConnect Africa</p>
          <p style="margin:6px 0 0;font-size:13px;color:#BBF7D0;">LaunchPadX Programme</p>
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          ${bodyHtml}
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

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${text}</p>`;
}

function button(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:#16A34A;border-radius:8px;">
    <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

export function applicationReceivedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Application received - LaunchPadX",
    html: shell("Application Received", `
      ${p(`Dear ${firstName},`)}
      ${p("Thank you for submitting your application to LaunchPadX. Our team reviews applications on a rolling basis, and you'll hear from us with next steps soon.")}
      ${p("[Placeholder: add any directions/resources for applicants here.]")}
    `),
  };
}

export function videoInviteEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Next step: submit your video pitch - LaunchPadX",
    html: shell("Video Pitch Invitation", `
      ${p(`Dear ${firstName},`)}
      ${p("Congratulations on progressing to the next stage of LaunchPadX. Please submit your video pitch using the link below.")}
      ${button("Submit Your Video Pitch", `${SITE_URL}/video-pitch`)}
      ${p("[Placeholder: any additional guidance for this stage.]")}
    `),
  };
}

export function videoReceivedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Video pitch received - LaunchPadX",
    html: shell("Video Received", `
      ${p(`Dear ${firstName},`)}
      ${p("We've received your video pitch. Our review team will be in touch with next steps.")}
    `),
  };
}

export function videoApprovedEmail(
  firstName: string,
  whatsappLink?: string | null
): { subject: string; html: string } {
  return {
    subject: "You're approved - next steps for verification",
    html: shell("Video Approved", `
      ${p(`Dear ${firstName},`)}
      ${p("Congratulations - your video pitch has been approved. Please proceed to verification using the details below.")}
      ${button("Start Verification", `${SITE_URL}/verification`)}
      ${whatsappLink
        ? button("Join Your Community WhatsApp Group", whatsappLink)
        : p("[WhatsApp group link for your batch will be shared separately.]")
      }
      ${p("[Placeholder: LaunchPadX ID creation - coming soon.]")}
    `),
  };
}

export function videoRejectedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Update on your LaunchPadX video pitch",
    html: shell("Video Pitch Update", `
      ${p(`Dear ${firstName},`)}
      ${p("Thank you for submitting your video pitch. After review, we're unable to move forward with your application at this time.")}
      ${p("[Placeholder: encouragement / alternative program info.]")}
    `),
  };
}

export function verificationReceivedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Verification submitted - LaunchPadX",
    html: shell("Verification Received", `
      ${p(`Dear ${firstName},`)}
      ${p("We've received your verification submission. Our team will review it and follow up with next steps.")}
    `),
  };
}

export function verificationApprovedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Congratulations - you're a LaunchPadX Program Participant",
    html: shell("Verification Approved", `
      ${p(`Dear ${firstName},`)}
      ${p("Congratulations! Your verification has been approved and you are now a LaunchPadX Program Participant.")}
      ${p("[Placeholder: next steps for program participants.]")}
    `),
  };
}

export function verificationRejectedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Update on your LaunchPadX verification",
    html: shell("Verification Update", `
      ${p(`Dear ${firstName},`)}
      ${p("After review, we're unable to approve your verification at this time.")}
      ${p("[Placeholder: reason/next steps.]")}
    `),
  };
}
