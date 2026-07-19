const SITE_URL = "https://lpx.growthconnect.africa";

const LINKS = {
  communityChannel: "https://whatsapp.com/channel/0029VaDTbXUCcW4nag3FKI2i",
  verificationCommunity: "https://chat.whatsapp.com/GmafO3e7UqW4OUuEXGUHGV",
  founderCommunity: "https://chat.whatsapp.com/Ir57x6aP2c9BsC6N0OdCE0",
  tiktok: "https://www.tiktok.com/@joingrowthconnect",
  linkedin: "https://www.linkedin.com/company/joingrowthconnect",
  instagram: "https://instagram.com/joingrowthconnect",
  journeyVideo: "https://youtu.be/If1ugBzvRbs",
  verificationPayment: "https://paystack.shop/pay/lpx-verification",
  verificationFormDownload: "https://drive.google.com/file/d/1Tv0KHAbU8CHPXcY98UofbaRJjEKfm4Zc/view?usp=sharing",
  orientation: "https://growthconnect.africa/courses/launchpadx-orientation-program/",
  accelerator: "https://growthconnect.africa/courses/lpx-ira/",
};

const NAIRA = "\u20A6";
const EMOJI = {
  party: "\u{1F389}",
  check: "\u2705",
  money: "\u{1F4B0}",
  bank: "\u{1F3E6}",
  globe: "\u{1F30D}",
  mic: "\u{1F3A4}",
  calendar: "\u{1F4C5}",
  warning: "\u26A0\uFE0F",
  rocket: "\u{1F680}",
  hourglass: "\u23F3",
};

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#31ad7c;padding:32px 40px;">
          <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">GrowthConnect</p>
          <p style="margin:6px 0 0;font-size:13px;color:#E6FFF4;">LaunchPadX Programme</p>
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

function h3(text: string): string {
  return `<h3 style="margin:24px 0 12px;font-size:17px;color:#111827;">${text}</h3>`;
}

