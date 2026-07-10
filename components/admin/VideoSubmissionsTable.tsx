"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import type { VideoSubmission } from "@/lib/firebase/types";

export function VideoSubmissionsTable({ initialData }: { initialData: VideoSubmission[] }) {
  const [submissions, setSubmissions] = useState(initialData);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [whatsappLinks, setWhatsappLinks] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = submissions.filter((s) =>
    `${s.applicant_first_name} ${s.applicant_last_name} ${s.applicant_email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function callUpdate(
    id: string, 
    action: "approve" | "reject" | "action_required", 
    feedbackText?: string,
    whatsappLink?: string
  ) {
    setSavingId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/video-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          action, 
          feedback: feedbackText,
          whatsapp_link: whatsappLink 
        }),
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

  async function handleApprove(id: string) {
    const link = whatsappLinks[id]?.trim();
    if (!link) {
      setActionError("A WhatsApp group link is required to approve this submission.");
      return;
    }

    const ok = await callUpdate(id, "approve", undefined, link);
    if (ok) {
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, review_status: "approved", whatsapp_link: link } : s)));
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
    if (!fb) return;
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
              <th className="px-4 py-3 font-semibold">Video</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const isExpanded = expandedId === s.id;
              return (
                <>
                  <tr key={s.id} className="border-t border-brand-line">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className="text-brand-charcoal font-medium hover:text-brand-green text-left"
                      >
                        {isExpanded ? "v " : "> "}
                        {s.applicant_first_name} {s.applicant_last_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">{s.applicant_email}</td>
                    <td className="px-4 py-3">
                      <a href={s.video_link} target="_blank" rel="noopener noreferrer" className="text-brand-green font-medium hover:underline">
                        Watch
                      </a>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${statusColor(s.review_status)}`}>
                        {statusLabel(s.review_status)}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${s.id}-details`} className="border-t border-brand-line">
                      <td colSpan={5} className="px-6 py-5">
                        {s.review_status !== "pending" ? (
                          <div className={`rounded-lg px-4 py-3 text-sm ${statusColor(s.review_status)}`}>
                            {s.review_status === "approved" && `Approved - verification email sends 10 days after this decision. Link: ${(s as any).whatsapp_link ?? 'None'}`}
                            {s.review_status === "rejected" && "Rejected - training email sends 10 days after this decision."}
                            {s.review_status === "action_required" && `Action required sent: "${s.feedback}"`}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <TextInput
                                placeholder="WhatsApp group link..."
                                value={whatsappLinks[s.id] ?? ""}
                                onChange={(e) => setWhatsappLinks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                className="mb-2"
                              />
                              <Button variant="primary" disabled={savingId === s.id} onClick={() => handleApprove(s.id)} className="w-full">
                                Approve
                              </Button>
                            </div>
                            <div>
                              <textarea
                                rows={2}
                                placeholder="Feedback for applicant..."
                                value={feedback[s.id] ?? ""}
                                onChange={(e) => setFeedback((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-2"
                              />
                              <Button variant="secondary" disabled={savingId === s.id} onClick={() => handleActionRequired(s.id)} className="w-full !border-amber-300 !text-amber-700">
                                Send Feedback Instantly
                              </Button>
                            </div>
                            <div className="flex items-end">
                              <Button variant="secondary" disabled={savingId === s.id} onClick={() => handleReject(s.id)} className="w-full">
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-slate">
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
