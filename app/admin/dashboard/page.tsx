import { redirect } from "next/navigation";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { d1QueryOrdered, normalizeApplicant } from "@/lib/db/d1-admin";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Applicant, VideoSubmission, Verification } from "@/lib/db/types";

const DASHBOARD_LIMIT = 300;

export default async function DashboardPage() {
  const session = await getVerifiedAdminSession();
  if (!session) redirect("/admin/login");

  const [applicantsDocs, videoDocs, verificationsDocs] = await Promise.all([
    d1QueryOrdered("applicants", [], "date_applied", "DESCENDING", 100),
    d1QueryOrdered("video_submissions", [], "submitted_at", "DESCENDING", DASHBOARD_LIMIT),
    d1QueryOrdered("verifications", [], "submitted_at", "DESCENDING", DASHBOARD_LIMIT),
  ]);

  const applicants: Applicant[] = applicantsDocs.map((doc) => normalizeApplicant({ id: doc.id, ...doc.data() }) as Applicant);
  const videoSubmissions: VideoSubmission[] = videoDocs.map((doc) => ({ id: doc.id, ...doc.data() }) as VideoSubmission);
  const verifications: Verification[] = verificationsDocs.map((doc) => ({ id: doc.id, ...doc.data() }) as Verification);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-brand-line px-4 md:px-8 py-5 flex items-center justify-between">
        <h1 className="text-base md:text-lg font-bold text-brand-charcoal pl-12 md:pl-0">LaunchPadX Admin</h1>
        <form action="/admin/logout" method="post">
          <button className="rounded-pill bg-brand-green text-white px-5 py-2 text-sm font-medium hover:bg-brand-green-dark">
            Logout
          </button>
        </form>
      </header>
      <AdminShell applicants={applicants} videoSubmissions={videoSubmissions} verifications={verifications} />
    </main>
  );
}


