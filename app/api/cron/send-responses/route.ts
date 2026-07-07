import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/engine/supabaseAdmin";
import { sendEmail } from "@/lib/engine/ses";

// GET /api/cron/send-responses?secret=...
//
// Runs every Tuesday & Friday at midnight CAT (UTC+2).
// Vercel Cron Job: add to vercel.json — see bottom of this file.
// Checks all queued responses whose scheduled_send_date = today,
// fires them via AWS SES, then marks them sent and logs to send_log.

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // CAT = UTC+2, so midnight CAT = 22:00 UTC the day before.
  // We use today's UTC date for the date-only comparison.
  const todayUtc = new Date();
  const todayCat = new Date(todayUtc.getTime() + 2 * 60 * 60 * 1000);
  const todayStr = todayCat.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const results = {
    sent: 0,
    skipped: 0,
    errors: [] as string[],
    runAt: new Date().toISOString(),
    scheduledDate: todayStr,
  };

  // Fetch all queued records scheduled for today
  const { data: queued, error: fetchError } = await supabaseAdmin
    .from("applicants")
    .select(
      "id, email, first_name, admin_response, scheduled_send_date, current_stage"
    )
    .eq("email_response_status", "queued")
    .eq("scheduled_send_date", todayStr);

  if (fetchError) {
    results.errors.push(`Fetch error: ${fetchError.message}`);
    return NextResponse.json(results, { status: 500 });
  }

  if (!queued || queued.length === 0) {
    return NextResponse.json({ ...results, message: "No responses due today." });
  }

  for (const row of queued) {
    try {
      if (!row.admin_response?.trim()) {
        results.skipped++;
        continue;
      }

      const subject =
        row.current_stage === "Rejected Application"
          ? "Update on Your LaunchPadX Application"
          : "Update on Your LaunchPadX Application";

      const html = buildResponseEmail({
        firstName: row.first_name ?? "Applicant",
        response: row.admin_response.trim(),
      });

      await sendEmail({
        to: row.email,
        subject,
        html,
      });

      // Mark sent
      await supabaseAdmin
        .from("applicants")
        .update({
          email_response_status: "sent",
          last_updated: new Date().toISOString(),
        })
        .eq("id", row.id);

      // Log
      await supabaseAdmin.from("send_log").insert({
        applicant_id: row.id,
        template_key: "application_response",
      });

      results.sent++;
    } catch (err: any) {
      results.errors.push(`${row.email}: ${err.message}`);
    }
  }

  return NextResponse.json(results);
}

// ── Email HTML template ───────────────────────────────────────────────────────

function buildResponseEmail({
  firstName,
  response,
}: {
  firstName: string;
  response: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LaunchPadX Application Update</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#16A34A;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:-0.3px;">
                GrowthConnect Africa
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#BBF7D0;">
                LaunchPadX Programme
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">
                Dear ${firstName},
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                Thank you for taking the time to apply to LaunchPadX. After careful review of your application, we have an update for you.
              </p>

              <!-- Response box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-left:4px solid #16A34A;border-radius:6px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;font-size:15px;color:#1F2937;line-height:1.7;white-space:pre-wrap;">
${escapeHtml(response)}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.6;">
                If you have any questions or would like to discuss your application further, please reply to this email — our team is happy to help.
              </p>
              <p style="margin:0;font-size:14px;color:#6B7280;">
                Warm regards,<br />
                <strong style="color:#374151;">The LaunchPadX Review Team</strong><br />
                GrowthConnect Africa
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F3F4F6;padding:20px 40px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
                © ${new Date().getFullYear()} GrowthConnect Africa. All rights reserved.<br />
                You received this email because you applied to LaunchPadX.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br />");
}

/*
====================================================================
VERCEL CRON SETUP — add this to vercel.json in the project root:
====================================================================

{
  "crons": [
    {
      "path": "/api/cron/send-responses",
      "schedule": "0 22 * * 2,5"
    }
  ]
}

Explanation:
  - "0 22 * * 2,5" = 22:00 UTC every Tuesday (2) and Friday (5)
  - 22:00 UTC = 00:00 CAT (UTC+2) — exactly midnight Central Africa Time
  - The CRON_SECRET env var must be set in Vercel Project Settings
====================================================================
*/
