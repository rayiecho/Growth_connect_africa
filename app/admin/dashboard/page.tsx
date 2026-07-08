import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { supabaseAdmin } from "@/lib/engine/supabaseAdmin";
import { DashboardTabs } from "@/components/admin/DashboardTabs";
import { VideoSubmission } from "@/components/admin/VideoSubmissionsTable";
import { Verification } from "@/components/admin/VerificationsTable";

export default async function DashboardPage() {
  // Auth check: Firebase session cookie + admin custom claim.
  // requireAdmin() redirects to /admin/login if either is missing.
  await requireAdmin();

  // NOTE: Reads still hit Supabase during the migration window because we
  // haven't replaced the data layer yet (Phase 4). We use `supabaseAdmin`
  // (service-role, RLS-bypassing) here because the Firebase session is what
  // gates access — there's no Supabase auth cookie for the new admin flow.
  const { data: applicants } = await supabaseAdmin
    .from("applicants")
    .select(
      "id, first_name, last_name, email, phone, current_stage, current_status, date_applied, industry, other_industry, business_name, business_stage, business_description, problem_solved, target_customers, business_registered, generates_revenue, revenue_progress, growth_potential, long_term_vision, use_of_funds, biggest_challenges, attend_lagos_event, why_considered, commitment_confirmed, disclaimers_accepted, state_country, age_range, gender, linkedin, business_social, assigned_reviewer, notes, next_action_required, admin_response, email_response_status, scheduled_send_date, video_invite_window"
    )
    .order("date_applied", { ascending: false });

  const { data: videoSubmissions } = await supabaseAdmin
    .from("video_submissions")
    .select(
      "id, applicant_id, video_link, submitted_at, review_status, feedback, approved_at, rejected_at, invite_email_sent_at, applicants(first_name, last_name, email)"
    )
    .order("submitted_at", { ascending: false });

  const { data: verifications } = await supabaseAdmin
    .from("verifications")
    .select(
      "id, applicant_id, email, lpx_id, review_status, form_submitted, submitted_at, verification_form_path, payment_receipt_path, applicants(first_name, last_name, email)"
    )
    .order("submitted_at", { ascending: false });

  const total = applicants?.length ?? 0;
  const active = applicants?.filter((a) => a.current_status === "Active").length ?? 0;
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
          <StatCard label="Active" value={active} />
          <StatCard label="Rejected" value={rejected} />
        </div>

        <span className="brand-eyebrow-line" />
        <h2 className="text-xl font-bold text-brand-charcoal mb-6">Review Queue</h2>
        <DashboardTabs
          applicants={applicants ?? []}
          videoSubmissions={(videoSubmissions ?? []) as unknown as VideoSubmission[]}
          verifications={(verifications ?? []) as unknown as Verification[]}
          cronSecret={process.env.CRON_SECRET ?? ""}
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
