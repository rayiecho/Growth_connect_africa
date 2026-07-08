import { getAdminDatabase } from "../admin";
import { RT } from "./_references";
import type { VerificationBatch } from "../types";

/**
 * Returns the latest verification batch whose batch_date is <= today.
 * Replaces the Supabase query:
 *   order(batch_date desc).limit(1).lte(batch_date, today).single()
 *
 * RTDB ordering is by string comparison, so YYYY-MM-DD format means
 * lexical comparison works for date math — no special handling needed.
 */
export async function getActiveBatch(todayStr: string): Promise<VerificationBatch | null> {
  const db = getAdminDatabase();
  const snap = await db
    .ref(RT.verificationBatches)
    .orderByChild("batchDate")
    .endAt(todayStr)
    .limitToLast(1)
    .get();
  if (!snap.exists()) return null;
  const [id, batch] = Object.entries(snap.val() as Record<string, VerificationBatch>)[0]!;
  return { ...batch, id };
}
