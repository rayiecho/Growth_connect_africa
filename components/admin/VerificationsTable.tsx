"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatShortDate } from "@/lib/engine/dates";
import { TextInput } from "@/components/ui/Input";
import type { Verification } from "@/lib/db/types";

export function VerificationsTable({ initialData }: { initialData: Verification[] }) {
  const [items, setItems] = useState(initialData);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);

  const filtered = items.filter((v) =>
    `${v.applicant_first_name} ${v.applicant_last_name} ${v.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function updateStatus(id: string, applicantId: string, status: "Approved" | "Rejected" | "Action Required", feedbackText?: string) {
    if (status === "Action Required" && !feedbackText?.trim()) {
      setActionError("Please enter feedback before sending Action Required.");
      return;
    }
    setUpdatingId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, applicant_id: applicantId, status, feedback: feedbackText }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setActionError(`Server error (status ${res.status}). Please try again.`);
        setUpdatingId(null);
        return;
      }
      if (!res.ok) {
        setActionError(data.error || "Failed to update verification.");
        setUpdatingId(null);
        return;
      }
      setItems((prev) => prev.map((v) => (v.id === id ? { ...v, review_status: status } : v)));
      setExpandedId(null);
    } catch (err) {
      console.error(err);
      setActionError("Network error. Please try again.");
    }
    setUpdatingId(null);
  }

  async function viewFile(path: string | null) {
    if (!path) return;
    const segments = path.split("/").map(encodeURIComponent).join("/");
    window.open(`/api/public/verification/file/${segments}`, "_blank");
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
      setSelectedIds(new Set(filtered.map((v) => v.id)));
    }
  }

  async function handleBulkAction(status: "Approved" | "Rejected") {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`${status === "Approved" ? "Approve" : "Reject"} ${selectedIds.size} selected verifications?`)) return;

    setBulkSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/bulk-verification-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status }),
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
      setItems((prev) => prev.map((v) => (selectedIds.has(v.id) ? { ...v, review_status: status } : v)));
      setSelectedIds(new Set());
    } catch {
      setActionError("Network error during bulk action.");
    }
    setBulkSaving(false);
  }

  const statusColor = (status: string) => {
    if (status === "Approved") return "bg-brand-green/10 text-brand-green-dark";
    if (status === "Rejected") return "bg-red-50 text-red-600";
    if (status === "Action Required") return "bg-amber-50 text-amber-700";
    return "bg-gray-100 text-brand-slate";
  };

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

      {selectedIds.size > 0 && (
        <div className="bg-brand-green/5 border border-brand-green/30 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-brand-charcoal">{selectedIds.size} selected</p>
          <div className="flex gap-2">
            <Button variant="primary" className="!px-4 !py-2 text-xs" disabled={bulkSaving} onClick={() => handleBulkAction("Approved")}>
              Approve Selected
            </Button>
            <Button variant="secondary" className="!px-4 !py-2 text-xs" disabled={bulkSaving} onClick={() => handleBulkAction("Rejected")}>
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
              <th className="px-4 py-3 font-semibold">LPX ID</th>
              <th className="px-4 py-3 font-semibold">Files</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const isExpanded = expandedId === v.id;
              return (
                <>
                  <tr key={v.id} className="border-t border-brand-line">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleSelect(v.id)} />
                    </td>
                    <td className="px-4 py-3">{v.applicant_first_name} {v.applicant_last_name}</td>
                    <td className="px-4 py-3 text-brand-slate">{v.email}</td>
                    <td className="px-4 py-3">{v.lpx_id || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button type="button" onClick={() => viewFile(v.verification_form_path)} className="text-brand-green font-medium hover:underline text-left">
                          Verification Form
                        </button>
                        <button type="button" onClick={() => viewFile(v.payment_receipt_path)} className="text-brand-green font-medium hover:underline text-left">
                          Payment Receipt
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">
                      {formatShortDate(v.submitted_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${statusColor(v.review_status)}`}>
                        {v.review_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                        className="text-xs text-brand-green font-medium hover:underline"
                      >
                        {isExpanded ? "Hide" : "Change Decision"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${v.id}-actions`} className="border-t border-brand-line bg-gray-50">
                      <td colSpan={8} className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button variant="primary" disabled={updatingId === v.id} onClick={() => updateStatus(v.id, v.applicant_id, "Approved")}>
                            Approve
                          </Button>
                          <div>
                            <textarea
                              rows={2}
                              placeholder="Feedback for applicant..."
                              value={feedback[v.id] ?? ""}
                              onChange={(e) => setFeedback((prev) => ({ ...prev, [v.id]: e.target.value }))}
                              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-2"
                            />
                            <Button
                              variant="secondary"
                              disabled={updatingId === v.id}
                              onClick={() => updateStatus(v.id, v.applicant_id, "Action Required", feedback[v.id])}
                              className="w-full !border-amber-300 !text-amber-700"
                            >
                              Action Required
                            </Button>
                          </div>
                          <Button variant="secondary" disabled={updatingId === v.id} onClick={() => updateStatus(v.id, v.applicant_id, "Rejected")}>
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
                <td colSpan={8} className="px-4 py-8 text-center text-brand-slate">
                  No verification submissions match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
