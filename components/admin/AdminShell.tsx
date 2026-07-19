"use client";
import { useState, useEffect } from "react";
import { AdminSidebar, type Section } from "@/components/admin/AdminSidebar";
import { ApplicantTable } from "@/components/admin/ApplicantTable";
import { VideoSubmissionsTable } from "@/components/admin/VideoSubmissionsTable";
import { VerificationsTable } from "@/components/admin/VerificationsTable";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { SupportPanel } from "@/components/admin/SupportPanel";
import { EmailTemplatesPanel } from "@/components/admin/EmailTemplatesPanel";
import { StagedBatchesPanel } from "@/components/admin/StagedBatchesPanel";
import { AdditionalDetailsPanel } from "@/components/admin/AdditionalDetailsPanel";
import { CallLogPanel } from "@/components/admin/CallLogPanel";
import { CallNotesPanel } from "@/components/admin/CallNotesPanel";
import { ComposeEmailPanel } from "@/components/admin/ComposeEmailPanel";
import { FollowupBatchesPanel } from "@/components/admin/FollowupBatchesPanel";
import { FunnelAnalyticsPanel } from "@/components/admin/FunnelAnalyticsPanel";
import type { Applicant, VideoSubmission, Verification } from "@/lib/db/types";

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
  const [visited, setVisited] = useState<Set<Section>>(new Set(["review"]));
  const [programParticipants, setProgramParticipants] = useState<Applicant[]>([]);
  const [participantsStatus, setParticipantsStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");

  function loadParticipants() {
    setParticipantsStatus("loading");
    fetch("/api/admin/program-participants")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        setProgramParticipants(data.participants || []);
        setParticipantsStatus("loaded");
      })
      .catch(() => setParticipantsStatus("error"));
  }

  useEffect(() => {
    if (reviewTab === 3 && participantsStatus === "idle") {
      loadParticipants();
    }
  }, [reviewTab, participantsStatus]);

  useEffect(() => {
    if (!visited.has(section)) {
      setVisited((prev) => new Set(prev).add(section));
    }
  }, [section, visited]);

  function keepAlive(target: Section, content: React.ReactNode) {
    if (!visited.has(target)) return null;
    return <div style={{ display: section === target ? "block" : "none" }}>{content}</div>;
  }

  return (
    <div className="flex">
      <AdminSidebar
        section={section}
        onSectionChange={setSection}
        reviewTab={reviewTab}
        onReviewTabChange={setReviewTab}
      />
      <div className="flex-1 px-4 pt-20 pb-8 md:px-8 md:py-8 overflow-x-auto">
        {section === "review" && (
          <>
            {reviewTab === 0 && <ApplicantTable initialData={applicants} enableLoadMore />}
            {reviewTab === 1 && (
              <VideoSubmissionsTable
                initialData={videoSubmissions}
              />
            )}
            {reviewTab === 2 && (
              <VerificationsTable
                initialData={verifications}
              />
            )}
            {reviewTab === 3 && (
              participantsStatus === "error" ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500 mb-3">Failed to load program participants.</p>
                  <button
                    type="button"
                    onClick={loadParticipants}
                    className="text-sm font-medium text-brand-green hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <ApplicantTable initialData={programParticipants} />
              )
            )}
          </>
        )}
        {keepAlive("analytics", <AnalyticsPanel applicants={applicants} videoSubmissions={videoSubmissions} verifications={verifications} />)}
        {keepAlive("users", <UsersPanel applicants={applicants} />)}
        {keepAlive("support", <SupportPanel />)}
        {keepAlive("emails", <EmailTemplatesPanel />)}
        {keepAlive("staged", <StagedBatchesPanel />)}
        {keepAlive("details", <AdditionalDetailsPanel />)}
        {keepAlive("calllog", <CallLogPanel />)}
        {keepAlive("callnotes", <CallNotesPanel />)}
        {keepAlive("lookup", <ComposeEmailPanel />)}
        {keepAlive("followups", <FollowupBatchesPanel />)}
        {keepAlive("funnel", <FunnelAnalyticsPanel />)}
      </div>
    </div>
  );
}






