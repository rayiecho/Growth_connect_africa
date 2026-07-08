import { getAdminDatabase } from "../admin";
import { RT } from "./_references";
import type { ApplicantId, TemplateKey } from "../types";

/**
 * Append-only send log. Each entry is one email sent, used for
 * audit + dedup of cron work.
 */
export async function logSend(
  applicantId: ApplicantId,
  templateKey: TemplateKey
): Promise<void> {
  const db = getAdminDatabase();
  const ref_ = db.ref(RT.sendLog).push();
  await ref_.set({
    id: ref_.key,
    applicantId,
    templateKey,
    sentAt: new Date().toISOString(),
  });
}
