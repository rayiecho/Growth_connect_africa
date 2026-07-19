"use client";

import { useState, useEffect } from "react";

type ScheduleItem = { label: string; date: string; sent: boolean };

type CallLogEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: string;
  submittedAt: string;
  deadline: string;
  daysRemaining: number | null;
  remindersSent: number;
  remindersTotal: number;
  schedule: ScheduleItem[];
};

export function CallLogPanel() {
  const [tab, setTab] = useState<"video" | "verification">("video");
  const [entries, setEntries] = useState<CallLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/call-log")
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data) => setEntries(data.entries || []))
      .catch(() => setError("Failed to load reminder tracking."))
      .finally(() => setLoading(false));
  }, []);

  const videoEntries = entries.filter((e) => e.stage === "Video Pitch");
  const verificationEntries = entries.filter((e) => e.stage === "Verification");
  const activeEntries = tab === "video" ? videoEntries : verificationEntries;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Reminders</h2>
        </div>
      </div>
      <p className="text-sm text-brand-slate mb-6">
        Everyone waiting to submit, with their full reminder schedule - when they submitted, how many reminders have gone out, and when the rest are due.
      </p>

      <div className="flex gap-6 border-b border-brand-line mb-6">
        <button
          type="button"
          onClick={() => setTab("video")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "video" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Video Pitch ({videoEntries.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("verification")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "verification" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Verification ({verificationEntries.length})
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-brand-slate">Loading...</p>
      ) : activeEntries.length === 0 ? (
        <p className="text-sm text-brand-slate">Nobody currently waiting in this stage.</p>
      ) : (
        <div className="space-y-3">
          {activeEntries.map((e) => {
            const isExpanded = expandedId === e.id;
            return (
              <div key={e.id} className="bg-white rounded-xl border border-brand-line overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : e.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">{e.name}</p>
                    <p className="text-xs text-brand-slate">
                      {e.email} - Submitted/Invited: {e.submittedAt} - Deadline: {e.deadline}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium rounded-pill px-3 py-1 ${e.daysRemaining !== null && e.daysRemaining <= 1 ? "bg-red-50 text-red-600" : "bg-gray-100 text-brand-slate"}`}>
                      {e.daysRemaining !== null ? `${e.daysRemaining}d left` : "-"}
                    </span>
                    <span className="text-xs text-brand-slate">
                      {e.remindersSent}/{e.remindersTotal} reminders sent
                    </span>
                    <span className="text-brand-slate text-lg">{isExpanded ? "-" : "+"}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-brand-line pt-4">
                    <p className="text-xs font-semibold text-brand-charcoal mb-2">Phone: {e.phone}</p>
                    <p className="text-xs font-semibold text-brand-charcoal mb-2">Full reminder schedule:</p>
                    <div className="space-y-1">
                      {e.schedule.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-gray-50">
                          <span className="text-brand-charcoal">{s.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-brand-slate">{s.date}</span>
                            <span className={`text-xs font-medium rounded-pill px-2 py-0.5 ${s.sent ? "bg-brand-green/10 text-brand-green-dark" : "bg-amber-50 text-amber-700"}`}>
                              {s.sent ? "Sent" : "Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
