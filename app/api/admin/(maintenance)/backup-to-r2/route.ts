import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const TABLES = [
  "applicants",
  "video_submissions",
  "verifications",
  "platform_users",
  "email_templates",
  "email_otps",
  "cron_run_log",
  "application_funnel_events",
  "call_notes",
  "contact_messages",
  "sos_reports",
  "chatbot_conversations",
  "email_conversations",
  "additional_details_submissions",
  "batch_links",
  "certificates",
  "rejection_followups",
];

export const POST = withAdminAuth(async (req, session) => {
  try {
    const cfContext = await getCloudflareContext();
    const env = (cfContext?.env || {}) as any;
    const db = env.launchpadx_db;
    const bucket = env.VERIFICATION_BUCKET;
    if (!db) return NextResponse.json({ error: "D1 database binding unavailable." }, { status: 500 });
    if (!bucket) return NextResponse.json({ error: "R2 bucket binding unavailable." }, { status: 500 });

    const timestamp = new Date().toISOString();
    const backupFolder = `d1-backups/${timestamp.slice(0, 10)}/${timestamp}`;
    const results: { table: string; rows: number; error?: string }[] = [];

    for (const table of TABLES) {
      try {
        const result = await db.prepare(`SELECT * FROM ${table}`).all();
        const rows = result.results || [];
        const key = `${backupFolder}/${table}.json`;
        await bucket.put(key, JSON.stringify(rows, null, 2), {
          httpMetadata: { contentType: "application/json" },
        });
        results.push({ table, rows: rows.length });
      } catch (err: any) {
        results.push({ table, rows: 0, error: err.message });
      }
    }

    const manifestKey = `${backupFolder}/_manifest.json`;
    await bucket.put(manifestKey, JSON.stringify({ timestamp, tables: results }, null, 2), {
      httpMetadata: { contentType: "application/json" },
    });

    return NextResponse.json({ success: true, timestamp, folder: backupFolder, tables: results });
  } catch (err: any) {
    console.error("backup-to-r2 failed:", err);
    return NextResponse.json({ error: err.message || "Backup failed." }, { status: 500 });
  }
});
