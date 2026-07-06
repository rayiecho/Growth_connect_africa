"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";

export type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  current_stage: string;
  current_status: string;
  date_applied: string;
  industry: string | null;
  business_name: string | null;
  business_stage: string | null;
  business_description: string | null;
  problem_solved: string | null;
  target_customers: string | null;
  monthly_revenue: string | null;
  use_of_funds: string | null;
  seeking_funding: string | null;
  funding_amount: string | null;
  business_registered: string | null;
  registration_number: string | null;
  existing_investors: string | null;
  hours_per_week: string | null;
  available_for_sessions: string | null;
  state_country: string | null;
  age_range: string | null;
  gender: string | null;
  linkedin: string | null;
  business_social: string | null;
  assigned_reviewer: string | null;
  notes: string | null;
  next_action_required: string | null;
};

export function ApplicantTable({ initialData }: { initialData: Applicant[] }) {
  const [applicants, setApplicants] = useState(initialData);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);

  const filtered = applicants.filter((a) =>
    `${a.first_name} ${a.last_name} ${a.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function updateStage(id: string, stage: string, status: string) {
    setUpdatingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("applicants")
      .update({ current_stage: stage, current_status: status, last_updated: new Date().toISOString() })
      .eq("id", id);

    setUpdatingId(null);
    if (!error) {
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, current_stage: stage, current_status: status } : a))
      );
    }
  }

  async function updateAdminFields(
    id: string,
    fields: { assigned_reviewer?: string; notes?: string; next_action_required?: string }
  ) {
    setSavingNotesId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("applicants")
      .update({ ...fields, last_updated: new Date().toISOString() })
      .eq("id", id);

    setSavingNotesId(null);
    if (!error) {
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...fields } : a))
      );
    }
  }

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <TextInput
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-brand-line">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-brand-charcoal">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Applied</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const isExpanded = expandedId === a.id;
              return (
                <>
                  <tr key={a.id} className="border-t border-brand-line">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}
                        className="text-brand-charcoal font-medium hover:text-brand-green text-left"
                      >
                        {isExpanded ? "▾ " : "▸ "}
                        {a.first_name} {a.last_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">{a.email}</td>
                    <td className="px-4 py-3">{a.current_stage}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${
                          a.current_status === "Active"
                            ? "bg-brand-green/10 text-brand-green-dark"
                            : a.current_status === "Rejected"
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100 text-brand-slate"
                        }`}
                      >
                        {a.current_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">
                      {new Date(a.date_applied).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          className="!px-4 !py-2 text-xs"
                          disabled={updatingId === a.id}
                          onClick={() => updateStage(a.id, "Applications Approved", "Active")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          className="!px-4 !py-2 text-xs"
                          disabled={updatingId === a.id}
                          onClick={() => updateStage(a.id, "Rejected Application", "Rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${a.id}-details`} className="border-t border-brand-line bg-gray-50">
                      <td colSpan={6} className="px-6 py-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 mb-5 text-sm">
                          <Detail label="Phone" value={a.phone} />
                          <Detail label="Industry" value={a.industry} />
                          <Detail label="State/Country" value={a.state_country} />
                          <Detail label="Age Range" value={a.age_range} />
                          <Detail label="Gender" value={a.gender} />
                          <Detail label="LinkedIn" value={a.linkedin} />
                          <Detail label="Business Social" value={a.business_social} />
                          <Detail label="Business Name" value={a.business_name} />
                          <Detail label="Business Stage" value={a.business_stage} />
                          <Detail label="Target Customers" value={a.target_customers} />
                          <Detail label="Monthly Revenue" value={a.monthly_revenue} />
                          <Detail label="Seeking Funding" value={a.seeking_funding} />
                          <Detail label="Funding Amount" value={a.funding_amount} />
                          <Detail label="Business Registered" value={a.business_registered} />
                          <Detail label="Registration Number" value={a.registration_number} />
                          <Detail label="Existing Investors" value={a.existing_investors} />
                          <Detail label="Hours/Week" value={a.hours_per_week} />
                          <Detail label="Available for Sessions" value={a.available_for_sessions} />
                        </div>

                        <div className="space-y-1 mb-5">
                          <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">
                            Business Description
                          </p>
                          <p className="text-brand-slate whitespace-pre-wrap">
                            {a.business_description || "—"}
                          </p>
                        </div>

                        <div className="space-y-1 mb-5">
                          <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">
                            Problem Solved
                          </p>
                          <p className="text-brand-slate whitespace-pre-wrap">
                            {a.problem_solved || "—"}
                          </p>
                        </div>

                        <div className="space-y-1 mb-5">
                          <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">
                            Use of Funds
                          </p>
                          <p className="text-brand-slate whitespace-pre-wrap">
                            {a.use_of_funds || "—"}
                          </p>
                        </div>

                        <AdminFieldsEditor
                          applicant={a}
                          saving={savingNotesId === a.id}
                          onSave={(fields) => updateAdminFields(a.id, fields)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-slate">
                  No applicants match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">{label}</p>
      <p className="text-brand-slate">{value || "—"}</p>
    </div>
  );
}

function AdminFieldsEditor({
  applicant,
  saving,
  onSave,
}: {
  applicant: Applicant;
  saving: boolean;
  onSave: (fields: { assigned_reviewer?: string; notes?: string; next_action_required?: string }) => void;
}) {
  const [reviewer, setReviewer] = useState(applicant.assigned_reviewer ?? "");
  const [notes, setNotes] = useState(applicant.notes ?? "");
  const [nextAction, setNextAction] = useState(applicant.next_action_required ?? "");

  return (
    <div className="border-t border-brand-line pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">
          Assigned Reviewer
        </p>
        <TextInput value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
      </div>
      <div>
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">
          Next Action Required
        </p>
        <TextInput value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
      </div>
      <div className="md:col-span-3">
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">
          Notes
        </p>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
        />
      </div>
      <div>
        <Button
          variant="primary"
          className="!px-4 !py-2 text-xs"
          disabled={saving}
          onClick={() =>
            onSave({
              assigned_reviewer: reviewer,
              notes,
              next_action_required: nextAction,
            })
          }
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}