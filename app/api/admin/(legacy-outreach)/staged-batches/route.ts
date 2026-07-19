import { NextResponse } from "next/server";
import { d1GetAll, d1GetBatchLink } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

function rankBatches(allDates: string[], targetDates: string[]): Record<string, number> {
  const uniqueSorted = Array.from(new Set(allDates)).sort();
  const rankMap: Record<string, number> = {};
  uniqueSorted.forEach((d, i) => { rankMap[d] = i + 1; });
  const result: Record<string, number> = {};
  targetDates.forEach((d) => { result[d] = rankMap[d] ?? 0; });
  return result;
}

export const GET = withAdminAuth(async (req, session) => {
  try {
    const applicants = await d1GetAll("applicants");
    const applicantData = applicants.map((d) => ({ id: d.id, ...d.data() })) as any[];

    const videoSubs = await d1GetAll("video_submissions");
    const videoSubData = videoSubs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    const verifications = await d1GetAll("verifications");
    const verificationData = verifications.map((d) => ({ id: d.id, ...d.data() })) as any[];

    const pendingInvites = applicantData.filter(
      (a) => !a.video_invite_sent_at && a.video_invite_release_date
    );
    const inviteAllDates = applicantData.filter((a) => a.video_invite_release_date).map((a) => a.video_invite_release_date);
    const inviteRanks = rankBatches(inviteAllDates, pendingInvites.map((a) => a.video_invite_release_date));

    const inviteBatchesMap: Record<string, any> = {};
    for (const a of pendingInvites) {
      const date = a.video_invite_release_date;
      if (!inviteBatchesMap[date]) {
        inviteBatchesMap[date] = { batchNumber: inviteRanks[date], releaseDate: date, template: "video_invite", people: [] };
      }
      inviteBatchesMap[date].people.push({ id: a.id, name: `${a.first_name} ${a.last_name}`, email: a.email });
    }

    const pendingVideoOutcomes = videoSubData.filter(
      (s) => (s.review_status === "approved" || s.review_status === "rejected") && !s.outcome_sent_at
    );
    const videoOutcomeAllDates = videoSubData.filter((s) => s.outcome_release_date).map((s) => s.outcome_release_date);
    const videoOutcomeRanks = rankBatches(videoOutcomeAllDates, pendingVideoOutcomes.map((s) => s.outcome_release_date));

    const videoBatchesMap: Record<string, any> = {};
    for (const s of pendingVideoOutcomes) {
      const date = s.outcome_release_date;
      const key = `${date}-${s.review_status}`;
      if (!videoBatchesMap[key]) {
        videoBatchesMap[key] = {
          batchNumber: videoOutcomeRanks[date],
          releaseDate: date,
          outcome: s.review_status,
          template: s.review_status === "approved" ? "video_approved" : "video_rejected",
          whatsappLink: null,
          people: [],
        };
      }
      videoBatchesMap[key].people.push({ id: s.id, name: `${s.applicant_first_name} ${s.applicant_last_name}`, email: s.applicant_email });
    }
    for (const key in videoBatchesMap) {
      if (videoBatchesMap[key].outcome === "approved") {
        videoBatchesMap[key].whatsappLink = await d1GetBatchLink(videoBatchesMap[key].releaseDate);
      }
    }

    const pendingVerificationOutcomes = verificationData.filter(
      (v) => (v.review_status === "Approved" || v.review_status === "Rejected") && !v.outcome_sent_at
    );
    const verificationAllDates = verificationData.filter((v) => v.outcome_release_date).map((v) => v.outcome_release_date);
    const verificationRanks = rankBatches(verificationAllDates, pendingVerificationOutcomes.map((v) => v.outcome_release_date));

    const verificationBatchesMap: Record<string, any> = {};
    for (const v of pendingVerificationOutcomes) {
      const date = v.outcome_release_date;
      const key = `${date}-${v.review_status}`;
      if (!verificationBatchesMap[key]) {
        verificationBatchesMap[key] = {
          batchNumber: verificationRanks[date],
          releaseDate: date,
          outcome: v.review_status,
          template: v.review_status === "Approved" ? "verification_approved" : "verification_rejected",
          people: [],
        };
      }
      verificationBatchesMap[key].people.push({ id: v.id, name: `${v.applicant_first_name} ${v.applicant_last_name}`, email: v.email });
    }

    const legacyPending = applicantData.filter(
      (a) => a.pending_legacy_email && !a.legacy_email_sent_at
    );
    const legacyBatchesMap: Record<string, any> = {};
    for (const a of legacyPending) {
      const key = `${a.legacy_email_scheduled_date}-${a.pending_legacy_email}`;
      if (!legacyBatchesMap[key]) {
        legacyBatchesMap[key] = {
          releaseDate: a.legacy_email_scheduled_date,
          template: a.pending_legacy_email,
          people: [],
        };
      }
      legacyBatchesMap[key].people.push({ id: a.id, name: `${a.first_name} ${a.last_name}`, email: a.email });
    }

    return NextResponse.json({
      videoInvites: Object.values(inviteBatchesMap).sort((a: any, b: any) => a.batchNumber - b.batchNumber),
      videoDecisions: Object.values(videoBatchesMap).sort((a: any, b: any) => a.batchNumber - b.batchNumber),
      verificationDecisions: Object.values(verificationBatchesMap).sort((a: any, b: any) => a.batchNumber - b.batchNumber),
      legacyBatches: Object.values(legacyBatchesMap),
    });
  } catch (err) {
    console.error("staged-batches fetch failed:", err);
    return NextResponse.json({ error: "Failed to load staged batches." }, { status: 500 });
  }
});
