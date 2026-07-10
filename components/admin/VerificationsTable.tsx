"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import type { Verification } from "@/lib/firebase/types";

export function VerificationsTable({ initialData }: { initialData: Verification[] }) {
  const [items, setItems] = useState(initialData);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = items.filter((v) =>
    `${v.applicant_first_name} ${v.applicant_last_name} ${v.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function updateStatus(id: string, applicantId: string, status: "Approved" | "Rejected") {
    setUpdatingId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, applicant_id: applicantId, status }),
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
              <th className="px-4 py-3 font-semibold">LPX ID</th>
              <th className="px-4 py-3 font-semibold">Files</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-t border-brand-line">
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
                  {v.submitted_at ? new Date(v.submitted_at).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${
                      v.review_status === "Approved"
                        ? "bg-brand-green/10 text-brand-green-dark"
                        : v.review_status === "Rejected"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-brand-slate"
                    }`}
                  >
                    {v.review_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="primary" className="!px-4 !py-2 text-xs" disabled={updatingId === v.id} onClick={() => updateStatus(v.id, v.applicant_id, "Approved")}>
                      Approve
                    </Button>
                    <Button variant="secondary" className="!px-4 !py-2 text-xs" disabled={updatingId === v.id} onClick={() => updateStatus(v.id, v.applicant_id, "Rejected")}>
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-slate">
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
