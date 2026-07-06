"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { ApplicantTable, Applicant } from "@/components/admin/ApplicantTable";
import { VideoSubmissionsTable, VideoSubmission } from "@/components/admin/VideoSubmissionsTable";

const STEPS = ["Applicants", "Video Submissions", "Verification", "Program Participants"];

// Stages that count as "in the program" — update this list once the
// verification pipeline assigns a real activation stage.
const PROGRAM_STAGES = ["Program Participant", "Active Program"];

export function DashboardTabs({
  applicants,
  videoSubmissions,
}: {
  applicants: Applicant[];
  videoSubmissions: VideoSubmission[];
}) {
  const [tab, setTab] = useState(0);

  const programParticipants = applicants.filter((a) =>
    PROGRAM_STAGES.includes(a.current_stage)
  );

  return (
    <div>
      <Tabs steps={STEPS} activeIndex={tab} onStepClick={setTab} />
      {tab === 0 && <ApplicantTable initialData={applicants} />}
      {tab === 1 && <VideoSubmissionsTable initialData={videoSubmissions} />}
      {tab === 2 && (
        <div className="rounded-lg border border-brand-line bg-white p-8 text-center text-brand-slate">
          <p className="font-medium text-brand-charcoal mb-1">
            Verification pipeline not yet built
          </p>
          <p className="text-sm">
            This tab will show LaunchPadX ID registration, payment status, and
            verification review once that stage is built (tables, form, and
            Paystack webhook).
          </p>
        </div>
      )}
      {tab === 3 && <ApplicantTable initialData={programParticipants} />}
    </div>
  );
}