"use client";

import { useState } from "react";
import { ref, update } from "firebase/database";
import { clientDb } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import type { VideoSubmission } from "@/lib/firebase/types";

export function VideoSubmissionsTable({ initialData }: { initialData: VideoSubmission[] }) {
  const [submissions, setSubmissions] = useState(initialData);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = submissions.filter((s) =>
    `${s.applicant_first_name} ${s.applicant_last_name} ${s.applicant_email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function handleApprove(id: string) {
    setSavingId(id);
    try {
      await update(ref(clientDb, `video_submissions/${id}`), {
        review_status: "approved",
        approved_at: new Date().toISOString(),
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, review_status: "approved" } : s))
      );
      setExpandedId(null);
    } catch (err) {
      console.error(err);
    }
    setSavingId(null);
  }

  async function handleReject(id: string) {
    setSavingId(id);
    try {
      await update(ref(clientDb, `video_submissions/${id}`), {
        review_status: "rejected",
        rejected_at: new Date().toISOString(),
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, review_status: "rejected" } : s))
      );
      setExpandedId(null);
    } catch (err) {
      console.error(err);
    }
    setSavingId(null);
  }

  async function handleActionRequired(id: string) {
    const fb = feedback[id]?.trim();
    if (!fb) return;
    if (!window.confirm("Send action-required feedback to this applicant?")) return;

    setSavingId(id);
    try {
      // Note: this only records the feedback + status. Actually EMAILING it
      // instantly still needs a server route, since sending email requires
      // AWS credentials that must never reach the browser. That route is
      // built in the cron-routes checkpoint, right after this file.
      await update(ref(clientDb, `video_submissions/${id}`), {
        review_status: "action_required",
        feedback: fb,
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, review_status: "action_required", feedback: fb } : s))
      );

      await fetch("/api/cron/video/action-required", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id, feedback: fb }),
      });

      setFeedback((prev) => ({ ...prev, [id]: "" }));
      setExpandedId(null);
    } catch (err) {
      console.error(err);
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
                        {isExpanded ? "▾ " : "▸ "}
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
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "—"}
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
                            {s.review_status === "approved" && "✅ Approved — verification email sends 10 days after this decision."}
                            {s.review_status === "rejected" && "❌ Rejected — training email sends 10 days after this decision."}
                            {s.review_status === "action_required" && `⚠️ Action required sent: "${s.feedback}"`}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="primary" disabled={savingId === s.id} onClick={() => handleApprove(s.id)}>
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
                                Send Feedback Instantly
                              </Button>
                            </div>
                            <Button variant="secondary" disabled={savingId === s.id} onClick={() => handleReject(s.id)}>
                              Reject
                            </Button>
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
                  No video submissions match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

