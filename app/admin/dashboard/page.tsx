import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardTabs } from "@/components/admin/DashboardTabs";
import { VideoSubmission } from "@/components/admin/VideoSubmissionsTable";
import { Verification } from "@/components/admin/VerificationsTable";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: applicants } = await supabase
    .from("applicants")
    .select(
      "id, first_name, last_name, email, phone, current_stage, current_status, date_applied, industry, other_industry, business_name, business_stage, business_description, problem_solved, target_customers, business_registered, generates_revenue, revenue_progress, growth_potential, long_term_vision, use_of_funds, biggest_challenges, attend_lagos_event, why_considered, commitment_confirmed, disclaimers_accepted, state_country, age_range, gender, linkedin, business_social, assigned_reviewer, notes, next_action_required, admin_response, email_response_status, scheduled_send_date"
    )
    .order("date_applied", { ascending: false });

  // Joined against applicants so the video table can show the person's
  // name/email without a second round trip — this is the Postgres
  // relational join the whole schema was designed around.
  const { data: videoSubmissions } = await supabase
    .from("video_submissions")
    .select(
      "id, applicant_id, video_link, submitted_at, review_status, applicants(first_name, last_name, email)"
    )
    .order("submitted_at", { ascending: false });
    const { data: verifications } = await supabase
    .from("verifications")
    .select(
      "id, applicant_id, email, lpx_id, review_status, form_submitted, submitted_at, verification_form_path, payment_receipt_path, applicants(first_name, last_name, email)"
    )
    .order("submitted_at", { ascending: false });

  const total = applicants?.length ?? 0;
  const approved = applicants?.filter((a) => a.current_status === "Active").length ?? 0;
  const rejected = applicants?.filter((a) => a.current_status === "Rejected").length ?? 0;

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
          <StatCard label="Active" value={approved} />
          <StatCard label="Rejected" value={rejected} />
        </div>

        <span className="brand-eyebrow-line" />
        <h2 className="text-xl font-bold text-brand-charcoal mb-6">
          Review Queue
        </h2>
        <DashboardTabs
          applicants={applicants ?? []}
          videoSubmissions={(videoSubmissions ?? []) as unknown as VideoSubmission[]}
          verifications={(verifications ?? []) as unknown as Verification[]}
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
