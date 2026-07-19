import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { firestoreAdd, firestoreQuery } from "@/lib/firebase/firestore-rest";
import { nextReviewWindow, computeCohort } from "@/lib/engine/dates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const POST = withAdminAuth(async (req, session) => {
  try {
    const cfContext = await getCloudflareContext();
    const kv = (cfContext?.env as any)?.TOKEN_CACHE;
    if (!kv) return NextResponse.json({ error: "KV binding unavailable." }, { status: 500 });

    const listResult = await kv.list({ prefix: "pending_application:" });
    const keys = listResult?.keys || [];

    const results = { found: keys.length, reconciled: 0, errors: [] as string[] };

    for (const keyInfo of keys) {
      try {
        const raw = await kv.get(keyInfo.name);
        if (!raw) continue;
        const { body, email } = JSON.parse(raw);

        const existing = await firestoreQuery("applicants", [
          { field: "email", op: "EQUAL", value: email },
        ]);
        if (existing.length > 0) {
          await kv.delete(keyInfo.name);
          results.reconciled++;
          continue;
        }

        const now = new Date();
        const releaseDate = nextReviewWindow(now);
        await firestoreAdd("applicants", {
          ...body,
          email,
          email_verified: false,
          submitted_at: now.toISOString(),
          date_applied: now.toISOString(),
          current_stage: "Application Submitted",
          current_status: "Active",
          cohort: computeCohort(now),
          video_invite_release_date: releaseDate.toISOString().slice(0, 10),
          video_invite_sent_at: null,
          video_deadline_date: null,
          video_submitted_at: null,
          video_reminder_2_sent: false,
          video_reminder_4_sent: false,
          video_reminder_deadline_sent: false,
          verification_invite_sent_at: null,
          verification_deadline_date: null,
          verification_submitted_at: null,
          verification_reminder_2_sent: false,
          verification_reminder_4_sent: false,
          verification_reminder_6_sent: false,
          verification_reminder_8_sent: false,
          verification_reminder_10_sent: false,
          lpx_id: null,
          lpx_id_generated_at: null,
          program_completed: false,
          program_completed_at: null,
          certificate_code: null,
          trial_number: 1,
          cleared_for_reapply: false,
          trial_history: [],
        });

        await kv.delete(keyInfo.name);
        results.reconciled++;
      } catch (err: any) {
        results.errors.push(`${keyInfo.name}: ${err.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("reconcile-pending-applications failed:", err);
    return NextResponse.json({ error: err.message || "Reconciliation failed." }, { status: 500 });
  }
});
