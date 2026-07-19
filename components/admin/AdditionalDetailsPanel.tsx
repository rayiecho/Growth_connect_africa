"use client";

import { useState, useEffect } from "react";
import { formatShortDate } from "@/lib/engine/dates";

type Submission = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  business_name: string;
  business_stage: string;
  industry: string;
  business_description: string;
  linkedin: string;
  submitted_at: string;
};

export function AdditionalDetailsPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/additional-details")
      .then((res) => (res.ok ? res.json() : { submissions: [] }))
      .then((data) => setSubmissions(data.submissions || []))
      .catch(() => setError("Failed to load submissions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Additional Details Submissions</h2>
        </div>
      </div>
      <p className="text-sm text-brand-slate mb-6">
        Details submitted by legacy-imported founders to complete their records. Use these to manually update their applicant records.
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-brand-slate">Loading...</p>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-brand-slate">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className="bg-white rounded-xl border border-brand-line overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">{s.first_name} {s.last_name} - {s.email}</p>
                    <p className="text-xs text-brand-slate">{s.business_name} - {formatShortDate(s.submitted_at)}</p>
                  </div>
                  <span className="text-brand-slate text-lg">{isExpanded ? "-" : "+"}</span>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-brand-line pt-4 text-sm space-y-2">
                    <p><strong className="text-brand-slate">Phone:</strong> {s.phone}</p>
                    <p><strong className="text-brand-slate">Business Stage:</strong> {s.business_stage || "-"}</p>
                    <p><strong className="text-brand-slate">Industry:</strong> {s.industry || "-"}</p>
                    <p><strong className="text-brand-slate">Description:</strong> {s.business_description || "-"}</p>
                    <p><strong className="text-brand-slate">LinkedIn:</strong> {s.linkedin || "-"}</p>
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
