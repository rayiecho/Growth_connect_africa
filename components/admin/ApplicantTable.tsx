"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import type { Applicant } from "@/lib/firebase/types";

export function ApplicantTable({ initialData }: { initialData: Applicant[] }) {
  const [applicants, setApplicants] = useState(initialData);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = applicants.filter((a) =>
    `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  );

  async function updateAdminFields(
    id: string,
    fields: { assigned_reviewer?: string; notes?: string; next_action_required?: string }
  ) {
    setSavingId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...fields }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setActionError(`Server error (status ${res.status}). Please try again.`);
        setSavingId(null);
        return;
      }

      if (!res.ok) {
        setActionError(data.error || "Failed to save changes.");
        setSavingId(null);
        return;
      }

      setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, ...fields } : a)));
    } catch (err) {
      console.error("Failed to save:", err);
      setActionError("Network error. Please try again.");
    }
    setSavingId(null);
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

      {actionError && (
        <p className="text-sm text-red-500 mb-4">{actionError}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-brand-line">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-brand-charcoal">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Applied</th>
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
                        {isExpanded ? "v " : "> "}
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
                      {a.date_applied ? new Date(a.date_applied).toLocaleDateString() : "-"}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${a.id}-details`} className="border-t border-brand-line bg-gray-50">
                      <td colSpan={5} className="px-6 py-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 mb-5 text-sm">
                          <Detail label="Phone" value={a.phone} />
                          <Detail label="Industry" value={a.industry} />
                          <Detail label="State/Country" value={a.state_country} />
                          <Detail label="Age Range" value={a.age_range} />
                          <Detail label="Gender" value={a.gender} />
                          <Detail label="Business Name" value={a.business_name} />
                          <Detail label="Business Stage" value={a.business_stage} />
                          <Detail label="Target Customers" value={a.target_customers} />
                          <Detail label="Business Registered" value={a.business_registered} />
                          <Detail label="Generates Revenue" value={a.generates_revenue} />
                          <Detail label="Attend Lagos Event" value={a.attend_lagos_event} />
                        </div>

                        <LongField label="Business Description" value={a.business_description} />
                        <LongField label="Problem Solved" value={a.problem_solved} />
                        <LongField label="Growth Potential" value={a.growth_potential} />
                        <LongField label="Long-Term Vision" value={a.long_term_vision} />
                        <LongField label="Use of Funds" value={a.use_of_funds} />
                        <LongField label="Why Considered" value={a.why_considered} />

                        <AdminFieldsEditor
                          applicant={a}
                          saving={savingId === a.id}
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
                <td colSpan={5} className="px-4 py-8 text-center text-brand-slate">
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
      <p className="text-brand-slate">{value || "-"}</p>
    </div>
  );
}

function LongField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1 mb-5">
      <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">{label}</p>
      <p className="text-brand-slate whitespace-pre-wrap">{value || "-"}</p>
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
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">Assigned Reviewer</p>
        <TextInput value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
      </div>
      <div>
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">Next Action Required</p>
        <TextInput value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
      </div>
      <div className="md:col-span-3">
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">Notes</p>
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
          onClick={() => onSave({ assigned_reviewer: reviewer, notes, next_action_required: nextAction })}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
