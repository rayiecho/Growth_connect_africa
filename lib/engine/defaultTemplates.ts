export interface EmailTemplateDefault {
  name: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
}

const NAIRA = "\u20A6";
const EMOJI = {
  party: "\u{1F389}",
  check: "\u2705",
  money: "\u{1F4B0}",
  bank: "\u{1F3E6}",
  globe: "\u{1F30D}",
  mic: "\u{1F3A4}",
  rocket: "\u{1F680}",
  hourglass: "\u23F3",
};
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
const SITE_URL = "https://lpx.growthconnect.africa";

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
function replyLine(context: string): string {
  return p(`Have a question or something to share? <a href="${SITE_URL}/reply?email={{email}}&context=${context}" style="color:#31ad7c;">Reply to us</a>.`);
}

export const DEFAULT_TEMPLATES: Record<string, EmailTemplateDefault> = {
  admin_email_verification: {
    name: "Admin - Email Verification",
    subject: "Verify Your Email - LaunchPadX Admin Access",
    variables: ["verification_link"],
    bodyHtml: `
      ${p("Hello,")}
      ${p("You've been granted admin access to the LaunchPadX dashboard. Before you can log in, please verify your email address.")}
      ${button("Verify My Email", "{{verification_link}}")}
      ${p("If you did not expect this, you can safely ignore this email.")}
      ${p("Warm regards,<br/>GrowthConnect Team")}
    `,
  },
  legacy_welcome_accepted: {
    name: "Legacy Batch - Welcome to the Program",
    subject: `${EMOJI.party} Welcome to LaunchpadX! Your Next Steps into the Accelerator`,
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Dear participant,")}
      ${p("<strong>Congratulations!</strong>")}
      ${p("We're excited to let you know that your Founder & Business Verification has been successfully completed.")}
      ${p("Following our 7-business-day review process, during which our team carefully reviewed and verified the information you submitted, you have now been officially admitted into the LaunchpadX Accelerator Program.")}
      ${p("Welcome to the community of founders building solutions that create lasting impact across Africa.")}
      ${p("<strong>Your Next Steps</strong>")}
      ${p("To ensure every founder starts with the right foundation, there are a few onboarding steps you'll need to complete before beginning the Accelerator.")}
      ${h3("Step 1: Join the LaunchpadX Founder Community")}
      ${p("This is where you'll receive:")}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#374151;line-height:1.8;">
        <li>Program updates</li>
        <li>Cohort announcements</li>
        <li>Important timelines</li>
        <li>Live session reminders</li>
        <li>Funding and partnership opportunities</li>
        <li>Founder discussions and support</li>
      </ul>
      ${button("Join the Founder Community", LINKS.founderCommunity)}
      ${h3("Step 2: Follow Our WhatsApp Channel")}
      ${p("We regularly share announcements, opportunities, founder resources, and important program updates through our official WhatsApp Channel.")}
      ${button("Follow the Channel", LINKS.communityChannel)}
      ${p("<strong>Important:</strong> After following the channel, please turn on notifications so you don't miss important updates.")}
      ${h3("Step 3: Follow Growth Connect")}
      ${p("Stay connected with our latest opportunities, founder stories, resources, and ecosystem updates.")}
      ${p(`<a href="${LINKS.instagram}" style="color:#31ad7c;">Instagram</a> &middot; <a href="${LINKS.linkedin}" style="color:#31ad7c;">LinkedIn</a>`)}
      ${h3("Step 4: Complete the LaunchpadX Orientation")}
      ${p("Before you can access the Accelerator, every founder is required to complete the LaunchpadX Orientation Program.")}
      ${button("Access the Orientation", LINKS.orientation)}
      ${p("<strong>If you are new to the platform:</strong> Open the Orientation link, click Enroll in This Course, create your account by completing the registration form, log in to your new account, click Take This Course, and complete the Orientation.")}
      ${p("<strong>If you already have an account:</strong> Open the Orientation link, click Enroll in This Course, log in using your existing account, click Take This Course, and complete the Orientation.")}
      ${p("If you leave before finishing, simply log back in and click Resume Course to continue where you stopped.")}
      ${h3("Step 5: Access the LaunchpadX Accelerator")}
      ${p("Once you've completed the Orientation, you'll automatically be ready to begin the main LaunchpadX Accelerator.")}
      ${button("Go to the Accelerator", LINKS.accelerator)}
      ${p("The Accelerator can only be accessed after successfully completing the Orientation Program.")}
      ${h3("Step 6: Let Us Know You've Completed the Orientation")}
      ${p("After completing the Orientation Program, simply reply to this email letting us know you've finished. Our team will acknowledge your completion and send you the next set of instructions to help you get started successfully in the Accelerator.")}
      ${h3("Update Your LaunchPadX ID")}
      ${button("Update Your ID", `${SITE_URL}/id`)}
      ${h3("Update Your Details")}
      ${p("Please fill in your details so we can complete your record correctly.")}
      ${button("Update My Details", `${SITE_URL}/update-details?email={{email}}`)}
      ${replyLine("legacy_welcome_accepted")}
      ${p("<strong>What to Expect</strong>")}
      ${p("Over the coming weeks, you'll work through a structured founder journey designed to help you:")}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#374151;line-height:1.8;">
        <li>Build a stronger business foundation</li>
        <li>Validate and strengthen your business model</li>
        <li>Develop systems for sustainable growth</li>
        <li>Position your business for customers, partnerships, and investment</li>
        <li>Connect with a growing network of ambitious African founders</li>
      </ul>
      ${p("We're excited to have you join the LaunchpadX community and look forward to supporting you throughout your entrepreneurial journey.")}
      ${p("Welcome once again - we're glad you're here.")}
      ${p("Warm regards,<br/>Growth Connect Team<br/>LaunchpadX Accelerator<br/>Building Africa's Next Generation of High-Impact Founders")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:6px;margin:20px 0 0;"><tr><td style="padding:16px 20px;font-size:13px;color:#1F2937;line-height:1.6;">
        If you have received a different or conflicting email from us before this one, please disregard it - this email reflects your correct, current status.
      </td></tr></table>
    `,
  },
  legacy_update_id: {
    name: "Legacy Batch - Update Your ID",
    subject: "UPDATE YOUR LAUNCHPADX PROGRAM PROFILE",
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("As a recognized LaunchPadX Program Participant, here is a reminder of your program access, along with a request to update your ID and details in our system.")}
      ${h3("Accelerator")}
      ${button("Go to the Accelerator", LINKS.accelerator)}
      ${h3("Update Your LaunchPadX ID")}
      ${button("Update My ID", `${SITE_URL}/id`)}
      ${h3("Update Your Details")}
      ${p("Please fill in your details so we can complete your record correctly.")}
      ${button("Update My Details", `${SITE_URL}/update-details?email={{email}}`)}
      ${replyLine("legacy_update_id")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:6px;margin:20px 0 0;"><tr><td style="padding:16px 20px;font-size:13px;color:#1F2937;line-height:1.6;">
        If you have received a different or conflicting email from us before this one, please disregard it - this email reflects your correct, current status.
      </td></tr></table>
    `,
  },
  legacy_correction_welcome: {
    name: "Legacy Correction - Program Acceptance",
    subject: "Important Correction: Your LaunchPadX Acceptance",
    variables: ["first_name", "lpx_id", "email"],
    bodyHtml: `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:6px;margin:0 0 20px;"><tr><td style="padding:16px 20px;font-size:14px;color:#1F2937;line-height:1.6;">
        <strong>Please disregard our previous email</strong> that mentioned verification steps and a processing payment. That message was sent in error. This corrected email reflects your actual status below.
      </td></tr></table>
      ${p("Dear {{first_name}},")}
      ${p("Congratulations! You have been officially accepted into the LaunchPadX Program.")}
      ${p("<strong>Your LaunchPadX ID:</strong> {{lpx_id}}")}
      ${p("No further verification steps or payment are required. Please take a moment to log in and update your profile details (name, business name, phone) to make sure everything matches our records correctly.")}
      ${button("Update My Profile", `${SITE_URL}/id`)}
      ${p("We apologize for any confusion caused, and we're excited to have you with us.")}
      ${replyLine("legacy_correction_welcome")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  legacy_participant_welcome: {
    name: "Legacy Participant Welcome",
    subject: "Your LaunchPadX Program Participant Status - Important Update",
    variables: ["first_name", "lpx_id", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("We're excited to let you know that our LaunchPadX systems have been upgraded. As a recognized Program Participant, we've set up your account in our new system so you can continue accessing everything smoothly.")}
      ${p("<strong>Your LaunchPadX ID:</strong> {{lpx_id}}")}
      ${p("Please take a moment to log in and update your profile details (name, phone, LinkedIn) to make sure everything matches our records correctly.")}
      ${button("Update My Profile", `${SITE_URL}/id`)}
      ${p("If you have any questions, feel free to reach out to our team.")}
      ${replyLine("legacy_participant_welcome")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  application_received: {
    name: "Application Received",
    subject: `${EMOJI.party} Idea Submitted Successfully - Welcome to LaunchPadX`,
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Hello Founder,")}
      ${p("<strong>Your application has been successfully received.</strong>")}
      ${p("Our review team assesses applications every <strong>Tuesday</strong> and <strong>Friday</strong>. If selected, you'll be invited to the next stage of qualification, where you'll submit your Founder Video Pitch.")}
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
      ${replyLine("application_received")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  video_invite: {
    name: "Video Pitch Invitation",
    subject: "Congratulations! You've Been Selected for the Founder Assessment Stage",
    variables: ["first_name", "deadline_date", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("Congratulations! Following a review of your application, you have been selected to proceed to the Founder Assessment (Video Pitch) Stage of the LaunchPadX qualification process.")}
      ${p("<strong>Instructions for this stage:</strong>")}
      ${p("Record a short video introducing yourself, your business, the problem you are solving, your customers, and why you would like to participate in LaunchPadX. Upload it to YouTube as an Unlisted video, copy the link, and submit it below.")}
      ${h3("Video Guidelines")}
      ${p("Record a simple video using your phone or computer. 2-3 minutes is sufficient. No editing or professional production is required. Clarity and authenticity matter more than presentation quality.")}
      ${button("Submit Your Video Pitch", `${SITE_URL}/video-pitch`)}
      ${p(`<strong>Submission Deadline:</strong> all video submissions must be received on or before 11:59pm (WAT), <strong>{{deadline_date}}</strong>. Submissions will close after this deadline.`)}
      ${p("Join the community for updates while you prepare:")}
      ${button("Join the Community", LINKS.communityChannel)}
      ${replyLine("video_invite")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  video_received: {
    name: "Video Pitch Received",
    subject: `Your LaunchPadX Video Pitch Has Been Received ${EMOJI.check}`,
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Hi {{first_name}},")}
      ${p("Thank you for completing and submitting your Founder Assessment. We have successfully received your video submission, and it has been added to the review queue.")}
      ${p("Assessments are reviewed every <strong>Tuesday</strong> and <strong>Friday</strong>, and you will receive feedback after the next review cycle.")}
      ${h3("What Happens Next?")}
      ${p("Successful founders will be invited to proceed to the Founder Verification Stage.")}
      ${replyLine("video_received")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  video_approved: {
    name: "Video Approved - Verification Invite",
    subject: "Congratulations! Welcome to LaunchPadX - Complete Your Founder Verification",
    variables: ["first_name", "whatsapp_link", "deadline_date", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("Congratulations! You have been accepted into the LaunchPadX Program.")}
      ${p("<strong>Deadline for all verification steps: {{deadline_date}}.</strong>")}
      ${h3("Step 1: Join the Founder Verification Community (Required)")}
      ${button("Join the Verification Community", "{{whatsapp_link}}")}
      ${h3("Step 2: Get Your LaunchPadX ID")}
      ${button("Get Your LaunchPadX ID", `${SITE_URL}/id`)}
      ${h3("Step 3: Complete Your Founder & Business Verification")}
      ${p(`Verification processing fee: ${NAIRA}10,500.`)}
      ${button("Make Your Verification Payment", LINKS.verificationPayment)}
      ${h3("Step 4: Complete the Verification Form")}
      ${button("Download Verification Form", LINKS.verificationFormDownload)}
      ${h3("Step 5: Submit Your Verification Form")}
      ${button("Submit Your Verification", `${SITE_URL}/verification`)}
      ${p("For a detailed walkthrough of every step, visit our full guide:")}
      ${button("View Full Verification Guide", `${SITE_URL}/verification-guide`)}
      ${replyLine("video_approved")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  video_rejected: {
    name: "Video Rejected",
    subject: "Update on Your LaunchPadX Video Pitch",
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("Thank you for taking the time to submit your Founder Assessment video pitch. After careful review, we're unable to move forward with your application in this cohort.")}
      ${button("Join the Community", LINKS.communityChannel)}
      ${p("Would you like us to follow up with you about future opportunities and the latest news from GrowthConnect?")}
      <table cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr>
        <td style="background:#31ad7c;border-radius:8px;margin-right:8px;"><a href="${SITE_URL}/api/public/rejection-followup?email={{email}}&stage=video&response=yes" style="display:inline-block;padding:10px 20px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">Yes, keep me updated</a></td>
        <td width="12"></td>
        <td style="background:#E5E7EB;border-radius:8px;"><a href="${SITE_URL}/api/public/rejection-followup?email={{email}}&stage=video&response=no" style="display:inline-block;padding:10px 20px;font-size:14px;font-weight:bold;color:#374151;text-decoration:none;">No, thanks</a></td>
      </tr></table>
      ${replyLine("video_rejected")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  verification_received: {
    name: "Verification Received",
    subject: "Founder Verification Submitted - Under Review",
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("Thank you for submitting your Founder & Business Verification Form. We have successfully received your submission and it has been forwarded to our verification partners for processing.")}
      ${p(`${EMOJI.hourglass} Verification typically takes up to <strong>7 working days</strong> to complete.`)}
      ${replyLine("verification_received")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  verification_approved: {
    name: "Verification Approved - Program Welcome",
    subject: `${EMOJI.party} Welcome to LaunchpadX! Your Next Steps into the Accelerator`,
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Dear participant,")}
      ${p("<strong>Congratulations!</strong>")}
      ${p("We're excited to let you know that your Founder & Business Verification has been successfully completed.")}
      ${p("Following our 7-business-day review process, during which our team carefully reviewed and verified the information you submitted, you have now been officially admitted into the LaunchpadX Accelerator Program.")}
      ${p("Welcome to the community of founders building solutions that create lasting impact across Africa.")}
      ${p("<strong>Your Next Steps</strong>")}
      ${p("To ensure every founder starts with the right foundation, there are a few onboarding steps you'll need to complete before beginning the Accelerator.")}
      ${h3("Step 1: Join the LaunchpadX Founder Community")}
      ${p("This is where you'll receive:")}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#374151;line-height:1.8;">
        <li>Program updates</li>
        <li>Cohort announcements</li>
        <li>Important timelines</li>
        <li>Live session reminders</li>
        <li>Funding and partnership opportunities</li>
        <li>Founder discussions and support</li>
      </ul>
      ${button("Join the Founder Community", LINKS.founderCommunity)}
      ${h3("Step 2: Follow Our WhatsApp Channel")}
      ${p("We regularly share announcements, opportunities, founder resources, and important program updates through our official WhatsApp Channel.")}
      ${button("Follow the Channel", LINKS.communityChannel)}
      ${p("<strong>Important:</strong> After following the channel, please turn on notifications so you don't miss important updates.")}
      ${h3("Step 3: Follow Growth Connect")}
      ${p("Stay connected with our latest opportunities, founder stories, resources, and ecosystem updates.")}
      ${p(`<a href="${LINKS.instagram}" style="color:#31ad7c;">Instagram</a> &middot; <a href="${LINKS.linkedin}" style="color:#31ad7c;">LinkedIn</a>`)}
      ${h3("Step 4: Complete the LaunchpadX Orientation")}
      ${p("Before you can access the Accelerator, every founder is required to complete the LaunchpadX Orientation Program.")}
      ${button("Access the Orientation", LINKS.orientation)}
      ${p("<strong>If you are new to the platform:</strong> Open the Orientation link, click Enroll in This Course, create your account by completing the registration form, log in to your new account, click Take This Course, and complete the Orientation.")}
      ${p("<strong>If you already have an account:</strong> Open the Orientation link, click Enroll in This Course, log in using your existing account, click Take This Course, and complete the Orientation.")}
      ${p("If you leave before finishing, simply log back in and click Resume Course to continue where you stopped.")}
      ${h3("Step 5: Access the LaunchpadX Accelerator")}
      ${p("Once you've completed the Orientation, you'll automatically be ready to begin the main LaunchpadX Accelerator.")}
      ${button("Go to the Accelerator", LINKS.accelerator)}
      ${p("The Accelerator can only be accessed after successfully completing the Orientation Program.")}
      ${h3("Step 6: Let Us Know You've Completed the Orientation")}
      ${p("After completing the Orientation Program, simply reply to this email letting us know you've finished. Our team will acknowledge your completion and send you the next set of instructions to help you get started successfully in the Accelerator.")}
      ${replyLine("verification_approved")}
      ${p("<strong>What to Expect</strong>")}
      ${p("Over the coming weeks, you'll work through a structured founder journey designed to help you:")}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#374151;line-height:1.8;">
        <li>Build a stronger business foundation</li>
        <li>Validate and strengthen your business model</li>
        <li>Develop systems for sustainable growth</li>
        <li>Position your business for customers, partnerships, and investment</li>
        <li>Connect with a growing network of ambitious African founders</li>
      </ul>
      ${p("We're excited to have you join the LaunchpadX community and look forward to supporting you throughout your entrepreneurial journey.")}
      ${p("Welcome once again - we're glad you're here.")}
      ${p("Warm regards,<br/>Growth Connect Team<br/>LaunchpadX Accelerator<br/>Building Africa's Next Generation of High-Impact Founders")}
    `,
  },
  verification_rejected: {
    name: "Verification Rejected",
    subject: "Update on Your LaunchPadX Verification",
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("After review, we're unable to approve your verification at this time.")}
      ${p("If you believe this is in error or have questions about the outcome, please reach out to our team.")}
      ${p("Would you like us to follow up with you about future opportunities and the latest news from GrowthConnect?")}
      <table cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr>
        <td style="background:#31ad7c;border-radius:8px;margin-right:8px;"><a href="${SITE_URL}/api/public/rejection-followup?email={{email}}&stage=verification&response=yes" style="display:inline-block;padding:10px 20px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">Yes, keep me updated</a></td>
        <td width="12"></td>
        <td style="background:#E5E7EB;border-radius:8px;"><a href="${SITE_URL}/api/public/rejection-followup?email={{email}}&stage=verification&response=no" style="display:inline-block;padding:10px 20px;font-size:14px;font-weight:bold;color:#374151;text-decoration:none;">No, thanks</a></td>
      </tr></table>
      ${replyLine("verification_rejected")}
      ${p("Warm regards,<br/>GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  video_action_required: {
    name: "Video Pitch - Action Required",
    subject: "Action Required on Your LaunchPadX Video Pitch",
    variables: ["first_name", "feedback", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("Thank you for submitting your Founder Assessment video pitch. Our review team has identified something that needs to be addressed before we can proceed with your review.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:6px;margin:0 0 16px;"><tr><td style="padding:16px 20px;font-size:15px;color:#1F2937;line-height:1.6;white-space:pre-wrap;">{{feedback}}</td></tr></table>
      ${p("Please resubmit your video pitch using the same email address as soon as possible.")}
      ${button("Resubmit Your Video Pitch", `${SITE_URL}/video-pitch`)}
      ${replyLine("video_action_required")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  verification_action_required: {
    name: "Verification - Action Required",
    subject: "Action Required on Your LaunchPadX Verification",
    variables: ["first_name", "feedback", "email"],
    bodyHtml: `
      ${p("Dear {{first_name}},")}
      ${p("Thank you for submitting your Founder & Business Verification. Our review team has identified something that needs to be addressed before we can proceed with your review.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:6px;margin:0 0 16px;"><tr><td style="padding:16px 20px;font-size:15px;color:#1F2937;line-height:1.6;white-space:pre-wrap;">{{feedback}}</td></tr></table>
      ${p("Please resubmit your verification using the same email address as soon as possible.")}
      ${button("Resubmit Your Verification", `${SITE_URL}/verification`)}
      ${replyLine("verification_action_required")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  video_reminder: {
    name: "Video Reminder",
    subject: "Reminder: Submit Your LaunchPadX Video Pitch",
    variables: ["first_name", "deadline_date", "days_remaining", "email"],
    bodyHtml: `
      ${p("Hi {{first_name}},")}
      ${p("This is a reminder that your LaunchPadX Founder Assessment video pitch is due by <strong>{{deadline_date}}</strong> ({{days_remaining}} days remaining).")}
      ${button("Submit Your Video Pitch", `${SITE_URL}/video-pitch`)}
      ${p("If you've already submitted, please disregard this reminder.")}
      ${replyLine("video_reminder")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  video_reminder_final: {
    name: "Video Reminder (Final Day)",
    subject: "Final Reminder: Your Video Pitch Deadline Is Today",
    variables: ["first_name", "deadline_date", "email"],
    bodyHtml: `
      ${p("Hi {{first_name}},")}
      ${p("Today, <strong>{{deadline_date}}</strong>, is the deadline to submit your LaunchPadX Founder Assessment video pitch.")}
      ${button("Submit Your Video Pitch", `${SITE_URL}/video-pitch`)}
      ${replyLine("video_reminder_final")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  verification_reminder: {
    name: "Verification Reminder",
    subject: "Reminder: Complete Your LaunchPadX Verification",
    variables: ["first_name", "deadline_date", "days_remaining", "email"],
    bodyHtml: `
      ${p("Hi {{first_name}},")}
      ${p("This is a reminder that your Founder & Business Verification is due by <strong>{{deadline_date}}</strong> ({{days_remaining}} days remaining).")}
      ${button("Submit Your Verification", `${SITE_URL}/verification`)}
      ${replyLine("verification_reminder")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  verification_reminder_final: {
    name: "Verification Reminder (Final Day)",
    subject: "Final Reminder: Your Verification Deadline Is Today",
    variables: ["first_name", "deadline_date", "email"],
    bodyHtml: `
      ${p("Hi {{first_name}},")}
      ${p("Today, <strong>{{deadline_date}}</strong>, is the deadline to submit your Founder & Business Verification.")}
      ${button("Submit Your Verification", `${SITE_URL}/verification`)}
      ${replyLine("verification_reminder_final")}
      ${p("GrowthConnect Team<br/>LaunchPadX Program")}
    `,
  },
  non_applicant_followup: {
    name: "Non-Applicant Follow-Up",
    subject: "Have you considered applying to LaunchPadX?",
    variables: ["first_name", "email"],
    bodyHtml: `
      ${p("Hi {{first_name}},")}
      ${p("We wanted to reach out and let you know about LaunchPadX - a free qualification and business growth pipeline designed to help entrepreneurs move from ideas, to structure, to opportunities, to funding and scale.")}
      ${p("If you have a business idea or an existing business you would like to grow, we would love for you to apply.")}
      ${button("Apply to LaunchPadX", `${SITE_URL}/apply`)}
      ${replyLine("non_applicant_followup")}
      ${p("Warm regards,<br/>GrowthConnect Team")}
    `,
  },
};















