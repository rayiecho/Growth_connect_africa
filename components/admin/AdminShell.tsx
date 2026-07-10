"use client";

import { useState } from "react";
import { AdminSidebar, type Section } from "@/components/admin/AdminSidebar";
import { ApplicantTable } from "@/components/admin/ApplicantTable";
import { VideoSubmissionsTable } from "@/components/admin/VideoSubmissionsTable";
import { VerificationsTable } from "@/components/admin/VerificationsTable";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import type { Applicant, VideoSubmission, Verification } from "@/lib/firebase/types";

const PROGRAM_STAGES = ["Program Participant", "Active Program"];

export function AdminShell({
  applicants,
  videoSubmissions,
  verifications,
}: {
  applicants: Applicant[];
  videoSubmissions: VideoSubmission[];
  verifications: Verification[];
}) {
  const [section, setSection] = useState<Section>("review");
  const [reviewTab, setReviewTab] = useState(0);

  const programParticipants = applicants.filter((a) => PROGRAM_STAGES.includes(a.current_stage));

  return (
    <div className="flex">
      <AdminSidebar
        section={section}
        onSectionChange={setSection}
        reviewTab={reviewTab}
        onReviewTabChange={setReviewTab}
      />
      <div className="flex-1 px-8 py-8">
        {section === "review" && (
          <>
            {reviewTab === 0 && <ApplicantTable initialData={applicants} />}
            {reviewTab === 1 && <VideoSubmissionsTable initialData={videoSubmissions} />}
            {reviewTab === 2 && <VerificationsTable initialData={verifications} />}
            {reviewTab === 3 && <ApplicantTable initialData={programParticipants} />}
          </>
        )}
        {section === "analytics" && (
          <AnalyticsPanel applicants={applicants} videoSubmissions={videoSubmissions} verifications={verifications} />
        )}
        {section === "users" && <UsersPanel applicants={applicants} />}
      </div>
    </div>
  );
}
