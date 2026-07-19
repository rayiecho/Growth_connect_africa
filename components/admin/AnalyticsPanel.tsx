"use client";

import { useEffect, useState } from "react";
import type { Applicant, VideoSubmission, Verification } from "@/lib/db/types";

type AnalyticsData = {
  applicants: Applicant[];
  videoSubmissions: VideoSubmission[];
  verifications: Verification[];
  fetchedAt: string;
};

const POLL_INTERVAL_MS = 15000;

export function AnalyticsPanel({
  applicants: initialApplicants,
  videoSubmissions: initialVideo,
  verifications: initialVerifications,
}: {
  applicants: Applicant[];
  videoSubmissions: VideoSubmission[];
  verifications: Verification[];
}) {
  const [data, setData] = useState<AnalyticsData>({
    applicants: initialApplicants,
    videoSubmissions: initialVideo,
    verifications: initialVerifications,
    fetchedAt: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData((prev) => ({ ...prev, fetchedAt: new Date().toISOString() }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/analytics-data");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Live refresh paused - connection issue.");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  const { applicants, videoSubmissions, verifications } = data;

  const stageBreakdown = countBy(applicants, (a) => a.current_stage || "Unknown");
  const statusBreakdown = countBy(applicants, (a) => a.current_status || "Unknown");
  const videoStatusBreakdown = countBy(videoSubmissions, (v) => v.review_status || "Unknown");
  const verificationStatusBreakdown = countBy(verifications, (v) => v.review_status || "Unknown");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Analytics</h2>
          <button type="button" onClick={() => window.location.reload()} className="text-xs text-brand-green font-medium hover:underline mt-1">Refresh</button>
        </div>
        <p className="text-xs text-brand-slate">
          Live - last updated {new Date(data.fetchedAt).toLocaleTimeString()}
          {error && <span className="text-red-500 ml-2">{error}</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Applicants" value={applicants.length} />
        <StatCard label="Video Submissions" value={videoSubmissions.length} />
        <StatCard label="Verifications" value={verifications.length} />
        <StatCard
          label="Program Participants"
          value={applicants.filter((a) => a.current_stage === "Program Participant").length}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <BreakdownCard title="Applicants by Stage" counts={stageBreakdown} />
        <BreakdownCard title="Applicants by Status" counts={statusBreakdown} />
        <BreakdownCard title="Video Review Status" counts={videoStatusBreakdown} />
        <BreakdownCard title="Verification Status" counts={verificationStatusBreakdown} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-brand-charcoal mb-3">Live Data - Applicants</h3>
        <LiveTable
          rows={applicants}
          columns={["first_name", "last_name", "email", "current_stage", "current_status", "date_applied"]}
        />
      </div>
    </div>
  );
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-brand-line p-5">
      <p className="text-sm text-brand-slate mb-1">{label}</p>
      <p className="text-2xl font-bold text-brand-charcoal">{value}</p>
    </div>
  );
}

function BreakdownCard({ title, counts }: { title: string; counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0) || 1;
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-xl border border-brand-line p-5">
      <p className="text-sm font-semibold text-brand-charcoal mb-3">{title}</p>
      <div className="space-y-2">
        {entries.map(([label, count]) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-brand-slate mb-1">
              <span>{label}</span>
              <span>{count}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-green rounded-full"
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-brand-slate">No data yet.</p>}
      </div>
    </div>
  );
}

function LiveTable({ rows, columns }: { rows: Record<string, any>[]; columns: string[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-brand-line">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-brand-charcoal">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 font-semibold whitespace-nowrap">
                {c.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-t border-brand-line">
              {columns.map((c) => (
                <td key={c} className="px-4 py-3 text-brand-slate whitespace-nowrap">
                  {String(row[c] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-brand-slate">
                No data yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}





