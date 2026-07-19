"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import type { VideoSubmission } from "@/lib/db/types";

export function VideoSubmissionsTable({ initialData }: { initialData: VideoSubmission[] }) {
  const [submissions, setSubmissions] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "action_required" | "all">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);

  const [batchLinks, setBatchLinks] = useState<Record<string, string>>({});
  const [batchLinkInputs, setBatchLinkInputs] = useState<Record<string, string>>({});
  const [savingBatch, setSavingBatch] = useState<string | null>(null);

  const filtered = submissions.filter((s) => {
    const matchesStatus = statusFilter === "all" || s.review_status === statusFilter;
    const matchesSearch = `${s.applicant_first_name} ${s.applicant_last_name} ${s.applicant_email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const allBatchDates = Array.from(
    new Set(
      filtered
        .filter((s) => (s as any).outcome_release_date)
        .map((s) => (s as any).outcome_release_date as string)
    )
  ).sort();

  useEffect(() => {
    allBatchDates.forEach((date) => {
      if (batchLinks[date] !== undefined) return;
      fetch(`/api/admin/batch-link?date=${date}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setBatchLinks((prev) => ({ ...prev, [date]: data.link || "" }));
            setBatchLinkInputs((prev) => ({ ...prev, [date]: data.link || "" }));
          }
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBatchDates.join(",")]);

  async function saveBatchLink(date: string) {
    const link = batchLinkInputs[date]?.trim();
    if (!link) return;
    setSavingBatch(date);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/batch-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, link }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {
        setActionError(`Server error (status ${res.status}).`);
        setSavingBatch(null);
        return;
      }
      if (!res.ok) {
        setActionError(data.error || "Failed to save batch link.");
        setSavingBatch(null);
        return;
      }
      setBatchLinks((prev) => ({ ...prev, [date]: link }));
    } catch {
      setActionError("Network error saving batch link.");
    }
    setSavingBatch(null);
  }

  async function callUpdate(id: string, action: "approve" | "reject" | "action_required", feedbackText?: string) {
    setSavingId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/video-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, feedback: feedbackText }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setActionError(`Server error (status ${res.status}). Please try again.`);
        setSavingId(null);
        return false;
      }

      if (!res.ok) {
        setActionError(data.error || "Something went wrong. Please try again.");
        setSavingId(null);
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      setActionError("Network error. Please try again.");
      setSavingId(null);
      return false;
    }
  }

  async function handleApprove(id: string, batchDate: string | undefined) {
    if (batchDate && !batchLinks[batchDate]) {
      setActionError("Set this batch's WhatsApp link before approving submissions in it.");
      return;
    }
    const ok = await callUpdate(id, "approve");
    if (ok) {
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, review_status: "approved" } : s)));
      setExpandedId(null);
    }
    setSavingId(null);
  }

  async function handleReject(id: string) {
    const ok = await callUpdate(id, "reject");
    if (ok) {
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, review_status: "rejected" } : s)));
      setExpandedId(null);
    }
    setSavingId(null);
  }

  async function handleActionRequired(id: string) {
    const fb = feedback[id]?.trim();
    if (!fb) {
      setActionError("Please enter feedback before sending Action Required.");
      return;
    }
    if (!window.confirm("Send action-required feedback to this applicant?")) return;

    const ok = await callUpdate(id, "action_required", fb);
    if (ok) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, review_status: "action_required", feedback: fb } : s))
      );
      setFeedback((prev) => ({ ...prev, [id]: "" }));
      setExpandedId(null);
    }
    setSavingId(null);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  }

  async function handleBulkAction(action: "approve" | "reject") {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`${action === "approve" ? "Approve" : "Reject"} ${selectedIds.size} selected submissions?`)) return;

    setBulkSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/bulk-video-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), action }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {
        setActionError(`Server error (status ${res.status}).`);
        setBulkSaving(false);
        return;
      }
      if (!res.ok) {
        setActionError(data.error || "Bulk action failed.");
        setBulkSaving(false);
        return;
      }
      setSubmissions((prev) =>
        prev.map((s) => (selectedIds.has(s.id) ? { ...s, review_status: action === "approve" ? "approved" : "rejected" } : s))
      );
      setSelectedIds(new Set());
    } catch {
      setActionError("Network error during bulk action.");
    }
    setBulkSaving(false);
  }

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-brand-green/10 text-brand-green-dark";
    if (status === "rejected") return "bg-red-50 text-red-600";
    if (status === "action_required") return "bg-amber-50 text-amber-700";
    return "bg-gray-100 text-brand-slate";
  };

  const statusLabel = (status: string) => {
    if (status === "action_required") return "Action Required";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div>
      {allBatchDates.length > 0 && (
        <div className="bg-white rounded-xl border border-brand-line p-5 mb-6">
          <h3 className="text-sm font-semibold text-brand-charcoal mb-3">Batch WhatsApp Links</h3>
          <p className="text-xs text-brand-slate mb-4">
            Set one link per review batch (Tue/Fri release date). It's used automatically for every approval email in that batch.
          </p>
          <div className="space-y-3">
            {allBatchDates.map((date) => (
              <div key={date} className="flex items-end gap-3">
                <div className="w-32 text-sm font-medium text-brand-charcoal pb-2">{date}</div>
                <div className="flex-1">
                  <TextInput
                    placeholder="WhatsApp group link for this batch..."
                    value={batchLinkInputs[date] ?? ""}
                    onChange={(e) => setBatchLinkInputs((prev) => ({ ...prev, [date]: e.target.value }))}
                  />
                </div>
                <Button
                  variant="secondary"
                  disabled={savingBatch === date}
                  onClick={() => saveBatchLink(date)}
                  className="!px-4 !py-2 text-xs"
                >
                  {batchLinks[date] ? "Update" : "Save"}
                </Button>
                {batchLinks[date] && <span className="text-xs text-brand-green-dark pb-2">Set</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 max-w-sm">
        <TextInput
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-4 max-w-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
        >
          <option value="pending">Awaiting Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="action_required">Action Required</option>
          <option value="all">All Statuses</option>
        </select>
      </div>

      {actionError && (
        <p className="text-sm text-red-500 mb-4">{actionError}</p>
      )}

      {selectedIds.size > 0 && (
        <div className="bg-brand-green/5 border border-brand-green/30 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-brand-charcoal">{selectedIds.size} selected</p>
          <div className="flex gap-2">
            <Button variant="primary" className="!px-4 !py-2 text-xs" disabled={bulkSaving} onClick={() => handleBulkAction("approve")}>
              Approve Selected
            </Button>
            <Button variant="secondary" className="!px-4 !py-2 text-xs" disabled={bulkSaving} onClick={() => handleBulkAction("reject")}>
              Reject Selected
            </Button>
            <Button variant="secondary" className="!px-4 !py-2 text-xs" disabled={bulkSaving} onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-brand-line">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-brand-charcoal">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Video</th>
              <th className="px-4 py-3 font-semibold">Batch Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const isExpanded = expandedId === s.id;
              const batchDate = (s as any).outcome_release_date as string | undefined;
              return (
                <>
                  <tr key={s.id} className="border-t border-brand-line">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-brand-charcoal font-medium">
                        {s.applicant_first_name} {s.applicant_last_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">{s.applicant_email}</td>
                    <td className="px-4 py-3">
                      <a href={s.video_link} target="_blank" rel="noopener noreferrer" className="text-brand-green font-medium hover:underline">
                        Watch
                      </a>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">{batchDate ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${statusColor(s.review_status)}`}>
                        {statusLabel(s.review_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className="text-xs text-brand-green font-medium hover:underline"
                      >
                        {isExpanded ? "Hide" : "Change Decision"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${s.id}-details`} className="border-t border-brand-line">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button variant="primary" disabled={savingId === s.id} onClick={() => handleApprove(s.id, batchDate)}>
                            Approve
                          </Button>
                          <div>
                            <textarea
                              rows={2}
                              placeholder="Feedback for applicant..."
                              value={feedback[s.id] ?? ""}
                              onChange={(e) => setFeedback((prev) => ({ ...prev, [s.id]: e.target.value }))}
                              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-2"
                            />
                            <Button variant="secondary" disabled={savingId === s.id} onClick={() => handleActionRequired(s.id)} className="w-full !border-amber-300 !text-amber-700">
                              Action Required
                            </Button>
                          </div>
                          <Button variant="secondary" disabled={savingId === s.id} onClick={() => handleReject(s.id)}>
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-slate">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
