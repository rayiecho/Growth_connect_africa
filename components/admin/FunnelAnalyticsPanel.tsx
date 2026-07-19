"use client";

import { useState, useEffect } from "react";

type DropOff = { step: number; count: number };
type ErrorItem = { label: string; count: number };

const STEP_LABELS: Record<number, string> = {
  0: "Step 1: Personal Details (never progressed)",
  1: "Step 2",
  2: "Step 3",
  3: "Step 4",
  4: "Step 5 (final, never submitted)",
};

export function FunnelAnalyticsPanel() {
  const [data, setData] = useState<{
    totalVisits: number;
    startedCount: number;
    submittedCount: number;
    completionRate: number;
    dropOffBreakdown: DropOff[];
    errorBreakdown: ErrorItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/funnel-analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => setError("Failed to load funnel analytics."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Application Funnel</h2>
        </div>
        <button type="button" onClick={() => window.location.reload()} className="text-xs text-brand-green font-medium hover:underline">
          Refresh
        </button>
      </div>
      <p className="text-sm text-brand-slate mb-6">
        Tracks every visit to the application page - where people drop off, and every error encountered along the way.
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-brand-slate">Loading...</p>
      ) : !data ? (
        <p className="text-sm text-brand-slate">No data yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-brand-line p-5">
              <p className="text-sm text-brand-slate mb-1">Page Visits</p>
              <p className="text-2xl font-bold text-brand-charcoal">{data.totalVisits}</p>
            </div>
            <div className="bg-white rounded-xl border border-brand-line p-5">
              <p className="text-sm text-brand-slate mb-1">Started Filling</p>
              <p className="text-2xl font-bold text-brand-charcoal">{data.startedCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-brand-line p-5">
              <p className="text-sm text-brand-slate mb-1">Submitted</p>
              <p className="text-2xl font-bold text-brand-charcoal">{data.submittedCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-brand-line p-5">
              <p className="text-sm text-brand-slate mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-brand-charcoal">{data.completionRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-brand-line p-5">
              <h3 className="text-sm font-semibold text-brand-charcoal mb-4">Where People Drop Off</h3>
              {data.dropOffBreakdown.length === 0 ? (
                <p className="text-sm text-brand-slate">No drop-offs recorded.</p>
              ) : (
                <div className="space-y-2">
                  {data.dropOffBreakdown.map((d) => (
                    <div key={d.step} className="flex items-center justify-between text-sm">
                      <span className="text-brand-charcoal">{STEP_LABELS[d.step] || `Step ${d.step + 1}`}</span>
                      <span className="font-semibold text-brand-slate">{d.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-brand-line p-5">
              <h3 className="text-sm font-semibold text-brand-charcoal mb-4">Errors Encountered</h3>
              {data.errorBreakdown.length === 0 ? (
                <p className="text-sm text-brand-slate">No errors recorded.</p>
              ) : (
                <div className="space-y-2">
                  {data.errorBreakdown.map((e) => (
                    <div key={e.label} className="flex items-center justify-between text-sm gap-4">
                      <span className="text-brand-charcoal">{e.label}</span>
                      <span className="font-semibold text-red-600 shrink-0">{e.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
