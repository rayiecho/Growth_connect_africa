import { getAdminDatabase } from "../admin";
import { RT } from "./_references";

export type EngineRunInput = {
  videoInvitesSent: number;
  verificationInvitesSent: number;
  trainingEmailsSent?: number;
  errors: Array<{ stage: string; message: string; applicantId?: string }>;
};

/**
 * Writes a run-summary record to /engineRunLog. Only called when there
 * were errors, mirroring the existing behavior in run-review-batch.
 *
 * The full counter set is captured for diagnostics, even though only
 * errorCount + errors are tracked for alerting purposes.
 */
export async function logRun(input: EngineRunInput): Promise<void> {
  if (input.errors.length === 0) return; // mirror existing guard
  const db = getAdminDatabase();
  const ref_ = db.ref(RT.engineRunLog).push();
  await ref_.set({
    id: ref_.key,
    ranAt: new Date().toISOString(),
    videoInvitesSent: input.videoInvitesSent,
    verificationInvitesSent: input.verificationInvitesSent,
    trainingEmailsSent: input.trainingEmailsSent ?? 0,
    errorCount: input.errors.length,
    errors: input.errors,
  });
}
