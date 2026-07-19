"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatShortDate } from "@/lib/engine/dates";
import { TextInput } from "@/components/ui/Input";
import type { Applicant } from "@/lib/db/types";

export function ApplicantTable({ initialData, enableLoadMore }: { initialData: Applicant[]; enableLoadMore?: boolean }) {
  const [applicants, setApplicants] = useState(initialData);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.length >= 100);

  async function handleLoadMore() {
    if (applicants.length === 0) return;
    const cursor = (applicants[applicants.length - 1] as any).date_applied;
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/admin/applicants-more?cursor=${encodeURIComponent(cursor)}`);
      const data = await res.json();
      if (res.ok) {
        setApplicants((prev) => [...prev, ...(data.applicants || [])]);
        setHasMore(!!data.hasMore);
      }
    } catch {
      // silently fail, button just stays available to retry
    }
    setLoadingMore(false);
  }

  const filtered = applicants.filter((a) =>
    `${a.first_name} ${a.last_name} ${a.email} ${a.lpx_id || ""}`.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Search by name, email, or LPX ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {actionError && (
        <p className="text-sm text-red-500 mb-4">{actionError}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-brand-line w-full">
        <table className="w-full min-w-[1000px] text-sm text-left table-fixed">
          <thead className="bg-gray-50 text-brand-charcoal">
            <tr>
              <th className="px-4 py-3 font-semibold w-[18%]">Name</th>
              <th className="px-4 py-3 font-semibold w-[16%]">LaunchPadX ID</th>
              <th className="px-4 py-3 font-semibold w-[28%]">Email</th>
              <th className="px-4 py-3 font-semibold w-[20%]">Stage</th>
              <th className="px-4 py-3 font-semibold w-[10%]">Status</th>
              <th className="px-4 py-3 font-semibold w-[8%]">Applied</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const isExpanded = expandedId === a.id;
              return (
                <tr key={a.id} className="border-t border-brand-line p-0">
                  <td colSpan={6} className="p-0">
                    <table className="w-full text-sm text-left table-fixed">
                      <colgroup>
                        <col style={{ width: '18%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '28%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '8%' }} />
                      </colgroup>
                      <tbody>
                        <tr>
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
                          <td className="px-4 py-3 font-mono font-semibold text-brand-green">
                            {a.lpx_id || <span className="text-gray-300 italic text-xs">Not Generated</span>}
                          </td>
                          <td className="px-4 py-3 text-brand-slate">
                            <p>{a.email}</p>
                            <span className={`inline-block mt-1 rounded-pill px-2 py-0.5 text-[10px] font-medium ${(a as any).email_verified ? "bg-brand-green/10 text-brand-green-dark" : "bg-amber-50 text-amber-700"}`}>
                              {(a as any).email_verified ? "Email Verified" : "Not Verified"}
                            </span>
                          </td>
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
                            {formatShortDate(a.submitted_at || a.date_applied)}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-t border-brand-line bg-gray-50">
                            <td colSpan={6} className="px-6 py-5">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 mb-5 text-sm">
                                <Detail label="Phone" value={a.phone} />
                                <Detail label="Preferred Name on Card" value={a.preferred_name || null} />
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
                              <CompletionButton applicant={a} />
                              <TrialManagement applicant={a} onDeleted={() => window.location.reload()} />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
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
      {enableLoadMore && hasMore && !search && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-sm font-medium text-brand-green hover:underline disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
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

function CompletionButton({ applicant }: { applicant: Applicant }) {
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(!!(applicant as any).program_completed);
  const [certCode, setCertCode] = useState<string | null>((applicant as any).certificate_code ?? null);
  const [error, setError] = useState<string | null>(null);

  async function handleMark() {
    if (!(applicant as any).lpx_id) {
      setError("This applicant does not have a LaunchPadX ID yet.");
      return;
    }
    setMarking(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/mark-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId: applicant.id,
          firstName: applicant.first_name,
          lastName: applicant.last_name,
          lpxId: (applicant as any).lpx_id,
          cohort: (applicant as any).cohort,
        }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {
        setError(`Server error (status ${res.status}).`);
        setMarking(false);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to mark as completed.");
        setMarking(false);
        return;
      }
      setDone(true);
      setCertCode(data.certificate_code);
    } catch {
      setError("Network error. Please try again.");
    }
    setMarking(false);
  }

  return (
    <div className="border-t border-brand-line pt-4 mt-4">
      <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-2">Program Completion</p>
      {done ? (
        <p className="text-sm text-brand-green-dark">
          Marked complete. Certificate code: <strong>{certCode}</strong>
        </p>
      ) : (
        <Button variant="primary" className="!px-4 !py-2 text-xs" disabled={marking} onClick={handleMark}>
          {marking ? "Marking..." : "Mark Program Completed"}
        </Button>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
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








function TrialManagement({ applicant, onDeleted }: { applicant: Applicant; onDeleted: () => void }) {
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cleared, setCleared] = useState(!!(applicant as any).cleared_for_reapply);
  const [error, setError] = useState<string | null>(null);

  const status = (applicant as any).current_status;
  const stage = (applicant as any).current_stage || "";
  const trialNumber = (applicant as any).trial_number || 1;
  const trialHistory = (applicant as any).trial_history || [];
  const isRejected = stage.toLowerCase().includes("rejected");

  async function handleClear() {
    setClearing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clear-for-reapply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId: applicant.id }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {
        setError(`Server error (status ${res.status}).`);
        setClearing(false);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to clear for reapply.");
        setClearing(false);
        return;
      }
      setCleared(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setClearing(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Permanently delete ${applicant.first_name} ${applicant.last_name}? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/delete-applicant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId: applicant.id }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {
        setError(`Server error (status ${res.status}).`);
        setDeleting(false);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to delete applicant.");
        setDeleting(false);
        return;
      }
      onDeleted();
    } catch {
      setError("Network error. Please try again.");
    }
    setDeleting(false);
  }

  return (
    <div className="border-t border-brand-line pt-4 mt-4">
      <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-2">
        Trial ${trialNumber}
      </p>
      {trialHistory.length > 0 && (
        <div className="text-xs text-brand-slate mb-2 space-y-1">
          {trialHistory.map((t: any, i: number) => (
            <p key={i}>Trial ${t.trial_number}: reached ${t.current_stage || "-"}, cleared ${t.cleared_at ? new Date(t.cleared_at).toLocaleDateString() : "-"}</p>
          ))}
        </div>
      )}
      <div className="flex gap-3 flex-wrap">
        {isRejected && !cleared && (
          <Button variant="secondary" className="!px-4 !py-2 text-xs" disabled={clearing} onClick={handleClear}>
            {clearing ? "Clearing..." : "Clear for Reapply"}
          </Button>
        )}
        {cleared && (
          <span className="text-xs text-brand-green-dark self-center">Cleared - can reapply</span>
        )}
        <Button variant="secondary" className="!px-4 !py-2 text-xs !border-red-300 !text-red-600" disabled={deleting} onClick={handleDelete}>
          {deleting ? "Deleting..." : "Delete Permanently"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}



