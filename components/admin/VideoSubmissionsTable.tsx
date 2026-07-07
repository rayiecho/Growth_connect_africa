"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";

export type VideoSubmission = {
  id: string;
  applicant_id: string;
  video_link: string;
  submitted_at: string;
  review_status: string;
  feedback: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  invite_email_sent_at: string | null;
  applicants: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};

export function VideoSubmissionsTable({
  initialData,
  cronSecret,
}: {
  initialData: VideoSubmission[];
  cronSecret: string;
}) {
  const [submissions, setSubmissions] = useState(initialData);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [result, setResult] = useState<
    Record<string, { type: "success"; msg: string } | { type: "error"; msg: string }>
  >({});

  const filtered = submissions.filter((s) => {
    const name = s.applicants
      ? `${s.applicants.first_name} ${s.applicants.last_name} ${s.applicants.email}`
      : "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  async function handleAction(
    id: string,
    action: "approved" | "rejected",
    CRON_SECRET: string
  ) {
    setSubmittingId(id);
    setResult((prev) => ({ ...prev, [id]: { type: "success", msg: "Processing…" } }));

    try {
      const res = await fetch(
        `/api/cron/video/${action}?secret=${CRON_SECRET}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId: id }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setResult((prev) => ({ ...prev, [id]: { type: "error", msg: data.error ?? "Something went wrong." } }));
      } else {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  review_status: action,
                  approved_at: action === "approved" ? new Date().toISOString() : s.approved_at,
                  rejected_at: action === "rejected" ? new Date().toISOString() : s.rejected_at,
                }
              : s
          )
        );
        setResult((prev) => ({ ...prev, [id]: { type: "success", msg: data.message } }));
        setExpandedId(null);
      }
    } catch {
      setResult((prev) => ({ ...prev, [id]: { type: "error", msg: "Network error. Try again." } }));
    }

    setSubmittingId(null);
  }

  async function handleActionRequired(id: string, CRON_SECRET: string) {
    const fb = feedback[id]?.trim();
    if (!fb) {
      setResult((prev) => ({ ...prev, [id]: { type: "error", msg: "Please write your feedback before sending." } }));
      return;
    }
    if (!window.confirm("Send the action-required email instantly to the applicant?")) return;

    setSubmittingId(id);
    setResult((prev) => ({ ...prev, [id]: { type: "success", msg: "Sending…" } }));

    try {
      const res = await fetch(
        `/api/cron/video/action-required?secret=${CRON_SECRET}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId: id, feedback: fb }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setResult((prev) => ({ ...prev, [id]: { type: "error", msg: data.error ?? "Something went wrong." } }));
      } else {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, review_status: "action_required", feedback: fb } : s
          )
        );
        setResult((prev) => ({ ...prev, [id]: { type: "success", msg: "✅ Email sent instantly to the applicant." } }));
        setFeedback((prev) => ({ ...prev, [id]: "" }));
        setExpandedId(null);
      }
    } catch {
      setResult((prev) => ({ ...prev, [id]: { type: "error", msg: "Network error. Try again." } }));
    }

    setSubmittingId(null);
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
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const isExpanded = expandedId === s.id;
              const res = result[s.id];

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
                        {s.applicants
                          ? `${s.applicants.first_name} ${s.applicants.last_name}`
                          : "—"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">
                      {s.applicants?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={s.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-green font-medium hover:underline"
                      >
                        Watch
                      </a>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">
                      {new Date(s.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${statusColor(s.review_status)}`}>
                        {statusLabel(s.review_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-slate">
                      {s.review_status === "pending"
                        ? "Review below"
                        : s.review_status === "approved"
                        ? `Approved ${s.approved_at ? new Date(s.approved_at).toLocaleDateString() : ""}`
                        : s.review_status === "rejected"
                        ? `Rejected ${s.rejected_at ? new Date(s.rejected_at).toLocaleDateString() : ""}`
                        : "Action sent"}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${s.id}-details`} className="border-t border-brand-line">
                      <td colSpan={6} className="px-6 py-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* LEFT: Video details + existing feedback */}
                          <div>
                            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wide mb-4">
                              Video Details
                            </h3>
                            <div className="space-y-3 mb-6 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">Video Link</p>
                                <a href={s.video_link} target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline break-all">{s.video_link}</a>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">Submitted</p>
                                <p className="text-brand-slate">{new Date(s.submitted_at).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">Current Status</p>
                                <span className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${statusColor(s.review_status)}`}>
                                  {statusLabel(s.review_status)}
                                </span>
                              </div>
                              {s.feedback && (
                                <div>
                                  <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">Feedback Sent</p>
                                  <p className="text-brand-slate whitespace-pre-wrap">{s.feedback}</p>
                                </div>
                              )}
                            </div>

                            {s.review_status === "pending" && (
                              <div>
                                <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-2">Your Feedback</p>
                                <textarea
                                  rows={5}
                                  value={feedback[s.id] ?? ""}
                                  onChange={(e) => setFeedback((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                  placeholder="Describe what you need from the applicant — e.g. video not accessible, missing audio, need more details…"
                                  className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-y text-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* RIGHT: Review actions */}
                          <div className="border-l border-brand-line pl-8">
                            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wide mb-4">
                              Review Decision
                            </h3>

                            {s.review_status !== "pending" ? (
                              <div className="space-y-3">
                                <div className={`rounded-lg px-4 py-3 text-sm ${s.review_status === "approved" ? "bg-brand-green/10 text-brand-green-dark" : s.review_status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                                  {s.review_status === "approved" && "✅ Video approved — verification email will be sent in 10 days."}
                                  {s.review_status === "rejected" && "❌ Video rejected — training email will be sent in 10 days."}
                                  {s.review_status === "action_required" && `⚠️ Action required email sent: "${s.feedback}"`}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Approved */}
                                <div className="border border-brand-line rounded-lg p-4">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                                      <span className="text-brand-green text-sm">✅</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-brand-charcoal text-sm">Approve</p>
                                      <p className="text-xs text-brand-slate">Applicant moves to verification stage. Email fires in 10 days.</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="primary"
                                    className="w-full"
                                    disabled={submittingId === s.id}
                                    onClick={() => handleAction(s.id, "approved", cronSecret)}
                                  >
                                    Approve Video
                                  </Button>
                                </div>

                                {/* Action Required */}
                                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/30">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                      <span className="text-amber-600 text-sm">⚠️</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-brand-charcoal text-sm">Action Required</p>
                                      <p className="text-xs text-brand-slate">Email fires <strong>instantly</strong> when you submit.</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="secondary"
                                    className="w-full !border-amber-300 !text-amber-700 hover:!bg-amber-100"
                                    disabled={submittingId === s.id}
                                    onClick={() => handleActionRequired(s.id, cronSecret)}
                                  >
                                    Send Feedback Instantly
                                  </Button>
                                </div>

                                {/* Rejected */}
                                <div className="border border-red-100 rounded-lg p-4">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                      <span className="text-red-500 text-sm">✕</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-brand-charcoal text-sm">Reject</p>
                                      <p className="text-xs text-brand-slate">Polite rejection + training programs link. Email fires in 10 days.</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="secondary"
                                    className="w-full"
                                    disabled={submittingId === s.id}
                                    onClick={() => handleAction(s.id, "rejected", cronSecret)}
                                  >
                                    Reject Video
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Feedback message */}
                            {res && (
                              <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${res.type === "error" ? "bg-red-50 text-red-600" : "bg-brand-green/10 text-brand-green-dark"}`}>
                                {res.msg}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-slate">
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
