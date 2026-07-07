"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { ApplicantTable, Applicant } from "@/components/admin/ApplicantTable";
import { VideoSubmissionsTable, VideoSubmission } from "@/components/admin/VideoSubmissionsTable";
import { VerificationsTable, Verification } from "@/components/admin/VerificationsTable";

const STEPS = ["Applicants", "Video Submissions", "Verification", "Program Participants"];

// Stages that count as "in the program" — update this list once the
// verification pipeline assigns a real activation stage.
const PROGRAM_STAGES = ["Program Participant", "Active Program"];

export function DashboardTabs({
  applicants,
  videoSubmissions,
  verifications,
}: {
  applicants: Applicant[];
  videoSubmissions: VideoSubmission[];
  verifications: Verification[];
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
      {tab === 2 && <VerificationsTable initialData={verifications} />}
      {tab === 3 && <ApplicantTable initialData={programParticipants} />}
    </div>
  );
}