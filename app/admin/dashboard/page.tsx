import { redirect } from "next/navigation";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreGetAll } from "@/lib/firebase/rest-admin";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Applicant, VideoSubmission, Verification } from "@/lib/firebase/types";

export default async function DashboardPage() {
  const session = await getVerifiedAdminSession();
  if (!session) redirect("/admin/login");

  const [applicantsDocs, videoDocs, verificationsDocs] = await Promise.all([
    firestoreGetAll("applicants"),
    firestoreGetAll("video_submissions"),
    firestoreGetAll("verifications"),
  ]);

  const applicants: Applicant[] = applicantsDocs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Applicant)
    .sort((a, b) => (b.date_applied ?? "").localeCompare(a.date_applied ?? ""));
  const videoSubmissions: VideoSubmission[] = videoDocs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as VideoSubmission)
    .sort((a, b) => (b.submitted_at ?? "").localeCompare(a.submitted_at ?? ""));
  const verifications: Verification[] = verificationsDocs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Verification)
    .sort((a, b) => (b.submitted_at ?? "").localeCompare(a.submitted_at ?? ""));

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-brand-line px-8 py-5 flex items-center justify-between">
        <h1 className="text-lg font-bold text-brand-charcoal">LaunchPadX Admin</h1>
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