function button(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr><td style="background:#31ad7c;border-radius:8px;">
    <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

function socialLinksBlock(): string {
  return `<p style="margin:24px 0 0;font-size:13px;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:16px;">
    Follow us:
    <a href="${LINKS.communityChannel}" style="color:#31ad7c;">WhatsApp</a> &middot;
    <a href="${LINKS.tiktok}" style="color:#31ad7c;">TikTok</a> &middot;
    <a href="${LINKS.linkedin}" style="color:#31ad7c;">LinkedIn</a> &middot;
    <a href="${LINKS.instagram}" style="color:#31ad7c;">Instagram</a>
  </p>`;
}

export function applicationReceivedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: `${EMOJI.party} Idea Submitted Successfully - Welcome to LaunchPadX`,
    html: shell("Application Received", `
      ${p("Hello Founder,")}
      ${p("<strong>Your application has been successfully received.</strong>")}
      ${p("Our review team assesses applications every Tuesday and Friday. If selected, you'll be invited to the next stage of qualification, where you'll submit your Founder Video Pitch.")}
      ${p("<strong>Qualified founders may progress toward:</strong>")}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#374151;line-height:1.8;">
        <li>${EMOJI.money} ${NAIRA}1,000,000 Funding Opportunity</li>
        <li>${EMOJI.bank} Up to ${NAIRA}20M Credit Financing</li>
        <li>${EMOJI.globe} Up to $50,000 Equity Funding Opportunity</li>
        <li>${EMOJI.mic} The Capital Live Pitch Event</li>
      </ul>
      ${p("While you wait, join the LaunchPadX Community for updates, opportunities, and important announcements.")}
      ${button("Join the Community", LINKS.communityChannel)}
      ${p(`Welcome to LaunchPadX. This is where clarity meets capital ${EMOJI.rocket}`)}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function videoInviteEmail(firstName: string, deadlineDateStr: string): { subject: string; html: string } {
  return {
    subject: "Congratulations! You've Been Selected for the Founder Assessment Stage",
    html: shell("Video Pitch Invitation", `
      ${p(`Dear ${firstName},`)}
      ${p("Congratulations! Following a review of your application, you have been selected to proceed to the Founder Assessment (Video Pitch) Stage of the LaunchPadX qualification process.")}
      ${p("<strong>Instructions for this stage:</strong>")}
      ${p("Record a short video introducing yourself, your business, the problem you are solving, your customers, and why you would like to participate in LaunchPadX. Upload it to YouTube as an Unlisted video, copy the link, and submit it below.")}
      ${h3("Video Guidelines")}
      ${p("Record a simple video using your phone or computer. 2-3 minutes is sufficient. No editing or professional production is required. Clarity and authenticity matter more than presentation quality.")}
      ${button("Submit Your Video Pitch", `${SITE_URL}/video-pitch`)}
      ${p(`${EMOJI.warning} <strong>Submission Deadline:</strong> all video submissions must be received on or before 11:59pm (WAT), <strong>${deadlineDateStr}</strong>. Submissions will close after this deadline.`)}
      ${p("Join the community for updates while you prepare:")}
      ${button("Join the Community", LINKS.communityChannel)}
      ${p("What happens next: your submission will be reviewed by our team. Successful founders will be invited to proceed to Founder Verification & Business Identity - the gateway into the LaunchPadX Investment Readiness Program.")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function videoReceivedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: `Your LaunchPadX Video Pitch Has Been Received ${EMOJI.check}`,
    html: shell("Video Received", `
      ${p(`Hi ${firstName},`)}
      ${p("Thank you for completing and submitting your Founder Assessment. We have successfully received your video submission, and it has been added to the review queue.")}
      ${p(`${EMOJI.calendar} Assessments are reviewed every Tuesday and Friday, and you will receive feedback after the next review cycle.`)}
      ${h3("What Happens Next?")}
      ${p("Successful founders will be invited to proceed to the Founder Verification Stage, designed to confirm your identity as a founder, your business information, business ownership details, and eligibility to participate in the LaunchPadX Investment Readiness Program.")}
      ${p("While you wait: monitor updates in the community, monitor your email for updates, and be prepared to proceed quickly if selected.")}
      ${p("Thank you for your interest in LaunchPadX. We look forward to reviewing your submission.")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function videoApprovedEmail(
  firstName: string,
  whatsappLink: string | null,
  deadlineDateStr: string
): { subject: string; html: string } {
  return {
    subject: "Congratulations! Welcome to LaunchPadX - Complete Your Founder Verification",
    html: shell("Video Approved", `
      ${p(`Dear ${firstName},`)}
      ${p("Congratulations! Following a review of your application and Founder Assessment submission, we are pleased to inform you that you have been accepted into the LaunchPadX Program.")}
      ${p("Before your participation can be activated, all accepted participants are required to complete the Founder & Business Verification Process.")}
      ${p(`<strong>Deadline for all verification steps: ${deadlineDateStr}.</strong>`)}

      ${h3("Step 1: Join the Founder Verification Community (Required)")}
      ${p("This is where you'll receive announcements, guidance, FAQs, and support throughout verification.")}
      ${button("Join the Verification Community", whatsappLink || LINKS.verificationCommunity)}

      ${h3("Before You Continue: Watch the LaunchPadX Journey")}
      ${button("Watch the Journey Video", LINKS.journeyVideo)}

      ${h3("Step 2: Get Your LaunchPadX ID")}
      ${p("Every participant is assigned a LaunchPadX ID - your unique identifier throughout the program.")}
      ${button("Get Your LaunchPadX ID", `${SITE_URL}/id`)}

      ${h3("Step 3: Complete Your Founder & Business Verification")}
      ${p(`This includes identity, BVN, NIN, business verification, and ownership validation. Verification processing fee: ${NAIRA}10,500 (covers third-party verification and compliance checks - not paid to GrowthConnect).`)}
      ${button("Make Your Verification Payment", LINKS.verificationPayment)}

      ${h3("Step 4: Complete the Verification Form")}
      ${p("Download and complete the Founder & Business Verification Form, save it as a PDF.")}
      ${button("Download Verification Form", LINKS.verificationFormDownload)}

      ${h3("Step 5: Submit Your Verification Form")}
      ${p("Once you've obtained your LaunchPadX ID, completed payment, and filled the form, submit it below.")}
      ${button("Submit Your Verification", `${SITE_URL}/verification`)}

      ${p("Congratulations once again on your acceptance into LaunchPadX. We're excited to support you.")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function videoRejectedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Update on Your LaunchPadX Video Pitch",
    html: shell("Video Pitch Update", `
      ${p(`Dear ${firstName},`)}
      ${p("Thank you for taking the time to submit your Founder Assessment video pitch. After careful review, we're unable to move forward with your application in this cohort.")}
      ${p("This isn't a reflection of your potential as a founder - we review a large number of strong applicants each cycle. We'd encourage you to keep building and consider applying again in a future cohort.")}
      ${p("Stay connected with us for future opportunities:")}
      ${button("Join the Community", LINKS.communityChannel)}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function verificationReceivedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Founder Verification Submitted - Under Review",
    html: shell("Verification Received", `
      ${p("Dear Participant,")}
      ${p("Thank you for submitting your Founder & Business Verification Form. We have successfully received your submission and it has been forwarded to our verification partners for processing.")}
      ${h3("What Happens Next?")}
      ${p("Your submission will undergo: identity verification, BVN verification, NIN verification, business verification, ownership validation, and business name availability checks.")}
      ${p(`${EMOJI.hourglass} Verification typically takes up to <strong>7 working days</strong> to complete.`)}
      ${h3("Program Access")}
      ${p("Once your verification is successfully completed, you will receive confirmation and be granted access to commence the LaunchPadX Investment Readiness Program.")}
      ${p("Kindly monitor your email regularly for updates.")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function verificationApprovedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: `${EMOJI.party} Welcome to LaunchpadX! Your Next Steps into the Accelerator`,
    html: shell("Verification Approved", `
      ${p("Dear participant,")}
      ${p("Congratulations! Your Founder & Business Verification has been successfully completed. Following our 7-business-day review process, you have now been officially admitted into the LaunchpadX Accelerator Program.")}
      ${h3("Step 1: Join the LaunchpadX Founder Community")}
      ${button("Join the Founder Community", LINKS.founderCommunity)}
      ${h3("Step 2: Follow Our WhatsApp Channel")}
      ${button("Follow the Channel", LINKS.communityChannel)}
      ${h3("Step 3: Follow Growth Connect")}
      ${p(`<a href="${LINKS.instagram}">Instagram</a> &middot; <a href="${LINKS.linkedin}">LinkedIn</a> &middot; <a href="${LINKS.tiktok}">TikTok</a>`)}
      ${h3("Step 4: Complete the LaunchpadX Orientation")}
      ${p("Every founder must complete the Orientation before accessing the Accelerator.")}
      ${button("Start Orientation", LINKS.orientation)}
      ${h3("Step 5: Access the LaunchpadX Accelerator")}
      ${button("Go to the Accelerator", LINKS.accelerator)}
      ${h3("Step 6: Let Us Know You've Completed Orientation")}
      ${p("Simply reply to this email once done, and our team will send your next set of instructions.")}
      ${p("Welcome once again - we're glad you're here.")}
      ${p("Warm regards,<br/>Growth Connect Team<br/>LaunchpadX Accelerator")}
      ${socialLinksBlock()}
    `),
  };
}

export function verificationRejectedEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Update on Your LaunchPadX Verification",
    html: shell("Verification Update", `
      ${p(`Dear ${firstName},`)}
      ${p("Thank you for completing your Founder & Business Verification submission. After review, we're unable to approve your verification at this time.")}
      ${p("If you believe this is in error or have questions about the outcome, please reach out to our team.")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function videoReminderEmail(
  firstName: string,
  deadlineDateStr: string,
  isFinalDay: boolean
): { subject: string; html: string } {
  return {
    subject: isFinalDay
      ? "Final Reminder: Your Video Pitch Deadline Is Today"
      : "Reminder: Submit Your LaunchPadX Video Pitch",
    html: shell("Video Pitch Reminder", `
      ${p(`Hi ${firstName},`)}
      ${p(isFinalDay
        ? `Today, <strong>${deadlineDateStr}</strong>, is the deadline to submit your LaunchPadX Founder Assessment video pitch.`
        : `This is a reminder that your LaunchPadX Founder Assessment video pitch is due by <strong>${deadlineDateStr}</strong>.`
      )}
      ${button("Submit Your Video Pitch", `${SITE_URL}/video-pitch`)}
      ${p("If you've already submitted, please disregard this reminder.")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function verificationReminderEmail(
  firstName: string,
  deadlineDateStr: string,
  isFinalDay: boolean
): { subject: string; html: string } {
  return {
    subject: isFinalDay
      ? "Final Reminder: Your Verification Deadline Is Today"
      : "Reminder: Complete Your LaunchPadX Verification",
    html: shell("Verification Reminder", `
      ${p(`Hi ${firstName},`)}
      ${p(isFinalDay
        ? `Today, <strong>${deadlineDateStr}</strong>, is the deadline to submit your Founder & Business Verification.`
        : `This is a reminder that your Founder & Business Verification is due by <strong>${deadlineDateStr}</strong>.`
      )}
      ${button("Submit Your Verification", `${SITE_URL}/verification`)}
      ${p("If you've already submitted, please disregard this reminder.")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
      ${socialLinksBlock()}
    `),
  };
}

export function otpEmail(code: string): { subject: string; html: string } {
  return {
    subject: "Your LaunchPadX Verification Code",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Verification Code</title></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#31ad7c;padding:28px 40px;">
          <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">GrowthConnect</p>
        </td></tr>
        <tr><td style="padding:36px 40px;text-align:center;">
          <p style="margin:0 0 20px;font-size:15px;color:#374151;">Your LaunchPadX email verification code is:</p>
          <p style="margin:0 0 20px;font-size:36px;font-weight:bold;letter-spacing:8px;color:#111827;">${code}</p>
          <p style="margin:0;font-size:13px;color:#9CA3AF;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

export function sosAlertEmail(name: string, email: string, message: string): { subject: string; html: string } {
  return {
    subject: `SOS ALERT: Urgent report from ${name}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>SOS Alert</title></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#DC2626;padding:24px 32px;">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#ffffff;">URGENT: SOS Report Received</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 8px;font-size:14px;color:#374151;"><strong>From:</strong> ${name} (${email})</p>
          <p style="margin:0 0 16px;font-size:14px;color:#6B7280;">Submitted just now via the platform SOS button.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF2F2;border-left:4px solid #DC2626;border-radius:6px;margin-bottom:16px;">
            <tr><td style="padding:16px 20px;font-size:15px;color:#1F2937;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#9CA3AF;">Please review this in the admin dashboard's SOS Reports tab as soon as possible.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}




