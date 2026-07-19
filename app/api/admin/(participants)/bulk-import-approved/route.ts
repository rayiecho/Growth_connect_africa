import { NextResponse } from "next/server";
import { d1Add, d1Query } from "@/lib/db/d1-admin";
import { computeCohort, nextReviewWindow } from "@/lib/engine/dates";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const PEOPLE: { email: string; submittedAt: string }[] = [
  { email: "ilemobayo.ayejuni@gmail.com", submittedAt: "2026-06-30" },
  { email: "iheanachograce5@gmail.com", submittedAt: "2026-06-30" },
  { email: "adelinus930@gmail.com", submittedAt: "2026-07-01" },
  { email: "kennetheniayeye@gmail.com", submittedAt: "2026-07-01" },
  { email: "kaotharjimoh2003@gmail.com", submittedAt: "2026-07-01" },
  { email: "georgejesse807@gmail.com", submittedAt: "2026-07-02" },
  { email: "victavon@gmail.com", submittedAt: "2026-07-02" },
  { email: "magbagbeolaoluwatoyin@gmail.com", submittedAt: "2026-07-03" },
  { email: "udydan001@gmail.com", submittedAt: "2026-07-03" },
  { email: "nwankwnmartha@gmail.com", submittedAt: "2026-07-03" },
  { email: "jovitaeboheboh@gmail.com", submittedAt: "2026-07-03" },
  { email: "officialmaryroseemeka@gmail.com", submittedAt: "2026-07-04" },
  { email: "aondoawasesefa@gmail.com", submittedAt: "2026-07-04" },
  { email: "franklinentah@gmail.com", submittedAt: "2026-07-06" },
  { email: "ayodeleifeoluwa20@gmail.com", submittedAt: "2026-07-06" },
  { email: "kingpatrick102@gmail.com", submittedAt: "2026-07-07" },
  { email: "a.nwadiuto@reestyl.com", submittedAt: "2026-07-07" },
  { email: "imisioluwaakintoye83@gmail.com", submittedAt: "2026-07-07" },
  { email: "Olajumoke.olas199@gmail.com", submittedAt: "2026-07-07" },
  { email: "Samson.Obadare@paypetal.africa", submittedAt: "2026-07-07" },
  { email: "elizabethwilliamsng@gmail.com", submittedAt: "2026-07-07" },
  { email: "dietwellconsults@gmail.com", submittedAt: "2026-07-07" },
  { email: "hradaramolasamson@gmail.com", submittedAt: "2026-07-07" },
  { email: "neltoby@gmail.com", submittedAt: "2026-07-08" },
  { email: "ajayisolomon22@gmail.com", submittedAt: "2026-07-08" },
  { email: "Bigtimmy0078@gmail.com", submittedAt: "2026-07-08" },
  { email: "Udofiapeace1996@gmail.com", submittedAt: "2026-07-08" },
  { email: "solozikedi@gmail.com", submittedAt: "2026-07-08" },
  { email: "sadebanjo92@gmail.com", submittedAt: "2026-07-09" },
  { email: "hopelifebridge@gmail.com", submittedAt: "2026-07-09" },
  { email: "ayaogedawodu@gmail.com", submittedAt: "2026-07-09" },
  { email: "tezzertech@gmail.com", submittedAt: "2026-07-09" },
  { email: "ronke.go@gmail.com", submittedAt: "2026-07-09" },
  { email: "contactmpfstudios91@gmail.com", submittedAt: "2026-07-09" },
  { email: "nuellasfoods@gmail.com", submittedAt: "2026-07-10" },
  { email: "alhassanadamwase@gmail.com", submittedAt: "2026-07-10" },
  { email: "kkiremodeventures@yahoo.com", submittedAt: "2026-07-11" },
  { email: "odhiamboregan6440@gmail.com", submittedAt: "2026-07-13" },
  { email: "tunejji@gmail.com", submittedAt: "2026-07-13" },
];

export const POST = withAdminAuth(async (req, session) => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const results = { created: 0, skippedExisting: 0, errors: [] as string[] };

  for (const person of PEOPLE) {
    const email = person.email.trim().toLowerCase();
    try {
      const existing = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: email }]);
      if (existing.length > 0) {
        results.skippedExisting++;
        continue;
      }

      const submittedDate = new Date(person.submittedAt);
      const videoInviteSentAt = new Date(submittedDate);
      videoInviteSentAt.setDate(videoInviteSentAt.getDate() - 1);
      const videoDeadline = new Date(submittedDate);
      videoDeadline.setDate(videoDeadline.getDate() + 5);

      const { id: applicantId } = await d1Add("applicants", {
        first_name: "Founder",
        last_name: "",
        email,
        phone: "",
        current_stage: "Video Pitch Approved",
        current_status: "Active",
        cohort: computeCohort(submittedDate),
        date_applied: submittedDate.toISOString(),
        submitted_at: submittedDate.toISOString(),

        video_invite_release_date: nextReviewWindow(submittedDate).toISOString().slice(0, 10),
        video_invite_sent_at: videoInviteSentAt.toISOString(),
        video_deadline_date: videoDeadline.toISOString().slice(0, 10),
        video_submitted_at: submittedDate.toISOString(),
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
        program_completed: false,
        trial_number: 1,
        cleared_for_reapply: false,
        imported_legacy: true,
      });

      await d1Add("video_submissions", {
        applicant_id: applicantId,
        applicant_first_name: "Founder",
        applicant_last_name: "",
        applicant_email: email,
        video_link: "",
        submitted_at: submittedDate.toISOString(),
        review_status: "approved",
        outcome_release_date: todayStr,
        outcome_sent_at: null,
        imported_legacy: true,
      });

      results.created++;
    } catch (err: any) {
      results.errors.push(`${email}: ${err.message}`);
    }
  }

  return NextResponse.json(results);
});
