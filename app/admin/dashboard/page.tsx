import { redirect } from "next/navigation";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreGetAll } from "@/lib/firebase/rest-admin";
import { DashboardTabs } from "@/components/admin/DashboardTabs";
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

  const total = applicants.length;
  const active = applicants.filter((a) => a.current_status === "Active").length;
  const rejected = applicants.filter((a) => a.current_status === "Rejected").length;

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

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label="Total Applicants" value={total} />
          <StatCard label="Active" value={active} />
          <StatCard label="Rejected" value={rejected} />
        </div>

        <span className="brand-eyebrow-line" />
        <h2 className="text-xl font-bold text-brand-charcoal mb-6">
          Review Queue
        </h2>
        <DashboardTabs
          applicants={applicants}
          videoSubmissions={videoSubmissions}
          verifications={verifications}
        />
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-brand-line p-6">
      <p className="text-sm text-brand-slate mb-1">{label}</p>
      <p className="text-3xl font-bold text-brand-charcoal">{value}</p>
    </div>
  );
}
