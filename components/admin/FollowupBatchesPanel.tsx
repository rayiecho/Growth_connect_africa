"use client";

import { useState, useEffect } from "react";

type Person = {
  id: string;
  name: string;
  email: string;
  followUpsSent: number;
  nextFollowUpDate: string;
  template: string;
};

type Batch = {
  batchId: string;
  uploadedAt: string;
  people: Person[];
};

export function FollowupBatchesPanel() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/followup-batches")
      .then((res) => (res.ok ? res.json() : { batches: [] }))
      .then((data) => setBatches(data.batches || []))
      .catch(() => setError("Failed to load follow-up batches."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Non-Applicant Follow-Ups</h2>
        </div>
      </div>
      <p className="text-sm text-brand-slate mb-6">
        Each CSV upload becomes its own batch. The first follow-up email goes out 1 day after upload, then every 5 days after that.
        The moment someone applies, they're removed from this list and enter the normal applicant flow.
        Once a batch is fully converted, it disappears here on its own.
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-brand-slate">Loading...</p>
      ) : batches.length === 0 ? (
        <p className="text-sm text-brand-slate">No non-applicant batches right now.</p>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => {
            const isExpanded = expandedBatch === batch.batchId;
            const uploadDate = new Date(batch.uploadedAt).toLocaleString();
            return (
              <div key={batch.batchId} className="bg-white rounded-xl border border-brand-line overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedBatch(isExpanded ? null : batch.batchId)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">
                      Uploaded {uploadDate} - {batch.people.length} {batch.people.length === 1 ? "person" : "people"}
                    </p>
                    <p className="text-xs text-brand-slate mt-1">Template: Non-Applicant Follow-Up</p>
                  </div>
                  <span className="text-brand-slate text-lg">{isExpanded ? "-" : "+"}</span>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-brand-line pt-4">
                    <div className="overflow-x-auto rounded-lg border border-brand-line">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-brand-charcoal">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Name</th>
                            <th className="px-4 py-2 font-semibold">Email</th>
                            <th className="px-4 py-2 font-semibold">Follow-Ups Sent</th>
                            <th className="px-4 py-2 font-semibold">Next Follow-Up</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batch.people.map((p) => (
                            <tr key={p.id} className="border-t border-brand-line">
                              <td className="px-4 py-2 text-brand-charcoal font-medium">{p.name}</td>
                              <td className="px-4 py-2 text-brand-slate">{p.email}</td>
                              <td className="px-4 py-2 text-brand-slate">{p.followUpsSent}</td>
                              <td className="px-4 py-2 text-brand-slate">{p.nextFollowUpDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

